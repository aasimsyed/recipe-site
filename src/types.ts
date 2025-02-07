import { JSONContent } from '@tiptap/react'
import type { Nutrition } from '@/components/recipe/NutritionFacts'
import type { Step } from '@/components/recipe/StepRenderer'
import { Media, Review, Category, User } from '@prisma/client'

export interface Recipe {
  id: string
  title: string
  slug: string
  description: string
  content: JSONContent
  ingredients: any[]
  steps: Step[]
  video?: string
  servings: number
  cookTime: number
  prepTime: number
  authorId: string
  rating: number
  media: Media[]
  reviews: Review[]
  categories: Category[]
  author: Pick<User, 'name' | 'image'>
  nutrition?: Nutrition
  createdAt: Date
  updatedAt: Date
} 