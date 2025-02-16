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
const ALLOWED_METHODS = ['GET', 'HEAD', 'PUT', 'DELETE']

const recipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  categoryIds: z.array(z.string()).min(1),
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

    const data = await request.json()
    console.log('Received update data:', data)

    const validatedData = recipeSchema.parse(data)
    
    // Separate the data that needs special handling
    const {
      categoryIds,
      ingredients,
      steps,
      image, // Extract image from validatedData
      ...recipeUpdateData
    } = validatedData

    // Prepare media update
    const mediaUpdate = image ? {
      deleteMany: {},
      create: {
        publicId: image,
        url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${image}`,
        type: 'IMAGE' as const
      }
    } : undefined

    // Perform the update
    const recipe = await prisma.recipe.update({
      where: { slug: params.slug },
      data: {
        ...recipeUpdateData,
        ingredients,
        steps,
        categories: {
          set: [], // Clear existing relationships
          connect: categoryIds.map((id: string) => ({ id }))
        },
        media: mediaUpdate // Update media relationship
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        media: true
      }
    })

    // Clear cache
    if (redis) {
      await redis.del(`recipe:${params.slug}`)
      await redis.del('recipes')
    }
    revalidateTag('recipes')

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Recipe update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { 
        error: 'Failed to update recipe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
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

    // Delete the recipe and all related records
    await prisma.recipe.delete({
      where: { slug: params.slug }
    })

    // Clear cache
    if (redis) {
      await redis.del(`recipe:${params.slug}`)
      await redis.del('recipes')
    }
    revalidateTag('recipes')

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error('Recipe deletion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete recipe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 