"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

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

    router.refresh()
    router.push("/dashboard")
  }

  return (
    <>
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

        <button className="bg-black text-white p-2">
          Login
        </button>
      </form>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="bg-red-500 text-white p-2 flex items-center justify-center gap-2"
      >
        <img
          src="/google-icon.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Login with Google
      </button>
    </>

    
  )
}