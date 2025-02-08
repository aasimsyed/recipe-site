'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CookingPot } from 'lucide-react'
import { toast } from 'sonner'

export function CookModeToggle() {
  const [isCookMode, setIsCookMode] = useState(false)
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  const toggleCookMode = async () => {
    if (!isCookMode) {
      try {
        // Check if Wake Lock API is supported
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen')
          setWakeLock(lock)
          toast.success('Cook Mode activated - screen will stay awake')
          
          // Add listener for when wake lock is released by the system
          lock.addEventListener('release', () => {
            toast.info('Screen wake lock was released by the system')
            setIsCookMode(false)
            setWakeLock(null)
          })
        } else {
          toast.error('Screen wake lock is not supported in your browser')
          return
        }
      } catch (err) {
        console.error('Wake Lock failed:', err)
        toast.error('Failed to keep screen awake. Please check your device settings.')
        return
      }
    } else {
      try {
        await wakeLock?.release()
        toast.success('Cook Mode deactivated')
      } catch (err) {
        console.error('Failed to release wake lock:', err)
      }
      setWakeLock(null)
    }
    setIsCookMode(!isCookMode)
  }

  // Clean up wake lock on component unmount
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(console.error)
      }
    }
  }, [wakeLock])

  // Handle visibility change (e.g., when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isCookMode && !wakeLock) {
        try {
          const lock = await navigator.wakeLock.request('screen')
          setWakeLock(lock)
        } catch (err) {
          console.error('Failed to reacquire wake lock:', err)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isCookMode, wakeLock])

  return (
    <Button 
      onClick={toggleCookMode} 
      className={`
        font-medium px-4 py-2 rounded-md
        flex items-center gap-2 transition-all duration-200
        ${isCookMode 
          ? 'bg-red-600 hover:bg-red-700 text-white' 
          : 'bg-red-500 hover:bg-red-600 text-white'
        }
        shadow-sm hover:shadow-md transform hover:-translate-y-0.5
      `}
    >
      <CookingPot className="h-4 w-4" />
      {isCookMode ? 'Exit Cook Mode' : 'Cook Mode'}
    </Button>
  )
} 