export default function LoadingCategories() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
          >
            <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <div 
                  key={j}
                  className="h-4 w-full bg-neutral-200 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 