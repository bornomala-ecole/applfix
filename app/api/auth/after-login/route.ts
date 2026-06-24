import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

function getSafeCallbackUrl(callbackUrl: string | null) {
  if (!callbackUrl) return null
  if (!callbackUrl.startsWith("/")) return null
  if (callbackUrl.startsWith("//")) return null

  return callbackUrl
}

function getBaseUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://applfix.codermahmud.xyz"
  )
}

export async function GET(req: NextRequest) {
  const session = await auth()

  const role = session?.user?.role

  const callbackUrl = getSafeCallbackUrl(
    req.nextUrl.searchParams.get("callbackUrl")
  )

  const baseUrl = getBaseUrl()

  if (callbackUrl) {
    return NextResponse.redirect(new URL(callbackUrl, baseUrl))
  }

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", baseUrl))
  }

  if (role === "MANAGER") {
    return NextResponse.redirect(new URL("/manager/dashboard", baseUrl))
  }

  return NextResponse.redirect(new URL("/dashboard", baseUrl))
}