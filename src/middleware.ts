import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

declare module 'next-auth/jwt' {
  interface JWT {
    user?: {
      role?: 'ADMIN' | 'USER'
    }
  }
}

export async function middleware(req: NextRequest) {
  console.log('=== Middleware Execution Start ===')
  console.log('Timestamp:', new Date().toISOString())
  console.log('URL:', req.url)
  console.log('Method:', req.method)
  
  try {
    console.log('Getting token...')
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    console.log('Token retrieved:', {
      exists: !!token,
      role: token?.user?.role,
      timestamp: new Date().toISOString()
    })
    
    const isAdmin = token?.user?.role === 'ADMIN'
    const { pathname } = req.nextUrl

    console.log('Request details:', {
      pathname,
      isAdmin,
      hasToken: !!token
    })

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      console.log('Processing admin route access')
      if (!token) {
        console.log('No token found, redirecting to signin')
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      
      if (!isAdmin) {
        console.log('User is not admin, redirecting to home')
        return NextResponse.redirect(new URL('/', req.url))
      }
      console.log('Admin access granted')
    }

    console.log('=== Middleware Execution End ===')
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.redirect(new URL('/', req.url))
  }
}

// Update matcher to be more specific and use nodejs runtime
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
  runtime: 'nodejs'
} 