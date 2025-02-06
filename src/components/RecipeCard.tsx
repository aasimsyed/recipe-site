import Link from 'next/link'
import Image from 'next/image'
import { Recipe, Media, Author, Category, Review } from '@prisma/client'

type RecipeWithRelations = Recipe & {
  media: Pick<Media, 'url' | 'type'>[]
  author: Pick<Author, 'name' | 'image'>
  categories: Pick<Category, 'name' | 'slug'>[]
  reviews: Pick<Review, 'rating'>[]
}

interface RecipeCardProps {
  recipe: RecipeWithRelations
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link 
      href={`/recipes/${recipe.slug}`}
      className="group hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden bg-white"
    >
      <div className="aspect-video relative">
        {recipe.media[0]?.url ? (
          <Image
            src={recipe.media[0].url}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
          {recipe.title}
        </h2>
        <p className="text-gray-600 mt-2 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center mt-4 text-sm text-gray-500">
          <span>{recipe.cookTime + recipe.prepTime} mins</span>
          <span className="mx-2">•</span>
          <span>{recipe.servings} servings</span>
        </div>
      </div>
    </Link>
  )
} 