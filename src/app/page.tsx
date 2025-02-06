import { Suspense } from 'react'
import { RecipeCard } from '@/components/recipe/RecipeCard'
import LoadingGrid from '@/components/LoadingGrid'
import { getRecipes } from '@/lib/recipes'
// eslint-disable-next-line
import { getCategories } from '@/lib/categories'
import { notFound } from 'next/navigation'

// Enable static page generation with ISR
export const revalidate = 60 // Revalidate every minute

// Optimize data fetching
async function getPageData() {
  const recipes = await getRecipes({
    include: {
      author: {
        select: { name: true }
      },
      categories: {
        select: { name: true }
      },
      media: {
        select: { type: true, url: true }
      },
      reviews: {
        select: { id: true, rating: true }
      }
    }
  })
  return recipes
}

export default async function HomePage() {
  const recipes = await getPageData()

  if (!Array.isArray(recipes)) {
    return notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <h1 className="font-display text-2xl md:text-display-lg text-neutral-700 mb-6 md:mb-12">
          Featured Recipes
        </h1>
        
        <Suspense fallback={<LoadingGrid />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe}
                  priority={recipes.indexOf(recipe) < 3}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 md:py-12">
                <p className="text-neutral-600">
                  Check back soon for delicious recipes!
                </p>
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </main>
  )
}
