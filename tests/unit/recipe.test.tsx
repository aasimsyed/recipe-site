import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import RecipePage from '@/app/recipes/[slug]/page'

jest.mock('@/lib/recipes', () => ({
  getRecipeBySlug: jest.fn().mockResolvedValue({
    title: 'Test Recipe',
    content: { type: 'doc', content: [] }
  })
}))

describe('Recipe Page', () => {
  it('displays recipe title', async () => {
    const Page = await RecipePage({ params: { slug: 'test' } })
    render(Page)
    expect(screen.getByText('Test Recipe')).toBeInTheDocument()
  })
})