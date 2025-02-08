'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CldUploadWidget } from 'next-cloudinary'
import { ImagePlus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

interface Category {
  id: string
  name: string
}

interface CreateRecipeFormProps {
  categories: Category[]
}

export function CreateRecipeForm({ categories }: CreateRecipeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    cookTime: '',
    servings: '',
    ingredients: [{ name: '', amount: '', unit: '' }],
    steps: [{ content: '' }]
  })

  const handleImageUpload = (result: any) => {
    setUploadedImage(result.info.secure_url)
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }))
  }

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { content: '' }]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: uploadedImage
        })
      })

      if (!response.ok) throw new Error('Failed to create recipe')

      const data = await response.json()
      router.push(`/recipes/${data.slug}`)
    } catch (error) {
      console.error('Error creating recipe:', error)
      // Add error handling UI here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />

        <Select
          label="Category"
          value={formData.categoryId}
          onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
          required
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cook Time (minutes)"
            type="number"
            value={formData.cookTime}
            onChange={e => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
            required
          />
          <Input
            label="Servings"
            type="number"
            value={formData.servings}
            onChange={e => setFormData(prev => ({ ...prev, servings: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold">Ingredients</h3>
        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Name"
              value={ingredient.name}
              onChange={e => {
                const newIngredients = [...formData.ingredients]
                newIngredients[index].name = e.target.value
                setFormData(prev => ({ ...prev, ingredients: newIngredients }))
              }}
            />
            <Input
              placeholder="Amount"
              value={ingredient.amount}
              onChange={e => {
                const newIngredients = [...formData.ingredients]
                newIngredients[index].amount = e.target.value
                setFormData(prev => ({ ...prev, ingredients: newIngredients }))
              }}
            />
            <Input
              placeholder="Unit"
              value={ingredient.unit}
              onChange={e => {
                const newIngredients = [...formData.ingredients]
                newIngredients[index].unit = e.target.value
                setFormData(prev => ({ ...prev, ingredients: newIngredients }))
              }}
            />
          </div>
        ))}
        <Button type="button" onClick={addIngredient}>Add Ingredient</Button>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold">Steps</h3>
        {formData.steps.map((step, index) => (
          <div key={index}>
            <Textarea
              placeholder={`Step ${index + 1}`}
              value={step.content}
              onChange={e => {
                const newSteps = [...formData.steps]
                newSteps[index].content = e.target.value
                setFormData(prev => ({ ...prev, steps: newSteps }))
              }}
            />
          </div>
        ))}
        <Button type="button" onClick={addStep}>Add Step</Button>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold mb-4">Recipe Image</h3>
        <CldUploadWidget
          uploadPreset="recipes"
          onUpload={handleImageUpload}
        >
          {({ open }) => (
            <div className="space-y-4">
              <Button 
                type="button"
                onClick={() => open()}
                className="flex items-center gap-2"
              >
                <ImagePlus className="w-4 h-4" />
                Upload Image
              </Button>
              {uploadedImage && (
                <img 
                  src={uploadedImage} 
                  alt="Recipe preview" 
                  className="w-full max-w-md rounded-lg"
                />
              )}
            </div>
          )}
        </CldUploadWidget>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Recipe...
          </>
        ) : (
          'Create Recipe'
        )}
      </Button>
    </form>
  )
} 