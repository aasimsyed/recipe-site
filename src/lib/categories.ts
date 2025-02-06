import 'server-only'
import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export const getCategories = async () => {
  return unstable_cache(
    async () => {
      try {
        return await prisma.category.findMany({
          include: {
            recipes: {
              select: {
                id: true,
                title: true,
                slug: true
              },
              take: 4,
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        })
      } catch (error) {
        console.error('Error fetching categories:', error)
        return []
      }
    },
    ['all-categories'],
    {
      revalidate: 60, // Cache for 1 minute
      tags: ['categories']
    }
  )()
}

export const getCategoryBySlug = async (slug: string) => {
  return unstable_cache(
    async () => {
      try {
        return await prisma.category.findUnique({
          where: { slug },
          include: {
            recipes: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                createdAt: true,
                author: {
                  select: {
                    name: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        })
      } catch (error) {
        console.error('Error fetching category:', error)
        return null
      }
    },
    [`category-${slug}`],
    {
      revalidate: 60,
      tags: ['categories', `category-${slug}`]
    }
  )()
} 