'use client'

import { Star as StarIcon } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  rating: number
  readonly?: boolean
  className?: string
  onChange?: (rating: number) => void
}

export function StarRating({ rating, readonly = false, className = '', onChange }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return
    const container = event.currentTarget.parentElement
    if (!container) return
    
    const stars = Array.from(container.children)
    const starIndex = stars.indexOf(event.currentTarget)
    const star = event.currentTarget
    const rect = star.getBoundingClientRect()
    const x = event.clientX - rect.left
    const decimal = x / rect.width
    
    setHoverRating(starIndex + (decimal <= 0.5 ? 0.5 : 1))
  }

  const handleMouseLeave = () => {
    if (readonly) return
    setHoverRating(null)
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return
    const container = event.currentTarget.parentElement
    if (!container) return
    
    const stars = Array.from(container.children)
    const starIndex = stars.indexOf(event.currentTarget)
    const star = event.currentTarget
    const rect = star.getBoundingClientRect()
    const x = event.clientX - rect.left
    const decimal = x / rect.width
    
    onChange?.(starIndex + (decimal <= 0.5 ? 0.5 : 1))
  }

  const displayRating = hoverRating ?? rating

  return (
    <div 
      className={`flex items-center ${className}`} 
      onMouseLeave={handleMouseLeave}
    >
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const isFullStar = starIndex < Math.floor(displayRating)
        const isHalfStar = !isFullStar && starIndex + 0.5 <= displayRating
        
        return (
          <div
            key={starIndex}
            className={`relative ${!readonly ? 'cursor-pointer' : ''}`}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
          >
            <StarIcon
              className={`w-5 h-5 ${
                isFullStar || isHalfStar
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-200'
              }`}
            />
          </div>
        )
      })}
    </div>
  )
} 