import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import slugify from 'slugify'

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

const recipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  cookTime: z.coerce.number().min(1, "Cook time must be at least 1 minute"),
  servings: z.coerce.number().min(1, "Servings must be at least 1"),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.string().min(1),
    unit: z.string().min(1)
  })),
  steps: z.array(z.object({
    content: z.string().min(1)
  })),
  image: z.string().url()
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = recipeSchema.parse(body)

    const slug = slugify(validatedData.title, { lower: true })

    const recipe = await prisma.recipe.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        categoryId: validatedData.categoryId,
        cookTime: validatedData.cookTime,
        servings: validatedData.servings,
        ingredients: validatedData.ingredients,
        steps: validatedData.steps,
        authorId: user.id,
        media: {
          create: {
            type: 'IMAGE',
            url: validatedData.image,
            publicId: validatedData.image
          }
        }
      }
    })

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
} 