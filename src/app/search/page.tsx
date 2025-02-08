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
  const results = await searchRecipes(query)

  return <SearchResults results={results} query={query} />
}

async function searchRecipes(query: string): Promise<Recipe[]> {
  const cacheKey = `search:${query}`
  const cached = await getFromCache<Recipe[]>(cacheKey)
  if (cached) return cached

  const results = await prisma.recipe.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
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
      }
    }
  })

  await setCache(cacheKey, results, 900)
  return results as unknown as Recipe[]
} 