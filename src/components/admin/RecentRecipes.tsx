'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Recipe {
  id: string
  title: string
  createdAt: Date
  author: {
    name: string | null
  }
  _count: {
    reviews: number
  }
}

interface RecentRecipesProps {
  recipes: Recipe[]
}

export function RecentRecipes({ recipes }: RecentRecipesProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
      <h2 className="font-display text-xl font-semibold mb-4">Recent Recipes</h2>
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div 
            key={recipe.id}
            className="flex items-center justify-between"
          >
            <div>
              <Link 
                href={`/recipes/${recipe.id}`}
                className="font-medium text-neutral-900 hover:text-primary-600"
              >
                {recipe.title}
              </Link>
              <p className="text-sm text-neutral-500">
                by {recipe.author.name || 'Unknown'} • {recipe._count.reviews} reviews
              </p>
            </div>
            <span className="text-sm text-neutral-500">
              {formatDate(recipe.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 