'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked: 'An account with this email already exists. Please sign in with your existing account.',
    Default: 'An error occurred during authentication'
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">
          {errorMessage}
        </p>
        <div className="mt-4 space-y-4">
          <Link
            href="/auth/signin"
            className="text-primary-600 hover:text-primary-500 block"
          >
            Try signing in again
          </Link>
          <Link
            href="/"
            className="text-neutral-600 hover:text-neutral-500 block"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 