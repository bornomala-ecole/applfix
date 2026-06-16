import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function GET() {
  const session = await auth()
  const role = session?.user?.role

  console.log("custom route hit! User role:", role)

  if (role === "admin" || role === "super_admin") {
    redirect("/admin/dashboard")
  }

  redirect("/dashboard")
}