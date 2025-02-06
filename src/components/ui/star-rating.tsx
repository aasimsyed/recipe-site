'use client'

import { useState } from 'react'
import { Star, StarHalf } from 'lucide-react'

interface StarRatingProps {
  rating: number
  className?: string
}

export function StarRating({ rating, className = '' }: StarRatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  
  return (
    <div 
      className={`flex items-center space-x-0.5 md:space-x-1 ${className}`}
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return (
            <Star
              key={i}
              className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-500"
              aria-hidden="true"
            />
          )
        }
        if (i === fullStars && hasHalfStar) {
          return (
            <StarHalf
              key={i}
              className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-500"
              aria-hidden="true"
            />
          )
        }
        return (
          <Star
            key={i}
            className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-300"
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
} 