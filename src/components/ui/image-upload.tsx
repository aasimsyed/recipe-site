import { useDropzone } from 'react-dropzone'
import { uploadImage } from '@/lib/cloudinary'

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {'image/*': ['.jpeg', '.png']},
    multiple: false,
    onDrop: async files => {
      const buffer = Buffer.from(await files[0].arrayBuffer())
      const result = await uploadImage(buffer)
      const url = (result as { secure_url: string }).secure_url
      onUpload(url)
    }
  })

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-4">
      <input {...getInputProps()} />
      <p>Drag image or click to upload</p>
    </div>
  )
} 