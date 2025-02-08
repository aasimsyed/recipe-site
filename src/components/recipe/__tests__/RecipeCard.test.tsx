import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecipeCard } from '../RecipeCard'
import { MediaType } from '@prisma/client'

const mockRecipe = {
  id: '1',
  title: 'Test Recipe',
  slug: 'test-recipe',
  description: 'A test recipe description',
  content: { type: 'doc', content: [] },
  ingredients: { type: 'doc', content: [] },
  steps: { type: 'doc', content: [] },
  nutrition: null,
  cookTime: 30,
  prepTime: 15,
  servings: 4,
  media: [{ 
    type: MediaType.IMAGE, 
    url: 'test-image.jpg', 
    id: '1', 
    publicId: 'test', 
    recipeId: '1' 
  }],
  author: { name: 'Test Author', image: null },
  categories: [],
  reviews: [],
  rating: 0,
  video: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  authorId: '1'
}

describe('RecipeCard', () => {
  it('renders recipe details correctly', () => {
    render(<RecipeCard recipe={mockRecipe} />)
    
    expect(screen.getByText('Test Recipe')).toBeInTheDocument()
    expect(screen.getByText('A test recipe description')).toBeInTheDocument()
    expect(screen.getByText('45 mins')).toBeInTheDocument()
    expect(screen.getByText('4 servings')).toBeInTheDocument()
  })
}) 