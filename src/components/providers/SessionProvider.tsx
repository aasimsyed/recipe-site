'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

export function SessionProvider({ 
  children,
  defaultSession
}: { 
  children: React.ReactNode
  defaultSession?: Session | null
}) {
  return (
    <NextAuthSessionProvider
      session={defaultSession}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      refetchInterval={5 * 60} // Only refetch every 5 minutes
    >
      {children}
    </NextAuthSessionProvider>
  )
} 