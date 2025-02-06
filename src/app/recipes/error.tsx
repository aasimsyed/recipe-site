'use client'

export default function ErrorRecipes({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-display font-bold text-neutral-800 mb-4">
        Something went wrong!
      </h2>
      <p className="text-neutral-600 mb-6">
        {error.message || 'Failed to load recipes'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
      >
        Try again
      </button>
    </div>
  )
} 