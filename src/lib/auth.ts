import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Email/Password provider for development
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }
        
        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (user) {
          // User exists, return user data
          console.log('Existing user login:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role as 'USER' | 'ADMIN' | 'MODERATOR' | 'EDITOR'
          }
        } else {
          // Create new user for development
          console.log('Creating new user:', credentials.email)
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: 'USER'
            }
          })
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role as 'USER' | 'ADMIN' | 'MODERATOR' | 'EDITOR'
          }
        }
      }
    }),
    // OAuth providers (conditional - only if keys exist)
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && 
        process.env.GITHUB_CLIENT_ID !== 'demo_github_client_id' ? [
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== 'demo_google_client_id' ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role as 'USER' | 'ADMIN' | 'MODERATOR' | 'EDITOR'
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role as 'USER' | 'ADMIN' | 'MODERATOR' | 'EDITOR'
      }
      return token
    },
    async signIn({ user, account, profile }) {
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async createUser({ user }) {
      console.log('New user created:', user.email)
    },
  },
  debug: process.env.NODE_ENV === 'development',
}