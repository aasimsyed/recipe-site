import { prisma } from '@/lib/prisma'
import { getFromCache, setCache } from '@/lib/redis'
import type { Recipe } from '@/types/recipe'
import { SearchResults } from '@/components/search/SearchResults'

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const query = Array.isArray(searchParams?.q) ? searchParams.q[0] : searchParams?.q || ''
  const categorySlug = Array.isArray(searchParams?.category) ? searchParams.category[0] : searchParams?.category || ''
  const results = await searchRecipes(query, categorySlug)

  return <SearchResults results={results} query={query} />
}

async function searchRecipes(query: string, categorySlug?: string): Promise<Recipe[]> {
  const cacheKey = `search:${query}:${categorySlug}`
  const cached = await getFromCache<Recipe[]>(cacheKey)
  if (cached) return cached

  const results = await prisma.recipe.findMany({
    where: {
      AND: [
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        categorySlug ? {
          categories: {
            some: {
              slug: categorySlug
            }
          }
        } : {}
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      cookTime: true,
      servings: true,
      media: {
        take: 1,
        select: {
          url: true,
          type: true,
          publicId: true
        }
      },
      categories: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  })

  await setCache(cacheKey, results, 900)
  return results as unknown as Recipe[]
} 