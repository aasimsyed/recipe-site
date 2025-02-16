import type { Recipe as PrismaRecipe, Review, Category, Media, User } from '@prisma/client'
import { JSONContent } from '@tiptap/core'

export interface Recipe extends Omit<PrismaRecipe, 'content'|'ingredients'|'steps'|'nutrition'|'rating'> {
  content: JSONContent
  ingredients: JSONContent
  steps: JSONContent
  nutrition: JSONContent | null
  rating?: number
  reviews?: Review[]
  categories?: Category[]
  media?: Media[]
  video: string | null
  author?: Pick<User, 'name' | 'image'>
}

export type Step = {
  content: string
}

export type Ingredient = {
  name: string
  amount: string
  unit: string
} 