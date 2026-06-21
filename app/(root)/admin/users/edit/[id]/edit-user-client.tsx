"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Save,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

type UserRole = "CUSTOMER" | "MANAGER" | "ADMIN" | "SUPER_ADMIN";

type EditableUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  totalSpent: number;
  paidSpent: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    accounts: number;
  };
};

type Props = {
  user: EditableUser;
  currentUserId: string;
};

const roles: UserRole[] = [
  "CUSTOMER",
  "MANAGER",
  "ADMIN",
  "SUPER_ADMIN",
];

const FRANCE_TIME_ZONE = "Europe/Paris";

export default function EditUserClient({
  user,
  currentUserId,
}: Props) {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>(user.role);
  const [isPending, startTransition] = useTransition();

  const isCurrentUser = user.id === currentUserId;
  const roleChanged = role !== user.role;
  const isTryingToRemoveOwnSuperAdmin =
    isCurrentUser && user.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN";

  function formatRole(role: string) {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!roleChanged) {
      toast.info("No changes to save");
      return;
    }

    if (isTryingToRemoveOwnSuperAdmin) {
      toast.error("You cannot remove your own Super Admin role");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${user.id}/role`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to update role");
          return;
        }

        toast.success("User role updated");

        router.push(`/admin/users/${user.id}`);
        router.refresh();
      } catch (error) {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href={`/admin/users/${user.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to User Details
          </Link>

          <p className="mt-4 text-sm font-medium text-primaryRed">
            Super Admin Access
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Edit User Role
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Change user permissions and access level.
          </p>
        </div>

        <Link
          href="/admin/users"
          className="inline-flex items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          All Users
        </Link>
      </div>

      {/* WARNING */}
      <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
        <div className="flex gap-3">
          <ShieldAlert size={22} className="shrink-0" />

          <div>
            <h2 className="font-semibold">
              Role changes affect admin access
            </h2>

            <p className="mt-1 text-sm">
              Only Super Admins can edit roles. Be careful when assigning Admin
              or Super Admin access because those users can access protected
              admin areas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* USER SUMMARY */}
        <div className="xl:col-span-1">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="mb-4 h-24 w-24 rounded-full border object-cover"
                />
              ) : (
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-3xl font-semibold text-gray-500">
                  {user.name?.charAt(0)?.toUpperCase() ||
                    user.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-900">
                {user.name || "No Name"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {user.email || "No email"}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2.5 py-1 font-medium ${getRoleBadge(
                    user.role
                  )}`}
                >
                  {formatRole(user.role)}
                </span>

                {isCurrentUser && (
                  <span className="rounded-full bg-black px-2.5 py-1 text-white">
                    You
                  </span>
                )}

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                  {user._count.accounts > 0
                    ? "OAuth User"
                    : "Credentials User"}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t pt-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-500">
                  <ShoppingBag size={15} />
                  Orders
                </span>

                <span className="font-semibold text-gray-900">
                  {user._count.orders}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-500">
                  <CreditCard size={15} />
                  Total Spent
                </span>

                <span className="font-semibold text-gray-900">
                  {formatPrice(user.totalSpent)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-500">
                  <ShieldCheck size={15} />
                  Paid Revenue
                </span>

                <span className="font-semibold text-gray-900">
                  {formatPrice(user.paidSpent)}
                </span>
              </div>

              <div className="border-t pt-4">
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  <CalendarDays size={13} />
                  Joined: {formatFranceDate(user.createdAt)}
                </p>

                <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <CalendarDays size={13} />
                  Updated: {formatFranceDate(user.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* EDIT FORM */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit}>
              <div className="mb-6 flex items-center gap-2">
                <UserRound size={20} className="text-gray-500" />

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Role Management
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Select a new role and save changes.
                  </p>
                </div>
              </div>

              {isCurrentUser && (
                <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                  You are editing your own account. For safety, you cannot
                  remove your own Super Admin role.
                </div>
              )}

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  User Role
                </label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border p-3 text-sm outline-none focus:border-black"
                >
                  {roles.map((roleItem) => (
                    <option key={roleItem} value={roleItem}>
                      {formatRole(roleItem)}
                    </option>
                  ))}
                </select>

                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  <p>
                    <strong>Customer:</strong> Can shop and manage their own
                    account.
                  </p>

                  <p className="mt-1">
                    <strong>Manager:</strong> Can manage basic operational
                    areas.
                  </p>

                  <p className="mt-1">
                    <strong>Admin:</strong> Can access admin management pages.
                  </p>

                  <p className="mt-1">
                    <strong>Super Admin:</strong> Can manage roles and full
                    admin access.
                  </p>
                </div>
              </div>

              {roleChanged && (
                <div className="mb-6 rounded-xl border bg-blue-50 p-4 text-sm text-blue-700">
                  Role will change from{" "}
                  <strong>{formatRole(user.role)}</strong> to{" "}
                  <strong>{formatRole(role)}</strong>.
                </div>
              )}

              {isTryingToRemoveOwnSuperAdmin && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  This change is blocked. You cannot remove your own Super Admin
                  role.
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={
                    isPending ||
                    !roleChanged ||
                    isTryingToRemoveOwnSuperAdmin
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  {isPending ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}