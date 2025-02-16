'use client'

import { cn } from "@/lib/utils"
import React from "react"

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = "Select"

export const SelectTrigger = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("relative w-full", className)} {...props} />
)

export const SelectValue = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("block truncate", className)} {...props} />
)

export const SelectContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(
    "absolute z-50 w-full mt-1 bg-popover text-popover-foreground",
    "rounded-md shadow-lg border overflow-hidden",
    className
  )} {...props} />
)

export const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
        "transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = "SelectItem"
