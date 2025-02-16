import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { redis } from '@/lib/redis'
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
  categoryIds: z.array(z.string())
    .min(1, "At least one category is required")
    .transform(val => Array.from(new Set(val))), // Ensure unique values
  cookTime: z.coerce.number().min(0).default(0),
  servings: z.coerce.number().min(1).default(1),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.string().min(1),
    unit: z.string().min(1)
  })).default([]),
  steps: z.array(z.object({
    content: z.string().min(1)
  })).default([]),
  image: z.string().nullish(),
  prepTime: z.coerce.number().min(0).default(0)
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session data:', {
      email: session?.user?.email,
      id: session?.user?.id,
      role: session?.user?.role
    })

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    console.log('📥 Received POST data:', data)

    // Include categoryIds in the validation
    const validatedData = recipeSchema.parse({
      ...data,
      cookTime: Number(data.cookTime) || 0,
      servings: Number(data.servings) || 1,
      prepTime: Number(data.prepTime) || 0,
      categoryIds: data.categoryIds // Explicitly include categoryIds
    })
    console.log('✅ Validated data:', validatedData)

    // Generate a slug from the title
    const baseSlug = slugify(validatedData.title, {
      lower: true,
      strict: true
    })

    // Check for existing recipes with similar slugs
    const existingRecipes = await prisma.recipe.findMany({
      where: {
        slug: {
          startsWith: baseSlug
        }
      },
      select: { slug: true }
    })

    // Generate unique slug
    let slug = baseSlug
    if (existingRecipes.length > 0) {
      slug = `${baseSlug}-${existingRecipes.length + 1}`
    }

    // Create recipe with the generated slug and content
    console.log('Creating recipe with data:', {
      title: validatedData.title,
      imageUrl: validatedData.image,
      categoryIds: validatedData.categoryIds
    })

    const recipe = await prisma.recipe.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        cookTime: validatedData.cookTime,
        servings: validatedData.servings,
        ingredients: validatedData.ingredients,
        steps: validatedData.steps,
        prepTime: validatedData.prepTime,
        content: {},
        slug,
        authorId: session.user.id,
        categories: {
          connect: validatedData.categoryIds.map((id: string) => ({ id }))
        },
        media: validatedData.image ? {
          create: {
            publicId: validatedData.image,
            url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${validatedData.image}`,
            type: 'IMAGE'
          }
        } : undefined
      },
      include: {
        media: true,
        categories: true,
        author: true
      }
    })

    console.log('📝 Created recipe:', {
      id: recipe.id,
      media: recipe.media,
      imageUrl: recipe.media[0]?.url
    })

    // Revalidate cache
    if (redis) await redis.del('recipes')
    revalidateTag('recipes')

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Recipe creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
} 