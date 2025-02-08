import { prisma } from '@/lib/prisma'
import { adminConfig } from '@/config/admin'

export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true }
  })
  
  return user?.role === 'ADMIN'
}

export async function ensureAdminRole(email: string) {
  if (adminConfig.allowedEmails.includes(email)) {
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    return true
  }
  return false
} 