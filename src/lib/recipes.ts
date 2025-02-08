import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getFromCache, setCache } from '@/lib/redis'
import type { Recipe } from '@/types/recipe'
import type { Prisma } from '@prisma/client'
import { JSONContent } from '@tiptap/core'

const MAX_RETRIES = 3
const INITIAL_BACKOFF = 100 // 100ms

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | unknown
  let backoff = INITIAL_BACKOFF
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      // Execute the query with a fresh client
      const result = await fn()
      return result
    } catch (error) {
      lastError = error
      console.error(`Attempt ${i + 1} failed:`, error)
      
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, backoff))
        backoff *= 2
      }
    }
  }
  
  throw lastError
}

type FindManyOptions = {
  skip?: number
  take?: number
  where?: Prisma.RecipeWhereInput
  orderBy?: Prisma.RecipeOrderByWithRelationInput
}

export async function getRecipes() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        media: {
          select: {
            id: true,
            url: true,
            publicId: true,
            type: true
          }
        },
        author: {
          select: {
            name: true,
            email: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add logging here
    console.log('Database recipes:', recipes.map(r => ({
      title: r.title,
      mediaCount: r.media.length,
      firstMediaPublicId: r.media[0]?.publicId
    })))

    return recipes
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return []
  }
}

// Helper function
function parseJSONField(field: Prisma.JsonValue): JSONContent {
  if (typeof field === 'string') return JSON.parse(field)
  return field as JSONContent
}

function calculateRating(reviews: { rating: number }[]): number {
  return reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0
}

export const getRecipeBySlug = unstable_cache(
  async (slug: string) => {
    if (!slug) return null

    const cacheKey = `recipe:${slug}`
    const cached = await getFromCache<Recipe>(cacheKey)
    if (cached) return cached

    try {
      const recipe = await prisma.recipe.findUnique({
        where: { slug },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          content: true,
          ingredients: true,
          steps: true,
          nutrition: true,
          cookTime: true,
          prepTime: true,
          servings: true,
          createdAt: true,
          media: {
            select: {
              type: true,
              publicId: true,
              url: true
            },
            take: 1 // Limit to one media item
          },
          video: true,
          reviews: {
            select: {
              rating: true
            }
          },
          author: {
            select: {
              name: true,
              image: true
            }
          }
        }
      })

      if (!recipe) return null

      // Calculate average rating from reviews
      const averageRating = recipe.reviews.length > 0
        ? recipe.reviews.reduce((acc, review) => acc + review.rating, 0) / recipe.reviews.length
        : 0

      const processed = {
        ...recipe,
        rating: averageRating,
        content: typeof recipe.content === 'string' ? JSON.parse(recipe.content) : recipe.content,
        ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
        steps: typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : recipe.steps,
        nutrition: recipe.nutrition ? 
          (typeof recipe.nutrition === 'string' ? JSON.parse(recipe.nutrition) : recipe.nutrition) 
          : null,
        reviewCount: recipe.reviews.length
      }

      await setCache(cacheKey, processed, 3600)
      return processed
    } catch (error) {
      console.error(`Error fetching recipe ${slug}:`, error)
      return null
    }
  },
  ['recipe-by-slug'],
  {
    tags: ['recipe'],
    revalidate: 3600
  }
) 