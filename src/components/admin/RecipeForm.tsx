'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { toast } from 'sonner'
import { CldUploadWidget, CldImage } from 'next-cloudinary'
import { ImagePlus, Loader2 } from 'lucide-react'
import { ChangeEvent } from 'react'
import type { JSONContent } from '@tiptap/core'
import { Controller } from 'react-hook-form'
import { useSession } from 'next-auth/react'

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
  slug: z.string().optional(),
  prepTime: z.coerce.number().min(0, 'Prep time must be at least 0 minutes').optional(),
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
    prepTime?: number
  }
  categories: {
    id: string
    name: string
    slug: string
  }[]
  mode: 'create' | 'edit'
}

export function RecipeForm({ initialData, categories, mode }: RecipeFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ...initialData,
      categoryId: initialData?.categoryId || categories[0]?.id || '',
      prepTime: initialData?.prepTime || 0,
      cookTime: initialData?.cookTime || 0,
      servings: initialData?.servings || 1
    }
  })

  const [ingredients, setIngredients] = useState(initialData?.ingredients || [])
  const [steps, setSteps] = useState(initialData?.steps || [])
  const [uploadedImage, setUploadedImage] = useState(initialData?.image || '')

  useEffect(() => {
    if (initialData) {
      setValue('title', initialData.title)
      setValue('description', initialData.description)
      setValue('categoryId', initialData.categoryId)
      setValue('cookTime', initialData.cookTime)
      setValue('servings', initialData.servings)
      setValue('prepTime', initialData.prepTime || 0)
    }
  }, [initialData, setValue])

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
    if (result?.info?.public_id) {
      const publicId = result.info.public_id;
      console.log('Upload successful, publicId:', publicId);
      setUploadedImage(publicId);
      setValue('image', publicId); // We store the publicId, not the URL
    } else {
      console.error('Upload failed or invalid result:', result);
    }
  }

  const onSubmit = async (data: RecipeFormData) => {
    console.log('Form submission started:', {
      formData: data,
      uploadedImage,
      mode
    })
    
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        image: uploadedImage || '',
        categoryId: data.categoryId,
        cookTime: Number(data.cookTime) || 0,
        servings: Number(data.servings) || 1,
        prepTime: Number(data.prepTime) || 0
      }

      console.log('Submitting payload:', payload)

      const endpoint = mode === 'edit' && initialData?.slug
        ? `/api/recipes/${initialData.slug}`
        : '/api/recipes'
      
      const response = await fetch(endpoint, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.email}`
        },
        body: JSON.stringify(payload)
      })

      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      const responseData = response.headers.get('content-type')?.includes('application/json')
        ? await response.json()
        : { error: await response.text() }

      console.log('API Response:', {
        status: response.status,
        ok: response.ok,
        data: responseData,
        contentType: response.headers.get('content-type')
      })

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`)
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
            <option 
              key={category.id} 
              value={category.id}
            >
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prep Time (minutes)</label>
          <Input 
            type="number"
            min="0"
            defaultValue="0"
            {...register('prepTime', { 
              valueAsNumber: true,
              setValueAs: (value) => parseInt(value) || 0
            })}
          />
          {errors.prepTime && (
            <p className="text-red-500 text-sm mt-1">{errors.prepTime.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recipe Image</h3>
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={(result, { widget }) => {
            console.log('Upload success:', result);
            handleImageUpload(result);
            widget.close();
          }}
          onError={(error: any) => {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
          }}
          options={{
            maxFiles: 1,
            resourceType: "image",
            folder: "recipe-site/recipes",
            clientAllowedFormats: ['jpg', 'png', 'webp'],
            maxFileSize: 5242880,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            showUploadMoreButton: false,
            showAdvancedOptions: false,
            singleUploadAutoClose: true
          }}
        >
          {({ open }) => (
            <div className="space-y-4">
              <Button
                type="button"
                onClick={() => open()}
                variant="outline"
                className="w-full py-8 flex flex-col items-center gap-2"
              >
                <ImagePlus className="w-8 h-8" />
                <span>{uploadedImage ? 'Change Image' : 'Upload Image'}</span>
              </Button>
              
              {uploadedImage && (
                <div className="relative mt-4">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <CldImage
                      src={uploadedImage}
                      alt="Recipe preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600 px-2 py-1 text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setUploadedImage('')
                      setValue('image', '')
                    }}
                  >
                    Remove
                  </Button>
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