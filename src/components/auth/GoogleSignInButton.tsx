'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log('Button session status:', status)
    console.log('Button session data:', session)
  }, [session, status])

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      console.log('Starting sign in...')
      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: false,
      })
      console.log('Sign in result:', result)
      
      if (result?.error) {
        toast.error('Failed to sign in')
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </svg>
      <span className="text-sm font-medium">
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </span>
    </button>
  )
} 