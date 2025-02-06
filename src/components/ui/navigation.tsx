'use client'

import { Menu, Transition } from '@headlessui/react'
import { Search, ChevronDown, Menu as Hamburger } from 'lucide-react'
import Link from 'next/link'
import { Fragment, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export function Navigation() {
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  
  // Add state for search query
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Add search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  if (!mounted) {
    return null // Return null on server-side and first render
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="font-display text-lg md:text-xl font-bold text-neutral-800"
            >
              Recipe Site
            </Link>
            
            <Link 
              href="/recipes" 
              className="hidden md:block px-2 py-1 hover:text-primary-500 transition-colors"
            >
              Recipes
            </Link>
            <Link 
              href="/categories" 
              className="hidden md:block px-2 py-1 hover:text-primary-500 transition-colors"
            >
              Categories
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <form 
              onSubmit={handleSearch} 
              className="hidden md:flex relative rounded-md shadow-sm"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-64 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button 
                type="submit"
                className="bg-primary-500 text-white px-4 py-2 rounded-r-md hover:bg-primary-600"
                aria-label="Search recipes"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>

            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link 
                href="/auth/signin" 
                className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-primary-500"
            >
              <Hamburger className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link 
              href="/recipes"
              className="block px-4 py-2 text-neutral-700 hover:bg-neutral-50"
            >
              Recipes
            </Link>
            <Link 
              href="/categories"
              className="block px-4 py-2 text-neutral-700 hover:bg-neutral-50"
            >
              Categories
            </Link>
            
            <form onSubmit={handleSearch} className="px-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-2.5 text-neutral-500"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  )
} 