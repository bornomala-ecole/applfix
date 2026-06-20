import Link from "next/link";
import { CheckCircle } from "lucide-react";

type Props = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: Props) {
  const { orderId } = await searchParams;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle size={34} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Order Placed Successfully
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Thank you for your purchase. We have received your order and will
            start processing it soon.
          </p>

          {orderId && (
            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Your Order ID</p>

              <p className="mt-1 font-semibold text-gray-900">
                #{orderId.slice(0, 8)}
              </p>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {orderId && (
              <Link
                href={`/dashboard/orders/${orderId}`}
                className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                View Order
              </Link>
            )}

            <Link
              href="/shop"
              className="rounded-xl border px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}