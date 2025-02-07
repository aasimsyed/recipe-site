export function NavigationSkeleton() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center gap-6">
            {/* Logo placeholder */}
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            
            {/* Search bar placeholder */}
            <div className="hidden md:flex items-center">
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Auth button placeholder */}
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </nav>
  )
} 