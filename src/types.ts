import { JSONContent } from '@tiptap/react'
import type { Nutrition } from '@/components/recipe/NutritionFacts'
import type { Step } from '@/components/recipe/StepRenderer'

export interface Recipe {
  id: string
  title: string
  slug: string
  media: { 
    type: 'IMAGE' | 'VIDEO'
    url: string
    publicId?: string
  }[]
  rating: number
  reviews: { id: string; rating: number }[]
  content: JSONContent[]
  ingredients: string[]
  nutrition: Nutrition
  steps: Step[]
  video?: string
  servings: number
  cookTime: number
  description: string
} 