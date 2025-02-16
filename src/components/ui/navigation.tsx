'use client'

import { Menu, Transition } from '@headlessui/react'
import { Search, ChevronDown, Menu as Hamburger } from 'lucide-react'
import Link from 'next/link'
import { Fragment, useState, useEffect, useCallback, memo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession, signIn } from 'next-auth/react'
import { NavigationSkeleton } from './NavigationSkeleton'
import { useNavigationStore } from '@/store/navigation-store'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

const Navigation = () => {
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { isInitialized } = useNavigationStore()

  // Memoize handlers
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }, [searchQuery, router])

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/' })
  }, [])

  const handleSignIn = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/',
      })
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show skeleton while loading
  if (!mounted || status === 'loading') {
    return <NavigationSkeleton />
  }

  const navLinks = [
    { href: '/recipes', label: 'Recipes' },
    { href: '/categories', label: 'Categories' },
  ]

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="font-display text-lg md:text-xl font-bold text-neutral-800 hover:text-primary-500 transition-colors"
            >
              Saleha's Kitchen
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {navLinks.map(({ href, label }) => (
                <Link 
                  key={href}
                  href={href}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium
                    ${pathname === href 
                      ? 'text-primary-500 bg-primary-50' 
                      : 'text-neutral-700 hover:text-primary-500 hover:bg-neutral-50'
                    }
                    transition-colors duration-200
                  `}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {/* Search form */}
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
                className="bg-primary-500 text-white px-4 py-2 rounded-r-md hover:bg-primary-600 transition-colors"
                aria-label="Search recipes"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>

            {/* Auth button */}
            {!session ? (
              <GoogleSignInButton />
            ) : (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors"
              >
                Sign Out
              </button>
            )}

            {/* Mobile menu button */}
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

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navLinks.map(({ href, label }) => (
              <Link 
                key={href}
                href={href}
                className={`
                  block px-4 py-2 rounded-md text-sm font-medium
                  ${pathname === href 
                    ? 'text-primary-500 bg-primary-50' 
                    : 'text-neutral-700 hover:text-primary-500 hover:bg-neutral-50'
                  }
                  transition-colors duration-200
                `}
              >
                {label}
              </Link>
            ))}
            <form onSubmit={handleSearch} className="px-4 pt-2">
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

export default Navigation
export { Navigation } 