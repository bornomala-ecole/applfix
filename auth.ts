import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import User from "@/lib/models/User"

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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }
      
        await connectDB()
      
        const user = await User.findOne({
          email: credentials.email as string,
        })
      
        if (!user) throw new Error("User not found")
      
        if (!user.password) {
          throw new Error("Please sign in with Google")
        }
      
        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
      
        if (!isMatch) throw new Error("Invalid password")
      
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "user",
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  callbacks: {
    
    async signIn({ user, account }) {
      try {
        await connectDB()
    
        if (account?.provider === "google") {
          if (!user.email) {
            console.log("Google login failed: no email returned")
            return false
          }
    
          await User.findOneAndUpdate(
            { email: user.email },
            {
              $setOnInsert: {
                name: user.name ?? "",
                email: user.email,
                image: user.image ?? "",
                provider: "google",
                role: "user",
              },
            },
            {
              upsert: true,
              new: true,
            }
          )
        }
    
        return true
      } catch (error) {
        console.log("Google signIn callback error:", error)
        return false
      }
    },

    async jwt({ token }) {
      await connectDB()

      if (token.email) {
        const dbUser = await User.findOne({ email: token.email }).select(
          "_id role"
        )

        if (dbUser) {
          token.id = dbUser._id.toString()
          token.role = dbUser.role || "user"
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