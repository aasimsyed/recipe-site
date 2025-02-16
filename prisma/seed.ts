import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create categories
  await prisma.category.upsert({
    where: { slug: 'appetizers' },
    update: {},
    create: {
      name: 'Appetizers',
      slug: 'appetizers',
      description: 'Start your meal with these delicious appetizers'
    }
  })

  await prisma.category.upsert({
    where: { slug: 'main-dishes' },
    update: {},
    create: {
      name: 'Main Dishes',
      slug: 'main-dishes',
      description: 'Hearty and satisfying main course recipes'
    }
  })

  await prisma.category.upsert({
    where: { slug: 'desserts' },
    update: {},
    create: {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Sweet treats and dessert recipes'
    }
  })

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })