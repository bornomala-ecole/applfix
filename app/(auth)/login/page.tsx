import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LoginForm from "./LoginForm"

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    const role = session.user.role

    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      redirect("/admin/dashboard")
    }

    if (role === "manager") {
      redirect("/manager/dashboard")
    }

    // console.log("not admin or super_admin")
    redirect("/dashboard")
  }

  return <LoginForm />
}