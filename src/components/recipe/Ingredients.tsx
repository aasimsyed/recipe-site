import { Checkbox } from '@/components/ui/checkbox'

interface Ingredient {
  name: string
  amount: string
  unit: string
}

export function Ingredients({ 
  items,
  className 
}: { 
  items: Ingredient[]
  className?: string 
}) {
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
      <ul className="space-y-2">
        {items.map((ingredient, index) => (
          <li 
            key={index}
            className="flex items-center text-neutral-700"
          >
            <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>
            <span className="mx-2">-</span>
            <span>{ingredient.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
} 