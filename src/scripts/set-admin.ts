import { prisma } from '@/lib/prisma'

async function main() {
  await prisma.user.update({
    where: { email: 'aasim.ss@gmail.com' },
    data: { role: 'ADMIN' }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 