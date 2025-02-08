'use client'

import { CldImage } from 'next-cloudinary'
import { formatCloudinaryUrl } from '@/lib/cloudinary'

interface RecipeImageProps {
  publicId: string
  title: string
  priority?: boolean
}

export function RecipeImage({ publicId, title, priority = true }: RecipeImageProps) {
  const formattedPublicId = formatCloudinaryUrl(publicId);
  console.log('RecipeImage props:', { 
    originalPublicId: publicId, 
    formattedPublicId, 
    title,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME 
  });
  
  if (!formattedPublicId) {
    console.warn('Missing or invalid publicId for recipe:', title);
    return (
      <div className="mb-8 rounded-lg overflow-hidden bg-neutral-100 h-[400px] flex items-center justify-center">
        <span className="text-neutral-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg overflow-hidden">
      <CldImage
        src={formattedPublicId}
        alt={title}
        width={1200}
        height={800}
        crop="fill"
        gravity="auto"
        className="w-full"
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px"
        onError={(e) => {
          console.error('CldImage error for:', { 
            formattedPublicId, 
            title,
            error: e,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
          });
        }}
      />
    </div>
  )
} 