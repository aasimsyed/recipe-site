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

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (readonly) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const width = rect.width
    const position = x / width

    // Calculate the rating based on mouse position
    let newRating = starIndex
    if (position < 0.5) {
      newRating += 0.5
    } else {
      newRating += 1
    }

    setHoverRating(newRating)
  }

  const handleMouseLeave = () => {
    if (readonly) return
    setHoverRating(null)
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (readonly) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const width = rect.width
    const position = x / width

    // Calculate the rating based on click position
    let newRating = starIndex
    if (position < 0.5) {
      newRating += 0.5
    } else {
      newRating += 1
    }

    onChange?.(newRating)
  }

  const displayRating = hoverRating !== null ? hoverRating : rating

  return (
    <div 
      className={`flex items-center ${className}`} 
      onMouseLeave={handleMouseLeave}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const value = index + 1
        const isHalfStar = displayRating === index + 0.5
        const isFullStar = displayRating >= value

        return (
          <div
            key={`star-${index}`}
            className={`relative ${!readonly ? 'cursor-pointer' : ''}`}
            onClick={(e) => handleClick(e, index)}
            onMouseMove={(e) => handleMouseMove(e, index)}
          >
            <StarIcon
              key={`star-icon-${index}`}
              className={`w-5 h-5 ${
                isFullStar 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : isHalfStar
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