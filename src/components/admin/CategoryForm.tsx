'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CldUploadWidget, CldImage } from 'next-cloudinary'
import { ImagePlus } from 'lucide-react'
import { CategoryImage } from '@/components/CategoryImage'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  publicId: z.string().nullable().default(null),
  slug: z.string().optional()
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  initialData?: {
    name: string
    description: string
    publicId: string | null
    slug: string
  }
  mode: 'create' | 'edit'
}

export function CategoryForm({ initialData, mode }: CategoryFormProps) {
  console.log('Upload preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(initialData?.publicId || '')

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      publicId: initialData?.publicId || null,
      slug: initialData?.slug
    }
  })

  const handleImageUpload = (result: any) => {
    console.log('CategoryForm handleImageUpload called:', result);
    
    // Log the entire result structure
    console.log('Upload result structure:', JSON.stringify(result, null, 2));
    
    if (!result) {
      console.error('Upload result is null or undefined');
      return;
    }

    // Check if we have the expected structure
    if (result.event === 'success' && result.info) {
      const publicId = result.info.public_id;
      console.log('Upload success event:', {
        event: result.event,
        publicId,
        info: result.info
      });
      
      if (publicId) {
        console.log('Setting publicId:', publicId);
        setUploadedImage(publicId);
        setValue('publicId', publicId, { 
          shouldValidate: true,
          shouldDirty: true 
        });
        console.log('Updated form state with publicId');
      } else {
        console.error('Upload succeeded but missing public_id:', result.info);
      }
    } else {
      console.error('Unexpected upload result structure:', {
        hasEvent: !!result.event,
        hasInfo: !!result.info,
        result
      });
    }
  }

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        publicId: uploadedImage || null
      };

      console.log('Submitting form with payload:', payload);

      const endpoint = mode === 'edit' 
        ? `/api/categories/${initialData?.slug}`
        : '/api/categories'

      const response = await fetch(endpoint, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save category')
      }

      toast.success(mode === 'edit' ? 'Category updated!' : 'Category created!')
      router.push('/admin/categories')
      router.refresh()
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <Input {...register('name')} />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea {...register('description')} />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Category Image</h3>
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
            folder: "recipe-site/categories",
            clientAllowedFormats: ['jpg', 'png', 'webp'],
            maxFileSize: 5242880,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            showUploadMoreButton: false,
            showAdvancedOptions: false,
            singleUploadAutoClose: true,
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#0078FF",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#0078FF",
                action: "#FF620C",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
              }
            }
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
                {uploadedImage ? 'Change Image' : 'Upload Image'}
              </Button>
              {uploadedImage && (
                <div className="relative w-full max-w-md">
                  <CldImage 
                    width="600"
                    height="400"
                    src={uploadedImage}
                    alt="Category preview" 
                    className="w-full rounded-lg shadow-md"
                    crop="fill"
                  />
                </div>
              )}
            </div>
          )}
        </CldUploadWidget>
      </div>

      {uploadedImage && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Preview:</p>
          <CategoryImage 
            publicId={uploadedImage}
            name="Preview"
          />
        </div>
      )}

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
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
} 