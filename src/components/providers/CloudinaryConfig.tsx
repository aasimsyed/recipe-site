'use client'

export function CloudinaryConfig({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined')
  }

  return (
    <div data-cloudinary-context>
      {children}
    </div>
  )
}