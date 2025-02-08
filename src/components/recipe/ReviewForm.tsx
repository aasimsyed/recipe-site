'use client'

import { useState } from 'react'
import { StarRating } from '@/components/ui/star-rating'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useSession, signIn } from 'next-auth/react'
import { AuthLoading } from '@/components/auth/AuthLoading'

interface ReviewFormProps {
  recipeId: string
  slug: string
  existingReview?: {
    rating: number
    comment: string | null
  } | null
}

export function ReviewForm({ recipeId, slug, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [comment, setComment] = useState(existingReview?.comment ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast.error('Please sign in to leave a review')
      signIn('google', {
        callbackUrl: window.location.href,
      })
      return
    }

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId,
          rating,
          comment: comment.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      if (!existingReview) {
        toast.success('Review submitted successfully!')
      } else {
        toast.success('Review updated successfully!')
      }
      
      // Force a hard refresh of the page
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return <AuthLoading />
  }

  if (!session) {
    return (
      <div className="text-center p-6 bg-neutral-50 rounded-lg">
        <p className="text-neutral-600 mb-4">
          Please sign in to leave a review
        </p>
        <button
          onClick={() => signIn('google')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Rating
        </label>
        <StarRating 
          rating={rating} 
          readonly={false} 
          onChange={setRating}
          className="text-lg" 
        />
      </div>
      
      <div className="space-y-2">
        <label 
          htmlFor="comment" 
          className="block text-sm font-medium text-gray-700"
        >
          Comment (optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          rows={4}
          placeholder="Share your thoughts about this recipe..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
      </button>
    </form>
  )
} 