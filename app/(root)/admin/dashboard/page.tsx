import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AlertTriangle,
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  Layers,
  Package,
  PlusCircle,
  ShoppingBag,
  Star,
  Tags,
  Users,
} from "lucide-react";

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

function getStatusClass(status: string) {
  const lowerStatus = status.toLowerCase();

  if (lowerStatus === "pending") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (lowerStatus === "processing") {
    return "bg-blue-100 text-blue-700";
  }

  if (lowerStatus === "shipped") {
    return "bg-purple-100 text-purple-700";
  }

  if (lowerStatus === "delivered") {
    return "bg-green-100 text-green-700";
  }

  if (lowerStatus === "cancelled") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
}

const AdminDashboardPage = async () => {
  const session = await auth();

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    totalOrders,
    pendingOrders,
    totalUsers,
    totalBrands,
    totalCategories,
    revenue,
    lowStockVariants,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),

    prisma.product.count({
      where: {
        isActive: true,
      },
    }),

    prisma.product.count({
      where: {
        isFeatured: true,
      },
    }),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "pending",
      },
    }),

    prisma.user.count(),

    prisma.brand.count(),

    prisma.category.count(),

    prisma.order.aggregate({
      _sum: {
        total: true,
      },
    }),

    prisma.productVariant.findMany({
      where: {
        isActive: true,
        stock: {
          lte: 5,
        },
      },
      select: {
        id: true,
        title: true,
        color: true,
        sku: true,
        stock: true,
        lowStockThreshold: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        stock: "asc",
      },
      take: 5,
    }),

    prisma.order.findMany({
      select: {
        id: true,
        total: true,
        status: true,
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
      take: 5,
    }),
  ]);

  const totalRevenue = revenue._sum.total || 0;

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      helper: `${activeProducts} active products`,
      icon: Package,
      href: "/admin/products",
    },
    {
      title: "Featured Products",
      value: featuredProducts,
      helper: "Shown on homepage",
      icon: Star,
      href: "/admin/products?status=featured",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      helper: `${pendingOrders} pending orders`,
      icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      helper: "All-time order value",
      icon: BadgeDollarSign,
      href: "/admin/orders",
    },
  ];

  return (
    <main className="space-y-6">
      {/* WELCOME HEADER */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primaryRed">
              Admin Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
              Welcome back, {session?.user?.name || "Admin"}!
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Manage your products, orders, customers, inventory, brands, and
              store performance from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <PlusCircle size={17} />
              Add Product
            </Link>

            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              View Products
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {item.title}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {item.value}
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    {item.helper}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-100 p-3 text-gray-700 transition group-hover:bg-black group-hover:text-white">
                  <Icon size={22} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* QUICK STORE OVERVIEW */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-primaryRed">
              <Tags size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Brands</p>
              <h3 className="text-xl font-bold text-gray-900">
                {totalBrands}
              </h3>
            </div>
          </div>

          <Link
            href="/admin/brands"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primaryRed hover:underline"
          >
            Manage Brands
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Layers size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <h3 className="text-xl font-bold text-gray-900">
                {totalCategories}
              </h3>
            </div>
          </div>

          <Link
            href="/admin/categories"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primaryRed hover:underline"
          >
            Manage Categories
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <Users size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Customers / Users</p>
              <h3 className="text-xl font-bold text-gray-900">
                {totalUsers}
              </h3>
            </div>
          </div>

          <Link
            href="/admin/users"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primaryRed hover:underline"
          >
            Manage Users
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* RECENT ORDERS */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Recent Orders
              </h2>

              <p className="text-sm text-gray-500">
                Latest customer purchases.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-sm font-medium text-primaryRed hover:underline"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <ShoppingBag className="mx-auto mb-3 text-gray-400" size={28} />
              <h3 className="font-semibold text-gray-900">
                No orders yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                New orders will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 rounded-xl border p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      #{order.id.slice(0, 8)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {order.user?.name ||
                        order.user?.email ||
                        "Unknown Customer"}{" "}
                      • {order._count.items} item
                      {order._count.items > 1 ? "s" : ""}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOW STOCK */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Low Stock Alerts
              </h2>

              <p className="text-sm text-gray-500">
                Variants with 5 or fewer items left.
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <AlertTriangle size={22} />
            </div>
          </div>

          {lowStockVariants.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <Boxes className="mx-auto mb-3 text-gray-400" size={28} />
              <h3 className="font-semibold text-gray-900">
                Stock looks good
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No low-stock variants right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between gap-4 rounded-xl border p-4"
                >
                  <div>
                    <Link
                      href={`/admin/products/edit/${variant.product.id}`}
                      className="font-semibold text-gray-900 hover:text-primaryRed"
                    >
                      {variant.product.name}
                    </Link>

                    <p className="mt-1 text-xs text-gray-500">
                      {variant.title}
                      {variant.color ? ` / ${variant.color}` : ""}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      SKU: {variant.sku}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      {variant.stock}
                    </p>

                    <p className="text-xs text-gray-400">left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Common admin tasks you may need often.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products/create"
            className="rounded-xl border p-4 transition hover:bg-gray-50"
          >
            <PlusCircle className="mb-3 text-gray-700" size={22} />
            <p className="font-semibold text-gray-900">Add Product</p>
            <p className="mt-1 text-xs text-gray-500">
              Create a new phone listing.
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="rounded-xl border p-4 transition hover:bg-gray-50"
          >
            <Package className="mb-3 text-gray-700" size={22} />
            <p className="font-semibold text-gray-900">Manage Products</p>
            <p className="mt-1 text-xs text-gray-500">
              Edit stock, price, images, and variants.
            </p>
          </Link>

          <Link
            href="/admin/brands"
            className="rounded-xl border p-4 transition hover:bg-gray-50"
          >
            <Tags className="mb-3 text-gray-700" size={22} />
            <p className="font-semibold text-gray-900">Manage Brands</p>
            <p className="mt-1 text-xs text-gray-500">
              Add or update brand details.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="rounded-xl border p-4 transition hover:bg-gray-50"
          >
            <Users className="mb-3 text-gray-700" size={22} />
            <p className="font-semibold text-gray-900">Manage Users</p>
            <p className="mt-1 text-xs text-gray-500">
              Review customers and admin roles.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboardPage;