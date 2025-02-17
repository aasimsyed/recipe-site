import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Ensure global is defined for NextAuth
if (typeof global === 'undefined') {
  (global as any) = globalThis
}

const handler = NextAuth(authOptions)

// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  const originalGet = handler.GET
  handler.GET = async (request: Request) => {
    console.log('[NextAuth] Handling GET request:', request.url)
    const response = await originalGet(request)
    console.log('[NextAuth] Response:', response)
    return response
  }

  const originalPost = handler.POST
  handler.POST = async (request: Request) => {
    console.log('[NextAuth] Handling POST request:', request.url)
    const body = await request.clone().json().catch(() => ({}))
    console.log('[NextAuth] Request body:', body)
    const response = await originalPost(request)
    console.log('[NextAuth] Response:', response)
    return response
  }
}

// Remove the headers export and add them to the response directly
const wrappedHandler = async (req: Request) => {
  const response = await handler(req)
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'")
  response.headers.set('X-Frame-Options', 'DENY')
  return response
}

export const GET = handler
export const POST = handler

// Force Node.js runtime for NextAuth
export const runtime = 'nodejs'

// Configure dynamic segment handling
export const dynamic = 'force-dynamic'
