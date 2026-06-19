"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type UserRole = "CUSTOMER" | "MANAGER" | "ADMIN" | "SUPER_ADMIN";

type EditableUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  createdAt: string;
  _count: {
    orders: number;
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

export default function EditUserClient({
  user,
  currentUserId,
}: Props) {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>(user.role);
  const [isPending, startTransition] = useTransition();

  const isCurrentUser = user.id === currentUserId;
  const roleChanged = role !== user.role;

  function formatRole(role: string) {
    return role
      .toLowerCase()
      .replace("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!roleChanged) {
      toast.info("No changes to save");
      return;
    }

    startTransition(async () => {
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
    });
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <Link
          href={`/admin/users/${user.id}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to User Details
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          Edit User Role
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Only super admins can change user roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* USER SUMMARY */}
        <div className="bg-white border rounded-xl p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-24 h-24 rounded-full object-cover border mb-4"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-3xl font-semibold text-gray-500 mb-4">
                {user.name?.charAt(0)?.toUpperCase() ||
                  user.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
            )}

            <h2 className="text-xl font-bold text-gray-900">
              {user.name || "No Name"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {user.email || "No email"}
            </p>

            {isCurrentUser && (
              <span className="text-[11px] px-2 py-0.5 bg-gray-900 text-white rounded-full mt-3">
                You
              </span>
            )}

            <div className="mt-5 w-full border-t pt-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Current Role</span>
                <span className="font-medium">
                  {formatRole(user.role)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Orders</span>
                <span className="font-medium">
                  {user._count.orders}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* EDIT FORM */}
        <div className="bg-white border rounded-xl p-6 lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Role Management
            </h3>

            {isCurrentUser && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-lg">
                You are editing your own account. For safety, the API
                will not allow you to remove your own super admin role.
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="border p-2 rounded w-full"
              >
                {roles.map((roleItem) => (
                  <option key={roleItem} value={roleItem}>
                    {formatRole(roleItem)}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-500 mt-2">
                Customer can shop. Manager can manage basic operations.
                Admin can manage admin areas. Super Admin can manage
                roles and full access.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Link
                href={`/admin/users/${user.id}`}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isPending || !roleChanged}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Saving..." : "Save Role"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}