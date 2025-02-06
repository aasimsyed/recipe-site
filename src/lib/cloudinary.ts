import { Cloudinary } from '@cloudinary/url-gen'

export const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  }
})

export async function uploadImage(file: Buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'recipes' },
      (error: any, result: any) => {
        if (error) reject(error)
        resolve(result)
      }
    )
    uploadStream.end(file)
  })
} 