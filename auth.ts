import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }
      
        const email = credentials.email as string
        const password = credentials.password as string
      
        const user = await prisma.user.findUnique({
          where: { email },
        })
      
        if (!user) throw new Error("User not found")
      
        if (!user.password) {
          throw new Error("Please sign in with Google")
        }
      
        const isMatch = await bcrypt.compare(password, user.password)
      
        if (!isMatch) throw new Error("Invalid password")
      
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {

      // Step 1: initial login
      if (user) {
        token.id = user.id
        token.email = user.email
      }
  
      // Step 2: ALWAYS fetch role from DB (IMPORTANT FIX)
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
          },
        })
  
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
        }
      }
  
      return token
    },
  
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },


  },

  pages: {
    signIn: "/login",
  },
})