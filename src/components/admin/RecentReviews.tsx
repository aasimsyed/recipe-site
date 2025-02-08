'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { StarRating } from '@/components/ui/star-rating'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    name: string | null
  }
  recipe: {
    title: string
  }
}

interface RecentReviewsProps {
  reviews: Review[]
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
      <h2 className="font-display text-xl font-semibold mb-4">Recent Reviews</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Link 
                  href={`/recipes/${review.recipe.title}`}
                  className="font-medium text-neutral-900 hover:text-primary-600"
                >
                  {review.recipe.title}
                </Link>
                <p className="text-sm text-neutral-500">
                  by {review.user.name || 'Anonymous'}
                </p>
              </div>
              <span className="text-sm text-neutral-500">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} readonly className="scale-90" />
              {review.comment && (
                <p className="text-sm text-neutral-600 line-clamp-1">
                  {review.comment}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 