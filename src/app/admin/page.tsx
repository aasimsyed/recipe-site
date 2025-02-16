import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminStats } from '@/components/admin/AdminStats'
import { RecentRecipes } from '@/components/admin/RecentRecipes'
import { RecentReviews } from '@/components/admin/RecentReviews'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <nav className="space-y-4">
        <Link href="/admin/categories" className="block text-blue-600 hover:underline">
          Manage Categories
        </Link>
        <Link href="/admin/recipes" className="block text-blue-600 hover:underline">
          Manage Recipes
        </Link>
      </nav>
    </div>
  )
} 