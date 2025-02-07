import { getRecipeBySlug } from '@/lib/recipes'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CldImage } from 'next-cloudinary'
import { Ingredients } from '@/components/recipe/Ingredients'
import { StepRenderer } from '@/components/recipe/StepRenderer'
import { NutritionFacts } from '@/components/recipe/NutritionFacts'
import { RecipeContent } from '@/components/recipe/RecipeContent'
import { CookModeToggle } from '@/components/recipe/CookModeToggle'
import { YouTubeVideo } from '@/components/recipe/YouTubeVideo'
import { Comments } from '@/components/recipe/Comments'
import { headers } from 'next/headers'
import { StarRating } from '@/components/ui/star-rating'
import { RecipeImage } from '@/components/recipe/RecipeImage'
import { RecipeHeader } from '@/components/recipe/RecipeHeader'
import { ReviewForm } from '@/components/recipe/ReviewForm'
import { Suspense } from 'react'
import { LoadingGrid } from '@/components/loading/LoadingGrid'

// Keep ISR but reduce revalidation time
export const revalidate = 60 // Revalidate every minute

// Use Next.js's built-in types
export default async function RecipePage({
  params
}: {
  params: { slug: string }
}) {
  if (!params.slug) return notFound()

  try {
    const recipe = await getRecipeBySlug(params.slug)
    if (!recipe) return notFound()

    const mainImage = recipe.media?.find(m => m.type === 'IMAGE')
    const rating = recipe.rating ?? 0

    return (
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <RecipeHeader
          title={recipe.title}
          rating={rating}
          reviewCount={recipe.reviews.length}
          description={recipe.description}
          cookTime={recipe.cookTime}
          servings={recipe.servings}
        />

        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          {mainImage?.publicId && (
            <RecipeImage 
              publicId={mainImage.publicId}
              title={recipe.title}
              priority={true} // Prioritize main image loading
            />
          )}
        </Suspense>

        <div className="flex justify-end mb-6">
          <CookModeToggle />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <RecipeContent content={recipe.content} />
            <StepRenderer steps={recipe.steps} />
            {recipe.video && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Video Guide</h2>
                <YouTubeVideo url={recipe.video} />
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <Ingredients items={recipe.ingredients} />
            {recipe.nutrition && (
              <NutritionFacts data={recipe.nutrition} />
            )}
          </aside>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-6">Leave a Review</h2>
          <ReviewForm 
            recipeId={recipe.id}
            slug={recipe.slug}
          />
        </div>

        <Comments 
          recipeId={recipe.id}
          className="mt-12"
        />
      </article>
    )
  } catch (error) {
    console.error('Error loading recipe:', error)
    throw error
  }
}

// Simplify metadata generation
export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const recipe = await getRecipeBySlug(params.slug)
  if (!recipe) return { title: 'Recipe Not Found' }
  
  const headersList = headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: recipe.title,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: recipe.media.map(m => ({ url: m.url }))
    }
  }
}