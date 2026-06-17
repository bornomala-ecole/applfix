import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const user = req.auth?.user
  const url = req.nextUrl

  // 🔒 Not logged in
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 🔒 Role protection for admin routes
  if (url.pathname.startsWith("/admin")) {
    const allowedRoles = ["admin", "super_admin"]

    if (!allowedRoles.includes(user.role!)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}