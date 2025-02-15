// This file is for client-side only
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
}

export function formatCloudinaryUrl(publicId: string | null | undefined): string | null {
  if (!publicId) return null
  return publicId.startsWith('http') ? publicId : publicId
}

export function getCloudinaryPublicId(url: string | null): string | null {
  if (!url) return null;
  
  try {
    const matches = url.match(/\/([^/]+)\.[^.]+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
    return null;
  }
} 