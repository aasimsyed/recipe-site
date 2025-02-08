import { withAuth } from 'next-auth/middleware'

// Polyfill global
if (typeof global === 'undefined') {
  (global as any) = globalThis
}

// Export middleware config
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/auth/:path*'
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