import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipeId, rating, comment } = await request.json()

    // Create or update review
    const review = await prisma.review.upsert({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId: session.user.id,
        recipeId,
        rating,
        comment,
      },
    })

    // Revalidate the recipe page and any pages that show recipes
    revalidatePath(`/recipes/[slug]`)
    revalidatePath('/recipes')

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
} 