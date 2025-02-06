'use client'

import { ErrorBoundary } from 'react-error-boundary'

export function NavigationError({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-red-50 p-4 text-red-700">
          Navigation failed to load
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
} 