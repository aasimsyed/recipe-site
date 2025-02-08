'use client'

import Link from 'next/link'
import { Recipe } from '@/types/recipe'
import { CldImage } from 'next-cloudinary'

const getPublicId = (url: string) => {
  if (!url.includes('cloudinary.com')) return ''
  const parts = url.split('/')
  return parts.slice(parts.indexOf('upload') + 1).join('/')
}

interface SearchResultsProps {
  results: Recipe[]
  query: string
}

export function SearchResults({ results, query }: SearchResultsProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{`Search Results for "${query}"`}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((recipe) => {
          const imageUrl = recipe.media?.[0]?.url || '/placeholder.jpg'
          const publicId = getPublicId(imageUrl)

          return (
            <div key={recipe.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {publicId ? (
                <CldImage
                  src={publicId}
                  alt={recipe.title}
                  width={400}
                  height={300}
                  crop="fill"
                  gravity="auto"
                  className="h-48 object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="h-48 bg-neutral-200 flex items-center justify-center">
                  <span className="text-neutral-500">No image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  <Link href={`/recipes/${recipe.slug}`} className="hover:text-red-600">
                    {recipe.title}
                  </Link>
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-4">{recipe.cookTime} mins</span>
                  <span>{recipe.servings} servings</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { SearchResultsSkeleton } from './SearchResultsSkeleton' 