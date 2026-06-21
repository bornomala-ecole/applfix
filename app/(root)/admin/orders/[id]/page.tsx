import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderStatusActions from "./order-status-actions";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";

type Props = {
  params: Promise<{
    id: string;
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
    hour: "numeric",
    minute: "2-digit",
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

export default async function AdminOrderDetailsPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
            },
          },
          variant: {
            select: {
              sku: true,
              title: true,
              color: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="space-y-6">
      {/* BACK */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      {/* HEADER */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primaryRed">
              Order Details
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
              Order #{order.id.slice(0, 8)}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays size={16} />
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${getOrderStatusClass(
                order.status
              )}`}
            >
              {order.status}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${getPaymentStatusClass(
                order.paymentStatus
              )}`}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* UPDATE ORDER STATUS */}
      <OrderStatusActions
        orderId={order.id}
        currentStatus={order.status}
        currentPaymentStatus={order.paymentStatus}
      />

      {/* TOP INFO */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* CUSTOMER */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <User size={20} className="text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Customer</h2>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-medium text-gray-900">
              {order.shippingFullName || order.user?.name || "Unknown Customer"}
            </p>

            {order.user?.email && (
              <p className="flex items-center gap-2 text-gray-500">
                <Mail size={15} />
                {order.user.email}
              </p>
            )}

            {order.shippingPhone && (
              <p className="flex items-center gap-2 text-gray-500">
                <Phone size={15} />
                {order.shippingPhone}
              </p>
            )}
          </div>
        </div>

        {/* SHIPPING */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">
              Shipping Address
            </h2>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <p>{order.shippingAddress1 || "No address provided"}</p>

            {order.shippingAddress2 && <p>{order.shippingAddress2}</p>}

            <p>
              {[order.shippingCity, order.shippingState, order.shippingPostcode]
                .filter(Boolean)
                .join(", ")}
            </p>

            <p>{order.shippingCountry}</p>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Payment</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="font-medium capitalize text-gray-900">
                {order.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status</span>
              <span className="font-medium capitalize text-gray-900">
                {order.paymentStatus}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Order Status</span>
              <span className="font-medium capitalize text-gray-900">
                {order.status}
              </span>
            </div>

            {order.stripePaymentIntentId && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Stripe Payment ID</span>
                <span className="break-all text-right font-medium text-gray-900">
                  {order.stripePaymentIntentId}
                </span>
              </div>
            )}

            {order.stripeCheckoutSessionId && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Stripe Session ID</span>
                <span className="break-all text-right font-medium text-gray-900">
                  {order.stripeCheckoutSessionId}
                </span>
              </div>
            )}



          </div>
        </div>
      </div>

      {/* ITEMS + SUMMARY */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* ORDER ITEMS */}
        <div className="rounded-2xl border bg-white shadow-sm xl:col-span-2">
          <div className="border-b p-5">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-gray-500" />
              <h2 className="text-lg font-bold text-gray-900">
                Ordered Items
              </h2>
            </div>
          </div>

          <div className="divide-y">
            {order.items.map((item) => {
              const lineTotal = item.price * item.quantity;

              return (
                <div key={item.id} className="p-5">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-gray-50">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-semibold text-gray-900 hover:text-primaryRed"
                          >
                            {item.name || item.product.name}
                          </Link>

                          <div className="mt-1 space-y-1 text-sm text-gray-500">
                            {(item.variantTitle || item.variant.title) && (
                              <p>
                                Variant:{" "}
                                {item.variantTitle || item.variant.title}
                              </p>
                            )}

                            {(item.color || item.variant.color) && (
                              <p>
                                Color: {item.color || item.variant.color}
                              </p>
                            )}

                            {(item.sku || item.variant.sku) && (
                              <p>SKU: {item.sku || item.variant.sku}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>

                          <p className="mt-1 font-bold text-gray-900">
                            {formatPrice(lineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="xl:col-span-1">
          <div className="sticky top-28 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3 border-b pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium">
                  {formatPrice(order.shippingFee)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium">{formatPrice(order.tax)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium">
                  -{formatPrice(order.discount)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>

            {order.notes && (
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Customer Note
                </p>

                <p className="mt-1 text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}