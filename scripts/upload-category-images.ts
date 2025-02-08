import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary'
import * as fs from 'fs/promises'
import * as path from 'path'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const categoryImages = [
  {
    name: 'breakfast',
    path: 'public/images/categories/breakfast.jpg',
    folder: 'recipes/categories'
  },
  {
    name: 'desserts',
    path: 'public/images/categories/desserts.jpg',
    folder: 'recipes/categories'
  },
  {
    name: 'vegetarian',
    path: 'public/images/categories/vegetarian.jpg',
    folder: 'recipes/categories'
  },
  {
    name: 'appetizers',
    path: 'public/images/categories/appetizers.jpg',
    folder: 'recipes/categories'
  },
  {
    name: 'soups',
    path: 'public/images/categories/soups.jpg',
    folder: 'recipes/categories'
  }
]

async function uploadCategoryImages() {
  const results = []

  for (const image of categoryImages) {
    try {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: image.folder,
        public_id: image.name,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })

      results.push({
        name: image.name,
        url: result.secure_url,
        publicId: result.public_id
      })

      console.log(`✓ Uploaded ${image.name}`)
    } catch (error) {
      console.error(`✗ Failed to upload ${image.name}:`, error)
    }
  }

  // Save results to JSON file
  await fs.writeFile(
    path.join(process.cwd(), 'prisma/category-images.json'),
    JSON.stringify(results, null, 2)
  )

  console.log('✓ Category images uploaded and JSON file updated')
}

uploadCategoryImages()
  .catch(console.error)
  .finally(() => process.exit()) 