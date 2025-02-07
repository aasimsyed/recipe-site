'use client'

import { StarRating } from '@/components/ui/star-rating'

interface RecipeHeaderProps {
  title: string
  rating: number
  reviewCount: number
  description: string
  cookTime: number
  servings: number
}

export function RecipeHeader({
  title,
  rating,
  reviewCount,
  description,
  cookTime,
  servings
}: RecipeHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="font-display font-semibold text-3xl md:text-4xl text-neutral-800 mb-4">
        {title}
      </h1>
      <div className="flex items-center gap-4 mb-4">
        <StarRating 
          rating={rating} 
          readonly={true}
          className="scale-100" 
        />
        <span className="text-sm text-neutral-500">
          ({reviewCount} reviews)
        </span>
      </div>
      <p className="text-lg text-neutral-600 mb-6">
        {description}
      </p>
      <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
        <span>{cookTime} mins</span>
        <span>•</span>
        <span>{servings} servings</span>
      </div>
    </header>
  )
} 