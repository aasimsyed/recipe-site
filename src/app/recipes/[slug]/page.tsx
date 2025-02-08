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
import { redis, getFromCache, setCache } from '@/lib/redis'
import { StarRating } from '@/components/recipe/StarRating'
import { ClockIcon, UsersIcon } from '@heroicons/react/24/outline'
import type { Recipe } from '@/types/recipe'
import type { Review, Media, MediaType } from '@prisma/client'
import type { JSONContent } from '@tiptap/core'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// Add dynamic route segment config
export const dynamic = 'force-static'
export const dynamicParams = false

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

interface RecipeWithReviews extends Omit<Recipe, 'reviews' | 'media' | 'steps' | 'content' | 'ingredients' | 'nutrition'> {
  reviews: (Review & {
    user: {
      name: string | null
      image: string | null
    }
  })[]
  media: {
    type: MediaType
    url: string
    publicId: string
  }[]
  content: JSONContent
  steps: Step[]
  ingredients: Ingredient[]
  nutrition: Nutrition | null
}

// Add generateStaticParams
export async function generateStaticParams() {
  const recipes = await prisma.recipe.findMany({
    select: { slug: true },
    take: 100 // Adjust based on your needs
  })
  return recipes.map(({ slug }) => ({ slug }))
}

// Update revalidate timing
export const revalidate = 3600 // 1 hour instead of 1 minute

async function getRecipe(slug: string): Promise<RecipeWithReviews | null> {
  const cacheKey = `recipe:${slug}`
  const cached = await getFromCache<RecipeWithReviews>(cacheKey)
  if (cached) return cached

  // Optimize query to fetch only needed fields
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
      media: {
        where: { type: 'IMAGE' },
        take: 1,
        select: {
          type: true,
          url: true,
          publicId: true
        }
      },
      reviews: {
        take: 10, // Limit initial reviews
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
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

  const processed = {
    ...recipe,
    content: typeof recipe.content === 'string' ? JSON.parse(recipe.content) : recipe.content,
    steps: typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : recipe.steps,
    ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
  } as RecipeWithReviews

  await setCache(cacheKey, processed, 3600) // Cache for 1 hour
  return processed
}

// Use Next.js's built-in types
export default async function RecipePage({
  params
}: {
  params: { slug: string }
}) {
  const session = await getServerSession(authOptions)
  const recipe = await getRecipe(params.slug)
  
  if (!recipe) {
    notFound()
  }

  // Fetch the user's existing review if they're logged in
  let existingReview = null
  if (session?.user?.email) {
    existingReview = await prisma.review.findFirst({
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
    })
  }

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
      <header className="mb-8 bg-white rounded-lg shadow-sm p-8 border border-neutral-100">
        <h1 className="font-display font-bold text-4xl md:text-5xl text-neutral-900 mb-6 leading-tight">
          {recipe.title}
        </h1>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <StarRating 
              rating={recipe.rating ?? 0} 
              readonly={true}
              className="scale-110" 
            />
            <span className="text-sm text-neutral-500 font-medium">
              ({recipe.reviews.length} reviews)
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