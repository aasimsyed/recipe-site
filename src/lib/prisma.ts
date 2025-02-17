import { PrismaClient } from '@prisma/client'

// Add global type for PrismaClient
declare global {
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma || new PrismaClient({
  log: ['error'],
  errorFormat: 'minimal',
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Handle shutdown properly
process.on('beforeExit', () => {
  void prisma.$disconnect()
})

export { prisma }