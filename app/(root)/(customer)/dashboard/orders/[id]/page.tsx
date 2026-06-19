import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DashboardOrderDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: session.user.id, // ✅ security: user can only see own order
    },
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          name: true,
          email: true,
        },
      },

      items: {
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          createdAt: true,

          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: {
                  type: "main",
                },
                select: {
                  id: true,
                  url: true,
                  alt: true,
                  type: true,
                },
                take: 1,
              },
            },
          },

          variant: {
            select: {
              id: true,
              sku: true,
              title: true,
              color: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function formatDateTime(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  function getStatusBadge(status: string) {
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
        return "bg-orange-100 text-orange-700";
    }
  }

  function formatStatus(status: string) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  const itemSubtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <Link
            href="/dashboard/orders"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Orders
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Order Details
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Order #{order.id.slice(0, 8)}
          </p>
        </div>

        <span
          className={`px-3 py-1 text-sm rounded-lg font-medium ${getStatusBadge(
            order.status
          )}`}
        >
          {formatStatus(order.status)}
        </span>
      </div>

      {/* ORDER SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Order Date</p>
          <h2 className="text-lg font-bold text-gray-900 mt-1">
            {formatDate(order.createdAt)}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Items</p>
          <h2 className="text-lg font-bold text-gray-900 mt-1">
            {order.items.length}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Order Total</p>
          <h2 className="text-lg font-bold text-gray-900 mt-1">
            {formatPrice(order.total)}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: ITEMS */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Ordered Items
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => {
              const mainImage = item.product.images?.[0];
              const lineTotal = item.price * item.quantity;

              return (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {mainImage ? (
                      <img
                        src={mainImage.url}
                        alt={mainImage.alt || item.name}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>

                      <div className="flex gap-2 mt-1 flex-wrap text-xs text-gray-500">
                        <span>{item.variant.title}</span>

                        {item.variant.color && (
                          <span>Color: {item.variant.color}</span>
                        )}

                        <span>SKU: {item.variant.sku}</span>
                      </div>

                      <div className="flex gap-2 mt-2 flex-wrap text-xs">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                          Qty: {item.quantity}
                        </span>

                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                          Price: {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatPrice(lineTotal)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: ORDER INFO */}
        <div className="space-y-6">
          {/* CUSTOMER INFO */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Customer Info
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 gap-3">
                <span className="text-gray-500">Name</span>
                <span className="font-medium text-gray-900 text-right">
                  {order.user.name || "No Name"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900 text-right break-all">
                  {order.user.email || "No Email"}
                </span>
              </div>
            </div>
          </div>

          {/* ORDER INFO */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Information
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 gap-3">
                <span className="text-gray-500">Order ID</span>
                <span className="font-medium text-gray-900 text-right break-all">
                  {order.id}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-3">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-gray-900">
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-3">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-900 text-right">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Updated</span>
                <span className="font-medium text-gray-900 text-right">
                  {formatDateTime(order.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* PAYMENT SUMMARY */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Payment Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Items Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(itemSubtotal)}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-900">
                  —
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900">
                  —
                </span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="font-bold text-gray-900">
                  Total
                </span>

                <span className="font-bold text-gray-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* ACTION */}
          <Link
            href="/dashboard/orders"
            className="block text-center bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}