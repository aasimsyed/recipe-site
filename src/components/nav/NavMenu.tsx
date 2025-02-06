'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

export function NavMenu() {
  const { data: session } = useSession()

  return (
    <div className="flex gap-3 md:gap-6 text-sm md:text-base items-center">
      <Link 
        href="/recipes" 
        className="px-2 py-1 hover:text-primary-500 transition-colors"
      >
        Recipes
      </Link>
      <Link 
        href="/categories" 
        className="px-2 py-1 hover:text-primary-500 transition-colors"
      >
        Categories
      </Link>
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
    </div>
  )
} 