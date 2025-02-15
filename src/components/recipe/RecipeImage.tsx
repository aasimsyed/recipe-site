'use client'

import { CldImage } from 'next-cloudinary'
import { cloudinaryConfig } from '@/lib/cloudinary-client'

interface RecipeImageProps {
  publicId: string
  title: string
  priority?: boolean
  className?: string
}

export function RecipeImage({ 
  publicId, 
  title, 
  priority = false,
  className = ''
}: RecipeImageProps) {
  if (!cloudinaryConfig.cloudName) {
    console.error('Cloudinary cloud name not configured')
    return null
  }

  return (
    <CldImage
      src={publicId}
      alt={title}
      width={1200}
      height={800}
      crop="fill"
      gravity="auto"
      loading={priority ? 'eager' : 'lazy'}
      className={`w-full h-full object-cover ${className}`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={priority}
    />
  )
} 