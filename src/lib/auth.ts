import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { DefaultSession } from 'next-auth'
import type { Account, Profile } from 'next-auth'

const ALLOWED_ADMIN_EMAILS = process.env.ALLOWED_ADMIN_EMAILS?.split(',') ?? []

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'ADMIN' | 'USER'
    } & DefaultSession['user']
  }
  interface User {
    role: 'ADMIN' | 'USER'
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        const googleProfile = profile as Profile & { email_verified?: boolean }
        return Boolean(googleProfile?.email_verified)
      }
      return true
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.role = ALLOWED_ADMIN_EMAILS.includes(session.user.email ?? '') 
          ? 'ADMIN' 
          : 'USER'
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = ALLOWED_ADMIN_EMAILS.includes(user.email ?? '') 
          ? 'ADMIN' 
          : 'USER'
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
} 