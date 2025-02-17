import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const headersList = headers()
  
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    const debugInfo = {
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        runtime: 'nodejs',
        dbConnected: true
      },
      headers: Object.fromEntries(headersList.entries()),
      globalObjects: {
        hasProcess: typeof process !== 'undefined',
        hasWindow: typeof window !== 'undefined',
        hasSelf: typeof self !== 'undefined',
        hasDocument: typeof document !== 'undefined'
      }
    }

    return NextResponse.json(debugInfo, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    console.error('Debug route error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 