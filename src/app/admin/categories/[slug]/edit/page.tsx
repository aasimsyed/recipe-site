import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { CategoryForm } from '@/components/admin/CategoryForm'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function EditCategoryPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    notFound()
  }

  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      description: true,
      publicId: true,
      slug: true
    }
  })
  
  if (!category) {
    notFound()
  }

  const initialData = {
    name: category.name,
    description: category.description || '',
    publicId: category.publicId || '',
    slug: category.slug
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold mb-8">
        Edit Category: {category.name}
      </h1>
      
      <CategoryForm 
        initialData={initialData}
        mode="edit"
      />
    </div>
  )
} 