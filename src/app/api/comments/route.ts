import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { content, recipeId, userId } = await request.json()
  
  const comment = await prisma.review.create({
    data: {
      content,
      rating: 0, // Default rating for comments
      authorId: userId,
      recipeId
    }
  })
  
  return NextResponse.json(comment)
} 