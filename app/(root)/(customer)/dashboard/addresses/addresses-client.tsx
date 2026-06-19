"use client";

import {
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type AddressType = "SHIPPING" | "BILLING" | "BOTH";

type CustomerAddress = {
  id: string;
  type: AddressType;
  fullName: string | null;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type AddressFormState = {
  type: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type Props = {
  addresses: CustomerAddress[];
};

const emptyForm: AddressFormState = {
  type: "SHIPPING",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

export default function AddressesClient({ addresses }: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<AddressFormState>(emptyForm);

  const isEditing = Boolean(editingId);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(address: CustomerAddress) {
    setEditingId(address.id);

    setForm({
      type: address.type,
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country,
      isDefault: address.isDefault,
    });

    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateForm<K extends keyof AddressFormState>(
    key: K,
    value: AddressFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function formatType(type: AddressType) {
    return type
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function getTypeBadge(type: AddressType) {
    switch (type) {
      case "BILLING":
        return "bg-blue-100 text-blue-700";
      case "BOTH":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-green-100 text-green-700";
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const url = isEditing
        ? `/api/account/addresses/${editingId}`
        : "/api/account/addresses";

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save address");
        return;
      }

      toast.success(
        isEditing
          ? "Address updated successfully"
          : "Address added successfully"
      );

      closeModal();
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete address");
        return;
      }

      toast.success("Address deleted successfully");

      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Addresses
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your shipping and billing addresses.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800"
        >
          + Add Address
        </button>
      </div>

      {/* ADDRESS LIST */}
      <div className="space-y-3">
        {addresses.length === 0 && (
          <div className="bg-white border rounded-xl p-6 text-center">
            <h2 className="font-bold text-gray-900">
              No addresses found
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Add your first shipping or billing address.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800"
            >
              Add Address
            </button>
          </div>
        )}

        {addresses.map((address) => (
          <div
            key={address.id}
            className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 items-start justify-between hover:shadow-sm transition"
          >
            {/* LEFT */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-gray-900">
                  {address.fullName || "No Name"}
                </h2>

                <span
                  className={`px-2 py-0.5 text-xs rounded ${getTypeBadge(
                    address.type
                  )}`}
                >
                  {formatType(address.type)}
                </span>

                {address.isDefault && (
                  <span className="px-2 py-0.5 text-xs rounded bg-black text-white">
                    Default
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700 mt-2">
                {address.addressLine1}
                {address.addressLine2
                  ? `, ${address.addressLine2}`
                  : ""}
              </p>

              <p className="text-sm text-gray-500">
                {address.city}
                {address.state ? `, ${address.state}` : ""}
                {address.postalCode ? ` ${address.postalCode}` : ""}
              </p>

              <p className="text-sm text-gray-500">
                {address.country}
              </p>

              {address.phone && (
                <p className="text-xs text-gray-400 mt-2">
                  Phone: {address.phone}
                </p>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEditModal(address)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => setDeleteId(address.id)}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? "Edit Address" : "Add New Address"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Fill in your address information below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* TYPE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Type
                  </label>

                  <select
                    value={form.type}
                    onChange={(e) =>
                      updateForm(
                        "type",
                        e.target.value as AddressType
                      )
                    }
                    className="border p-2 rounded w-full"
                  >
                    <option value="SHIPPING">Shipping</option>
                    <option value="BILLING">Billing</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                {/* FULL NAME */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) =>
                      updateForm("fullName", e.target.value)
                    }
                    placeholder="Enter full name"
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>

                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      updateForm("phone", e.target.value)
                    }
                    placeholder="Enter phone number"
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* COUNTRY */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>

                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) =>
                      updateForm("country", e.target.value)
                    }
                    placeholder="United States"
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* ADDRESS 1 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>

                  <input
                    type="text"
                    value={form.addressLine1}
                    onChange={(e) =>
                      updateForm("addressLine1", e.target.value)
                    }
                    placeholder="Street address"
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* ADDRESS 2 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>

                  <input
                    type="text"
                    value={form.addressLine2}
                    onChange={(e) =>
                      updateForm("addressLine2", e.target.value)
                    }
                    placeholder="Apartment, suite, unit, etc."
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* CITY */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>

                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      updateForm("city", e.target.value)
                    }
                    placeholder="City"
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* STATE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State / Region
                  </label>

                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) =>
                      updateForm("state", e.target.value)
                    }
                    placeholder="State"
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* POSTAL CODE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>

                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) =>
                      updateForm("postalCode", e.target.value)
                    }
                    placeholder="Postal code"
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* DEFAULT */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="isDefault"
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) =>
                      updateForm("isDefault", e.target.checked)
                    }
                    className="w-4 h-4"
                  />

                  <label
                    htmlFor="isDefault"
                    className="text-sm text-gray-700"
                  >
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 border-t pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm disabled:opacity-50"
                >
                  {isPending
                    ? "Saving..."
                    : isEditing
                    ? "Update Address"
                    : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-[320px]">
            <h2 className="text-lg font-bold mb-2">
              Delete Address?
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(deleteId)}
                disabled={isPending}
                className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}