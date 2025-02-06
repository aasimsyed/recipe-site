'use client'

import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Input({
  className,
  ...props
}: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none',
        className
      )}
      {...props}
    />
  )
} 