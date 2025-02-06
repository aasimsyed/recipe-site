import { Checkbox } from '@/components/ui/checkbox'

export function Ingredients({ items }: { items: string[] }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Ingredients</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center">
            <Checkbox className="mr-2" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
} 