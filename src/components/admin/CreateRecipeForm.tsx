'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CldUploadWidget, CldImage } from 'next-cloudinary'
import { ImagePlus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'react-hot-toast'
import { Controller, useForm } from "react-hook-form"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

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
    categoryIds: [categories.find(c => c.name === "Uncategorized")?.id || categories[0]?.id || ''],
    cookTime: '',
    servings: '',
    ingredients: [{ name: '', amount: '', unit: '' }],
    steps: [{ content: '' }]
  })

  const { control } = useForm({
    defaultValues: {
      categoryIds: categories.find(c => c.name === "Uncategorized")?.id?.toString() || categories[0]?.id?.toString() || ''
    }
  });

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
          categoryIds: formData.categoryIds,
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categories</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {formData.categoryIds.length > 0
                  ? `${formData.categoryIds.length} categories selected`
                  : "Select categories..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => {
                        setFormData(prev => {
                          const newCategoryIds = prev.categoryIds.includes(category.id)
                            ? prev.categoryIds.filter(id => id !== category.id)
                            : [...prev.categoryIds, category.id]
                          return { ...prev, categoryIds: newCategoryIds }
                        })
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.categoryIds.includes(category.id) 
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {category.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cook Time (minutes)</label>
            <Input
              type="number"
              value={formData.cookTime}
              onChange={e => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Servings</label>
            <Input
              type="number"
              value={formData.servings}
              onChange={e => setFormData(prev => ({ ...prev, servings: e.target.value }))}
              required
            />
          </div>
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
                className="flex items-center gap-2"
              >
                <ImagePlus className="w-4 h-4" />
                Upload Image
              </Button>
              {uploadedImage && (
                <div className="relative w-full max-w-md mt-4">
                  <CldImage
                    width="600"
                    height="400"
                    src={uploadedImage}
                    alt="Recipe preview"
                    className="w-full rounded-lg shadow-md object-cover aspect-video"
                    sizes="(max-width: 768px) 100vw, 600px"
                    crop="fill"
                  />
                </div>
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