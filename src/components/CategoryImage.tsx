'use client'

import { CldImage } from 'next-cloudinary'
import { useState } from 'react'

interface CategoryImageProps {
  publicId: string | null
  name: string
}

export function CategoryImage({ publicId, name }: CategoryImageProps) {
  const [imageError, setImageError] = useState(false)
  
  console.log('CategoryImage render:', {
    publicId,
    name,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  });

  if (!publicId || imageError) {
    console.log('CategoryImage showing fallback:', { publicId, imageError });
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    )
  }

  return (
    <CldImage
      width="600"
      height="400"
      src={publicId}
      alt={name}
      className="w-full h-48 object-cover rounded-t-lg"
      crop="fill"
      gravity="auto"
      sizes="(max-width: 768px) 100vw, 50vw"
      onError={(e) => {
        console.error('Failed to load image:', {
          publicId,
          error: e
        });
        setImageError(true);
      }}
    />
  )
} 