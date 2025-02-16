import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Polyfill global
if (typeof global === 'undefined') {
  (global as any) = globalThis
}

// Export middleware config
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/auth/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}

// Export the middleware function
export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ req, token }) {
      // For debugging
      console.log('Middleware authorized check:', { token })
      return !!token
    }
  }
})

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Add performance headers
  if (request.nextUrl.pathname.startsWith('/recipes') || 
      request.nextUrl.pathname.startsWith('/categories')) {
    response.headers.set('Link', [
      '<https://res.cloudinary.com>; rel=preconnect',
      '<https://fonts.googleapis.com>; rel=preconnect',
      '</recipes>; rel=preload; as=fetch; crossorigin=anonymous',
      '</categories>; rel=preload; as=fetch; crossorigin=anonymous'
    ].join(', '))
  }

  return response
} 