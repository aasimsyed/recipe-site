import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { redis } from '@/lib/redis'
import slugify from 'slugify'

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  publicId: z.string().nullable()
})

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

    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    const existingCategory = await prisma.category.findUnique({
      where: { slug: params.slug }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const newSlug = validatedData.name !== existingCategory.name 
      ? slugify(validatedData.name, { lower: true })
      : existingCategory.slug

    const publicId = validatedData.publicId || null

    const updatedCategory = await prisma.category.update({
      where: { slug: params.slug },
      data: {
        name: validatedData.name,
        slug: newSlug,
        description: validatedData.description,
        publicId: publicId
      }
    })

    // Clear cache
    if (redis) {
      await redis.del(`category:${params.slug}`)
    }
    revalidateTag('category')

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
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

    // Delete the category
    await prisma.category.delete({
      where: { slug: params.slug }
    })

    // Clear cache
    if (redis) {
      await redis.del(`category:${params.slug}`)
      await redis.del('categories')
    }
    revalidateTag('categories')

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Category deletion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 