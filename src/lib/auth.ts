import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { sessionCache } from '@/lib/session-cache'
import { DefaultSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

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

const authPrisma = new PrismaClient()

// Cache adapter operations
const cachedPrismaAdapter = {
  ...PrismaAdapter(authPrisma),
  getUser: async (id: string) => {
    const cached = sessionCache.get(id)
    if (cached?.user) {
      return cached.user
    }
    const adapter = PrismaAdapter(authPrisma)
    if (!adapter.getUser) throw new Error('Adapter method not found')
    return adapter.getUser(id)
  },
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(authPrisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true }
        })

        // If user exists but doesn't have a Google account linked
        if (existingUser && existingUser.accounts.length === 0) {
          // Link the Google account to the existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              refresh_token: account.refresh_token
            }
          })
          return true
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Add user data to JWT on first sign in
      if (account && user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Cache the session data
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        sessionCache.set(token.id as string, session)
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always allow internal URLs
      if (url.startsWith(baseUrl) || url.startsWith('/')) {
        return url
      }
      // Fallback to home page
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session only once per day
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  }
} 