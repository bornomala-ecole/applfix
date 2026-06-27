import { prisma } from "@/lib/prisma"
import Link from "next/link"

type Props = {
  params: Promise<{ id: string }>
}

function formatPrice(price?: number | null) {
  if (price === null || price === undefined) return "—"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function StatusBadge({
  active,
  activeText,
  inactiveText,
}: {
  active: boolean
  activeText: string
  inactiveText: string
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {active ? activeText : inactiveText}
    </span>
  )
}

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      series: true,
      images: {
        orderBy: [
          { type: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      },
      variants: {
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          orderItems: true,
          cartItems: true,
          wishlistItems: true,
        },
      },
    },
  })

  if (!product) {
    return (
      <div className="p-6 text-red-500">
        Product not found
      </div>
    )
  }

  const variants = product.variants || []

  const mainImage =
    product.images.find((img) => img.type === "main") ||
    product.images[0]

  const galleryImages = product.images.filter(
    (img) => img.type === "gallery"
  )

  const totalStock = variants.reduce(
    (sum, variant) => sum + variant.stock,
    0
  )

  const activeVariants = variants.filter(
    (variant) => variant.isActive
  ).length

  const prices = variants.map((variant) => variant.price)

  const minPrice = prices.length ? Math.min(...prices) : null
  const maxPrice = prices.length ? Math.max(...prices) : null

  const productType =
    variants.length > 1 ? "Variable Product" : "Simple Product"

  const isOutOfStock = totalStock <= 0

  return (
    <div className="min-h-screen bg-gray-50 px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge
                active={product.isActive}
                activeText="Active"
                inactiveText="Inactive"
              />

              <StatusBadge
                active={product.isFeatured}
                activeText="Featured"
                inactiveText="Not Featured"
              />

              <StatusBadge
                active={product.bestSelling}
                activeText="Best Selling"
                inactiveText="Not Best Selling"
              />

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  isOutOfStock
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              /product/{product.slug}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              View Store Page
            </Link>

            <Link
              href={`/admin/products/edit/${product.id}`}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Edit Product
            </Link>

            <Link
              href="/admin/products"
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
            >
              Back
            </Link>
          </div>
        </div>

        {/* TOP OVERVIEW */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* IMAGE CARD */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Product Image
            </h2>

            {mainImage ? (
              <div>
                <div className="flex aspect-square items-center justify-center rounded-2xl border bg-gray-50">
                  <img
                    src={mainImage.url}
                    alt={mainImage.alt || product.name}
                    className="h-full w-full rounded-2xl object-contain p-4"
                  />
                </div>

                <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                  <p>
                    <strong>Alt:</strong>{" "}
                    {mainImage.alt || "No alt text"}
                  </p>
                  <p>
                    <strong>Type:</strong> {mainImage.type}
                  </p>
                  <p>
                    <strong>Sort Order:</strong>{" "}
                    {mainImage.sortOrder}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed bg-gray-50 text-sm text-gray-400">
                No image uploaded
              </div>
            )}
          </div>

          {/* PRODUCT BASIC INFO */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Product Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem label="Product ID" value={product.id} />
              <InfoItem label="Product Type" value={productType} />
              <InfoItem
                label="Brand"
                value={product.brand?.name || "No Brand"}
              />
              <InfoItem
                label="Series"
                value={product.series?.name || "No Series"}
              />
              <InfoItem
                label="Category"
                value={product.category?.name || "No Category"}
              />
              <InfoItem
                label="Total Stock"
                value={`${totalStock} unit${totalStock === 1 ? "" : "s"}`}
              />
              <InfoItem
                label="Price Range"
                value={
                  minPrice !== null && maxPrice !== null
                    ? minPrice === maxPrice
                      ? formatPrice(minPrice)
                      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                    : "No price"
                }
              />
              <InfoItem
                label="Variants"
                value={`${variants.length} total / ${activeVariants} active`}
              />
              <InfoItem
                label="Created At"
                value={formatDate(product.createdAt)}
              />
              <InfoItem
                label="Updated At"
                value={formatDate(product.updatedAt)}
              />
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Stock" value={totalStock} />
          <StatCard title="Variants" value={variants.length} />
          <StatCard title="Order Items" value={product._count.orderItems} />
          <StatCard title="Wishlist" value={product._count.wishlistItems} />
        </div>

        {/* DESCRIPTIONS */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              Short Description
            </h2>

            <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
              {product.shortDescription || "No short description added."}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              Full Description
            </h2>

            <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
              {product.description || "No full description added."}
            </p>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            SEO Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoItem
              label="Meta Title"
              value={product.metaTitle || "No meta title"}
            />

            <InfoItem
              label="Meta Description"
              value={
                product.metaDescription || "No meta description"
              }
            />
          </div>
        </div>

        {/* GALLERY */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Gallery Images
            </h2>

            <span className="text-sm text-gray-500">
              {galleryImages.length} image
              {galleryImages.length === 1 ? "" : "s"}
            </span>
          </div>

          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {galleryImages.map((img) => (
                <div
                  key={img.id}
                  className="rounded-xl border bg-gray-50 p-3"
                >
                  <div className="aspect-square rounded-lg bg-white">
                    <img
                      src={img.url}
                      alt={img.alt || product.name}
                      className="h-full w-full rounded-lg object-contain p-2"
                    />
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    <p className="truncate">
                      Alt: {img.alt || "No alt"}
                    </p>
                    <p>Sort: {img.sortOrder}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400">
              No gallery images uploaded.
            </div>
          )}
        </div>

        {/* VARIANTS */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">
              Product Variants
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Pricing, stock, SKU, color, and internal cost details.
            </p>
          </div>

          {variants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">SKU</th>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Color</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Compare</th>
                    <th className="px-6 py-3">Cost</th>
                    <th className="px-6 py-3">Profit</th>
                    <th className="px-6 py-3">Stock</th>
                    <th className="px-6 py-3">Low Alert</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {variants.map((variant) => {
                    const profit =
                      variant.costPrice !== null &&
                      variant.costPrice !== undefined
                        ? variant.price - variant.costPrice
                        : null

                    return (
                      <tr key={variant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <StatusBadge
                            active={variant.isActive}
                            activeText="Active"
                            inactiveText="Inactive"
                          />
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-gray-700">
                          {variant.sku}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {variant.title}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {variant.color || "—"}
                        </td>

                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatPrice(variant.price)}
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {variant.comparePrice ? (
                            <span className="line-through">
                              {formatPrice(variant.comparePrice)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {formatPrice(variant.costPrice)}
                        </td>

                        <td className="px-6 py-4">
                          {profit !== null ? (
                            <span
                              className={`font-semibold ${
                                profit >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatPrice(profit)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${
                              variant.stock <= 0
                                ? "text-red-600"
                                : variant.stock <=
                                  variant.lowStockThreshold
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {variant.stock}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {variant.lowStockThreshold}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-gray-400">
              No variants found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="wrap-break-word text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  )
}

function StatCard({
  title,
  value,
}: {
  title: string
  value: number
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  )
}