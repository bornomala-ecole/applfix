"use server"

import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db"
import User from "@/lib/models/User"

export async function registerUser(formData: FormData) {
  await connectDB()

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    throw new Error("All fields required")
  }

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "user",
  })

  redirect("/login")
}