'use client'

import { CloudinaryContext } from 'next-cloudinary'

export function CloudinaryConfig({ children }: { children: React.ReactNode }) {
  return (
    <CloudinaryContext cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}>
      {children}
    </CloudinaryContext>
  )
} 