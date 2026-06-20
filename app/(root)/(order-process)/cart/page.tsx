"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  clearGuestCart,
  getGuestCart,
  getGuestCartSubtotal,
  removeGuestCartItem,
  updateGuestCartItemQuantity,
} from "@/lib/cart/guestCart";

type CartPageItem = {
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
    comparePrice?: number | null;
    stock: number;
  };
};

export default function CartPage() {
  const { status } = useSession();

  const [items, setItems] = useState<CartPageItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }


  function calculateSubtotal(cartItems: CartPageItem[]) {
    return cartItems.reduce((sum, item) => {
      return sum + item.variant.price * item.quantity;
    }, 0);
  }



  function loadGuestCart() {
    const guestItems = getGuestCart();

    const mappedItems: CartPageItem[] = guestItems.map((item) => ({
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
    setLoading(false);
  }

  async function loadDatabaseCart(showLoader = false) {
    try {
      if (showLoader) {
        setLoading(true);
      }
  
      const res = await fetch("/api/cart", {
        cache: "no-store",
      });
  
      if (!res.ok) {
        setItems([]);
        setSubtotal(0);
        return;
      }
  
      const data = await res.json();
  
      const mappedItems: CartPageItem[] = (data.items || []).map(
        (item: any) => ({
          id: item.id,
          source: "db",
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            images: item.product.images || [],
          },
          variant: {
            id: item.variant.id,
            title: item.variant.title,
            color: item.variant.color,
            price: item.variant.price,
            comparePrice: item.variant.comparePrice,
            stock: item.variant.stock,
          },
        })
      );
  
      setItems(mappedItems);
      setSubtotal(data.subtotal || 0);
    } catch (error) {
      toast.error("Failed to load cart");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  async function loadCart(showLoader = false) {
    if (status === "loading") return;
  
    if (status === "authenticated") {
      await loadDatabaseCart(showLoader);
    } else {
      loadGuestCart();
    }
  }

  async function updateQuantity(item: CartPageItem, quantity: number) {
    if (quantity < 1) return;
  
    if (quantity > item.variant.stock) {
      toast.error(`Only ${item.variant.stock} item(s) available`);
      return;
    }
  
    const previousItems = items;
    const previousSubtotal = subtotal;
  
    // =========================
    // INSTANT UI UPDATE
    // =========================
    const updatedItems = items.map((cartItem) => {
      if (cartItem.id !== item.id) return cartItem;
  
      return {
        ...cartItem,
        quantity,
      };
    });
  
    setItems(updatedItems);
    setSubtotal(calculateSubtotal(updatedItems));
  
    // =========================
    // GUEST CART SYNC
    // =========================
    if (item.source === "guest") {
      updateGuestCartItemQuantity(item.variant.id, quantity);
      window.dispatchEvent(new Event("cart-updated"));
      return;
    }
  
    // =========================
    // DATABASE CART BACKGROUND SYNC
    // =========================
    try {
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
        setItems(previousItems);
        setSubtotal(previousSubtotal);
        toast.error(data.message || "Failed to update cart");
        return;
      }
  
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      setItems(previousItems);
      setSubtotal(previousSubtotal);
      toast.error("Failed to update cart");
    }
  }

  async function removeItem(item: CartPageItem) {
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

  async function clearCart() {
    if (!items.length) return;

    if (status !== "authenticated") {
      clearGuestCart();
      setItems([]);
      setSubtotal(0);
      toast.success("Cart cleared");
      return;
    }

    const res = await fetch("/api/cart", {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Failed to clear cart");
      return;
    }

    toast.success("Cart cleared");
    window.dispatchEvent(new Event("cart-updated"));
    await loadDatabaseCart();
  }

  useEffect(() => {
    loadCart(true);
  
    const handleCartUpdated = () => {
      loadCart(false);
    };
  
    window.addEventListener("cart-updated", handleCartUpdated);
  
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [status]);

  const checkoutHref =
    status === "authenticated"
      ? "/checkout"
      : "/login?callbackUrl=/checkout";

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <Link
          href="/shop"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Shopping Cart
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review your selected products before checkout.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <XCircle size={16} />
              Clear Cart
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">Loading cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <ShoppingBag size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add some products to your cart and they will appear here.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* CART ITEMS */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => {
                const image = item.product.images?.[0];
                const lineTotal = item.variant.price * item.quantity;
                const isOutOfStock = item.variant.stock <= 0;

                return (
                  <div
                    key={`${item.source}-${item.id}`}
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-gray-50">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.alt || item.product.name}
                            fill
                            sizes="96px"
                            className="object-contain p-3"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-3">
                          <div>
                            <Link
                              href={`/product/${item.product.slug}`}
                              className="font-semibold text-gray-900 hover:text-primaryRed"
                            >
                              {item.product.name}
                            </Link>

                            <p className="mt-1 text-sm text-gray-500">
                              {item.variant.title}
                              {item.variant.color
                                ? ` / ${item.variant.color}`
                                : ""}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              Stock: {item.variant.stock}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item)}
                            className="h-fit text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="inline-flex w-fit items-center overflow-hidden rounded-lg border">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item, item.quantity - 1)
                              }
                              className="p-2 hover:bg-gray-100"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="px-5 text-sm font-semibold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              disabled={
                                item.quantity >= item.variant.stock ||
                                isOutOfStock
                              }
                              onClick={() =>
                                updateQuantity(item, item.quantity + 1)
                              }
                              className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-sm text-gray-500">
                              {formatPrice(item.variant.price)} each
                            </p>

                            <p className="font-bold text-gray-900">
                              {formatPrice(lineTotal)}
                            </p>
                          </div>
                        </div>

                        {isOutOfStock && (
                          <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs font-medium text-red-600">
                            This item is currently out of stock.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SUMMARY */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                  Order Summary
                </h2>

                <div className="mt-5 space-y-3 border-b pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <Link
                  href={checkoutHref}
                  className="mt-6 block rounded-xl bg-black px-5 py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
                >
                  Proceed to Checkout
                </Link>

                {status !== "authenticated" && (
                  <p className="mt-3 text-center text-xs text-gray-500">
                    You can add products as guest. Login is required only before
                    checkout.
                  </p>
                )}

                <Link
                  href="/shop"
                  className="mt-3 block rounded-xl border px-5 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}