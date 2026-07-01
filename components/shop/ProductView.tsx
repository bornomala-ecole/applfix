"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import {
  Check,
  Loader2,
  PackageCheck,
  ShoppingCart,
  X,
} from "lucide-react";

import { addGuestCartItem } from "@/lib/cart/guestCart";
import { ShopProduct, ShopProductVariant } from "@/lib/types/shop";

type ProductVariantsApiResponse =
  | {
      productId: string;
      variants: ShopProductVariant[];
    }
  | {
      message?: string;
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

function getFirstSelectableVariant(variants: ShopProductVariant[]) {
  return (
    variants.find((variant) => variant.stock > 0) ||
    variants[0] ||
    null
  );
}

function Badge({ badge }: { badge?: ShopProduct["badge"] }) {
  if (!badge) return null;

  const className =
    badge === "Sale"
      ? "bg-primaryRed text-white"
      : badge === "New"
        ? "bg-emerald-600 text-white"
        : badge === "Out of Stock"
          ? "bg-gray-950 text-white"
          : "bg-gray-900 text-white";

  return (
    <span
      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${className}`}
    >
      {badge}
    </span>
  );
}

interface ProductViewProps {
  products: ShopProduct[];
  viewMode: "grid" | "list";
}

export default function ProductView({ products, viewMode }: ProductViewProps) {
  const { status } = useSession();

  const variantRequestRef = useRef(0);

  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(
    null
  );
  const [selectedVariants, setSelectedVariants] = useState<
    ShopProductVariant[]
  >([]);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [variantLoadError, setVariantLoadError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const selectedVariant = useMemo(() => {
    if (selectedVariants.length === 0) return null;

    return (
      selectedVariants.find((variant) => variant.id === selectedVariantId) ||
      getFirstSelectableVariant(selectedVariants)
    );
  }, [selectedVariants, selectedVariantId]);

  async function fetchProductVariants(product: ShopProduct, requestId: number) {
    const startedAt = performance.now();

    console.log("[ProductView] variant fetch start", {
      productId: product.id,
      productName: product.name,
    });

    try {
      setIsLoadingVariants(true);
      setVariantLoadError(null);

      const res = await fetch(
        `/api/shop/products/${encodeURIComponent(product.id)}/variants`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = (await res.json()) as ProductVariantsApiResponse;

      if (variantRequestRef.current !== requestId) {
        return;
      }

      if (!res.ok) {
        const errorMessage =
          "message" in data && data.message
            ? data.message
            : "Failed to load product variants";

        setVariantLoadError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (!("variants" in data)) {
        setVariantLoadError("Failed to load product variants");
        toast.error("Failed to load product variants");
        return;
      }

      setSelectedVariants(data.variants);

      const firstVariant = getFirstSelectableVariant(data.variants);
      setSelectedVariantId(firstVariant?.id ?? "");

      console.log("[ProductView] variant fetch result", {
        productId: product.id,
        variants: data.variants.length,
        durationMs: (performance.now() - startedAt).toFixed(2),
      });
    } catch (error) {
      if (variantRequestRef.current !== requestId) {
        return;
      }

      console.error("[ProductView] variant fetch failed", error);

      setVariantLoadError("Failed to load product variants");
      toast.error("Failed to load product variants");
    } finally {
      if (variantRequestRef.current === requestId) {
        setIsLoadingVariants(false);

        console.log("[ProductView] variant fetch total", {
          productId: product.id,
          durationMs: (performance.now() - startedAt).toFixed(2),
        });
      }
    }
  }

  function openVariantModal(product: ShopProduct) {
    const requestId = variantRequestRef.current + 1;
    variantRequestRef.current = requestId;

    const existingVariants = product.variants ?? [];
    const firstVariant = getFirstSelectableVariant(existingVariants);

    setSelectedProduct(product);
    setSelectedVariants(existingVariants);
    setSelectedVariantId(firstVariant?.id ?? "");
    setQuantity(1);
    setIsAdding(false);
    setVariantLoadError(null);

    if (existingVariants.length > 0) {
      return;
    }

    void fetchProductVariants(product, requestId);
  }

  function retryVariantFetch() {
    if (!selectedProduct) return;

    const requestId = variantRequestRef.current + 1;
    variantRequestRef.current = requestId;

    setSelectedVariants([]);
    setSelectedVariantId("");
    setQuantity(1);
    setVariantLoadError(null);

    void fetchProductVariants(selectedProduct, requestId);
  }

  function closeVariantModal() {
    variantRequestRef.current += 1;

    setSelectedProduct(null);
    setSelectedVariants([]);
    setSelectedVariantId("");
    setQuantity(1);
    setIsLoadingVariants(false);
    setVariantLoadError(null);
    setIsAdding(false);
  }

  async function handleAddToCartFromShop() {
    if (!selectedProduct || !selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    if (selectedVariant.stock <= 0) {
      toast.error("This variant is out of stock");
      return;
    }

    try {
      setIsAdding(true);

      if (status !== "authenticated") {
        addGuestCartItem({
          productId: selectedProduct.id,
          variantId: selectedVariant.id,
          name: selectedProduct.name,
          slug: selectedProduct.slug,
          image: selectedProduct.image,
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
      console.error("[ProductView] add to cart failed", error);
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  }

  function renderVariantModalContent() {
    if (isLoadingVariants) {
      return (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Loader2 size={18} className="animate-spin text-primaryRed" />
            Loading variants...
          </div>
        </div>
      );
    }

    if (variantLoadError) {
      return (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
          <p className="text-sm font-semibold text-red-700">
            {variantLoadError}
          </p>

          <button
            type="button"
            onClick={retryVariantFetch}
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-primaryRed px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (selectedVariants.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
          <p className="text-sm font-semibold text-gray-700">
            No variants are available for this product.
          </p>
        </div>
      );
    }

    return (
      <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
        {selectedVariants.map((variant) => {
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

                {isSelected && <Check size={18} className="text-primaryRed" />}
              </div>
            </button>
          );
        })}
      </div>
    );
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

          {renderVariantModalContent()}

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Quantity</p>

              <div className="mt-2 inline-flex items-center overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  disabled={isLoadingVariants || !selectedVariant}
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  -
                </button>

                <span className="px-4 py-2 text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={
                    isLoadingVariants ||
                    !selectedVariant ||
                    selectedVariant.stock <= quantity
                  }
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
                isAdding ||
                isLoadingVariants ||
                !selectedVariant ||
                selectedVariant.stock <= 0
              }
              onClick={handleAddToCartFromShop}
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

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
        <h3 className="text-lg font-semibold text-gray-950">
          No products found
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Try changing your search or clearing the filters.
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <>
        <div className="space-y-4">
          {products.map((product) => {
            const discountPercent = getDiscountPercent(
              product.price,
              product.originalPrice
            );

            const isOutOfStock = product.stock <= 0;

            return (
              <article
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative flex h-48 items-center justify-center rounded-2xl bg-gray-50 sm:h-44 sm:w-44 sm:shrink-0"
                  >
                    <Badge badge={product.badge} />

                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      width={220}
                      height={220}
                      className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {product.brand}
                        </span>

                        {product.category && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {product.category}
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            isOutOfStock
                              ? "bg-gray-100 text-gray-500"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <PackageCheck size={13} />
                          {isOutOfStock
                            ? "Out of stock"
                            : `${product.stock} in stock`}
                        </span>
                      </div>

                      <Link href={`/product/${product.slug}`}>
                        <h3 className="text-xl font-semibold text-gray-950 transition-colors group-hover:text-primaryRed">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-1 text-sm text-gray-500">
                        {product.variantTitle}
                      </p>

                      {product.shortDescription && (
                        <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-gray-600">
                          {product.shortDescription}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-bold text-gray-950">
                            {formatPrice(product.price)}
                          </p>

                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <p className="pb-0.5 text-sm text-gray-400 line-through">
                                {formatPrice(product.originalPrice)}
                              </p>
                            )}
                        </div>

                        {discountPercent && (
                          <p className="mt-1 text-xs font-semibold text-primaryRed">
                            Save {discountPercent}%
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Link
                          href={`/product/${product.slug}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
                        >
                          View Product
                        </Link>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => openVariantModal(product)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primaryRed px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          <ShoppingCart size={18} />
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {renderVariantModal()}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-3 xl:gap-6">
        {products.map((product) => {
          const discountPercent = getDiscountPercent(
            product.price,
            product.originalPrice
          );

          const isOutOfStock = product.stock <= 0;

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
                  <Badge badge={product.badge} />

                  {discountPercent && (
                    <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primaryRed shadow-sm">
                      -{discountPercent}%
                    </span>
                  )}

                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    width={320}
                    height={320}
                    className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      {product.brand}
                    </p>

                    <Link href={`/product/${product.slug}`}>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-950 transition-colors group-hover:text-primaryRed">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                      {product.variantTitle}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap items-end gap-2">
                      <p className="text-lg font-bold text-gray-950">
                        {formatPrice(product.price)}
                      </p>

                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <p className="pb-0.5 text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                    </div>

                    <div className="mt-4 flex w-full flex-col items-start justify-between gap-3">
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
                          className="inline-flex h-11 items-center justify-center rounded-2xl border border-gray-200 bg-gray-800 px-3 text-sm font-semibold text-white transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-800"
                        >
                          View Product
                        </Link>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => openVariantModal(product)}
                          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-primaryRed text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
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
    </>
  );
}