'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CookingPot } from 'lucide-react'

export function CookModeToggle() {
  const [isCookMode, setIsCookMode] = useState(false)
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  const toggleCookMode = async () => {
    if (!isCookMode) {
      try {
        const lock = await navigator.wakeLock.request('screen')
        setWakeLock(lock)
      } catch (err) {
        console.error('Wake Lock failed:', err)
      }
    } else {
      wakeLock?.release()
      setWakeLock(null)
    }
    setIsCookMode(!isCookMode)
  }

  useEffect(() => {
    return () => {
      wakeLock?.release()
    }
  }, [wakeLock])

  return (
    <Button onClick={toggleCookMode} variant={isCookMode ? 'default' : 'outline'}>
      <CookingPot className="mr-2 h-4 w-4" />
      {isCookMode ? 'Exit Cook Mode' : 'Cook Mode'}
    </Button>
  )
} 