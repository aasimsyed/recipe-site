import { Suspense } from 'react'
import { getRecipes } from '@/lib/recipes'
import { RecipeCard } from '@/components/recipe/RecipeCard'
import { LoadingGrid } from '@/components/loading/LoadingGrid'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { JSONContent } from '@tiptap/core'

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

export async function generateMetadata() {
  const headersList = headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: "All Recipes | Saleha's Kitchen",
    description: 'Browse our collection of delicious recipes',
    openGraph: {
      title: "All Recipes | Saleha's Kitchen",
      description: 'Browse our collection of delicious recipes'
    }
  }
}

async function getPageData() {
  const recipes = await getRecipes()
  return recipes
}

export default async function RecipesPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN' && 
                  process.env.ALLOWED_ADMIN_EMAILS?.split(',')
                    .includes(session.user.email ?? '')
  const recipes = await getPageData()

  // Add detailed logging
  console.log('Recipes data:', recipes.map(r => ({
    title: r.title,
    mediaCount: r.media?.length,
    firstMedia: r.media?.[0] ? {
      publicId: r.media[0].publicId,
      url: r.media[0].url,
      type: r.media[0].type
    } : null
  })))

  if (!Array.isArray(recipes)) {
    return notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-neutral-800">
            All Recipes
          </h1>
          {isAdmin && (
            <Link href="/admin/recipes/new">
              <Button className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Recipe
              </Button>
            </Link>
          )}
        </div>
        
        <Suspense fallback={<LoadingGrid />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {recipes.length > 0 ? (
              recipes.map((recipe, index) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={{
                    ...recipe,
                    author: {
                      ...recipe.author,
                      image: (recipe.author as any)?.image || null
                    },
                    content: recipe.content as JSONContent,
                    ingredients: recipe.ingredients as JSONContent,
                    steps: recipe.steps as JSONContent,
                    nutrition: recipe.nutrition as JSONContent | null,
                    reviews: recipe.reviews.map(review => ({
                      ...review,
                      id: (review as any).id?.toString() || '',
                      userId: (review as any).userId?.toString() || '',
                      recipeId: (review as any).recipeId?.toString() || '',
                      createdAt: new Date((review as any).createdAt),
                      updatedAt: new Date((review as any).updatedAt),
                      comment: (review as any).comment || null
                    })),
                    media: recipe.media.map(mediaItem => ({
                      ...mediaItem,
                      recipeId: recipe.id.toString()
                    }))
                  }}
                  priority={index < 6}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-neutral-600">
                  No recipes found. Check back soon!
                </p>
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </main>
  )
} 