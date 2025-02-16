'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'default' | 'destructive'
}

export const buttonVariants = ({ variant = 'default' }: { variant?: ButtonProps['variant'] } = {}) => {
  return cn(
    'px-4 py-2 rounded-md font-medium transition-colors',
    variant === 'outline' 
      ? 'border border-gray-300 hover:bg-gray-50'
      : variant === 'destructive'
      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      : 'bg-red-600 text-white hover:bg-red-700'
  )
}

export function Button({
  className,
  variant = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  )
} 