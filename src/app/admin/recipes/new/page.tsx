import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CreateRecipeForm } from '@/components/admin/CreateRecipeForm'

export default async function NewRecipePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  })

  if (user?.role !== 'ADMIN') {
    redirect('/')
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true }
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold mb-8">Create New Recipe</h1>
      <CreateRecipeForm categories={categories} />
    </div>
  )
} 