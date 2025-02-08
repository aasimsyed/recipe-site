import { getCategoryBySlug } from '@/lib/categories'
import { RecipeCard } from '@/components/recipe/RecipeCard'
import { notFound } from 'next/navigation'
import { MediaType } from '@prisma/client'

export default async function CategoryPage({
  params
}: {
  params: { slug: string }
}) {
  const category = await getCategoryBySlug(params.slug)
  
  if (!category) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-900 mb-8">
        {category.name}
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {category.recipes.map((recipe) => (
          <RecipeCard 
            key={recipe.id} 
            recipe={{
              ...recipe,
              content: {},
              ingredients: {},
              steps: {},
              nutrition: null,
              video: null,
              authorId: '',
              prepTime: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              media: recipe.media.map(m => ({
                ...m,
                id: m.publicId,
                type: m.type as MediaType,
                recipeId: recipe.id
              }))
            }} 
          />
        ))}
      </div>
    </div>
  )
} 