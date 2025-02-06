export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export type Category = {
  id: string
  name: string
  slug: string
  subcategories: string[]
}

export type Nutrition = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type Comment = {
  id: string
  content: string
  author: User
  createdAt: string
} 