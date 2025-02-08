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