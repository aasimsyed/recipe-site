import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',') ?? []
      const isAllowed = allowedEmails.includes(user.email ?? '')
      console.log('Sign in attempt:', { email: user.email, isAllowed })
      return isAllowed
    },
    async session({ session, user }) {
      const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',') ?? []
      const isAdmin = allowedEmails.includes(user.email ?? '')
      console.log('Session callback:', { email: user.email, isAdmin })
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: isAdmin ? 'ADMIN' : 'USER'
        },
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl
    }
  },
  debug: true,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
export const runtime = 'nodejs' 