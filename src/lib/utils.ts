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