"use client"

import { signIn, getSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from 'react-toastify'
import Image from "next/image"

export default function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Invalid email or password")
      return
    }
    toast.success("Login successful!")
    // router.refresh()
    // router.push("/dashboard")

    // console.log("Login form:",res)

    const session = await getSession();
    setTimeout(() => {
      if (session?.user?.role === "admin" || session?.user?.role === 'superAdmin') {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    }, 1500)
  }

  return (
    <div className="login_page flex flex-col items-center">
      <h1>Please enter your credential to login or use Google login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-[350px]">
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-black text-white p-2 cursor-pointer">
          Login
        </button>
      </form>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="bg-[#902e2e] cursor-pointer text-white p-2 flex items-center justify-center gap-2 mt-6"
      >
        <img
          src="/images/google.png"
          alt="Google"
          className="w-5 h-5"
        />
        Login with Google
      </button>
    </div>

    
  )
}