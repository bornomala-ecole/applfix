import Image from "next/image";
import Link from "next/link";
import { PackageCheck, ShoppingCart } from "lucide-react";
import { ShopProduct } from "@/lib/types/shop";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function getDiscountPercent(price: number, originalPrice?: number | null) {
  if (!originalPrice || originalPrice <= price) return null;

  return Math.round(((originalPrice - price) / originalPrice) * 100);
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

                    <button
                      disabled={isOutOfStock}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primaryRed px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <ShoppingCart size={18} />
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
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

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p
                      className={`text-xs font-medium ${
                        isOutOfStock ? "text-gray-400" : "text-emerald-600"
                      }`}
                    >
                      {isOutOfStock ? "Out of stock" : "In stock"}
                    </p>

                    <button
                      disabled={isOutOfStock}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primaryRed text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}