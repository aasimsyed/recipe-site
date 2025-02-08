import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function updateCategoryImages() {
  const categoryImages = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'prisma/category-images.json'), 'utf-8')
  )

  for (const image of categoryImages) {
    await prisma.category.upsert({
      where: { slug: image.name },
      update: { imageUrl: image.url },
      create: {
        name: image.name.split('-').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        slug: image.name,
        imageUrl: image.url
      }
    })
  }

  console.log('✓ Category image URLs updated in database')
}

updateCategoryImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 