import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailsPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
    },
  });

  if (
    !currentUser ||
    !["ADMIN", "SUPER_ADMIN"].includes(currentUser.role)
  ) {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      accounts: {
        select: {
          id: true,
          provider: true,
          type: true,
        },
      },
      orders: {
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          orders: true,
          accounts: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isCurrentUser = user.id === currentUser.id;

  function formatRole(role: string) {
    return role
      .toLowerCase()
      .replace("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-700";
      case "ADMIN":
        return "bg-blue-100 text-blue-700";
      case "MANAGER":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-green-100 text-green-700";
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/admin/users"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Users
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            User Details
          </h1>
        </div>

        {currentUser.role === "SUPER_ADMIN" && (
          <Link
            href={`/admin/users/edit/${user.id}`}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-500"
          >
            Edit Role
          </Link>
        )}
      </div>

      {/* USER CARD */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-5">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-20 h-20 rounded-full object-cover border"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-semibold text-gray-500">
              {user.name?.charAt(0)?.toUpperCase() ||
                user.email?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.name || "No Name"}
              </h2>

              {isCurrentUser && (
                <span className="text-[11px] px-2 py-0.5 bg-gray-900 text-white rounded-full">
                  You
                </span>
              )}
            </div>

            <p className="text-gray-500 mt-1">
              {user.email || "No email"}
            </p>

            <div className="flex gap-2 mt-3 flex-wrap text-xs">
              <span
                className={`px-2 py-1 rounded ${getRoleBadge(
                  user.role
                )}`}
              >
                {formatRole(user.role)}
              </span>

              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {user._count.orders} orders
              </span>

              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {user._count.accounts > 0
                  ? "OAuth User"
                  : "Credentials User"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Account Information
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">User ID</span>
              <span className="font-medium text-gray-900 break-all text-right">
                {user.id}
              </span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Role</span>
              <span className="font-medium text-gray-900">
                {formatRole(user.role)}
              </span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Joined</span>
              <span className="font-medium text-gray-900">
                {formatDate(user.createdAt)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Updated</span>
              <span className="font-medium text-gray-900">
                {formatDate(user.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Login Providers
          </h3>

          {user.accounts.length === 0 ? (
            <p className="text-sm text-gray-500">
              This user signed up with email and password.
            </p>
          ) : (
            <div className="space-y-2">
              {user.accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex justify-between items-center border rounded-lg p-3 text-sm"
                >
                  <span className="font-medium capitalize">
                    {account.provider}
                  </span>

                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {account.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Recent Orders
        </h3>

        {user.orders.length === 0 ? (
          <p className="text-sm text-gray-500">
            This user has no orders yet.
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
                    {formatDate(order.createdAt)} ·{" "}
                    {order._count.items} items
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