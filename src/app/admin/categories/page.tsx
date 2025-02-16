import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    notFound()
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Link href="/admin/categories/new">
          <Button variant="default" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Your existing categories list */}
      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className="p-4 border rounded-lg">
            {category.name}
          </div>
        ))}
      </div>
    </div>
  )
} 