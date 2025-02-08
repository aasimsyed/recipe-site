'use client'

import { StarIcon } from '@heroicons/react/24/solid'

interface StarRatingProps {
  rating: number
  readonly?: boolean
  className?: string
  onChange?: (rating: number) => void
}

export function StarRating({ rating, readonly = false, className = '', onChange }: StarRatingProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-200'
          } ${!readonly ? 'cursor-pointer' : ''}`}
          onClick={!readonly ? () => onChange?.(star) : undefined}
        />
      ))}
    </div>
  )
} 