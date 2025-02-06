import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const recipes = await prisma.recipe.findMany({
    include: { 
      author: true, 
      categories: true,
      media: true,
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
  return NextResponse.json(recipes)
}

export async function POST(req: Request) {
  const body = await req.json()
  // Add Zod validation here
  const recipe = await prisma.recipe.create({
    data: { ...body, authorId: 'current_user_id' }
  })
  return NextResponse.json(recipe)
} 