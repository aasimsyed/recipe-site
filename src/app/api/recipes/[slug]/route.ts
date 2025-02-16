import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFromCache, setCache, redis } from '@/lib/redis'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import slugify from 'slugify'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Define allowed methods
const ALLOWED_METHODS = ['GET', 'HEAD', 'PUT']

const recipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  cookTime: z.coerce.number().min(0).default(0),
  servings: z.coerce.number().min(1).default(1),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.string().min(1),
    unit: z.string().min(1)
  })),
  steps: z.array(z.object({
    content: z.string().min(1)
  })),
  image: z.string().transform(val => val || null).nullish(),
  prepTime: z.coerce.number().min(0).default(0)
})

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const cacheKey = `recipe:${slug}`

    // Try to get from cache first
    const cached = await getFromCache(cacheKey)
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        source: 'cache'
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'Allow': ALLOWED_METHODS.join(', ')
        },
      })
    }

    // If not in cache, fetch from database
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc'
          },
        },
        media: true
      },
    })

    if (!recipe) {
      return notFound()
    }

    // Cache the result
    await setCache(cacheKey, recipe, 3600)

    return NextResponse.json({
      success: true,
      data: recipe,
      source: 'database'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Allow': ALLOWED_METHODS.join(', ')
      },
    })
  } catch (error) {
    console.error('Recipe fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recipe'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
        'Allow': ALLOWED_METHODS.join(', ')
      }
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': ALLOWED_METHODS.join(', ')
    }
  })
}

export async function HEAD(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const response = await GET(request, { params })
  return new NextResponse(null, {
    status: response.status,
    headers: response.headers
  })
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('PUT request received for slug:', params.slug)
    
    const session = await getServerSession(authOptions)
    console.log('Session:', {
      email: session?.user?.email,
      role: session?.user?.role
    })
    
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
    console.log('User data:', user)

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const validatedData = recipeSchema.parse(body)
    console.log('Validated data:', validatedData)

    // First, get the existing recipe
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug: params.slug },
      include: { media: true, categories: true }
    })
    console.log('Existing recipe:', existingRecipe)

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Generate new slug if title changed
    const newSlug = validatedData.title !== existingRecipe.title 
      ? slugify(validatedData.title, { lower: true })
      : existingRecipe.slug

    try {
      const updatedRecipe = await prisma.recipe.update({
        where: { slug: params.slug },
        data: {
          title: validatedData.title,
          slug: newSlug,
          description: validatedData.description,
          categories: {
            disconnect: existingRecipe.categories.map(cat => ({ id: cat.id })),
            connect: { id: validatedData.categoryId }
          },
          cookTime: validatedData.cookTime,
          servings: validatedData.servings,
          ingredients: validatedData.ingredients,
          steps: validatedData.steps,
          media: validatedData.image && validatedData.image !== '' ? {
            upsert: {
              where: {
                id: existingRecipe.media[0]?.id || 'dummy-id'
              },
              update: {
                url: validatedData.image,
                publicId: validatedData.image,
                type: 'IMAGE'
              },
              create: {
                url: validatedData.image,
                publicId: validatedData.image,
                type: 'IMAGE'
              }
            }
          } : undefined
        },
        include: {
          media: true,
          categories: true
        }
      })
      console.log('Updated recipe:', updatedRecipe)
      
      // Clear cache
      const cacheKey = `recipe:${params.slug}`
      if (redis) await redis.del(cacheKey)
      revalidateTag('recipe')

      return NextResponse.json(updatedRecipe)
    } catch (prismaError) {
      console.error('Prisma update error:', {
        error: prismaError,
        message: prismaError instanceof Error ? prismaError.message : 'Unknown Prisma error',
        stack: prismaError instanceof Error ? prismaError.stack : undefined
      })
      throw prismaError
    }
  } catch (error) {
    console.error('Error updating recipe:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update recipe' },
      { status: 500 }
    )
  }
} 