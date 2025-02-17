'use client'

import Link from 'next/link'
import { UserMenu } from '@/components/auth/UserMenu'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

export function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              Recipe Site
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/recipes" className="text-gray-700 hover:text-gray-900">
              Recipes
            </Link>
            {session ? (
              <UserMenu />
            ) : (
              <GoogleSignInButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 