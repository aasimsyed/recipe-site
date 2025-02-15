import { getRecipeBySlug } from '@/lib/recipes'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { RecipeForm } from '@/components/admin/RecipeForm'
import { prisma } from '@/lib/prisma'

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

  const recipe = await getRecipeBySlug(params.slug) as RecipeData
  
  if (!recipe) {
    notFound()
  }

  // Get categories for the form
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Format the initial data properly for the form
  const initialData = {
    title: recipe.title,
    description: recipe.description,
    categoryId: recipe.categories?.[0]?.id || '',
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    content: recipe.content,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    image: recipe.media?.[0]?.url || '',
    slug: recipe.slug
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