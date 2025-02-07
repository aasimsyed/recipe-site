'use client'

import { CldImage } from 'next-cloudinary'

interface RecipeImageProps {
  publicId: string
  title: string
}

export function RecipeImage({ publicId, title }: RecipeImageProps) {
  return (
    <div className="mb-8 rounded-lg overflow-hidden">
      <CldImage
        src={publicId}
        alt={title}
        width={1200}
        height={800}
        crop="fill"
        gravity="auto"
        className="w-full"
        priority
      />
    </div>
  )
} 