import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Simple gray placeholder image as base64
const placeholder = 'data:image/svg+xml;base64,' + Buffer.from(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f3f4f6"/>
  <text x="400" y="300" font-family="system-ui" font-size="32" font-weight="bold" 
    fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
    Category Image
  </text>
</svg>
`).toString('base64')

async function createPlaceholder() {
  try {
    const result = await cloudinary.uploader.upload(placeholder, {
      folder: 'recipe-site/defaults',
      public_id: 'category',
      overwrite: true,
      resource_type: 'image'
    })
    console.log('✓ Created and uploaded placeholder:', result.public_id)
  } catch (error) {
    console.error('✗ Failed:', error)
  }
}

createPlaceholder()
  .catch(console.error)
  .finally(() => process.exit()) 