import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const recipe = await prisma.recipe.findUnique({
    where: { slug: params.slug },
    include: {
      author: { 
        select: { 
          name: true, 
          image: true 
        } 
      },
      categories: { 
        select: { 
          name: true, 
          slug: true 
        } 
      },
      media: true,
      reviews: {
        include: {
          author: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }
    }
  })

  if (!recipe) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
  }

  return NextResponse.json({ recipe })
} 