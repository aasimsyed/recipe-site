'use client'

import { useSession } from 'next-auth/react'
import { AuthSkeleton } from './AuthSkeleton'
import { useEffect, useState, Suspense } from 'react'
import { sessionCache } from '@/lib/session-cache'

export function AuthLoading({ 
  children,
  fallback = <AuthSkeleton />
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [status])

  // Show children immediately if we have a cached session
  if (session && sessionCache.get(session.user.id)) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    )
  }

  return <>{children}</>
} 