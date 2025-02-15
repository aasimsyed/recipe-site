import { v2 as cloudinary } from 'cloudinary'

// Server-side only configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export async function uploadImage(file: Buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'recipe-site' },
      (error, result) => {
        if (error) reject(error)
        if (!result) reject(new Error('Upload failed'))
        resolve(result)
      }
    )
    uploadStream.end(file)
  })
}

export { cloudinary } 