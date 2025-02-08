'use client'

import { CldImage } from 'next-cloudinary'
import Link from 'next/link'
import { StarRating } from '@/components/ui/star-rating'
import type { Recipe } from '@/types/recipe'
import { useState, useEffect } from 'react'
import type { Media } from '@prisma/client/edge'
import { ErrorBoundary } from 'react-error-boundary'
import { formatCloudinaryUrl } from '@/lib/cloudinary'

export type { Recipe }

const getPublicId = (url: string) => {
  if (!url || !url.includes('cloudinary.com')) return null
  try {
    // Extract the public ID from a Cloudinary URL
    const matches = url.match(/upload\/(?:v\d+\/)?(.+)$/)
    return matches ? matches[1].split('.')[0] : null
  } catch (error) {
    console.error('Error extracting public ID:', error)
    return null
  }
}

export function RecipeCard({ recipe, priority = false }: { 
  recipe: Recipe
  priority?: boolean 
}) {
  const [imageError, setImageError] = useState(false)
  const originalPublicId = recipe.media?.[0]?.publicId
  const publicId = formatCloudinaryUrl(originalPublicId)

  useEffect(() => {
    setImageError(false)
  }, [publicId])

  console.log('RecipeCard media data:', {
    recipeTitle: recipe.title,
    originalPublicId,
    formattedPublicId: publicId,
    mediaUrl: recipe.media?.[0]?.url,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  });

  return (
    <ErrorBoundary
      fallback={<div>Error loading recipe card</div>}
      onError={(error) => console.error('RecipeCard error:', error)}
    >
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
                console.error('CldImage error for:', { 
                  originalPublicId,
                  publicId, 
                  title: recipe.title,
                  error: e,
                  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                });
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-400 text-sm">No image available</span>
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
              <StarRating 
                rating={recipe.rating ?? 0} 
                readonly={true}
                className="scale-90 md:scale-100" 
              />
              <span className="text-neutral-500">
                ({recipe.reviews?.length ?? 0})
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
    </ErrorBoundary>
  )
} 