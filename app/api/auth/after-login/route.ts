import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

function getSafeCallbackUrl(callbackUrl: string | null) {
  if (!callbackUrl) return null

  if (!callbackUrl.startsWith("/")) return null
  if (callbackUrl.startsWith("//")) return null

  return callbackUrl
}

export async function GET(req: NextRequest) {
  const session = await auth()

  const role = session?.user?.role

  const callbackUrl = getSafeCallbackUrl(
    req.nextUrl.searchParams.get("callbackUrl")
  )

  // ✅ If user came from checkout, send them back there
  if (callbackUrl) {
    return NextResponse.redirect(new URL(callbackUrl, req.url))
  }

  // ✅ Otherwise role-based redirect
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url))
  }

  if (role === "MANAGER") {
    return NextResponse.redirect(new URL("/manager/dashboard", req.url))
  }

  return NextResponse.redirect(new URL("/dashboard", req.url))
}