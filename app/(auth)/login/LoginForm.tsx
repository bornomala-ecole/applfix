"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    })

    setLoading(false)

    if (!res?.ok) {
      alert("Invalid credentials")
      return
    }

    const sessionRes = await fetch("/api/auth/session")
    const session = await sessionRes.json()

    const role = session?.user?.role

    // console.log("role:", role)

    if (role === "admin" || role === "super_admin") {
      router.push("/admin/dashboard")
    } else {
      router.push("/dashboard")
    }
  }

  const handleGoogleLogin = () => {
    signIn("google", {
      callbackUrl: "/api/auth/after-login",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md bg-white border rounded-2xl shadow-sm p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={130}
              height={130}
              className="mb-3"
            />
          </Link>

          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome Back
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Sign in to continue shopping
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            className="border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 pr-10"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primaryRed text-white rounded-lg py-3 font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Register */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <Link href="/register" className="text-primaryRed font-medium hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}