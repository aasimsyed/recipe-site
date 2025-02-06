import { PrismaClient, Prisma } from '@prisma/client'
// eslint-disable-next-line
import { hash } from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import cloudinaryUrls from './cloudinary-urls.json';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// eslint-disable-next-line
interface CloudinaryImage {
  name: string;
  url: string;
  publicId: string;
}

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'aasim.ss@gmail.com' },
    update: {},
    create: {
      email: 'aasim.ss@gmail.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // Create categories
  // eslint-disable-next-line
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'main-course' },
      update: {},
      create: {
        name: 'Main Course',
        slug: 'main-course',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'desserts' },
      update: {},
      create: {
        name: 'Desserts',
        slug: 'desserts',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'vegetarian' },
      update: {},
      create: {
        name: 'Vegetarian',
        slug: 'vegetarian',
      },
    }),
  ])

  // Create recipes
  // eslint-disable-next-line
  const recipes = await Promise.all([
    prisma.recipe.upsert({
      where: { slug: 'classic-spaghetti-carbonara' },
      update: {},
      create: {
        title: 'Classic Spaghetti Carbonara',
        slug: 'classic-spaghetti-carbonara',
        description: 'A creamy Italian pasta dish with eggs, cheese, pancetta, and black pepper',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This classic Roman pasta dish is simple yet delicious.',
                },
              ],
            },
          ],
        },
        ingredients: [
          { name: 'Spaghetti', amount: '1', unit: 'pound' },
          { name: 'Eggs', amount: '4', unit: 'large' },
          { name: 'Pecorino Romano', amount: '1', unit: 'cup' },
          { name: 'Pancetta', amount: '4', unit: 'ounces' },
        ],
        steps: [
          { content: 'Bring a large pot of salted water to boil' },
          { content: 'Cook pasta according to package directions' },
          { content: 'Meanwhile, cook pancetta until crispy' },
          { content: 'Mix eggs and cheese in a bowl' },
          { content: 'Combine everything and serve immediately' },
        ],
        cookTime: 20,
        prepTime: 10,
        servings: 4,
        authorId: adminUser.id,
        categories: {
          connect: [{ slug: 'main-course' }],
        },
        media: {
          create: [{
            url: cloudinaryUrls.find(img => img.name === 'carbonara')?.url ?? '',
            publicId: cloudinaryUrls.find(img => img.name === 'carbonara')?.publicId ?? '',
            type: 'IMAGE',
          }],
        },
      },
    }),
    prisma.recipe.upsert({
      where: { slug: 'chocolate-lava-cake' },
      update: {},
      create: {
        title: 'Chocolate Lava Cake',
        slug: 'chocolate-lava-cake',
        description: 'Decadent chocolate dessert with a molten center',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'A rich chocolate dessert that\'s surprisingly easy to make.',
                },
              ],
            },
          ],
        },
        ingredients: [
          { name: 'Dark Chocolate', amount: '8', unit: 'ounces' },
          { name: 'Butter', amount: '1/2', unit: 'cup' },
          { name: 'Eggs', amount: '4', unit: 'large' },
          { name: 'Sugar', amount: '1/2', unit: 'cup' },
        ],
        steps: [
          { content: 'Preheat oven to 425°F' },
          { content: 'Melt chocolate and butter together' },
          { content: 'Whisk eggs and sugar until light' },
          { content: 'Combine mixtures and bake for 12 minutes' },
        ],
        cookTime: 12,
        prepTime: 15,
        servings: 4,
        authorId: adminUser.id,
        categories: {
          connect: [{ slug: 'desserts' }],
        },
        media: {
          create: [
            {
              url: cloudinaryUrls.find(img => img.name === 'lava-cake')?.url ?? '',
              publicId: cloudinaryUrls.find(img => img.name === 'lava-cake')?.publicId ?? '',
              type: 'IMAGE',
            },
          ],
        },
      },
    }),
    prisma.recipe.upsert({
      where: { slug: 'roasted-vegetable-buddha-bowl' },
      update: {},
      create: {
        title: 'Roasted Vegetable Buddha Bowl',
        slug: 'roasted-vegetable-buddha-bowl',
        description: 'A healthy and colorful bowl packed with roasted vegetables and quinoa',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'A nutritious and satisfying vegetarian meal.',
                },
              ],
            },
          ],
        },
        ingredients: [
          { name: 'Quinoa', amount: '1', unit: 'cup' },
          { name: 'Sweet Potato', amount: '1', unit: 'large' },
          { name: 'Chickpeas', amount: '1', unit: 'can' },
          { name: 'Kale', amount: '2', unit: 'cups' },
        ],
        steps: [
          { content: 'Cook quinoa according to package directions' },
          { content: 'Roast sweet potatoes and chickpeas' },
          { content: 'Massage kale with olive oil' },
          { content: 'Assemble bowls with all components' },
        ],
        cookTime: 30,
        prepTime: 15,
        servings: 4,
        authorId: adminUser.id,
        categories: {
          connect: [
            { slug: 'vegetarian' },
            { slug: 'main-course' }
          ],
        },
        media: {
          create: [
            {
              url: cloudinaryUrls.find(img => img.name === 'buddha-bowl')?.url ?? '',
              publicId: cloudinaryUrls.find(img => img.name === 'buddha-bowl')?.publicId ?? '',
              type: 'IMAGE',
            },
          ],
        },
      },
    }),
  ])

  console.log(`Database has been seeded. 🌱`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 