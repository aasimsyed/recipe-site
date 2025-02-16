import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs' // Force Node.js runtime

export async function GET() {
  try {
    console.log('Fetching categories...')
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 

export async function POST(request: Request) {
  try {
    const validatedData = await request.json()
    console.log('API received category data:', validatedData);
    
    const slugifiedName = validatedData.name.toLowerCase().replace(/\s+/g, '-')

    // Ensure publicId is null if it's an empty string
    const publicId = validatedData.publicId || null

    console.log('Creating category with data:', {
      name: validatedData.name,
      description: validatedData.description,
      publicId,
      slug: slugifiedName
    });

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        publicId,
        slug: slugifiedName
      }
    })

    console.log('Created category:', category);

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 