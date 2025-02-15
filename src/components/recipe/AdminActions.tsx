'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminActionsProps {
  slug: string
}

export function AdminActions({ slug }: AdminActionsProps) {
  const router = useRouter()

  const handleDeleteRecipe = async () => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        const response = await fetch(`/api/recipes/${slug}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete recipe')
        }
        router.push('/recipes')
      } catch (error) {
        console.error('Error deleting recipe:', error)
        alert('Failed to delete recipe')
      }
    }
  }

  return (
    <div className="flex justify-end gap-4 mb-8">
      <Link
        href={`/admin/recipes/${slug}/edit`}
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Edit Recipe
      </Link>
      <button
        onClick={handleDeleteRecipe}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Delete Recipe
      </button>
    </div>
  )
} 