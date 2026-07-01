"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Check,
  Flame,
  ShoppingCart,
  X,
} from "lucide-react";

import { addGuestCartItem } from "@/lib/cart/guestCart";

type BestSellerProductVariant = {
  id: string;
  title: string;
  color: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
};

type BestSellerProductImage = {
  id?: string;
  url: string;
  alt: string | null;
  type: string;
  sortOrder?: number;
};

type BestSellerProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  brand: {
    name: string;
  } | null;
  images: BestSellerProductImage[];
  variants: BestSellerProductVariant[];
};

type Props = {
  products: BestSellerProduct[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function getDiscountPercent(price: number, originalPrice?: number | null) {
  if (!originalPrice || originalPrice <= price) return null;

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export default function BestSellerProductsClient({ products }: Props) {
  const { status } = useSession();

  const [selectedProduct, setSelectedProduct] =
    useState<BestSellerProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const selectedVariant = useMemo(() => {
    if (!selectedProduct) return null;

    return (
      selectedProduct.variants.find(
        (variant) => variant.id === selectedVariantId
      ) ||
      selectedProduct.variants.find((variant) => variant.stock > 0) ||
      selectedProduct.variants[0] ||
      null
    );
  }, [selectedProduct, selectedVariantId]);

  function openVariantModal(product: BestSellerProduct) {
    const firstAvailableVariant =
      product.variants.find((variant) => variant.stock > 0) ||
      product.variants[0];

    setSelectedProduct(product);
    setSelectedVariantId(firstAvailableVariant?.id || "");
    setQuantity(1);
  }

  function closeVariantModal() {
    setSelectedProduct(null);
    setSelectedVariantId("");
    setQuantity(1);
    setIsAdding(false);
  }

  function getMainImage(product: BestSellerProduct) {
    return (
      product.images?.find((image) => image.type === "main") ||
      product.images?.[0]
    );
  }

  async function handleAddToCartFromBestSeller() {
    if (!selectedProduct || !selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    if (selectedVariant.stock <= 0) {
      toast.error("This variant is out of stock");
      return;
    }

    const mainImage = getMainImage(selectedProduct);

    try {
      setIsAdding(true);

      if (status !== "authenticated") {
        addGuestCartItem({
          productId: selectedProduct.id,
          variantId: selectedVariant.id,
          name: selectedProduct.name,
          slug: selectedProduct.slug,
          image: mainImage?.url || "",
          variantTitle: selectedVariant.title,
          color: selectedVariant.color,
          price: selectedVariant.price,
          quantity,
          stock: selectedVariant.stock,
        });

        window.dispatchEvent(new Event("cart-updated"));

        toast.success("Product added to cart");
        closeVariantModal();
        return;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
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
      closeVariantModal();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  }

  function renderVariantModal() {
    if (!selectedProduct) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        onClick={closeVariantModal}
      >
        <div
          className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-950">
                Select Variant
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {selectedProduct.name}
              </p>
            </div>

            <button
              type="button"
              onClick={closeVariantModal}
              className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close variant modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
            {selectedProduct.variants.map((variant) => {
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
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-primaryRed bg-red-50"
                      : "border-gray-200 hover:border-gray-400"
                  } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950">
                        {variant.title}
                      </p>

                      {variant.color && (
                        <p className="mt-1 text-sm text-gray-500">
                          {variant.color}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-gray-950">
                          {formatPrice(variant.price)}
                        </p>

                        {variant.comparePrice &&
                          variant.comparePrice > variant.price && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatPrice(variant.comparePrice)}
                            </p>
                          )}
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        {variant.stock > 0
                          ? `${variant.stock} in stock`
                          : "Out of stock"}
                      </p>
                    </div>

                    {isSelected && (
                      <Check size={18} className="text-primaryRed" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Quantity</p>

              <div className="mt-2 inline-flex items-center overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 text-sm transition hover:bg-gray-50"
                >
                  -
                </button>

                <span className="px-4 py-2 text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={!selectedVariant || selectedVariant.stock <= quantity}
                  onClick={() =>
                    setQuantity((prev) =>
                      selectedVariant
                        ? Math.min(selectedVariant.stock, prev + 1)
                        : prev
                    )
                  }
                  className="px-4 py-2 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={
                isAdding || !selectedVariant || selectedVariant.stock <= 0
              }
              onClick={handleAddToCartFromBestSeller}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primaryRed px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingCart size={18} />
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-14 bg-white">
      <div className="container">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-100 px-3 py-1 text-xs font-medium text-primaryRed">
              <Flame size={13} className="fill-primaryRed text-primaryRed" />
              Customer Favorites
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Best Sellers
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Shop our most popular phones loved by customers.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-primaryRed hover:underline"
          >
            View All Products
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {products.map((product) => {
            const variants = product.variants || [];

            const firstAvailableVariant =
              variants.find((variant) => variant.stock > 0) || variants[0];

            const mainImage = getMainImage(product);

            const totalStock = variants.reduce(
              (sum, variant) => sum + variant.stock,
              0
            );

            const isOutOfStock = totalStock <= 0;

            const discountPercent = getDiscountPercent(
              firstAvailableVariant?.price || 0,
              firstAvailableVariant?.comparePrice
            );

            return (
              <article
                key={product.id}
                className="group flex overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex w-full flex-col">
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative flex aspect-square items-center justify-center bg-gray-50"
                  >
                    <span className="absolute left-3 top-3 rounded-full bg-primaryRed px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Best Seller
                    </span>

                    {discountPercent && (
                      <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primaryRed shadow-sm">
                        -{discountPercent}%
                      </span>
                    )}

                    <Image
                      src={mainImage?.url || "/product-placeholder.png"}
                      alt={mainImage?.alt || product.name}
                      width={320}
                      height={320}
                      className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex-1">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                        {product.brand?.name || "No Brand"}
                      </p>

                      <Link href={`/product/${product.slug}`}>
                        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-950 transition-colors group-hover:text-primaryRed">
                          {product.name}
                        </h3>
                      </Link>

                      {firstAvailableVariant && (
                        <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                          {firstAvailableVariant.color
                            ? `${firstAvailableVariant.title} / ${firstAvailableVariant.color}`
                            : firstAvailableVariant.title}
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex flex-wrap items-end gap-2">
                        {firstAvailableVariant ? (
                          <>
                            <p className="text-lg font-bold text-gray-950">
                              {variants.length > 1 ? "From " : ""}
                              {formatPrice(firstAvailableVariant.price)}
                            </p>

                            {firstAvailableVariant.comparePrice &&
                              firstAvailableVariant.comparePrice >
                                firstAvailableVariant.price && (
                                <p className="pb-0.5 text-xs text-gray-400 line-through">
                                  {formatPrice(
                                    firstAvailableVariant.comparePrice
                                  )}
                                </p>
                              )}
                          </>
                        ) : (
                          <p className="text-sm font-semibold text-gray-500">
                            No variant
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col items-start justify-between gap-3 w-full">
                        <p
                          className={`mb-3 text-xs font-medium ${
                            isOutOfStock ? "text-gray-400" : "text-emerald-600"
                          }`}
                        >
                          {isOutOfStock ? "Out of stock" : "In stock"}
                        </p>

                        <div className="flex w-full flex-row items-center justify-between gap-2">
                          <Link
                            href={`/product/${product.slug}`}
                            className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-gray-800 px-3 text-sm font-semibold text-white transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-800"
                          >
                            View Product
                          </Link>

                          <button
                            type="button"
                            disabled={isOutOfStock || variants.length === 0}
                            onClick={() => openVariantModal(product)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primaryRed text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                            aria-label={`Add ${product.name} to cart`}
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {renderVariantModal()}
      </div>
    </section>
  );
}