"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type UserRole = "CUSTOMER" | "MANAGER" | "ADMIN" | "SUPER_ADMIN";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    accounts: number;
  };
};

type Props = {
  users: AdminUser[];
  page: number;
  total: number;
  limit: number;
  search: string;
  roleFilter: UserRole | "all";
  currentUserId: string;
  currentUserRole: UserRole;
};

export default function UsersClient({
  users,
  page,
  total,
  limit,
  search,
  roleFilter,
  currentUserId,
  currentUserRole,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(search);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / limit);

  function updateQuery(paramsToUpdate: {
    search?: string;
    role?: string;
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

    if (paramsToUpdate.role !== undefined) {
      if (paramsToUpdate.role === "all") {
        params.delete("role");
      } else {
        params.set("role", paramsToUpdate.role);
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

  function getRoleBadge(role: UserRole) {
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

  function formatRole(role: UserRole) {
    return role
      .toLowerCase()
      .replace("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Users
          </h1>

          <p className="text-sm text-gray-500">
            Total Users:{" "}
            <span className="font-semibold">{total}</span>
          </p>
        </div>
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
              placeholder="Search users by name or email..."
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
            value={roleFilter}
            onChange={(e) =>
              updateQuery({
                role: e.target.value,
              })
            }
            className="border p-2 rounded"
          >
            <option value="all">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="MANAGER">Managers</option>
            <option value="ADMIN">Admins</option>
            <option value="SUPER_ADMIN">Super Admins</option>
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
            Loading users...
          </p>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {users.length === 0 && (
          <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
            No users found.
          </div>
        )}

        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;

          return (
            <div
              key={user.id}
              className="bg-white border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition"
            >
              {/* LEFT */}
              <div className="flex items-center gap-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-500">
                    {user.name?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900">
                      {user.name || "No Name"}
                    </h2>

                    {isCurrentUser && (
                      <span className="text-[11px] px-2 py-0.5 bg-gray-900 text-white rounded-full">
                        You
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500">
                    {user.email || "No email"}
                  </p>

                  <div className="flex gap-2 mt-1 flex-wrap text-xs">
                    <span
                      className={`px-2 py-0.5 rounded ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {formatRole(user.role)}
                    </span>

                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {user._count.orders} orders
                    </span>

                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {user._count.accounts > 0
                        ? "OAuth User"
                        : "Credentials User"}
                    </span>
                  </div>
                </div>
              </div>

              {/* MIDDLE */}
              <div className="hidden md:block text-sm text-gray-600 text-center">
                <div className="font-semibold text-gray-900">
                  Joined
                </div>

                <div className="text-xs text-gray-400">
                  {formatDate(user.createdAt)}
                </div>
              </div>

              {/* RIGHT */}
              <div className="hidden lg:block text-right text-sm">
                <div className="font-semibold">
                  Updated
                </div>

                <div className="text-xs text-gray-400">
                  {formatDate(user.updatedAt)}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 ml-6">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  View
                </Link>

                {currentUserRole === "SUPER_ADMIN" && (
                  <Link
                    href={`/admin/users/edit/${user.id}`}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
                  >
                    Edit Role
                  </Link>
                )}
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