import { Suspense } from 'react'
import { getRecipes } from '@/lib/recipes'
import { RecipeCard } from '@/components/recipe/RecipeCard'
import { LoadingGrid } from '@/components/loading/LoadingGrid'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'All Recipes',
  description: 'Browse our collection of delicious recipes'
}

async function getPageData() {
  const recipes = await getRecipes({
    include: {
      author: {
        select: { name: true }
      },
      categories: {
        select: { name: true }
      }
    }
  })
  return recipes
}

export default async function RecipesPage() {
  const recipes = await getPageData()

  if (!Array.isArray(recipes)) {
    return notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <h1 className="font-display text-2xl md:text-4xl text-neutral-800 mb-6 md:mb-12">
          All Recipes
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