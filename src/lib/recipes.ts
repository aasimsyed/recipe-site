import 'server-only'
import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { Prisma } from '@prisma/client'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        await prisma.$connect() // Reconnect before retry
      }
    }
  }
  throw lastError
}

// Use React's cache instead of unstable_cache
export async function getRecipes(params: Prisma.RecipeFindManyArgs = {}) {
  return withRetry(() => prisma.recipe.findMany({
    ...params,
    include: {
      ...params.include,
      media: true,
      reviews: {
        select: { id: true, rating: true }
      }
    }
  }))
}

export const getRecipeBySlug = unstable_cache(async (slug: string) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, image: true } },
        categories: { select: { name: true, slug: true } },
        media: { select: { type: true, url: true } },
        reviews: { select: { rating: true } }
      }
    })

    if (!recipe) return null

    return {
      ...recipe,
      steps: recipe.steps as { content: string }[]
    }
  } catch (error) {
    console.error('Error in getRecipeBySlug:', error)
    return null
  }
}) 