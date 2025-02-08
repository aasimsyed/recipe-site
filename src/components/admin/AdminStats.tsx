'use client'

import { 
  BookOpen, 
  Star, 
  Users, 
  FolderOpen 
} from 'lucide-react'

interface AdminStatsProps {
  recipeCount: number
  reviewCount: number
  userCount: number
  categoryCount: number
}

export function AdminStats({
  recipeCount,
  reviewCount,
  userCount,
  categoryCount
}: AdminStatsProps) {
  const stats = [
    {
      label: 'Total Recipes',
      value: recipeCount,
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      label: 'Total Reviews',
      value: reviewCount,
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      label: 'Total Users',
      value: userCount,
      icon: Users,
      color: 'text-green-600'
    },
    {
      label: 'Categories',
      value: categoryCount,
      icon: FolderOpen,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div 
          key={label}
          className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">{label}</p>
              <p className="text-2xl font-semibold mt-1">{value}</p>
            </div>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
        </div>
      ))}
    </div>
  )
} 