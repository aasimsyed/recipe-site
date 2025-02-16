import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getFromCache, setCache } from '@/lib/redis'
import type { Recipe } from '@/types/recipe'
import type { Prisma } from '@prisma/client'
import { JSONContent } from '@tiptap/core'
import { redis } from '@/lib/redis'
import { createHash } from 'crypto'

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

export async function getRecipes(options?: Prisma.RecipeFindManyArgs) {
  return prisma.recipe.findMany({
    ...options,
    include: {
      media: true,
      reviews: true,
      author: true
    }
  })
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

// Cache key generator
function generateCacheKey(slug: string, type: string = 'recipe'): string {
  return createHash('sha256').update(`${type}:${slug}`).digest('hex')
}

// Enhanced getRecipeBySlug with better caching
export const getRecipeBySlug = unstable_cache(
  async (slug: string) => {
    const cacheKey = generateCacheKey(slug)
    
    try {
      // Try Redis first
      if (redis) {
        const cached = await redis.get(cacheKey)
        if (cached) {
          return typeof cached === 'string' ? JSON.parse(cached) : cached
        }
      }

      const recipe = await prisma.recipe.findUnique({
        where: { slug },
        include: {
          media: {
            select: {
              type: true,
              publicId: true,
              url: true
            },
            take: 1
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
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

      if (recipe && redis) {
        await redis.set(cacheKey, JSON.stringify(recipe), {
          ex: 3600, // 1 hour cache
          nx: true  // Only set if not exists
        })
      }

      return recipe
    } catch (error) {
      console.error('Error fetching recipe:', error)
      return null
    }
  },
  ['recipe-by-slug'],
  {
    revalidate: 3600,
    tags: ['recipe']
  }
) 