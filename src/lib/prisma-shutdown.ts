import { prisma } from './prisma'

export async function handlePrismaShutdown() {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error disconnecting Prisma:', error)
  }
}

if (process.env.NODE_ENV === 'development') {
  process.on('SIGINT', () => {
    void handlePrismaShutdown()
  })
  process.on('SIGTERM', () => {
    void handlePrismaShutdown()
  })
} 