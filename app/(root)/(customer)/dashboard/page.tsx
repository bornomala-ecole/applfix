import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CustomerDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
      orders: {
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user.name || user.email || "Customer"}.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {user._count.orders}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Account Type</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {user.role}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Joined</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {formatDate(user.createdAt)}
          </h2>
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link
          href="/dashboard/profile"
          className="bg-white border rounded-xl p-5 hover:shadow-sm transition"
        >
          <h3 className="font-bold text-gray-900">
            Manage Profile
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Update your name, phone number, and account details.
          </p>
        </Link>

        <Link
          href="/dashboard/security"
          className="bg-white border rounded-xl p-5 hover:shadow-sm transition"
        >
          <h3 className="font-bold text-gray-900">
            Account Security
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Change your account password securely.
          </p>
        </Link>
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Recent Orders
          </h3>

          <Link
            href="/dashboard/orders"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {user.orders.length === 0 ? (
          <p className="text-sm text-gray-500">
            You do not have any orders yet.
          </p>
        ) : (
          <div className="space-y-3">
            {user.orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Order #{order.id.slice(0, 8)}
                  </h4>

                  <p className="text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${order.total}
                  </p>

                  <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}