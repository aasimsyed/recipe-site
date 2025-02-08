import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CategoryImage from './CategoryImage'

interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  _count?: {
    recipes: number
  }
}

export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      _count: {
        select: {
          recipes: true
        }
      }
    }
  })
  return categories
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="block rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <CategoryImage imageUrl={category.imageUrl} name={category.name} />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{category.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 