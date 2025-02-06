import { getRecipeBySlug } from '@/lib/recipes'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Use Next.js's built-in types
export default async function RecipePage({
  params
}: {
  params: { slug: string }
}) {
  const recipe = await getRecipeBySlug(params.slug)
  if (!recipe) notFound()
  
  return (
    <article>
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>
    </article>
  )
}

// Simplify metadata generation
export async function generateMetadata(props: {
  params: { slug: string },
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  const recipe = await getRecipeBySlug(props.params.slug)
  if (!recipe) return { title: 'Recipe Not Found' }
  
  return {
    title: recipe.title,
    description: recipe.description,
  }
}