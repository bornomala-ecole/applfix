import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import { getFeaturedProducts } from "@/lib/services/productService";

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (!products.length) {
    return null;
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  return (
    <section className="py-14 bg-gray-50">
      <div className="container">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1 text-xs font-medium text-gray-600">
              <Star size={13} className="fill-primaryRed text-primaryRed" />
              Handpicked Deals
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Explore our selected phones with the best value and availability.
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

        {/* GRID */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {products.map((product) => {
            const variants = product.variants || [];
            const variant = variants[0];

            const mainImage =
              product.images?.find((image) => image.type === "main") ||
              product.images?.[0];

            const totalStock = variants.reduce(
              (sum, item) => sum + item.stock,
              0
            );

            const isOutOfStock = totalStock <= 0;

            const hasMultipleVariants = variants.length > 1;

            const hasComparePrice =
              variant?.comparePrice &&
              variant.comparePrice > variant.price;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* BADGES */}
                <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
                  <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-medium text-white">
                    Featured
                  </span>

                  {hasComparePrice && (
                    <span className="rounded-full bg-primaryRed px-2.5 py-1 text-[11px] font-medium text-white">
                      Sale
                    </span>
                  )}
                </div>

                {/* IMAGE */}
                <Link
                  href={`/product/${product.slug}`}
                  className="relative block bg-gray-50"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={mainImage?.url || "/placeholder.png"}
                      alt={mainImage?.alt || product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain p-5 transition duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>

                {/* INFO */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-gray-500">
                      {product.brand?.name || "No Brand"}
                    </p>

                    <p
                      className={`text-[11px] font-medium ${
                        isOutOfStock
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </p>
                  </div>

                  <Link href={`/product/${product.slug}`}>
                    <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-gray-900 transition group-hover:text-primaryRed">
                      {product.name}
                    </h3>
                  </Link>

                  {product.shortDescription && (
                    <p className="mt-2 line-clamp-2 text-xs text-gray-500">
                      {product.shortDescription}
                    </p>
                  )}

                  {/* PRICE + ACTION */}
                  <div className="mt-auto pt-4">
                    <div className="mb-3 flex items-end justify-between gap-2">
                      <div>
                        {variant ? (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-bold text-gray-900">
                                {hasMultipleVariants ? "From " : ""}
                                {formatPrice(variant.price)}
                              </p>

                              {hasComparePrice && (
                                <p className="text-xs text-gray-400 line-through">
                                  {formatPrice(variant.comparePrice!)}
                                </p>
                              )}
                            </div>

                            <p className="mt-0.5 text-[11px] text-gray-400">
                              {variants.length} option
                              {variants.length > 1 ? "s" : ""} available
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-semibold text-gray-500">
                            No variant
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/product/${product.slug}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      <ShoppingCart size={16} />
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}