import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary'
import * as fs from 'fs'
import * as path from 'path'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Categories with custom icons/graphics for each
const categories = [
  {
    name: 'Breakfast',
    slug: 'breakfast',
    icon: `
      <path d="M200,250 A150,150 0 1,1 600,250" stroke="#4B5563" stroke-width="20" fill="none"/>
      <circle cx="400" cy="200" r="80" fill="#EF4444"/>
      <circle cx="400" cy="200" r="40" fill="#FEF3C7"/>
    `
  },
  {
    name: 'Main Dishes',
    slug: 'main-dishes',
    icon: `
      <rect x="250" y="200" width="300" height="200" rx="10" fill="#4B5563"/>
      <circle cx="400" cy="300" r="70" fill="#F87171"/>
      <path d="M320,250 L480,250" stroke="#E5E7EB" stroke-width="15"/>
    `
  },
  {
    name: 'Desserts',
    slug: 'desserts',
    icon: `
      <path d="M300,200 Q400,100 500,200 L500,350 Q400,400 300,350 Z" fill="#EC4899"/>
      <circle cx="400" cy="180" r="20" fill="#FEF3C7"/>
      <path d="M350,250 Q400,280 450,250" stroke="#FEF3C7" stroke-width="8" fill="none"/>
    `
  },
  {
    name: 'Vegetarian',
    slug: 'vegetarian',
    icon: `
      <path d="M400,150 Q500,200 400,350 Q300,200 400,150" fill="#059669"/>
      <path d="M350,200 Q400,250 450,200" fill="#34D399"/>
      <circle cx="400" cy="180" r="15" fill="#A7F3D0"/>
    `
  },
  {
    name: 'Appetizers',
    slug: 'appetizers',
    icon: `
      <rect x="300" y="200" width="200" height="30" rx="5" fill="#4B5563"/>
      <circle cx="350" cy="280" r="30" fill="#F87171"/>
      <circle cx="450" cy="280" r="30" fill="#FCD34D"/>
    `
  },
  {
    name: 'Soups',
    slug: 'soups',
    icon: `
      <path d="M300,200 Q400,150 500,200 L480,350 Q400,380 320,350 Z" fill="#60A5FA"/>
      <path d="M350,250 Q400,280 450,250" stroke="#93C5FD" stroke-width="12" fill="none"/>
      <path d="M370,290 Q400,310 430,290" stroke="#93C5FD" stroke-width="8" fill="none"/>
    `
  }
]

function generateCategoryImage(category: typeof categories[0]) {
  return 'data:image/svg+xml;base64,' + Buffer.from(`
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)"/>
      ${category.icon}
      <text x="400" y="500" font-family="system-ui" font-size="36" font-weight="bold" 
        fill="#1F2937" text-anchor="middle">${category.name}</text>
    </svg>
  `).toString('base64')
}

async function createCategoryImages() {
  const results = []

  for (const category of categories) {
    try {
      const image = generateCategoryImage(category)
      
      const result = await cloudinary.uploader.upload(image, {
        folder: 'recipe-site/categories',
        public_id: category.slug,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })

      results.push({
        name: category.slug,
        url: result.secure_url,
        publicId: result.public_id
      })

      console.log(`✓ Created image for ${category.name}:`, result.public_id)
    } catch (error) {
      console.error(`✗ Failed to create image for ${category.name}:`, error)
    }
  }

  // Save results to category-images.json
  fs.writeFileSync(
    path.join(process.cwd(), 'prisma/category-images.json'),
    JSON.stringify(results, null, 2)
  )

  console.log('✓ Category images JSON file updated')
}

createCategoryImages()
  .catch(console.error)
  .finally(() => process.exit()) 