import CustomerMenu from "@/components/customer/CustomerMenu";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CustomerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <section className="dashboard_section h-full">
      <div className="container h-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
          <div className="col-span-1 py-2 px-2 lg:py-6">
            <CustomerMenu />
          </div>

          <div className="col-span-4 py-2 lg:py-6 px-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}