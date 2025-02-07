'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      const result = await signIn('google', { 
        callbackUrl,
        redirect: false
      })
      
      if (result?.error === 'OAuthAccountNotLinked') {
        toast.error('An account with this email already exists. Please sign in with your existing account.')
      } else if (result?.error) {
        toast.error('Failed to sign in. Please try again.')
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
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      <Image
        src="/google.svg"
        alt="Google"
        width={20}
        height={20}
        priority
      />
      <span className="text-sm font-medium">
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </span>
    </button>
  )
} 