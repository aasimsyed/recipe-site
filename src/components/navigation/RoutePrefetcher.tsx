'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RoutePrefetcher() {
  const router = useRouter()

  useEffect(() => {
    const prefetchRoutes = () => {
      // Prefetch common routes
      router.prefetch('/recipes')
      router.prefetch('/categories')
      
      // Prefetch visible links
      const links = document.querySelectorAll('a[href^="/"]')
      links.forEach(link => {
        const href = link.getAttribute('href')
        if (href && isInViewport(link)) {
          router.prefetch(href)
        }
      })
    }

    const isInViewport = (element: Element) => {
      const rect = element.getBoundingClientRect()
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      )
    }

    prefetchRoutes()

    // Set up intersection observer for dynamic prefetching
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement
            const href = link.getAttribute('href')
            if (href) router.prefetch(href)
          }
        })
      },
      { rootMargin: '50px' }
    )

    document.querySelectorAll('a[href^="/"]').forEach(link => {
      observer.observe(link)
    })

    return () => observer.disconnect()
  }, [router])

  return null
} 