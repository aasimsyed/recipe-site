'use client'

import Image from 'next/image'

interface CategoryImageProps {
  imageUrl: string | null
  name: string
}

export default function CategoryImage({ imageUrl, name }: CategoryImageProps) {
  return (
    <div className="relative h-48 w-full bg-neutral-100">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover rounded-t-lg"
          onError={(e) => {
            const img = e.target as HTMLImageElement
            img.style.display = 'none'
            e.currentTarget.parentElement?.querySelector('.fallback-text')?.classList.remove('hidden')
          }}
        />
      ) : null}
      <div className={`fallback-text w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
        <span className="text-neutral-400">No image</span>
      </div>
    </div>
  )
} 