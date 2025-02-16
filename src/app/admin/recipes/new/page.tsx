import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RecipeForm } from '@/components/admin/RecipeForm'

export default async function NewRecipePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    notFound()
  }

  const categories = await prisma.category.findMany({
    select: { 
      id: true, 
      name: true,
      slug: true 
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold mb-8">Create New Recipe</h1>
      <RecipeForm 
        categories={categories}
        mode="create"
      />
    </div>
  )
} 