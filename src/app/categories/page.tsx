import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { CategoryImage } from '@/components/CategoryImage'
import { redis, getFromCache, setCache } from '@/lib/redis'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdminActions } from '@/components/category/AdminActions'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  publicId: string | null
  _count?: {
    recipes: number
  }
}

export async function getCategories(): Promise<Category[]> {
  const cached = await getFromCache<Category[]>('categories')
  if (cached) return cached

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      publicId: true,
      _count: {
        select: {
          recipes: true
        }
      }
    }
  })

  await setCache('categories', categories)
  return categories
}

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN'

  console.log('Fetching categories...');
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      publicId: true,
      _count: {
        select: {
          recipes: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  console.log('Retrieved categories:', categories.map(c => ({
    name: c.name,
    publicId: c.publicId
  })));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        {isAdmin && (
          <Link href="/admin/categories/new">
            <Button variant="default" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Category
            </Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-lg overflow-hidden shadow-sm">
            <Link href={`/categories/${category.slug}`}>
              <CategoryImage publicId={category.publicId} name={category.name} />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                <p className="text-gray-600">
                  {category._count?.recipes} {category._count?.recipes === 1 ? 'recipe' : 'recipes'}
                </p>
              </div>
            </Link>
            {isAdmin && (
              <div className="px-4 pb-4">
                <AdminActions slug={category.slug} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 