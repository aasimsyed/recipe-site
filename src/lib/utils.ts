import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: unknown[]) {
  return twMerge(clsx(inputs))
}

export function parseJSONField(field: any) {
  if (typeof field === 'string') {
    return JSON.parse(field)
  }
  return field
}

/**
 * Formats a date into a relative time string or absolute date
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  // Handle invalid or null dates
  if (!date) return 'Unknown date'
  
  try {
    const d = new Date(date)
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      return 'Invalid date'
    }
    
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    // Show relative time for recent dates
    if (days < 1) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours < 1) {
        const minutes = Math.floor(diff / (1000 * 60))
        if (minutes < 1) return 'just now'
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
      }
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    }
    if (days < 7) {
      return `${days} day${days === 1 ? '' : 's'} ago`
    }
    
    // Show absolute date for older dates
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
} 