import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary'
import * as path from 'path'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function uploadPlaceholder() {
  try {
    const result = await cloudinary.uploader.upload(
      path.join(process.cwd(), 'public/images/placeholder.jpg'), // Your placeholder image
      {
        folder: 'recipes/placeholders',
        public_id: 'category-default',
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      }
    )

    console.log('✓ Uploaded placeholder image:', result.public_id)
  } catch (error) {
    console.error('✗ Failed to upload placeholder:', error)
  }
}

uploadPlaceholder()
  .catch(console.error)
  .finally(() => process.exit()) 