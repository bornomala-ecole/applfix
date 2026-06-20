"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { RefreshCw, Save } from "lucide-react";

type Props = {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
};

const orderStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = [
  "unpaid",
  "paid",
  "failed",
  "refunded",
];

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function OrderStatusActions({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: Props) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    status !== currentStatus || paymentStatus !== currentPaymentStatus;

  async function handleUpdate() {
    if (!hasChanges) {
      toast.info("No changes to update");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          paymentStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update order");
        return;
      }

      toast.success("Order updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setStatus(currentStatus);
    setPaymentStatus(currentPaymentStatus);
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">
          Update Order
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Change order progress and payment status from here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Order Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border p-3 text-sm outline-none focus:border-black"
          >
            {orderStatuses.map((item) => (
              <option key={item} value={item}>
                {formatLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Payment Status
          </label>

          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full rounded-xl border p-3 text-sm outline-none focus:border-black"
          >
            {paymentStatuses.map((item) => (
              <option key={item} value={item}>
                {formatLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={saving || !hasChanges}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={saving || !hasChanges}
          className="rounded-xl border px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}