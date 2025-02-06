'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-display font-bold text-neutral-800 mb-4">
          Something went wrong!
        </h2>
        <p className="text-neutral-600 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-md transition-colors inline-block"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
} 