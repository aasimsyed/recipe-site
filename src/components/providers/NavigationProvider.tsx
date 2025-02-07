'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { useNavigationStore } from '@/store/navigation-store'

const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const { setSession, setInitialized } = useNavigationStore()
  const [mounted, setMounted] = useState(false)

  // Memoize initialization to prevent unnecessary re-renders
  const initializeNavigation = useCallback(() => {
    if (status !== 'loading') {
      setSession(session)
      setInitialized(true)
    }
  }, [session, setSession, setInitialized, status])

  useEffect(() => {
    // Use requestIdleCallback for non-critical initialization
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        setMounted(true)
        initializeNavigation()
      })
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        setMounted(true)
        initializeNavigation()
      }, 0)
    }
  }, [initializeNavigation])

  if (!mounted) {
    return null
  }

  return <>{children}</>
}

export default NavigationProvider
export { NavigationProvider } 