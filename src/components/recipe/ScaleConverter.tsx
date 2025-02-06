'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ScaleConverterProps {
  baseServings: number
}

export function ScaleConverter({ baseServings }: ScaleConverterProps) {
  const [scale, setScale] = useState(1)

  const handleScale = (factor: number) => {
    setScale(prev => Math.max(1, prev * factor))
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => handleScale(0.5)}>-</Button>
      <Input 
        type="number"
        value={scale}
        onChange={(e) => setScale(Math.max(1, Number(e.target.value)))}
        className="w-20 text-center"
      />
      <Button variant="outline" onClick={() => handleScale(2)}>+</Button>
      <span className="text-sm ml-2">x{baseServings} servings</span>
    </div>
  )
} 