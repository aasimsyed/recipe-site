export function NavigationSkeleton() {
  return (
    <nav className="bg-white shadow-sm animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="h-8 bg-gray-200 rounded w-32" />
          <div className="flex items-center gap-4">
            <div className="h-10 bg-gray-200 rounded w-64" />
            <div className="h-6 bg-gray-200 rounded w-6" />
          </div>
        </div>
      </div>
    </nav>
  )
} 