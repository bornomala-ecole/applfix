"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type UserRole = "CUSTOMER" | "MANAGER" | "ADMIN" | "SUPER_ADMIN";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  phone: string;
  createdAt: string;
};

type Props = {
  user: ProfileUser;
};

export default function ProfileClient({ user }: Props) {
  const router = useRouter();

  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [isLoading, setIsLoading] = useState(false);

  const hasChanges =
    name.trim() !== (user.name || "") ||
    phone.trim() !== (user.phone || "");

  function formatRole(role: string) {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage your personal account information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PROFILE SUMMARY */}
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

            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded mt-3">
              {formatRole(user.role)}
            </span>

            <div className="mt-5 w-full border-t pt-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Joined</span>
                <span className="font-medium">
                  {formatDate(user.createdAt)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Account</span>
                <span className="font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE FORM */}
        <div className="bg-white border rounded-xl p-6 lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Personal Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>

                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="border p-2 rounded w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed from this page.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 border-t pt-5">
              <Link
                href="/dashboard/security"
                className="text-sm text-blue-600 hover:underline"
              >
                Change password
              </Link>

              <button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}