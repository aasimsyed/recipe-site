'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignInButton() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await signIn('google', { 
        redirect: true,
        callbackUrl: '/admin'
      })

      // This won't execute if redirect is true
      if (result?.error) {
        console.error('Sign in error:', result.error)
        setError('Access denied. Please sign in with an authorized email address.')
      } else if (result?.ok) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="provider">
          <button
            onClick={handleSignIn}
            type="submit"
            className="button"
            disabled={isLoading}
          >
            <Image
              src="https://authjs.dev/img/providers/google.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
            <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-4 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </>
  )
} 