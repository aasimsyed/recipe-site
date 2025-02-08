'use server'

import { getCategoryBySlug } from '@/lib/categories'

export async function fetchCategoryRecipes(slug: string, page: number) {
  const category = await getCategoryBySlug(slug, page)
  return category
} 