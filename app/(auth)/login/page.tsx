import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LoginForm from "./LoginForm"

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    const role = session.user.role

    if (role === "admin") {
      redirect("/admin/dashboard")
    }

    if (role === "manager") {
      redirect("/manager/dashboard")
    }

    redirect("/dashboard")
  }

  return <LoginForm />
}