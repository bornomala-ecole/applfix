"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Eye,
  Package,
  Search,
  ShoppingBag,
} from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string | null;
  variantTitle: string | null;
  color: string | null;
  imageUrl: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    images: {
      id: string;
      url: string;
      alt: string | null;
      type: string;
    }[];
  };
  variant: {
    id: string;
    title: string;
    color: string | null;
  };
};

type Order = {
  id: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  totalQuantity: number;
  _count: {
    items: number;
  };
  items: OrderItem[];
};

type Props = {
  orders?: Order[];
  page?: number;
  total?: number;
  limit?: number;
  search?: string;
  statusFilter?: string;
  paymentStatusFilter?: string;
};

const FRANCE_TIME_ZONE = "Europe/Paris";

export default function OrdersClient({
  orders = [],
  page = 1,
  total = 0,
  limit = 10,
  search = "",
  statusFilter = "all",
  paymentStatusFilter = "all",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(search);
  const [isPending, startTransition] = useTransition();

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeTotal = Number.isFinite(total) ? total : 0;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;
  const totalPages = Math.ceil(safeTotal / safeLimit);

  function updateQuery(paramsToUpdate: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    page?: number;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if (paramsToUpdate.search !== undefined) {
      if (paramsToUpdate.search.trim()) {
        params.set("search", paramsToUpdate.search.trim());
      } else {
        params.delete("search");
      }

      params.set("page", "1");
    }

    if (paramsToUpdate.status !== undefined) {
      if (paramsToUpdate.status === "all") {
        params.delete("status");
      } else {
        params.set("status", paramsToUpdate.status);
      }

      params.set("page", "1");
    }

    if (paramsToUpdate.paymentStatus !== undefined) {
      if (paramsToUpdate.paymentStatus === "all") {
        params.delete("paymentStatus");
      } else {
        params.set("paymentStatus", paramsToUpdate.paymentStatus);
      }

      params.set("page", "1");
    }

    if (paramsToUpdate.page !== undefined) {
      params.set("page", String(paramsToUpdate.page));
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function clearFilters() {
    setSearchValue("");

    startTransition(() => {
      router.push(pathname);
    });
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    updateQuery({
      search: searchValue,
    });
  }

  function changePage(newPage: number) {
    updateQuery({
      page: newPage,
    });
  }

  function formatFranceDate(date: string) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: FRANCE_TIME_ZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).format(new Date(date));
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price || 0);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primaryRed">
            Customer Dashboard
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Total Orders:{" "}
            <span className="font-semibold">{safeTotal}</span>
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          <ShoppingBag size={16} />
          Continue Shopping
        </Link>
      </div>

      {/* FILTERS */}
      <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Search size={18} className="text-gray-500" />

          <h2 className="font-semibold text-gray-900">
            Search & Filter Orders
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 lg:col-span-2"
          >
            <input
              type="text"
              placeholder="Search by order ID, product, or SKU..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full rounded-xl border p-3 text-sm outline-none focus:border-black"
            />

            <button
              type="submit"
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Search
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) =>
              updateQuery({
                status: e.target.value,
              })
            }
            className="rounded-xl border p-3 text-sm outline-none focus:border-black"
          >
            <option value="all">All Order Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) =>
              updateQuery({
                paymentStatus: e.target.value,
              })
            }
            className="rounded-xl border p-3 text-sm outline-none focus:border-black"
          >
            <option value="all">All Payment Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Clear Filters
          </button>
        </div>

        {isPending && (
          <p className="mt-3 text-xs text-gray-400">
            Loading orders...
          </p>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {safeOrders.length === 0 && (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <Package className="mx-auto mb-3 text-gray-400" size={34} />

            <h3 className="font-semibold text-gray-900">
              No orders found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Your placed orders will appear here.
            </p>
          </div>
        )}

        {safeOrders.map((order) => {
          const orderItems = Array.isArray(order.items) ? order.items : [];
          const previewItems = orderItems.slice(0, 3);
          const itemCount = order._count?.items || orderItems.length;
          const totalQuantity =
            order.totalQuantity ||
            orderItems.reduce((sum, item) => sum + item.quantity, 0);
          const extraItems = itemCount - previewItems.length;

          return (
            <div
              key={order.id}
              className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              {/* TOP ROW */}
              <div className="mb-4 flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </h2>

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
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(order.total)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {totalQuantity} item
                    {totalQuantity > 1 ? "s" : ""}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs capitalize text-gray-500 lg:justify-end">
                    <CreditCard size={13} />
                    {order.paymentMethod || "cod"}
                  </p>
                </div>
              </div>

              {/* ORDER ITEMS */}
              <div className="space-y-3">
                {previewItems.map((item) => {
                  const fallbackImage = item.product?.images?.[0];
                  const mainImage = item.imageUrl || fallbackImage?.url;
                  const imageAlt = fallbackImage?.alt || item.name;
                  const variantTitle =
                    item.variantTitle || item.variant?.title;
                  const color = item.color || item.variant?.color;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white">
                          {mainImage ? (
                            <Image
                              src={mainImage}
                              alt={imageAlt}
                              fill
                              sizes="56px"
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {item.name || item.product?.name || "Product"}
                          </h3>

                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                            {variantTitle && <span>{variantTitle}</span>}

                            {color && <span>Color: {color}</span>}

                            {item.sku && <span>SKU: {item.sku}</span>}

                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-gray-900 sm:text-right">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {extraItems > 0 && (
                <p className="mt-3 text-xs text-gray-500">
                  + {extraItems} more item
                  {extraItems > 1 ? "s" : ""}
                </p>
              )}

              {/* ACTIONS */}
              <div className="mt-4 flex justify-end border-t pt-4">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  <Eye size={15} />
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => changePage(i + 1)}
              className={`rounded-lg border px-3 py-1 text-sm ${
                page === i + 1
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}