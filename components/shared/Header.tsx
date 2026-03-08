"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function Header() {
  const { data: session, status } = useSession()

  

  return (
    <header className="flex gap-6 p-4 border-b">
      <Link href="/">Home</Link>

      {session ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <button onClick={() => signOut()}>Logout</button>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      )}
    </header>
  )
}