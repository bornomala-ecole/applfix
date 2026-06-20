import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Package,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { Prisma } from "@prisma/client";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
  }>;
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getOrderStatusClass(status: string) {
  const value = status.toLowerCase();

  if (value === "pending") return "bg-yellow-100 text-yellow-700";
  if (value === "processing") return "bg-blue-100 text-blue-700";
  if (value === "shipped") return "bg-purple-100 text-purple-700";
  if (value === "delivered") return "bg-green-100 text-green-700";
  if (value === "cancelled") return "bg-red-100 text-red-700";

  return "bg-gray-100 text-gray-700";
}

function getPaymentStatusClass(status: string) {
  const value = status.toLowerCase();

  if (value === "paid") return "bg-green-100 text-green-700";
  if (value === "unpaid") return "bg-orange-100 text-orange-700";
  if (value === "failed") return "bg-red-100 text-red-700";
  if (value === "refunded") return "bg-purple-100 text-purple-700";

  return "bg-gray-100 text-gray-700";
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page || 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const search = params.search?.trim() || "";
  const statusFilter = params.status || "all";
  const paymentStatusFilter = params.paymentStatus || "all";

  const where: Prisma.OrderWhereInput = {};

  if (search) {
    where.OR = [
      {
        id: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        user: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        shippingFullName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        shippingPhone: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        items: {
          some: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  if (statusFilter !== "all") {
    where.status = statusFilter;
  }

  if (paymentStatusFilter !== "all") {
    where.paymentStatus = paymentStatusFilter;
  }

  const [
    orders,
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    totalRevenue,
  ] = await Promise.all([
    prisma.order.findMany({
      where,
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
        shippingFullName: true,
        shippingPhone: true,
        shippingCity: true,
        shippingCountry: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.order.count({
      where,
    }),

    prisma.order.count({
      where: {
        status: "pending",
      },
    }),

    prisma.order.count({
      where: {
        status: "processing",
      },
    }),

    prisma.order.count({
      where: {
        status: "delivered",
      },
    }),

    prisma.order.aggregate({
      _sum: {
        total: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalOrders / limit);

  const baseParams = new URLSearchParams();

  if (search) baseParams.set("search", search);
  if (statusFilter !== "all") baseParams.set("status", statusFilter);
  if (paymentStatusFilter !== "all") {
    baseParams.set("paymentStatus", paymentStatusFilter);
  }

  function getPageUrl(pageNumber: number) {
    const nextParams = new URLSearchParams(baseParams);
    nextParams.set("page", String(pageNumber));

    return `/admin/orders?${nextParams.toString()}`;
  }

  return (
    <main className="space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primaryRed">
              Order Management
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
              Orders
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              View customer orders, payment status, shipping details, and order
              progress.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {formatPrice(totalRevenue._sum.total || 0)}
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
              <p className="text-sm text-gray-500">Pending Orders</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {pendingOrders}
              </h2>
            </div>

            <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
              <ShoppingBag size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Processing</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {processingOrders}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Package size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {deliveredOrders}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <form className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Search Orders
            </label>

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                name="search"
                defaultValue={search}
                placeholder="Search by order ID, customer, phone, or product"
                className="w-full rounded-xl border py-2 pl-10 pr-3 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Order Status
            </label>

            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full rounded-xl border p-2 text-sm outline-none focus:border-black"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Payment Status
            </label>

            <select
              name="paymentStatus"
              defaultValue={paymentStatusFilter}
              className="w-full rounded-xl border p-2 text-sm outline-none focus:border-black"
            >
              <option value="all">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex gap-3 lg:col-span-4">
            <button
              type="submit"
              className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Apply Filters
            </button>

            <Link
              href="/admin/orders"
              className="rounded-xl border px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* ORDERS */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-gray-900">
            All Orders
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Showing {orders.length} of {totalOrders} order
            {totalOrders > 1 ? "s" : ""}.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingBag className="mx-auto mb-3 text-gray-400" size={32} />

            <h3 className="font-semibold text-gray-900">
              No orders found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Orders will appear here once customers place them.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-1 gap-4 p-5 hover:bg-gray-50 lg:grid-cols-12 lg:items-center"
              >
                <div className="lg:col-span-3">
                  <p className="text-sm font-semibold text-gray-900">
                    #{order.id.slice(0, 8)}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <CalendarDays size={13} />
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="lg:col-span-3">
                  <p className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <User size={14} />
                    {order.shippingFullName ||
                      order.user?.name ||
                      "Unknown Customer"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {order.user?.email || "No email"}
                  </p>

                  {order.shippingPhone && (
                    <p className="mt-1 text-xs text-gray-500">
                      {order.shippingPhone}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {order._count.items} item
                    {order._count.items > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getOrderStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getPaymentStatusClass(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  <p className="mt-2 text-xs capitalize text-gray-400">
                    Payment: {order.paymentMethod}
                  </p>
                </div>

                <div className="lg:col-span-2 lg:text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    View Details
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={getPageUrl(page - 1)}
              className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              Previous
            </Link>
          )}

          <span className="rounded-lg border bg-white px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={getPageUrl(page + 1)}
              className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </main>
  );
}