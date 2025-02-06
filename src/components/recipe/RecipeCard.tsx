'use client'

import { CldImage } from 'next-cloudinary'
import Link from 'next/link'
import { StarRating } from '@/components/ui/star-rating'
import { Recipe } from '@/types'
import { useState } from 'react'

export function RecipeCard({ recipe, priority = false }: { 
  recipe: Recipe
  priority?: boolean 
}) {
  const [imageError, setImageError] = useState(false)
  
  // Add logging to see what we're getting from recipe.media
  console.log('Recipe media:', recipe.media);
  
  const imageUrl = recipe.media.find(m => m.type === 'IMAGE')?.url || '/placeholder.jpg'
  console.log('Found imageUrl:', imageUrl);
  
  const getPublicId = (url: string) => {
    if (!url.includes('cloudinary.com')) return '';
    // Find the matching media item
    const mediaItem = recipe.media.find(m => m.url === url);
    return mediaItem?.publicId || '';  // Return the stored public_id
  }

  const publicId = getPublicId(imageUrl)
  console.log('Final publicId:', publicId);
  
  return (
    <article className="group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden">
        {publicId && !imageError ? (
          <CldImage
            key={publicId}
            src={publicId}
            alt={recipe.title}
            width={800}
            height={600}
            crop="fill"
            gravity="auto"
            loading={priority ? 'eager' : 'lazy'}
            className="object-cover transform group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            onError={(e) => {
              console.error('CldImage error:', e);
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <span className="text-neutral-500">No image</span>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6">
        <h3 className="font-display text-lg md:text-title mb-2 md:mb-3 text-neutral-700 group-hover:text-primary-500 transition-colors line-clamp-2">
          <Link 
            href={`/recipes/${recipe.slug}`}
            prefetch={false}
            className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm"
          >
            {recipe.title}
          </Link>
        </h3>
        <p className="text-sm md:text-base text-neutral-600 mb-4 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>
        <div className="flex items-center justify-between text-xs md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2">
            <StarRating rating={recipe.rating} className="scale-90 md:scale-100" />
            <span className="text-neutral-500">
              ({recipe.reviews.length})
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-neutral-500">
            <span>{recipe.cookTime} mins</span>
            <span>•</span>
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </div>
    </article>
  )
} 