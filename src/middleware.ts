import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Separate the auth middleware
const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token }) => token?.user?.role === 'ADMIN'
  }
})

// Export the config for protected routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/auth/:path*',
    '/auth/:path*'
  ]
}

// Handle all middleware cases
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle admin routes
  if (pathname.startsWith('/admin/')) {
    return authMiddleware(request)
  }

  // Handle auth routes
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/auth/')) {
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  // Default response
  return NextResponse.next()
} 