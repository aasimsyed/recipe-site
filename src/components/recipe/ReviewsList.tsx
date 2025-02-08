'use client'

import Image from 'next/image'
import { UserCircle } from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    name: string | null
    image: string | null
  }
}

interface ReviewsListProps {
  reviews: Review[]
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (!reviews?.length) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No reviews yet. Be the first to review this recipe!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div 
          key={review.id} 
          className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {review.user?.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-neutral-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-neutral-900">
                  {review.user?.name || 'Anonymous User'}
                </span>
                <span className="text-sm text-neutral-500">
                  • {formatDate(review.createdAt)}
                </span>
              </div>
              <div className="mb-2">
                <StarRating rating={review.rating} readonly className="scale-90" />
              </div>
              {review.comment && (
                <p className="text-neutral-700">{review.comment}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 