import 'server-only'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import type { Recipe } from '@/types/recipe'

interface Category {
  id: string
  name: string
  slug: string
  recipes: {
    id: string
    title: string
    slug: string
    description: string
    cookTime: number
    servings: number
    rating: number
    media: {
      url: string
      type: string
      publicId: string
    }[]
  }[]
}

export async function getCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      publicId: true,
      _count: {
        select: { recipes: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export const getCategoryBySlug = unstable_cache(
  async (slug: string, page = 1, limit = 12): Promise<Category | null> => {
    try {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          recipes: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              cookTime: true,
              servings: true,
              media: {
                select: {
                  url: true,
                  type: true,
                  publicId: true
                },
                take: 1
              },
              reviews: {
                select: {
                  rating: true
                }
              }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: {
              recipes: true
            }
          }
        }
      })

      if (!category) return null

      return {
        ...category,
        recipes: category.recipes.map(recipe => ({
          ...recipe,
          rating: recipe.reviews.length > 0
            ? recipe.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / recipe.reviews.length
            : 0
        }))
      }
    } catch (error) {
      console.error(`Error fetching category ${slug}:`, error)
      return null
    }
  },
  ['category-by-slug'],
  {
    tags: ['category'],
    revalidate: 3600
  }
) 