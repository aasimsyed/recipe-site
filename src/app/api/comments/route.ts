import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const commentSchema = z.object({
  content: z.string().min(1),
  recipeId: z.string()
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = commentSchema.parse(body)

    const review = await prisma.review.create({
      data: {
        comment: validatedData.content,
        rating: 0, // Default rating for comments
        recipeId: validatedData.recipeId,
        userId: session.user.id
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
} 