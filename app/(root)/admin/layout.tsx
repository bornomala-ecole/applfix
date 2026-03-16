import AdminMenu from "@/components/admin/AdminMenu";
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import {toast} from 'react-toastify'





export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth();
  // console.log("Session from admin layout", session)
  if(!session){
    redirect('/login')
  }
  const allowedRoles = ["admin", "superAdmin"]
  if (!allowedRoles.includes(session.user.role as string)) {
    toast("You're not allowed to visit this page, this page is admin only!")
    redirect("/")
  }

  return (
    <>
      <section className="dashboard_section h-full">
        <div className="container h-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
            <div className="col-span-1 py-2 px-2 lg:py-6 bg-gray-300">
              <AdminMenu />
            </div>
            <div className="col-span-4 py-2 lg:py-6 px-4">
              {children}
            </div>
          </div>
        </div>
      </section>
     
      
    </>
  );
}