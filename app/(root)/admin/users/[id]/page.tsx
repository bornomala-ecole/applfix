import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Mail,
  Package,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const FRANCE_TIME_ZONE = "Europe/Paris";

function formatRole(role: string) {
  return role
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFranceDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: FRANCE_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
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

function getOrderStatusBadge(status: string) {
  switch (status) {
    case "processing":
      return "bg-blue-100 text-blue-700";
    case "shipped":
      return "bg-purple-100 text-purple-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "refunded":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-orange-100 text-orange-700";
  }
}

function formatStatus(status: string) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function UserDetailsPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/admin/users/${id}`);
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
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

  const [user, totalSpentAggregate, paidSpentAggregate] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id,
      },
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
            subtotal: true,
            shippingFee: true,
            tax: true,
            discount: true,
            total: true,
            status: true,
            paymentMethod: true,
            paymentStatus: true,
            createdAt: true,
            updatedAt: true,
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
    }),

    prisma.order.aggregate({
      where: {
        userId: id,
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.aggregate({
      where: {
        userId: id,
        paymentStatus: "paid",
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  if (!user) {
    notFound();
  }

  const isCurrentUser = user.id === currentUser.id;
  const totalSpent = totalSpentAggregate._sum.total || 0;
  const paidSpent = paidSpentAggregate._sum.total || 0;
  const averageOrderValue =
    user._count.orders > 0 ? totalSpent / user._count.orders : 0;

  const providerLabel =
    user._count.accounts > 0 ? "OAuth User" : "Credentials User";

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Users
          </Link>

          <p className="mt-4 text-sm font-medium text-primaryRed">
            Admin Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            User Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review customer profile, account type, order history, and spending.
          </p>
        </div>

        {currentUser.role === "SUPER_ADMIN" && (
          <Link
            href={`/admin/users/edit/${user.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500"
          >
            Edit Role
          </Link>
        )}
      </div>

      {/* USER CARD */}
      <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="h-20 w-20 rounded-full border object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-semibold text-gray-500">
              {user.name?.charAt(0)?.toUpperCase() ||
                user.email?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.name || "No Name"}
              </h2>

              {isCurrentUser && (
                <span className="rounded-full bg-black px-2 py-0.5 text-[11px] text-white">
                  You
                </span>
              )}
            </div>

            <p className="mt-1 flex items-center gap-2 text-gray-500">
              <Mail size={15} />
              {user.email || "No email"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span
                className={`rounded-full px-2.5 py-1 font-medium ${getRoleBadge(
                  user.role
                )}`}
              >
                {formatRole(user.role)}
              </span>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                {user._count.orders} orders
              </span>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                {providerLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {user._count.orders}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ShoppingBag size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {formatPrice(totalSpent)}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CreditCard size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid Revenue</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {formatPrice(paidSpent)}
              </h2>
            </div>

            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Order</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {formatPrice(averageOrderValue)}
              </h2>
            </div>

            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Package size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ACCOUNT INFO */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <UserRound size={20} className="text-gray-500" />
            <h3 className="text-lg font-bold text-gray-900">
              Account Information
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b pb-3">
              <span className="text-gray-500">User ID</span>
              <span className="max-w-[65%] break-all text-right font-medium text-gray-900">
                {user.id}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b pb-3">
              <span className="text-gray-500">Role</span>
              <span className="font-medium text-gray-900">
                {formatRole(user.role)}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b pb-3">
              <span className="text-gray-500">Account Type</span>
              <span className="font-medium text-gray-900">
                {providerLabel}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b pb-3">
              <span className="text-gray-500">Joined</span>
              <span className="text-right font-medium text-gray-900">
                {formatFranceDate(user.createdAt)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Updated</span>
              <span className="text-right font-medium text-gray-900">
                {formatFranceDate(user.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* LOGIN PROVIDERS */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck size={20} className="text-gray-500" />
            <h3 className="text-lg font-bold text-gray-900">
              Login Providers
            </h3>
          </div>

          {user.accounts.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
              This user signed up with email and password.
            </p>
          ) : (
            <div className="space-y-3">
              {user.accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-xl border p-4 text-sm"
                >
                  <span className="font-medium capitalize text-gray-900">
                    {account.provider}
                  </span>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                    {account.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Recent Orders
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Showing latest {user.orders.length} of {user._count.orders} orders.
            </p>
          </div>
        </div>

        {user.orders.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            This user has no orders yet.
          </p>
        ) : (
          <div className="space-y-3">
            {user.orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border p-4 transition hover:bg-gray-50"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        Order #{order.id.slice(0, 8)}
                      </h4>

                      <span
                        className={`inline-flex h-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${getOrderStatusBadge(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>

                      <span
                        className={`inline-flex h-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentStatusBadge(
                          order.paymentStatus
                        )}`}
                      >
                        {formatStatus(order.paymentStatus)}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <p className="flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        Placed: {formatFranceDate(order.createdAt)}
                      </p>

                      <p className="flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        Updated: {formatFranceDate(order.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {order._count.items} item
                      {order._count.items > 1 ? "s" : ""} ·{" "}
                      <span className="capitalize">
                        {order.paymentMethod}
                      </span>
                    </p>
                  </div>

                  <div className="lg:text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      View Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}