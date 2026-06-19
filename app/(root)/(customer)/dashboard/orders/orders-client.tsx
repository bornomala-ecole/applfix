"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product: {
    id: string;
    name: string;
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
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
  items: OrderItem[];
};

type Props = {
  orders: Order[];
  page: number;
  total: number;
  limit: number;
  search: string;
  statusFilter: string;
};

export default function OrdersClient({
  orders,
  page,
  total,
  limit,
  search,
  statusFilter,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(search);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / limit);

  function updateQuery(paramsToUpdate: {
    search?: string;
    status?: string;
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

    if (paramsToUpdate.page !== undefined) {
      params.set("page", String(paramsToUpdate.page));
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
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

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="text-sm text-gray-500">
            Total Orders:{" "}
            <span className="font-semibold">{total}</span>
          </p>
        </div>

        <Link
          href="/shop"
          className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <form
            onSubmit={handleSearchSubmit}
            className="md:col-span-2 flex gap-2"
          >
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="border p-2 rounded w-full"
            />

            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
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
            className="border p-2 rounded"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="border px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>

        {isPending && (
          <p className="text-xs text-gray-400 mt-2">
            Loading orders...
          </p>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {orders.length === 0 && (
          <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
            No orders found.
          </div>
        )}

        {orders.map((order) => {
          return (
            <div
              key={order.id}
              className="bg-white border rounded-xl p-4 hover:shadow-sm transition"
            >
              {/* TOP ROW */}
              <div className="flex flex-wrap gap-3 items-start justify-between border-b pb-4 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </h2>

                    <span
                      className={`px-2 py-0.5 text-xs rounded ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(order.total)}
                  </p>

                  <p className="text-xs text-gray-500">
                    {order._count.items} item
                    {order._count.items > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* ORDER ITEMS */}
              <div className="space-y-3">
                {order.items.map((item) => {
                  const mainImage = item.product.images?.[0];

                  return (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {mainImage ? (
                          <img
                            src={mainImage.url}
                            alt={mainImage.alt || item.name}
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}

                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {item.name}
                          </h3>

                          <div className="flex gap-2 mt-1 flex-wrap text-xs text-gray-500">
                            <span>
                              {item.variant.title}
                            </span>

                            {item.variant.color && (
                              <span>
                                Color: {item.variant.color}
                              </span>
                            )}

                            <span>
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MORE ITEMS NOTICE */}
              {order._count.items > order.items.length && (
                <p className="text-xs text-gray-500 mt-3">
                  + {order._count.items - order.items.length} more item
                  {order._count.items - order.items.length > 1 ? "s" : ""}
                </p>
              )}

              {/* ACTIONS */}
              <div className="flex justify-end mt-4 border-t pt-4">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-8 justify-center flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => changePage(i + 1)}
              className={`px-3 py-1 rounded border text-sm ${
                page === i + 1
                  ? "bg-black text-white"
                  : "bg-white"
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