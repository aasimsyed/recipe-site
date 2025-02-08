'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  HomeIcon, 
  DocumentTextIcon,
  FolderIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Recipes', href: '/admin/recipes', icon: DocumentTextIcon },
  { name: 'Categories', href: '/admin/categories', icon: FolderIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        <h1 className="text-xl font-bold">Recipe Admin</h1>
      </div>
      <nav className="mt-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.name}
            </Link>
          )
        })}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
          Sign Out
        </button>
      </nav>
    </div>
  )
} 