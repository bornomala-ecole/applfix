"use client";

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  getGuestCart,
  getGuestCartSubtotal,
  removeGuestCartItem,
  updateGuestCartItemQuantity,
} from "@/lib/cart/guestCart";

type CartDrawerProps = {
  showCart: boolean;
  setShowCart: Dispatch<SetStateAction<boolean>>;
};

type DrawerCartItem = {
  id: string;
  source: "guest" | "db";
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: {
      url: string;
      alt: string | null;
    }[];
  };
  variant: {
    id: string;
    title: string;
    color: string | null;
    price: number;
    stock: number;
  };
};

export default function CartDrawer({
  showCart,
  setShowCart,
}: CartDrawerProps) {
  const { status } = useSession();

  const [items, setItems] = useState<DrawerCartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  function loadGuestCart() {
    const guestItems = getGuestCart();

    const mappedItems: DrawerCartItem[] = guestItems.map((item) => ({
      id: item.variantId,
      source: "guest",
      quantity: item.quantity,
      product: {
        id: item.productId,
        name: item.name,
        slug: item.slug,
        images: item.image
          ? [
              {
                url: item.image,
                alt: item.name,
              },
            ]
          : [],
      },
      variant: {
        id: item.variantId,
        title: item.variantTitle,
        color: item.color || null,
        price: item.price,
        stock: item.stock,
      },
    }));

    setItems(mappedItems);
    setSubtotal(getGuestCartSubtotal());
  }

  async function loadDatabaseCart() {
    try {
      setLoading(true);

      const res = await fetch("/api/cart", {
        cache: "no-store",
      });

      if (!res.ok) {
        setItems([]);
        setSubtotal(0);
        return;
      }

      const data = await res.json();

      const mappedItems: DrawerCartItem[] = (data.items || []).map(
        (item: any) => ({
          ...item,
          source: "db",
        })
      );

      setItems(mappedItems);
      setSubtotal(data.subtotal || 0);
    } catch {
      setItems([]);
      setSubtotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function loadCart() {
    if (status === "loading") return;

    if (status === "authenticated") {
      await loadDatabaseCart();
    } else {
      loadGuestCart();
    }
  }

  async function updateQuantity(item: DrawerCartItem, quantity: number) {
    if (quantity < 1) return;

    if (item.source === "guest") {
      updateGuestCartItemQuantity(item.variant.id, quantity);
      loadGuestCart();
      return;
    }

    const res = await fetch(`/api/cart/items/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Failed to update cart");
      return;
    }

    window.dispatchEvent(new Event("cart-updated"));
    await loadDatabaseCart();
  }

  async function removeItem(item: DrawerCartItem) {
    if (item.source === "guest") {
      removeGuestCartItem(item.variant.id);
      toast.success("Item removed");
      loadGuestCart();
      return;
    }

    const res = await fetch(`/api/cart/items/${item.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Failed to remove item");
      return;
    }

    toast.success("Item removed");
    window.dispatchEvent(new Event("cart-updated"));
    await loadDatabaseCart();
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  useEffect(() => {
    if (showCart) {
      loadCart();
    }
  }, [showCart, status]);

  useEffect(() => {
    const handleCartUpdated = () => {
      loadCart();
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [status]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCart(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [setShowCart]);

  const checkoutHref =
  status === "authenticated"
    ? "/checkout"
    : "/login?callbackUrl=/checkout";

  return (
    <>
      <div
        onClick={() => setShowCart(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          showCart ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 h-screen w-[320px] sm:w-[420px] bg-white z-50 shadow-xl transition-transform duration-300 ease-in-out ${
          showCart ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-semibold">Your Cart</h2>

          <button
            className="cursor-pointer"
            type="button"
            onClick={() => setShowCart(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-160px)]">
          {loading && (
            <p className="text-sm text-gray-500">Loading cart...</p>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-10">
              <h3 className="font-semibold text-gray-900">
                Your cart is empty
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Add products to your cart to see them here.
              </p>

              <Link
                href="/shop"
                onClick={() => setShowCart(false)}
                className="inline-block mt-4 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800"
              >
                Continue Shopping
              </Link>
            </div>
          )}

          {!loading &&
            items.map((item) => {
              const image = item.product.images?.[0];
              const lineTotal = item.variant.price * item.quantity;

              return (
                <div
                  key={`${item.source}-${item.id}`}
                  className="border rounded-xl p-3 mb-3"
                >
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 bg-gray-50 border rounded-lg overflow-hidden shrink-0">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.alt || item.product.name}
                          fill
                          sizes="64px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={() => setShowCart(false)}
                        className="font-medium text-sm text-gray-900 hover:text-primaryRed line-clamp-2"
                      >
                        {item.product.name}
                      </Link>

                      <p className="text-xs text-gray-500 mt-1">
                        {item.variant.title}
                        {item.variant.color
                          ? ` / ${item.variant.color}`
                          : ""}
                      </p>

                      <p className="font-semibold mt-1">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item, item.quantity - 1)
                        }
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="px-4 text-sm font-medium">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        disabled={item.quantity >= item.variant.stock}
                        onClick={() =>
                          updateQuantity(item, item.quantity + 1)
                        }
                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <p className="text-xs text-gray-400">
                      Stock: {item.variant.stock}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="border-t bg-white px-4 pt-4 pb-8 sm:pb-6">
          <div className="flex justify-between mb-4">
            <span className="font-medium">Subtotal</span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={() => setShowCart(false)}
                className="block text-center border px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                View Cart
              </Link>

              <Link
                href={checkoutHref}
                onClick={() => setShowCart(false)}
                className="block text-center bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Checkout
              </Link>
            </div>
          ) : (
            <Link
              href="/shop"
              onClick={() => setShowCart(false)}
              className="block text-center bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              Start Shopping
            </Link>
          )}

          {items.length > 0 && status !== "authenticated" && (
            <p className="mt-3 text-center text-xs text-gray-500">
              You can add items as guest. Login is required before checkout.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}