'use client'

import { useEffect } from 'react'

export function EnvironmentCheck() {
  useEffect(() => {
    console.log('Window exists:', typeof window !== 'undefined')
    console.log('Self exists:', typeof self !== 'undefined')
    console.log('Document exists:', typeof document !== 'undefined')
  }, [])

  return null
} 