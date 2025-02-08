import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const runtime = 'nodejs' // Force Node.js runtime instead of Edge

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  console.log('=== Recipe Debug Route Start ===')
  console.log('Timestamp:', new Date().toISOString())
  
  try {
    // Log request details
    console.log('Request details:', {
      url: request.url,
      method: request.method,
      slug: params.slug
    })
    
    // Log headers
    const headersList = headers()
    console.log('Headers:', Object.fromEntries(headersList.entries()))
    
    // Check environment
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      nextRuntime: process.env.NEXT_RUNTIME,
      isEdge: process.env.NEXT_RUNTIME === 'edge'
    })
    
    console.log('=== Recipe Debug Route End ===')
    
    return NextResponse.json({ 
      status: 'ok',
      debug: {
        slug: params.slug,
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(headersList.entries()),
        env: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error('Recipe Debug Route Error:', {
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