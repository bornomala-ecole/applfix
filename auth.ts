import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import User from "./lib/models/User"
 

 
export const { auth, handlers, signIn, signOut } = NextAuth({

  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) throw new Error("No credentials")

        await connectDB()

        const user = await User.findOne({
          email: credentials.email as string,
        })

        if (!user) throw new Error("User not found")

        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password || ""
        )

        if (!isMatch) throw new Error("Invalid password")

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await connectDB()

      if (account?.provider === "google") {
        
        if (!user.email) return false

        const existingUser = await User.findOne({
          email: user.email,
        })

        if (!existingUser) {
          await User.create({
            name: user.name ?? "",
            email: user.email,
            image: user.image ?? "",
            provider: "google",
          })
        }
      }

      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        // token.role = (user as any).role
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