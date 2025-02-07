import 'server-only'
import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { Prisma } from '@prisma/client'
const debug = require('debug')('app:recipes')

const MAX_RETRIES = 3
const INITIAL_BACKOFF = 100 // 100ms

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: any
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

// Define the exact shape of the recipe query result
type RecipeWithRelations = Prisma.RecipeGetPayload<{
  select: {
    id: true
    title: true
    slug: true
    description: true
    media: {
      select: {
        id: true
        url: true
        type: true
        publicId: true
      }
    }
    reviews: {
      select: {
        rating: true
      }
    }
    author: {
      select: {
        name: true
        image: true
      }
    }
    createdAt: true
  }
}>

export async function getRecipes(options?: Prisma.RecipeFindManyArgs) {
  try {
    const recipes = await prisma.recipe.findMany({
      where: options?.where,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        cookTime: true,
        prepTime: true,
        servings: true,
        createdAt: true,
        media: {
          select: {
            id: true,
            url: true,
            type: true,
            publicId: true
          }
        },
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
        },
        categories: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return recipes.map(recipe => ({
      ...recipe,
      rating: recipe.reviews.length > 0
        ? recipe.reviews.reduce((acc, review) => acc + review.rating, 0) / recipe.reviews.length
        : 0,
      author: recipe.author ?? { name: 'Unknown Author', image: null }
    }))
  } catch (error) {
    console.error('Error fetching recipes:', error)
    throw error
  }
}

export const getRecipeBySlug = unstable_cache(async (slug: string) => {
  if (!slug) return null

  try {
    // Use withRetry for resilience
    return await withRetry(async () => {
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
            }
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

      // Calculate average rating more efficiently
      const rating = recipe.reviews.length > 0
        ? recipe.reviews.reduce((acc, r) => acc + r.rating, 0) / recipe.reviews.length
        : 0

      return {
        ...recipe,
        content: typeof recipe.content === 'string' ? JSON.parse(recipe.content) : recipe.content,
        ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
        steps: typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : recipe.steps,
        nutrition: recipe.nutrition ? 
          (typeof recipe.nutrition === 'string' ? JSON.parse(recipe.nutrition) : recipe.nutrition) 
          : null,
        rating,
        reviews: recipe.reviews
      }
    })
  } catch (error) {
    console.error(`Error fetching recipe ${slug}:`, error)
    return null
  }
}, ['recipe-by-slug'], {
  tags: ['recipe'],
  revalidate: 3600,
  maxAge: 3600 // 1 hour
}) 