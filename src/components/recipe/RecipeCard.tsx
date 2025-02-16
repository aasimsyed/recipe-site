'use client'

import { CldImage } from 'next-cloudinary'
import Link from 'next/link'
import { StarRating } from '@/components/ui/star-rating'
import type { Recipe } from '@/types/recipe'
import { useState, useEffect } from 'react'
import type { Media } from '@prisma/client/edge'
import { ErrorBoundary } from 'react-error-boundary'
import { formatCloudinaryUrl } from '@/lib/cloudinary'
import { useRouter } from 'next/navigation'

export type { Recipe }

const getCloudinaryPublicId = (url: string) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    return pathParts.slice(uploadIndex + 2).join('/').split('.')[0];
  } catch {
    return null;
  }
};

export function RecipeCard({ recipe, priority = false }: { 
  recipe: Recipe
  priority?: boolean 
}) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  const publicId = recipe.media?.[0]?.publicId

  console.log('RecipeCard media:', {
    title: recipe.title,
    publicId,
    mediaDetails: recipe.media?.[0]
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
              src={publicId}
              alt={recipe.title}
              width={600}
              height={400}
              crop="fill"
              gravity="auto"
              loading={priority ? 'eager' : 'lazy'}
              className="object-cover transform group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              onError={() => setImageError(true)}
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
              prefetch={true}
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