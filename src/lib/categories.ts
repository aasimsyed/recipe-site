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

export const getCategories = async () => {
  return unstable_cache(
    async () => {
      try {
        return await prisma.category.findMany({
          include: {
            recipes: {
              select: {
                id: true,
                title: true,
                slug: true
              },
              take: 4,
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        })
      } catch (error) {
        console.error('Error fetching categories:', error)
        return []
      }
    },
    ['all-categories'],
    {
      revalidate: 60, // Cache for 1 minute
      tags: ['categories']
    }
  )()
}

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<Category | null> => {
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
    revalidate: 3600, // Cache for 1 hour
    maxAge: 3600 // Additional caching
  }
) 