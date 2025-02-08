import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { DefaultSession } from 'next-auth'

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
          response_type: "code",
          scope: "openid email profile"
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
    async signIn({ user, account, profile }) {
      if (!user.email) return false
      
      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true }
        })

        if (!existingUser) {
          // Create new user if doesn't exist
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'USER',
              accounts: {
                create: {
                  type: account?.type!,
                  provider: account?.provider!,
                  providerAccountId: account?.providerAccountId!,
                  access_token: account?.access_token,
                  token_type: account?.token_type,
                  scope: account?.scope,
                  id_token: account?.id_token,
                }
              }
            },
          })
        } else if (existingUser.accounts.length === 0) {
          // Link account if user exists but no accounts linked
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account?.type!,
              provider: account?.provider!,
              providerAccountId: account?.providerAccountId!,
              access_token: account?.access_token,
              token_type: account?.token_type,
              scope: account?.scope,
              id_token: account?.id_token,
            }
          })
        }
        
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'ADMIN' | 'USER'
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
} 