import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'

// Separate middleware for performance headers
export function middleware(request: NextRequest) {
  // Only add headers for routes that need them
  if (request.nextUrl.pathname.startsWith('/recipes')) {
    const response = NextResponse.next()
    
    // Add HTTP/2 and performance headers
    response.headers.set('Link', [
      '<https://res.cloudinary.com>; rel=preconnect',
      '<https://fonts.googleapis.com>; rel=preconnect',
    ].join(', '))
    
    return response
  }
  
  return NextResponse.next()
}

// Update the config to include both admin and recipe routes
export const config = {
  matcher: [
    '/recipes/:path*',
    '/admin/:path*',
    '/api/auth/:path*'
  ]
}

// Protect admin routes with authentication
export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => token?.role === 'ADMIN'
    },
    pages: {
      signIn: '/login',
      error: '/error'
    }
  }
)