import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

export async function GET() {
  try {
    console.log('=== System Debug Route Start ===')
    
    // Collect environment information
    const envInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
    
    console.log('Environment:', envInfo)
    
    // Check for global objects
    const globals = {
      hasProcess: typeof process !== 'undefined',
      hasWindow: typeof window !== 'undefined',
      hasSelf: typeof self !== 'undefined',
      hasDocument: typeof document !== 'undefined'
    }
    
    console.log('Global objects:', globals)
    
    // Get headers
    const headersList = headers()
    console.log('Headers:', Object.fromEntries(headersList.entries()))
    
    console.log('=== System Debug Route End ===')
    
    return NextResponse.json({
      status: 'ok',
      env: envInfo,
      globals,
      headers: Object.fromEntries(headersList.entries())
    })
  } catch (error) {
    console.error('System Debug Route Error:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 