'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { CldUploadWidget } from 'next-cloudinary'
import { ImagePlus, Loader2 } from 'lucide-react'
import { ChangeEvent } from 'react'
import type { JSONContent } from '@tiptap/core'

type Ingredient = {
  name: string
  amount: string
  unit: string
}

type Step = {
  content: string
}

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  cookTime: z.coerce.number().min(1, 'Cook time must be at least 1 minute'),
  servings: z.coerce.number().min(1, 'Servings must be at least 1'),
  content: z.any(),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.string().min(1),
    unit: z.string().min(1)
  })).default([]),
  steps: z.array(z.object({
    content: z.string().min(1)
  })).default([]),
  image: z.string().optional(),
  slug: z.string().optional()
})

type RecipeFormData = z.infer<typeof recipeSchema>

interface Category {
  id: string
  name: string
  slug: string
}

interface RecipeFormProps {
  initialData?: {
    title: string
    description: string
    categoryId: string
    cookTime: number
    servings: number
    content?: JSONContent
    ingredients: Ingredient[]
    steps: Step[]
    image: string
    slug: string
  }
  categories: {
    id: string
    name: string
    slug: string
  }[]
  mode: 'create' | 'edit'
}

export function RecipeForm({ initialData, categories, mode }: RecipeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      categoryId: initialData?.categoryId || '',
      cookTime: initialData?.cookTime || 1,
      servings: initialData?.servings || 1,
      content: initialData?.content || null,
      ingredients: initialData?.ingredients || [],
      steps: initialData?.steps || [],
      image: initialData?.image || '',
      slug: initialData?.slug || ''
    }
  })

  const [ingredients, setIngredients] = useState(initialData?.ingredients || [])
  const [steps, setSteps] = useState(initialData?.steps || [])
  const [uploadedImage, setUploadedImage] = useState(initialData?.image || '')

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }])
  }

  const updateIngredient = (index: number, field: string, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setIngredients(newIngredients)
    setValue('ingredients', newIngredients)
  }

  const addStep = () => {
    setSteps([...steps, { content: '' }])
  }

  const updateStep = (index: number, content: string) => {
    const newSteps = [...steps]
    newSteps[index] = { content }
    setSteps(newSteps)
    setValue('steps', newSteps)
  }

  const handleImageUpload = (result: any) => {
    const imageUrl = result.info.secure_url
    setUploadedImage(imageUrl)
    setValue('image', imageUrl)
  }

  const onSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true)
    try {
      // Add detailed logging for initialData
      console.log('Form submission details:', {
        mode,
        initialData,
        hasSlug: Boolean(initialData?.slug),
        fullInitialData: initialData
      })

      // Format the data to match the schema
      const formattedData = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        cookTime: Number(data.cookTime),
        servings: Number(data.servings),
        ingredients: data.ingredients.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit
        })),
        steps: data.steps.map(step => ({
          content: step.content
        })),
        image: data.image
      }

      // Ensure we have a valid slug for edit mode
      if (mode === 'edit' && !initialData?.slug) {
        console.error('Missing slug in edit mode:', {
          mode,
          initialDataKeys: initialData ? Object.keys(initialData) : [],
          initialDataValues: initialData,
          formData: data
        })
        throw new Error('Missing recipe slug for edit mode')
      }

      const endpoint = mode === 'edit' && initialData?.slug
        ? `/api/recipes/${initialData.slug}`
        : '/api/recipes'
      
      console.log('Submitting to endpoint:', {
        endpoint,
        method: mode === 'edit' ? 'PUT' : 'POST',
        formattedData
      })

      const response = await fetch(endpoint, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      })

      const responseData = await response.json()
      console.log('API Response:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      })

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save recipe')
      }

      toast.success(mode === 'edit' ? 'Recipe updated!' : 'Recipe created!')
      router.push(`/recipes/${responseData.slug}`)
      router.refresh()
    } catch (error) {
      console.error('Form submission error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        initialData,
        mode
      })
      toast.error(error instanceof Error ? error.message : 'Failed to save recipe')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input {...register('title')} />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea {...register('description')} />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <Select {...register('categoryId')}>
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        {errors.categoryId && (
          <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Cook Time (minutes)</label>
          <Input 
            type="number"
            min="1"
            defaultValue="1"
            {...register('cookTime', { 
              valueAsNumber: true,
              setValueAs: (value) => parseInt(value) || 1
            })}
          />
          {errors.cookTime && (
            <p className="text-red-500 text-sm mt-1">{errors.cookTime.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Servings</label>
          <Input 
            type="number"
            min="1"
            defaultValue="1"
            {...register('servings', { 
              valueAsNumber: true,
              setValueAs: (value) => parseInt(value) || 1
            })}
          />
          {errors.servings && (
            <p className="text-red-500 text-sm mt-1">{errors.servings.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recipe Image</h3>
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
                {uploadedImage ? 'Change Image' : 'Upload Image'}
              </Button>
              {uploadedImage && (
                <div className="relative w-full max-w-md">
                  <img 
                    src={uploadedImage} 
                    alt="Recipe preview" 
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          )}
        </CldUploadWidget>
        {errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Ingredients</h3>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Name"
              value={ingredient.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
            />
            <Input
              placeholder="Amount"
              value={ingredient.amount}
              onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
            />
            <Input
              placeholder="Unit"
              value={ingredient.unit}
              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
            />
          </div>
        ))}
        <Button type="button" onClick={addIngredient}>Add Ingredient</Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Steps</h3>
        {steps.map((step, index) => (
        <div key={index}>
          <Textarea
            placeholder={`Step ${index + 1}`}
            value={step.content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateStep(index, e.target.value)}
          />
        </div>
))}
        <Button type="button" onClick={addStep}>Add Step</Button>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </div>
    </form>
  )
} 