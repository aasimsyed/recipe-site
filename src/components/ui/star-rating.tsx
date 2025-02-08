'use client'

import { Star, StarHalf } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

interface StarRatingProps {
  rating: number
  readonly?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({ 
  rating = 0, 
  readonly = true, 
  onChange,
  className = ''
}: StarRatingProps) {
  // Ensure rating is a number and between 0-5
  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0))
  const roundedRating = Math.round(normalizedRating * 2) / 2 // Round to nearest 0.5
  
  return (
    <div className={`flex items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} p-0.5`}
          disabled={readonly}
          type="button"
          aria-label={`Rate ${star} stars`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className={`w-5 h-5 ${
              star <= roundedRating
                ? 'text-yellow-400'
                : 'text-gray-200'
            }`}
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ))}
      {!readonly && (
        <span className="ml-2 text-sm text-neutral-500">
          {roundedRating > 0 ? `${roundedRating} stars` : 'Select rating'}
        </span>
      )}
    </div>
  )
} 