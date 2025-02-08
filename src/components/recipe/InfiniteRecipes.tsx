'use client'

import { useInView } from 'react-intersection-observer'
import { useInfiniteQuery } from '@tanstack/react-query'
import { RecipeCard } from './RecipeCard'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { MediaType } from '@prisma/client'
import { AlertCircle } from 'lucide-react'

interface InfiniteRecipesProps {
  initialRecipes: any[]
  fetchMoreRecipes: (page: number) => Promise<any>
  totalRecipes: number
  slug: string
}

export function InfiniteRecipes({
  initialRecipes,
  fetchMoreRecipes,
  totalRecipes,
  slug
}: InfiniteRecipesProps) {
  const { ref, inView } = useInView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError
  } = useInfiniteQuery({
    queryKey: ['recipes', slug],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        return await fetchMoreRecipes(pageParam)
      } catch (error) {
        console.error('Error fetching recipes:', error)
        return []
      }
    },
    getNextPageParam: (_, pages) => {
      const loadedRecipes = pages.flat().length + initialRecipes.length
      return loadedRecipes < totalRecipes ? pages.length + 1 : undefined
    },
    initialData: {
      pages: [initialRecipes],
      pageParams: [1]
    },
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage])

  const recipes = data?.pages.flat() || []

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-neutral-600 space-y-4">
        <AlertCircle className="w-8 h-8" />
        <p>Failed to load recipes. Please try again later.</p>
        <button 
          onClick={() => fetchNextPage()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe: any) => (
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
              media: recipe.media?.map((m: any) => ({
                ...m,
                id: m.publicId,
                type: m.type as MediaType,
                recipeId: recipe.id
              })) || []
            }}
          />
        ))}
      </div>
      
      <div ref={ref} className="flex justify-center p-4">
        {isFetchingNextPage ? (
          <Spinner />
        ) : hasNextPage ? (
          <p className="text-sm text-neutral-500">Loading more recipes...</p>
        ) : recipes.length > 0 ? (
          <p className="text-sm text-neutral-500">No more recipes to load</p>
        ) : null}
      </div>
    </div>
  )
} 