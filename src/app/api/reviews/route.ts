import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { redis } from '@/lib/redis'

const reviewSchema = z.object({
  recipeId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to leave a review' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // First, get the user ID from the email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the recipe to invalidate cache
    const recipe = await prisma.recipe.findUnique({
      where: { id: validatedData.recipeId },
      select: { slug: true }
    })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Check if user has already reviewed this recipe
    const existingReview = await prisma.review.findFirst({
      where: {
        recipeId: validatedData.recipeId,
        userId: user.id,
      },
    })

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: {
          id: existingReview.id,
        },
        data: {
          rating: validatedData.rating,
          comment: validatedData.comment || '',
        },
      })
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          rating: validatedData.rating,
          comment: validatedData.comment || '',
          recipeId: validatedData.recipeId,
          userId: user.id,
        },
      })
    }

    // Invalidate both Redis and Next.js cache
    const cacheKey = `recipe:${recipe.slug}`
    if (redis) {
      await redis.del(cacheKey)
    }
    revalidateTag('recipe')
    revalidateTag(`recipe-${recipe.slug}`)

    return NextResponse.json(review)
  } catch (error) {
    console.error('Review submission error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid review data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
} 