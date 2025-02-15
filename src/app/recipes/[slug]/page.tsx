import { getRecipeBySlug } from '@/lib/recipes'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Ingredients } from '@/components/recipe/Ingredients'
import { StepRenderer } from '@/components/recipe/StepRenderer'
import { NutritionFacts } from '@/components/recipe/NutritionFacts'
import { RecipeContent } from '@/components/recipe/RecipeContent'
import { CookModeToggle } from '@/components/recipe/CookModeToggle'
import { YouTubeVideo } from '@/components/recipe/YouTubeVideo'
import { RecipeImage } from '@/components/recipe/RecipeImage'
import { RecipeHeader } from '@/components/recipe/RecipeHeader'
import { ReviewForm } from '@/components/recipe/ReviewForm'
import { Suspense, use } from 'react'
import { prisma } from '@/lib/prisma'
import { ReviewsList } from '@/components/recipe/ReviewsList'
import { redis, getFromCache, setCache } from '@/lib/redis'
import { StarRating } from '@/components/ui/star-rating'
import { ClockIcon, UsersIcon } from '@heroicons/react/24/outline'
import type { Recipe } from '@/types/recipe'
import type { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { AdminActions } from '@/components/recipe/AdminActions'
import { headers } from 'next/headers'
import type { JSONContent } from '@tiptap/core'

// Add this single configuration
export const dynamic = 'force-dynamic'

export const revalidate = 3600 // Revalidate every hour

interface Step {
  content: string
}

interface Ingredient {
  name: string
  amount: string
  unit: string
}

interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface RecipeWithReviews extends Recipe {
  reviews: {
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    updatedAt: Date
    userId: string
    recipeId: string
    user: {
      name: string | null
      image: string | null
    }
  }[]
  media: Prisma.MediaGetPayload<{}>[]
  content: JSONContent
  steps: Step[]
  ingredients: Ingredient[]
  nutrition: Nutrition | null
  reviewCount: number
}

// Update getRecipe function with proper cache handling
async function getRecipe(slug: string): Promise<RecipeWithReviews | null> {
  const headersList = headers()
  const cacheKey = `recipe:${slug}`
  
  try {
    // Try to get from cache first
    const cached = await getFromCache(cacheKey)
    if (cached) {
      // Handle both string and object cache values
      const parsedCache = typeof cached === 'string' 
        ? JSON.parse(cached)
        : cached;
      return parsedCache as RecipeWithReviews;
    }

    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        content: true,
        ingredients: true,
        steps: true,
        cookTime: true,
        servings: true,
        rating: true,
        prepTime: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        video: true,
        media: {
          where: { type: 'IMAGE' },
          select: {
            id: true,
            type: true,
            url: true,
            publicId: true,
            recipeId: true
          }
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            userId: true,
            recipeId: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    if (!recipe) return null

    // Process the recipe data
    const processedRecipe: RecipeWithReviews = {
      ...recipe,
      content: typeof recipe.content === 'string' 
        ? JSON.parse(recipe.content) 
        : recipe.content,
      steps: typeof recipe.steps === 'string' 
        ? JSON.parse(recipe.steps) 
        : recipe.steps,
      ingredients: typeof recipe.ingredients === 'string' 
        ? JSON.parse(recipe.ingredients) 
        : recipe.ingredients,
      nutrition: null,
      // Ensure all required Recipe properties are included
      rating: recipe.rating || 0,
      reviewCount: recipe.reviews.length,
      media: recipe.media || [],
      reviews: recipe.reviews || []
    }

    // Cache the stringified result
    await setCache(cacheKey, JSON.stringify(processedRecipe), 3600)
    
    return processedRecipe
  } catch (error) {
    console.error('Recipe fetch error:', error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error)
    return null
  }
}

// Make sure this is a proper async component
export default async function RecipePage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const [recipe, session] = await Promise.all([
    getRecipe(params.slug),
    getServerSession(authOptions)
  ])
  
  if (!recipe) {
    notFound()
  }

  const isAdmin = session?.user?.role === 'ADMIN'

  // Calculate average rating
  const averageRating = recipe.reviews.length > 0
    ? recipe.reviews.reduce((acc, review) => acc + review.rating, 0) / recipe.reviews.length
    : 0

  // Get existing review if user is logged in
  const existingReview = session?.user?.email ? await prisma.review.findFirst({
    where: {
      recipeId: recipe.id,
      user: {
        email: session.user.email
      }
    },
    select: {
      rating: true,
      comment: true
    }
  }) : null

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
    <>
      {/* Add resource hints */}
      <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8 bg-white rounded-lg shadow-sm p-8 border border-neutral-100">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-neutral-900 mb-6 leading-tight">
            {recipe.title}
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <StarRating 
                rating={averageRating} 
                readonly={true}
                className="scale-110" 
              />
              <span className="text-sm text-neutral-500 font-medium">
                ({recipe.reviews.length} {recipe.reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <span>{recipe.cookTime} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                <span>{recipe.servings} servings</span>
              </div>
            </div>
          </div>

          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed max-w-3xl">
            {recipe.description}
          </p>
        </header>

        <Suspense fallback={<div className="h-96 bg-neutral-100 rounded-lg animate-pulse mb-8" />}>
          {mainImage?.publicId ? (
            <div className="mb-8 rounded-lg overflow-hidden shadow-sm">
              <RecipeImage 
                publicId={mainImage.publicId}
                title={recipe.title}
                priority={true}
              />
            </div>
          ) : (
            <div className="h-96 bg-neutral-100 flex items-center justify-center mb-8 rounded-lg">
              <span className="text-neutral-400">No image available</span>
            </div>
          )}
        </Suspense>

        <div className="flex justify-end mb-6">
          <CookModeToggle />
        </div>

        {isAdmin && <AdminActions slug={recipe.slug} />}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2 space-y-8">
            <div className="prose prose-lg max-w-none">
              <RecipeContent content={recipe.content} />
            </div>
            
            <section className="space-y-6">
              <h2 className="font-display text-2xl font-semibold text-neutral-900">Instructions</h2>
              <StepRenderer steps={recipe.steps} />
            </section>

            {recipe.video && (
              <section className="space-y-4">
                <h2 className="font-display text-2xl font-semibold text-neutral-900">Video Guide</h2>
                <YouTubeVideo url={recipe.video} />
              </section>
            )}
          </div>

          <aside className="space-y-8">
            <section className="bg-white rounded-lg shadow-sm p-6 border border-neutral-100">
              <h2 className="font-display text-xl font-semibold mb-4 text-neutral-900">Ingredients</h2>
              <Ingredients items={recipe.ingredients} />
            </section>

            {recipe.nutrition && (
              <section className="bg-white rounded-lg shadow-sm p-6 border border-neutral-100">
                <h2 className="font-display text-xl font-semibold mb-4 text-neutral-900">Nutrition Facts</h2>
                <NutritionFacts data={recipe.nutrition} />
              </section>
            )}
          </aside>
        </div>

        <section className="border-t pt-12">
          <h2 className="font-display text-2xl font-semibold mb-8 text-neutral-900">Reviews</h2>
          <ReviewForm 
            recipeId={recipe.id} 
            slug={recipe.slug} 
            existingReview={existingReview}
          />
          <ReviewsList reviews={recipe.reviews} />
        </section>
      </article>
    </>
  )
}

// Update metadata generation to be dynamic as well
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const headers = new Headers()
  headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  
  const recipe = await getRecipeBySlug(params.slug)
  
  if (!recipe) {
    return {
      title: 'Recipe Not Found',
      description: 'The requested recipe could not be found.'
    }
  }

  return {
    title: recipe.title,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      type: 'article'
    }
  }
}