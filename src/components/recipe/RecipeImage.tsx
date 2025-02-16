'use client'

import { CldImage } from 'next-cloudinary'

interface RecipeImageProps {
  publicId: string
  title: string
  priority?: boolean
  className?: string
}

export function RecipeImage({ publicId, title, priority = false, className = '' }: RecipeImageProps) {
  return (
    <CldImage
      src={publicId}
      alt={title}
      width={800}
      height={600}
      crop="fill"
      gravity="auto"
      className={className}
      sizes="(max-width: 768px) 100vw, 800px"
      priority={priority}
    />
  )
} 