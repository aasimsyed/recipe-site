import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation } from '@/components/ui/navigation'

describe('Navigation', () => {
  it('toggles mobile menu', () => {
    render(<Navigation />)
    fireEvent.click(screen.getByRole('button', { name: /menu/i }))
    expect(screen.getByText('Dinner')).toBeInTheDocument()
  })
  
  it('shows search input on mobile', () => {
    render(<Navigation />)
    fireEvent.click(screen.getByRole('button', { name: /menu/i }))
    expect(screen.getByPlaceholderText('Search recipes...')).toBeInTheDocument()
  })
}) 