import { getRecipeBySlug } from '@/lib/recipes'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Ingredients } from '@/components/recipe/Ingredients'
import { StepRenderer } from '@/components/recipe/StepRenderer'
import { NutritionFacts } from '@/components/recipe/NutritionFacts'
import { RecipeContent } from '@/components/recipe/RecipeContent'
import { CookModeToggle } from '@/components/recipe/CookModeToggle'
import { YouTubeVideo } from '@/components/recipe/YouTubeVideo'
import { headers } from 'next/headers'
import { RecipeImage } from '@/components/recipe/RecipeImage'
import { RecipeHeader } from '@/components/recipe/RecipeHeader'
import { ReviewForm } from '@/components/recipe/ReviewForm'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ReviewsList } from '@/components/recipe/ReviewsList'

// Keep ISR but reduce revalidation time
export const revalidate = 60 // Revalidate every minute

async function getRecipeWithReviews(slug: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      media: {
        select: {
          type: true,
          url: true,
          publicId: true
        },
        where: {
          type: 'IMAGE'
        },
        take: 1
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
  
  if (!recipe) return null;
  
  // Add detailed logging for media
  console.log('Recipe media data:', {
    recipeTitle: recipe.title,
    mediaCount: recipe.media.length,
    mediaDetails: recipe.media.map(m => ({
      type: m.type,
      publicId: m.publicId,
      url: m.url
    }))
  });
  
  return {
    ...recipe,
    content: typeof recipe.content === 'string' ? JSON.parse(recipe.content) : recipe.content,
    steps: typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : recipe.steps,
    ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
    nutrition: recipe.nutrition ? 
      (typeof recipe.nutrition === 'string' ? JSON.parse(recipe.nutrition) : recipe.nutrition) 
      : null
  }
}

// Use Next.js's built-in types
export default async function RecipePage({
  params
}: {
  params: { slug: string }
}) {
  const recipe = await getRecipeWithReviews(params.slug)
  
  if (!recipe) {
    notFound()
  }

  const existingReview = recipe.reviews[0] || null

  const mainImage = recipe.media?.[0]
  console.log('Main image data:', {
    recipeTitle: recipe.title,
    imageData: mainImage ? {
      type: mainImage.type,
      publicId: mainImage.publicId,
      url: mainImage.url
    } : null
  });

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <RecipeHeader
        title={recipe.title}
        rating={recipe.rating}
        reviewCount={recipe.reviews.length}
        description={recipe.description}
        cookTime={recipe.cookTime}
        servings={recipe.servings}
      />

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
        {mainImage?.publicId ? (
          <RecipeImage 
            publicId={mainImage.publicId}
            title={recipe.title}
            priority={true}
          />
        ) : (
          <div className="h-64 bg-neutral-100 flex items-center justify-center mb-8 rounded-lg">
            <span className="text-neutral-400">No image available</span>
          </div>
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
              <h2 className="font-display font-semibold text-2xl mb-4">Video Guide</h2>
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
        <h2 className="font-display font-semibold text-2xl mb-6">Reviews</h2>
        <ReviewForm 
          recipeId={recipe.id}
          slug={recipe.slug}
          existingReview={existingReview}
        />
        
        <div className="mt-8">
          <ReviewsList reviews={recipe.reviews} />
        </div>
      </div>
    </article>
  )
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