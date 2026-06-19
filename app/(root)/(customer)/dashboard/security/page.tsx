import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChangePasswordClient from "./change-password-client";

export default async function AccountSecurityPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <ChangePasswordClient />;
}