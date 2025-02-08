import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminStats } from '@/components/admin/AdminStats'
import { RecentRecipes } from '@/components/admin/RecentRecipes'
import { RecentReviews } from '@/components/admin/RecentReviews'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  // Fetch dashboard data
  const stats = await prisma.$transaction([
    prisma.recipe.count(),
    prisma.review.count(),
    prisma.user.count(),
    prisma.category.count()
  ])

  const recentRecipes = await prisma.recipe.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { name: true }
      },
      _count: {
        select: { reviews: true }
      }
    }
  })

  const recentReviews = await prisma.review.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true }
      },
      recipe: {
        select: { title: true }
      }
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <Link 
          href="/admin/recipes/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Create Recipe
        </Link>
      </div>
      
      <AdminStats 
        recipeCount={stats[0]}
        reviewCount={stats[1]}
        userCount={stats[2]}
        categoryCount={stats[3]}
      />

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <RecentRecipes recipes={recentRecipes} />
        <RecentReviews reviews={recentReviews} />
      </div>
    </div>
  )
} 