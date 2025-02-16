import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadImage(file: any) {
  if (!file) throw new Error('No file provided')
  
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  return new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'recipes',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        max_file_size: 5 * 1024 * 1024, // 5MB
        transformation: [
          { width: 800, height: 600, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (result) resolve(result)
        else reject(error || new Error('Upload failed'))
      }
    )
    
    uploadStream.end(buffer)
  })
} 