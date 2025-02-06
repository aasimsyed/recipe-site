export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
      {[...Array(6)].map((_, i) => (
        <div 
          key={i}
          className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
        >
          <div className="h-48 bg-neutral-200 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
} 