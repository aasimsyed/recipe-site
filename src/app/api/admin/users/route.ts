import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true }
  })

  return NextResponse.json({ admins: admins.map(admin => admin.email).filter(Boolean) })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email } = await req.json()

  try {
    // First try to find the user
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // If user doesn't exist, create them
      user = await prisma.user.create({
        data: {
          email,
          role: 'ADMIN',
          // Add required fields with placeholder values
          name: email.split('@')[0], // Use part of email as name
          emailVerified: new Date(),
        }
      })
    } else {
      // If user exists, update their role
      user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      })
    }

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true }
    })

    return NextResponse.json({ admins: admins.map(admin => admin.email).filter(Boolean) })
  } catch (error) {
    console.error('Error adding admin:', error)
    return NextResponse.json(
      { error: 'Failed to add admin user' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email } = await req.json()

  // Prevent removing the last admin
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
  if (adminCount <= 1) {
    return NextResponse.json({ error: 'Cannot remove last admin' }, { status: 400 })
  }

  await prisma.user.update({
    where: { email },
    data: { role: 'USER' }
  })

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true }
  })

  return NextResponse.json({ admins: admins.map(admin => admin.email).filter(Boolean) })
} 