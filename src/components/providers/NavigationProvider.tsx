'use client'

import { useSession } from 'next-auth/react'
import { useNavigationStore } from '@/stores/navigation'
import { useState, useEffect } from 'react'

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { setSession, setInitialized } = useNavigationStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSession(session)
    setInitialized(true)
  }, [session, setSession, setInitialized])

  if (!mounted) return null

  return <>{children}</>
} 