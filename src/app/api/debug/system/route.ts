import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET() {
  const headersList = headers()
  
  const debugInfo = {
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    },
    headers: Object.fromEntries(headersList.entries()),
    globalObjects: {
      hasProcess: typeof process !== 'undefined',
      hasWindow: typeof window !== 'undefined',
      hasSelf: typeof self !== 'undefined',
      hasDocument: typeof document !== 'undefined'
    }
  }

  return NextResponse.json(debugInfo)
} 