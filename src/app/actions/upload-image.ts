'use server'

import { uploadImage } from '@/lib/cloudinary.server'

export async function handleImageUpload(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await uploadImage(buffer)
  return result
} 