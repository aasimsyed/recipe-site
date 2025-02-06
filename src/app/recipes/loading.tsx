import { LoadingGrid } from '@/components/loading/LoadingGrid'

export default function LoadingRecipes() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-8" />
      <LoadingGrid />
    </div>
  )
} 