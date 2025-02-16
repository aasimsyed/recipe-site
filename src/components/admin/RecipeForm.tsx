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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { toast } from 'sonner'
import { CldUploadWidget, CldImage } from 'next-cloudinary'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { ChangeEvent } from 'react'
import type { JSONContent } from '@tiptap/core'
import { Controller } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
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
    categoryIds: string[]
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
      categoryIds: initialData?.categoryIds || [],
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
      setValue('categoryIds', initialData.categoryIds)
      setValue('cookTime', initialData.cookTime)
      setValue('servings', initialData.servings)
      setValue('prepTime', initialData.prepTime || 0)
    }
  }, [initialData, setValue])

  useEffect(() => {
    if ((!watch('categoryIds') || watch('categoryIds').length === 0) && categories.length > 0) {
      console.log('Setting initial category:', categories[0].id);
      setValue('categoryIds', [categories[0].id], {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  }, [categories, setValue, watch]);

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
        categoryIds: data.categoryIds,
        cookTime: Number(data.cookTime) || 0,
        servings: Number(data.servings) || 1,
        prepTime: Number(data.prepTime) || 0
      }

      console.log('Payload being sent:', JSON.stringify(payload, null, 2))

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

  const handleDelete = async () => {
    if (!initialData?.slug) return
    
    try {
      const response = await fetch(`/api/recipes/${initialData.slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete recipe')
      }

      toast.success('Recipe deleted successfully')
      router.push('/admin/recipes')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete recipe')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {mode === 'edit' && (
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete Recipe
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the recipe.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

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
        <label className="block text-sm font-medium mb-2">Categories</label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Controller
                name="categoryIds"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={category.id}
                      checked={field.value?.includes(category.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const newValue = checked
                          ? [...(field.value || []), category.id]
                          : (field.value || []).filter((id) => id !== category.id);
                        field.onChange(newValue);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={category.id} className="text-sm">
                      {category.name}
                    </label>
                  </div>
                )}
              />
            </div>
          ))}
        </div>
        {errors.categoryIds && (
          <p className="text-red-500 text-sm mt-1">{errors.categoryIds.message}</p>
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