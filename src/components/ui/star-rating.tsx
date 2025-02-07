'use client'

import { Star, StarHalf } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

interface StarRatingProps {
  rating: number
  className?: string
  readonly?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({ 
  rating: initialRating, 
  className = '',
  readonly = true,
  onChange 
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState<number | null>(null)

  useEffect(() => {
    setRating(initialRating)
  }, [initialRating])

  const handleRatingChange = useCallback((newRating: number) => {
    if (readonly) return
    const clampedRating = Math.max(0, Math.min(5, newRating))
    setRating(clampedRating)
    onChange?.(clampedRating)
  }, [readonly, onChange])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (readonly) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const starWidth = rect.width / 5
    const newRating = Math.min(5, Math.max(0.5, Math.ceil((x / starWidth) * 2) / 2))
    setHoverRating(newRating)
  }, [readonly])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (readonly) return
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }, [readonly])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || readonly) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const starWidth = rect.width / 5
    const newRating = Math.min(5, Math.max(0.5, Math.ceil((x / starWidth) * 2) / 2))
    setHoverRating(newRating)
  }, [isDragging, readonly])

  const handleTouchEnd = useCallback(() => {
    if (readonly) return
    setIsDragging(false)
    if (hoverRating !== null) {
      handleRatingChange(hoverRating)
    }
  }, [readonly, hoverRating, handleRatingChange])

  const displayRating = hoverRating ?? rating

  return (
    <div className={`inline-flex ${className}`}>
      <div 
        className={`flex items-center gap-0.5 w-[6.7rem] ${!readonly ? 'cursor-pointer' : ''}`}
        {...(!readonly ? {
          onMouseMove: handleMouseMove,
          onMouseLeave: () => setHoverRating(null),
          onClick: () => hoverRating !== null && handleRatingChange(hoverRating),
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
        } : {})}
      >
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1
          const isHalfStar = displayRating > i && displayRating < starValue
          const isFullStar = displayRating >= starValue

          return (
            <div 
              key={i} 
              className="relative w-5 h-5 transition-colors duration-150"
            >
              {isHalfStar ? (
                <StarHalf
                  className="absolute w-5 h-5 text-yellow-400 fill-yellow-400 transition-colors duration-150"
                />
              ) : (
                <Star
                  className={`w-5 h-5 transition-colors duration-150 ${
                    isFullStar
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 