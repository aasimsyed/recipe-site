'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

// Increase max listeners globally
if (typeof process !== 'undefined') {
  require('events').EventEmitter.defaultMaxListeners = 20
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => 
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity, // Data will never become stale automatically
            cacheTime: 1000 * 60 * 60, // Cache for 1 hour
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
            retryDelay: 1000,
            networkMode: 'offlineFirst',
          },
        },
      })
  )

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
} 