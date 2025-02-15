'use client'

import Image from 'next/image'
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
      width={800}
      height={450}
      src={publicId}
      alt={title}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      sizes="(max-width: 768px) 100vw, 800px"
      className={`w-full h-full object-cover ${className}`}
    />
  )
} 