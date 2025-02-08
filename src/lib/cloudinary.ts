import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadImage(file: Buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'recipe-site' },
      (error: UploadApiErrorResponse | undefined, result?: UploadApiResponse) => {
        if (error) reject(error)
        if (!result) reject(new Error('Upload failed'))
        resolve(result)
      }
    )
    uploadStream.end(file)
  })
}

export function getCloudinaryPublicId(url: string | null): string | null {
  if (!url) return null;
  
  try {
    // Extract just the filename without extension from the full path
    const matches = url.match(/\/([^/]+)\.[^.]+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
    return null;
  }
}

export function formatCloudinaryUrl(publicId: string | null): string | null {
  if (!publicId) return null;
  
  // Remove any duplicate folder references
  const cleanPublicId = publicId
    .replace(/^recipe-site\/recipes\//, 'recipe-site/') // Remove duplicate recipes folder
    .replace(/^recipes\//, 'recipe-site/') // Handle case where only recipes/ is present
    .replace(/^recipe-site\/recipe-site\//, 'recipe-site/'); // Handle duplicate recipe-site folder
    
  // Ensure the publicId starts with recipe-site/
  return cleanPublicId.startsWith('recipe-site/') ? cleanPublicId : `recipe-site/${cleanPublicId}`;
} 