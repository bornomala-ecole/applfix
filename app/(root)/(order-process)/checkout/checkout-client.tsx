"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-toastify";

type CheckoutItem = {
  id: string;
  quantity: number;

  product: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    images: {
      id: string;
      url: string;
      alt: string | null;
    }[];
  };

  variant: {
    id: string;
    sku: string;
    title: string;
    color: string | null;
    price: number;
    comparePrice: number | null;
    stock: number;
    isActive: boolean;
  };
};

type Address = {
  id: string;
  type: string;
  fullName: string | null;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
};

type Props = {
  items: CheckoutItem[];
  subtotal: number;
  addresses: Address[];
};

export default function CheckoutClient({
  items,
  subtotal,
  addresses,
}: Props) {
  const router = useRouter();

  const defaultAddress = addresses[0];

  const [loading, setLoading] = useState(false);

  const [shippingFullName, setShippingFullName] = useState(
    defaultAddress?.fullName || ""
  );
  const [shippingPhone, setShippingPhone] = useState(
    defaultAddress?.phone || ""
  );
  const [shippingAddress1, setShippingAddress1] = useState(
    defaultAddress?.addressLine1 || ""
  );
  const [shippingAddress2, setShippingAddress2] = useState(
    defaultAddress?.addressLine2 || ""
  );
  const [shippingCity, setShippingCity] = useState(
    defaultAddress?.city || ""
  );
  const [shippingState, setShippingState] = useState(
    defaultAddress?.state || ""
  );
  const [shippingPostcode, setShippingPostcode] = useState(
    defaultAddress?.postalCode || ""
  );
  const [shippingCountry, setShippingCountry] = useState(
    defaultAddress?.country || ""
  );

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");

  const shippingFee = 0;
  const tax = 0;
  const discount = 0;

  const total = useMemo(() => {
    return subtotal + shippingFee + tax - discount;
  }, [subtotal]);

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  function fillAddress(address: Address) {
    setShippingFullName(address.fullName || "");
    setShippingPhone(address.phone || "");
    setShippingAddress1(address.addressLine1 || "");
    setShippingAddress2(address.addressLine2 || "");
    setShippingCity(address.city || "");
    setShippingState(address.state || "");
    setShippingPostcode(address.postalCode || "");
    setShippingCountry(address.country || "");
  }

  async function handlePlaceOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (
      !shippingFullName.trim() ||
      !shippingPhone.trim() ||
      !shippingAddress1.trim() ||
      !shippingCity.trim() ||
      !shippingCountry.trim()
    ) {
      toast.error("Please fill all required shipping fields");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shippingFullName,
        shippingPhone,
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingState,
        shippingPostcode,
        shippingCountry,
        paymentMethod,
        notes,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      toast.error(data.message || "Failed to place order");
      return;
    }

    if (data.url) {
      window.location.href = data.url;
      return;
    }
    
    window.dispatchEvent(new Event("cart-updated"));
    
    toast.success("Order placed successfully");
    
    router.push(`/checkout/success?orderId=${data.orderId}`);



  }

  // If guest cart syncs after login, refresh checkout data.
  useEffect(() => {
    const handleCartUpdated = () => {
      router.refresh();
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [router]);

  if (!items.length) {
    return (
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="container">
          <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <ShoppingBag size={32} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Your cart is empty
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Add products to your cart before checkout. If you just logged in,
              wait a moment and refresh the page.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* LEFT SIDE */}
          <div className="space-y-6 lg:col-span-2">
            {/* SAVED ADDRESSES */}
            {addresses.length > 0 && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  <h2 className="text-lg font-bold text-gray-900">
                    Saved Addresses
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => fillAddress(address)}
                      className="rounded-xl border p-4 text-left transition hover:border-black hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900">
                          {address.fullName || "Saved Address"}
                        </p>

                        {address.isDefault && (
                          <span className="rounded-full bg-black px-2 py-1 text-[10px] text-white">
                            Default
                          </span>
                        )}
                      </div>

                      {address.phone && (
                        <p className="mt-1 text-sm text-gray-500">
                          {address.phone}
                        </p>
                      )}

                      <p className="mt-2 text-sm text-gray-600">
                        {address.addressLine1}
                        {address.addressLine2
                          ? `, ${address.addressLine2}`
                          : ""}
                        , {address.city}
                        {address.state ? `, ${address.state}` : ""}
                        {address.postalCode
                          ? ` ${address.postalCode}`
                          : ""}
                        , {address.country}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SHIPPING FORM */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Shipping Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the delivery details for this order.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>

                  <input
                    value={shippingFullName}
                    onChange={(e) =>
                      setShippingFullName(e.target.value)
                    }
                    className="w-full rounded-lg border p-2 outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone *
                  </label>

                  <input
                    value={shippingPhone}
                    onChange={(e) =>
                      setShippingPhone(e.target.value)
                    }
                    className="w-full rounded-lg border p-2 outline-none focus:border-black"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address Line 1 *
                  </label>

                  <input
                    value={shippingAddress1}
                    onChange={(e) =>
                      setShippingAddress1(e.target.value)
                    }
                    className="w-full rounded-lg border p-2 outline-none focus:border-black"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address Line 2
                  </label>

                  <input
                    value={shippingAddress2}
                    onChange={(e) =>
                      setShippingAddress2(e.target.value)
                    }
                    className="w-full rounded-lg border p-2 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    City *
                  </label>

                  <input
                    value={shippingCity}
                    onChange={(e) =>
                      setShippingCity(e.target.value)
                    }
                    className="w-full rounded-lg border p-2 outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    State / Region
                  </label>

                  <input
                    value={shippingState}
                    onChange={(e) =>
                      setShippingState(e.target.value)
                    }
                    className="w-full rounded-lg border p-2 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>

                  <input
                    value={shippingPostcode}
                    onChange={(e) =>
                      setShippingPostcode(e.target.value)
                    }
                    className="w-full rounded-lg border p-2 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Country *
                  </label>

                  <input
                    value={shippingCountry}
                    onChange={(e) =>
                      setShippingCountry(e.target.value)
                    }
                    className="w-full rounded-lg border p-2 outline-none focus:border-black"
                    required
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                <h2 className="text-lg font-bold text-gray-900">
                  Payment Method
                </h2>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <div>
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when your order is delivered.</p>
                </div>
              </label>

              <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                <input
                  type="radio"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <div>
                  <p className="font-semibold text-gray-900">Card Payment</p>
                  <p className="text-sm text-gray-500">Pay securely with Stripe.</p>
                </div>
              </label>



              {/* <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                />

                <div>
                  <p className="font-semibold text-gray-900">
                    Cash on Delivery
                  </p>

                  <p className="text-sm text-gray-500">
                    Pay when your order is delivered.
                  </p>
                </div>
              </label> */}

              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Order Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[90px] w-full rounded-lg border p-2 outline-none focus:border-black"
                  placeholder="Any special delivery instruction?"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-5 space-y-4">
                {items.map((item) => {
                  const image = item.product.images[0];

                  const itemTotal =
                    item.variant.price * item.quantity;

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.alt || item.product.name}
                            fill
                            sizes="64px"
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-primaryRed"
                        >
                          {item.product.name}
                        </Link>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.variant.title}
                          {item.variant.color
                            ? ` / ${item.variant.color}`
                            : ""}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(itemTotal)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">
                    {shippingFee === 0
                      ? "Free"
                      : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">
                    {tax === 0 ? formatPrice(0) : formatPrice(tax)}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-3 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                <CheckCircle size={18} />
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}