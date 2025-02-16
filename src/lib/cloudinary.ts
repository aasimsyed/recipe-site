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

export function formatCloudinaryUrl(publicId: string | null | undefined): string | null {
  if (!publicId) return null
  
  // Simple URL formatting without using the cloudinary package
  return publicId.startsWith('http') ? publicId : publicId
}

export function getCloudName(): string {
  return cloudinaryConfig.cloudName || ''
}

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
}

export const getCloudinaryUrl = (publicId: string | null) => {
  if (!publicId) return null;
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
};

export const getPublicIdFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    return pathParts.slice(uploadIndex + 1).join('/').split('.')[0];
  } catch {
    return null;
  }
}; 