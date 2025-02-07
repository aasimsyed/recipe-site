import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  // Increase max listeners to prevent warning
  client.$on('beforeExit', () => {
    // Cleanup
  })
  
  // Set max listeners to a higher number
  if (client.$extends) {
    client.$extends.setMaxListeners(20)
  }

  return client
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add minimal error handling with increased max listeners
prisma.$on('error', (e) => {
  console.error('Prisma Error:', e)
})

export default prisma 