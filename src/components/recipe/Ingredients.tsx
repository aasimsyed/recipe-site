'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScaleIcon } from '@heroicons/react/24/outline'

interface Ingredient {
  amount: string
  name: string
  unit?: string
  metricAmount?: string
  metricUnit?: string
}

const convertToMetric = (amount: string, unit?: string): { amount: string, unit: string } => {
  const value = parseFloat(amount)
  if (isNaN(value)) return { amount, unit: unit || '' }

  switch (unit?.toLowerCase()) {
    case 'cup':
    case 'cups':
      return { amount: (value * 236.588).toFixed(0), unit: 'ml' }
    case 'oz':
    case 'ounce':
    case 'ounces':
      return { amount: (value * 28.3495).toFixed(0), unit: 'g' }
    case 'lb':
    case 'lbs':
    case 'pound':
    case 'pounds':
      return { amount: (value * 453.592).toFixed(0), unit: 'g' }
    case 'tbsp':
    case 'tablespoon':
    case 'tablespoons':
      return { amount: (value * 15).toFixed(0), unit: 'ml' }
    case 'tsp':
    case 'teaspoon':
    case 'teaspoons':
      return { amount: (value * 5).toFixed(0), unit: 'ml' }
    default:
      return { amount, unit: unit || '' }
  }
}

export function Ingredients({ items }: { items: Ingredient[] }) {
  const [isMetric, setIsMetric] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsMetric(!isMetric)}
          className={`
            text-sm font-medium px-4 py-2 rounded-md
            flex items-center gap-2 transition-all duration-200
            ${isMetric 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }
            shadow-sm hover:shadow-md transform hover:-translate-y-0.5
          `}
        >
          <ScaleIcon className="w-4 h-4" />
          {isMetric ? 'US Units' : 'Metric'}
        </Button>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => {
          const metric = convertToMetric(item.amount, item.unit)
          const displayAmount = isMetric ? metric.amount : item.amount
          const displayUnit = isMetric ? metric.unit : item.unit

          return (
            <li key={index} className="flex items-center text-neutral-700">
              <span className="font-medium">{displayAmount}</span>
              {displayUnit && (
                <span className="ml-1 font-medium">{displayUnit}</span>
              )}
              <span className="mx-2">-</span>
              <span>{item.name}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
} 