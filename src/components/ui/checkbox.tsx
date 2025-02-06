'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'h-5 w-5 rounded border-2 border-gray-300 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-white">
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
} 