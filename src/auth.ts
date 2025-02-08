import 'server-only'
import NextAuth from 'next-auth'
import type { DefaultSession } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import { PrismaClient } from '@prisma/client'
import type { NextAuthOptions } from 'next-auth'

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

const ALLOWED_ADMIN_EMAILS = process.env.ALLOWED_ADMIN_EMAILS?.split(',') ?? []

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials')
}

const prisma = new PrismaClient()

export const config: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user }) {
      return ALLOWED_ADMIN_EMAILS.includes(user.email ?? '')
    },
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: ALLOWED_ADMIN_EMAILS.includes(user.email ?? '') ? 'ADMIN' : 'USER'
        }
      }
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)