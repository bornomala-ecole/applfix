"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Eye,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Users,
} from "lucide-react";
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
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    accounts: number;
  };
};

type Props = {
  users?: AdminUser[];
  page?: number;
  total?: number;
  limit?: number;
  search?: string;
  roleFilter?: UserRole | "all";
  currentUserId: string;
  currentUserRole: UserRole;
  totalCustomers?: number;
  totalAdmins?: number;
};

const FRANCE_TIME_ZONE = "Europe/Paris";

export default function UsersClient({
  users = [],
  page = 1,
  total = 0,
  limit = 20,
  search = "",
  roleFilter = "all",
  currentUserId,
  currentUserRole,
  totalCustomers = 0,
  totalAdmins = 0,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(search);
  const [isPending, startTransition] = useTransition();

  const safeUsers = Array.isArray(users) ? users : [];
  const safeTotal = Number.isFinite(total) ? total : 0;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
  const totalPages = Math.ceil(safeTotal / safeLimit);

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

  function formatPrice(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primaryRed">
            Admin Dashboard
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customers, admins, managers, and account activity.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {safeTotal}
              </h2>
            </div>

            <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Customers</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {totalCustomers}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <UserRound size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Admins</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {totalAdmins}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Showing</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {safeUsers.length}
              </h2>
            </div>

            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Search size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Search size={18} className="text-gray-500" />

          <h2 className="font-semibold text-gray-900">
            Search & Filter Users
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 lg:col-span-2"
          >
            <input
              type="text"
              placeholder="Search users by name or email..."
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
            value={roleFilter}
            onChange={(e) =>
              updateQuery({
                role: e.target.value,
              })
            }
            className="rounded-xl border p-3 text-sm outline-none focus:border-black"
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
            className="rounded-xl border bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Clear Filters
          </button>
        </div>

        {isPending && (
          <p className="mt-3 text-xs text-gray-400">
            Loading users...
          </p>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {safeUsers.length === 0 && (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <Users className="mx-auto mb-3 text-gray-400" size={34} />

            <h3 className="font-semibold text-gray-900">
              No users found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filter.
            </p>
          </div>
        )}

        {safeUsers.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const providerLabel =
            user._count.accounts > 0 ? "OAuth User" : "Credentials User";

          return (
            <div
              key={user.id}
              className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
                {/* USER */}
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-4">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-12 w-12 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                        {user.name?.charAt(0)?.toUpperCase() ||
                          user.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-gray-900">
                          {user.name || "No Name"}
                        </h2>

                        {isCurrentUser && (
                          <span className="rounded-full bg-black px-2 py-0.5 text-[11px] text-white">
                            You
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-sm text-gray-500">
                        {user.email || "No email"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span
                          className={`rounded-full px-2.5 py-1 font-medium ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {formatRole(user.role)}
                        </span>

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                          {providerLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ORDERS */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ShoppingBag size={16} />
                    Orders
                  </div>

                  <p className="mt-1 font-semibold text-gray-900">
                    {user._count.orders}
                  </p>
                </div>

                {/* SPENT */}
                <div className="lg:col-span-2">
                  <p className="text-sm text-gray-500">Total Spent</p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {formatPrice(user.totalSpent)}
                  </p>
                </div>

                {/* DATES */}
                <div className="lg:col-span-3">
                  <div className="space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      Joined: {formatFranceDate(user.createdAt)}
                    </p>

                    <p className="flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      Updated: {formatFranceDate(user.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="lg:col-span-1 lg:text-right">
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-black px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
                    >
                      <Eye size={14} />
                      View
                    </Link>

                    {currentUserRole === "SUPER_ADMIN" && (
                      <Link
                        href={`/admin/users/edit/${user.id}`}
                        className="rounded-xl border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Role
                      </Link>
                    )}
                  </div>
                </div>
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