import { RecipeCard } from '@/components/recipe/RecipeCard'
import type { Recipe } from '@/components/recipe/RecipeCard'
import prisma from '@/lib/prisma'
import { parseJSONField } from '@/lib/utils'

export async function RelatedRecipes({ 
  currentRecipeId, 
  className 
}: { 
  currentRecipeId: string
  className?: string 
}) {
  // Fetch related recipes from API
  const recipes = await prisma.recipe.findMany({
    where: {
      id: { not: currentRecipeId },
      categories: { some: { recipes: { some: { id: currentRecipeId } } } }
    },
    include: {
      media: true,
      reviews: true,
    },
    take: 3
  })

  const relatedRecipes = recipes.map(recipe => ({
    ...recipe,
    content: parseJSONField(recipe.content),
    ingredients: parseJSONField(recipe.ingredients),
    steps: parseJSONField(recipe.steps),
    nutrition: recipe.nutrition ? parseJSONField(recipe.nutrition) : null,
  }))

  return (
    <section className={className}>
      <h3 className="text-2xl font-bold mb-6">You Might Also Like</h3>
      <div className="grid gap-6 md:grid-cols-3">
        {relatedRecipes.map((recipe: Recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  )
} 