import { RecipeCard } from '@/components/recipe/RecipeCard'
import type { Recipe } from '@/components/recipe/RecipeCard'

export async function RelatedRecipes({ 
  currentRecipeId, 
  className 
}: { 
  currentRecipeId: string
  className?: string 
}) {
  // Fetch related recipes from API
  const relatedRecipes = await prisma.recipe.findMany({
    where: {
      id: { not: currentRecipeId },
      categories: { some: { recipes: { some: { id: currentRecipeId } } } }
    },
    take: 3
  })

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