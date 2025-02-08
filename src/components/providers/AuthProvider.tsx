'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { useEffect } from 'react'

function SessionLogger() {
  const { data: session, status } = useSession()
  
  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
  }, [session, status])
  
  return null
}

export function AuthProvider({
  children,
  session
}: {
  children: React.ReactNode
  session: Session | null
}) {
  useEffect(() => {
    console.log('Initial session:', session)
    
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage change:', e.key, e.newValue)
      if (e.key === 'next-auth.session-token') {
        window.location.reload()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [session])

  return (
    <SessionProvider session={session} refetchInterval={0}>
      <SessionLogger />
      {children}
    </SessionProvider>
  )
} 