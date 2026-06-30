"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { addGuestCartItem } from "@/lib/cart/guestCart";

import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "react-toastify";

type ProductImage = {
  id: string;
  url: string;
  publicId: string | null;
  alt: string | null;
  type: string;
  sortOrder: number;
};

type ProductVariant = {
  id: string;
  sku: string;
  title: string;
  color: string | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;

  brand: {
    id: string;
    name: string;
    logo: string | null;
  } | null;

  category: {
    id: string;
    name: string;
  } | null;

  images: ProductImage[];
  variants: ProductVariant[];
};

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  brand: {
    name: string;
  } | null;
  images: {
    id: string;
    url: string;
    alt: string | null;
    type: string;
    sortOrder: number;
  }[];
  variants: {
    id: string;
    price: number;
    comparePrice: number | null;
    stock: number;
  }[];
};

type WishlistStatusResponse =
  | {
      wishlisted: boolean;
    }
  | {
      message?: string;
      wishlisted?: boolean;
    };

type Props = {
  product: Product;
  relatedProducts: RelatedProduct[];
  initialWishlisted: boolean;
};

export default function ProductDetailsClient({
  product,
  relatedProducts,
  initialWishlisted,
}: Props) {
  const { status } = useSession();

  const mainImage =
    product.images.find((image) => image.type === "main") ||
    product.images[0];

  const [selectedImage, setSelectedImage] =
    useState<ProductImage | undefined>(mainImage);

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id || ""
  );

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistStatusLoaded, setWishlistStatusLoaded] = useState(
    status !== "loading"
  );

  const selectedVariant = useMemo(() => {
    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ||
      product.variants[0]
    );
  }, [product.variants, selectedVariantId]);

  const [quantity, setQuantity] = useState(1);

  const totalStock = product.variants.reduce(
    (sum, variant) => sum + variant.stock,
    0
  );

  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  const hasComparePrice =
    selectedVariant?.comparePrice &&
    selectedVariant.comparePrice > selectedVariant.price;

  const discountPercent =
    hasComparePrice && selectedVariant
      ? Math.round(
          ((selectedVariant.comparePrice! - selectedVariant.price) /
            selectedVariant.comparePrice!) *
            100
        )
      : 0;

  useEffect(() => {
    let cancelled = false;

    async function loadWishlistStatus() {
      if (status === "loading") {
        return;
      }

      if (status !== "authenticated") {
        setIsWishlisted(false);
        setWishlistStatusLoaded(true);
        return;
      }

      const startedAt = performance.now();

      console.log("[ProductDetailsClient] wishlist status fetch start", {
        productId: product.id,
      });

      try {
        setWishlistStatusLoaded(false);

        const res = await fetch(
          `/api/wishlist/status?productId=${encodeURIComponent(product.id)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = (await res.json()) as WishlistStatusResponse;

        if (cancelled) return;

        if (!res.ok) {
          console.error("[ProductDetailsClient] wishlist status failed", data);
          setWishlistStatusLoaded(true);
          return;
        }

        setIsWishlisted(Boolean(data.wishlisted));
        setWishlistStatusLoaded(true);

        console.log("[ProductDetailsClient] wishlist status fetch result", {
          productId: product.id,
          wishlisted: Boolean(data.wishlisted),
          durationMs: (performance.now() - startedAt).toFixed(2),
        });
      } catch (error) {
        if (cancelled) return;

        console.error("[ProductDetailsClient] wishlist status error", error);
        setWishlistStatusLoaded(true);
      }
    }

    void loadWishlistStatus();

    return () => {
      cancelled = true;
    };
  }, [product.id, status]);

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  }

  function decreaseQuantity() {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  function increaseQuantity() {
    if (!selectedVariant) return;

    setQuantity((prev) => Math.min(selectedVariant.stock, prev + 1));
  }

  async function handleAddToCart() {
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    if (selectedVariant.stock <= 0) {
      toast.error("This variant is out of stock");
      return;
    }

    if (status !== "authenticated") {
      addGuestCartItem({
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name,
        slug: product.slug,
        image: selectedImage?.url || "",
        variantTitle: selectedVariant.title,
        color: selectedVariant.color,
        price: selectedVariant.price,
        quantity,
        stock: selectedVariant.stock,
      });

      window.dispatchEvent(new Event("cart-updated"));

      toast.success("Product added to cart");
      return;
    }

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Failed to add product to cart");
      return;
    }

    window.dispatchEvent(new Event("cart-updated"));

    toast.success("Product added to cart");
  }

  async function handleToggleWishlist() {
    if (status === "loading") {
      return;
    }

    if (status !== "authenticated") {
      toast.info("Please sign in to use wishlist");
      return;
    }

    try {
      setWishlistLoading(true);

      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update wishlist");
        return;
      }

      setIsWishlisted(Boolean(data.wishlisted));
      setWishlistStatusLoaded(true);

      toast.success(data.message || "Wishlist updated");

      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (error) {
      console.error("[ProductDetailsClient] wishlist toggle failed", error);
      toast.error("Something went wrong");
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <Link
          href="/shop"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-4 lg:p-6">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
              {selectedImage ? (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.alt || product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-6"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {product.images.map((image) => {
                  const isSelected = selectedImage?.url === image.url;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`relative aspect-square overflow-hidden rounded-xl border bg-gray-50 ${
                        isSelected ? "ring-2 ring-black" : "hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || product.name}
                        fill
                        sizes="100px"
                        className="object-contain p-2"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {product.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                  <Star size={12} />
                  Featured
                </span>
              )}

              {hasComparePrice && (
                <span className="rounded-full bg-primaryRed px-3 py-1 text-xs font-medium text-white">
                  {discountPercent}% OFF
                </span>
              )}

              {product.category && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {product.category.name}
                </span>
              )}
            </div>

            <p className="mb-2 text-sm text-gray-500">
              {product.brand?.name || "No Brand"}
            </p>

            <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-3 leading-relaxed text-gray-500">
                {product.shortDescription}
              </p>
            )}

            <div className="mt-6">
              {selectedVariant ? (
                <div className="flex flex-wrap items-end gap-3">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(selectedVariant.price)}
                  </p>

                  {hasComparePrice && (
                    <p className="text-lg text-gray-400 line-through">
                      {formatPrice(selectedVariant.comparePrice!)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xl font-semibold text-gray-500">
                  No variant available
                </p>
              )}

              {selectedVariant && (
                <p className="mt-2 text-xs text-gray-500">
                  SKU: {selectedVariant.sku}
                </p>
              )}
            </div>

            <div className="mt-4">
              {selectedVariant ? (
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isOutOfStock
                        ? "text-red-600"
                        : selectedVariant.stock <= selectedVariant.lowStockThreshold
                          ? "text-orange-600"
                          : "text-green-600"
                    }`}
                  >
                    {isOutOfStock
                      ? "Out of stock"
                      : selectedVariant.stock <= selectedVariant.lowStockThreshold
                        ? `Only ${selectedVariant.stock} left`
                        : "In stock"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Total available stock: {totalStock}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-600">
                  No active variant available.
                </p>
              )}
            </div>

            {product.variants.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">
                  Select Variant
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariantId === variant.id;
                    const disabled = variant.stock <= 0;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setQuantity(1);
                        }}
                        className={`rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? "border-black bg-gray-50"
                            : "hover:border-gray-400"
                        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {variant.title}
                            </p>

                            {variant.color && (
                              <p className="text-xs text-gray-500">
                                {variant.color}
                              </p>
                            )}
                          </div>

                          {isSelected && <Check size={16} className="text-black" />}
                        </div>

                        <p className="mt-2 text-sm font-bold">
                          {formatPrice(variant.price)}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {variant.stock > 0
                            ? `${variant.stock} in stock`
                            : "Out of stock"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">
                Quantity
              </h2>

              <div className="inline-flex items-center overflow-hidden rounded-xl border">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="p-3 hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>

                <span className="px-5 text-sm font-semibold">{quantity}</span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={isOutOfStock}
                  className="p-3 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedVariant}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={wishlistLoading || status === "loading"}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-medium transition disabled:opacity-50 ${
                  isWishlisted
                    ? "border-primaryRed bg-red-50 text-primaryRed"
                    : "hover:bg-gray-50"
                }`}
              >
                <Heart
                  size={18}
                  className={isWishlisted ? "fill-primaryRed text-primaryRed" : ""}
                />

                {wishlistLoading
                  ? "Updating..."
                  : status === "loading"
                    ? "Checking..."
                    : status === "authenticated" && !wishlistStatusLoaded
                      ? "Checking..."
                      : isWishlisted
                        ? "Wishlisted"
                        : "Wishlist"}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <Truck size={18} className="mb-2 text-gray-700" />
                <p className="text-sm font-semibold text-gray-900">
                  Fast Delivery
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Reliable shipping on eligible products.
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <Check size={18} className="mb-2 text-gray-700" />
                <p className="text-sm font-semibold text-gray-900">
                  Quality Checked
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Products are reviewed before listing.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6">
          <h2 className="mb-3 text-xl font-bold text-gray-900">
            Product Description
          </h2>

          {product.description ? (
            <p className="whitespace-pre-line leading-relaxed text-gray-600">
              {product.description}
            </p>
          ) : (
            <p className="text-gray-500">No detailed description available.</p>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Related Products
              </h2>

              <Link href="/shop" className="text-sm text-primaryRed hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
              {relatedProducts.map((item) => {
                const image = item.images[0];
                const variant = item.variants[0];

                return (
                  <Link
                    key={item.id}
                    href={`/product/${item.slug}`}
                    className="group overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg"
                  >
                    <div className="relative aspect-square bg-gray-50">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.alt || item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain p-5 transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-gray-500">
                        {item.brand?.name || "No Brand"}
                      </p>

                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-primaryRed">
                        {item.name}
                      </h3>

                      <p className="mt-3 font-bold text-gray-900">
                        {variant ? formatPrice(variant.price) : "Unavailable"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}