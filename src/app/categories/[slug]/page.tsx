import { fetchCategoryRecipes } from '@/lib/actions'
import { notFound } from 'next/navigation'
import { InfiniteRecipes } from '@/components/recipe/InfiniteRecipes'

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  const page = Number(searchParams.page) || 1
  const category = await fetchCategoryRecipes(params.slug, page)
  
  if (!category) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-900 mb-8">
        {category.name}
      </h1>
      
      <InfiniteRecipes
        initialRecipes={category.recipes}
        fetchMoreRecipes={async (page: number) => {
          'use server'
          const data = await fetchCategoryRecipes(params.slug, page)
          return data?.recipes || []
        }}
        totalRecipes={category._count.recipes}
        slug={params.slug}
      />
    </div>
  )
} 