import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function GET() {
  const session = await auth()
  const role = session?.user?.role

  // console.log("custom route hit! User role:", role)

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    redirect("/admin/dashboard")
  }
  console.log("not admin or super_admin")
  //redirect("/dashboard")
}