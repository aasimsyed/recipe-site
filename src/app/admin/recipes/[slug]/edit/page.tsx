import { getRecipeBySlug } from '@/lib/recipes'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { RecipeForm } from '@/components/admin/RecipeForm'
import { prisma } from '@/lib/prisma'
import { JSONContent } from '@tiptap/core'
import { Step, Ingredient } from '@/types/recipe'

export const dynamic = 'force-dynamic'

// Add proper type for recipe data
interface RecipeData {
  id: string
  title: string
  slug: string
  description: string
  content: any
  ingredients: Array<{
    name: string
    amount: string
    unit: string
  }>
  steps: Array<{
    content: string
  }>
  cookTime: number
  servings: number
  categories?: Array<{
    id: string
    name: string
    slug: string
  }>
  media?: Array<{
    type: string
    url: string
    publicId: string
  }>
}

export default async function EditRecipePage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    notFound()
  }

  const recipe = await prisma.recipe.findUnique({
    where: { slug: params.slug },
    include: {
      categories: true,
      media: true
    }
  })

  if (!recipe) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' }
  })

  const initialData = {
    ...recipe,
    categoryIds: recipe.categories.map(c => c.id),
    content: recipe.content as JSONContent,
    ingredients: recipe.ingredients as Ingredient[],
    steps: recipe.steps as Step[],
    image: recipe.media[0]?.url || ''
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold mb-8">
        Edit Recipe: {recipe.title}
      </h1>
      
      <RecipeForm 
        initialData={initialData}
        categories={categories}
        mode="edit"
      />
    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const recipe = await getRecipeBySlug(params.slug)
  
  if (!recipe) {
    return {
      title: 'Recipe Not Found'
    }
  }

  return {
    title: `Edit Recipe: ${recipe.title}`,
    description: `Edit ${recipe.title} recipe details`
  }
} 