'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function PerformanceMonitor() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const reportWebVitals = (metric: any) => {
      // You can send this to your analytics service
      console.log(metric)
    }

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        reportWebVitals(entry)
      })
    })

    observer.observe({ entryTypes: ['largest-contentful-paint', 'fid', 'cls', 'ttfb'] })

    return () => {
      observer.disconnect()
    }
  }, [pathname, searchParams])

  return null
} 