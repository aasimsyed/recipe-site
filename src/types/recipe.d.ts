import { Prisma } from '@prisma/client'

export interface JSONContent {
  type: string
  content?: Array<{
    type: string
    text?: string
    content?: JSONContent[]
  }>
}

export interface Recipe {
  id: string
  title: string
  slug: string
  description: string
  cookTime: number
  servings: number
  rating: number
  reviewCount: number
  authorId: string
  createdAt: Date
  updatedAt: Date
  video?: string | null
  prepTime?: number | null
}