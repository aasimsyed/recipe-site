'use server'

import { getCategoryBySlug } from '@/lib/categories'
import { prisma } from '@/lib/prisma'

export async function fetchCategoryRecipes(slug: string, page: number = 1) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      recipes: {
        take: 12,
        skip: (page - 1) * 12,
        include: {
          media: true,
          reviews: true,
          author: true
        }
      },
      _count: {
        select: { recipes: true }
      }
    }
  })

  return category
} 