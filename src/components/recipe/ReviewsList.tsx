import { formatDistance } from 'date-fns'
import { StarRating } from '@/components/ui/star-rating'
import Image from 'next/image'

interface Review {
  id: string
  rating: number
  comment: string
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
  if (reviews.length === 0) {
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
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="text-neutral-500 text-sm">
                    {review.user.name?.[0] || '?'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900">
                    {review.user.name || 'Anonymous'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} readonly size="sm" />
                    <span className="text-sm text-neutral-500">
                      {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              
              {review.comment && (
                <p className="mt-3 text-neutral-700 whitespace-pre-wrap">
                  {review.comment}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 