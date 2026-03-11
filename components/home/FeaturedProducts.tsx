"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

// Define the TypeScript type for a product
type Product = {
  id: number
  name: string
  brand: string
  slug: string // A URL-friendly version of the name for the product page
  price: number
  originalPrice?: number // Optional for showing discounts
  image: string
  badge?: "New" | "Sale" // Optional badge
}

// Sample product data - in a real app, this would come from an API or CMS
const products: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    slug: "iphone-15-pro-max",
    price: 1199,
    originalPrice: 1299,
    image: "/images/products/iphone-15-pro-max.png",
    badge: "New",
  },
  {
    id: 2,
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    slug: "galaxy-s24-ultra",
    price: 1199,
    image: "/images/products/galaxy-s24-ultra.png",
  },
  {
    id: 3,
    name: "Pixel 8 Pro",
    brand: "Google",
    slug: "pixel-8-pro",
    price: 999,
    originalPrice: 1099,
    image: "/images/products/pixel-8-pro.png",
    badge: "Sale",
  },
  {
    id: 4,
    name: "OnePlus 12",
    brand: "OnePlus",
    slug: "oneplus-12",
    price: 799,
    image: "/images/products/oneplus-12.png",
  },
  {
    id: 5,
    name: "Xiaomi 14 Pro",
    brand: "Xiaomi",
    slug: "xiaomi-14-pro",
    price: 899,
    image: "/images/products/xiaomi-14-pro.png",
    badge: "New",
  },
  {
    id: 6,
    name: "iPhone 15",
    brand: "Apple",
    slug: "iphone-15",
    price: 799,
    image: "/images/products/iphone-15.png",
  },
  {
    id: 7,
    name: "Galaxy Z Fold 5",
    brand: "Samsung",
    slug: "galaxy-z-fold5",
    price: 1799,
    originalPrice: 1999,
    image: "/images/products/galaxy-z-fold5.png",
    badge: "Sale",
  },
  {
    id: 8,
    name: "OnePlus Open",
    brand: "OnePlus",
    slug: "oneplus-open",
    price: 1699,
    image: "/images/products/oneplus-open.png",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-12">
      <div className="container">
        {/* Section Header */}
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <Link
            href="/shop"
            className="text-sm font-medium text-primaryRed hover:underline"
          >
            View All
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Product Image & Badge */}
              <div className="relative">
                <Link href={`/product/${product.slug}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                {product.badge && (
                  <span
                    className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-semibold text-white ${
                      product.badge === "New" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <p className="mb-1 text-xs text-gray-500">{product.brand}</p>
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="mb-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-primaryRed">
                      {product.name}
                    </h3>
                  </Link>
                </div>

                {/* Price & Add to Cart */}
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      ${product.price}
                    </p>
                    {product.originalPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        ${product.originalPrice}
                      </p>
                    )}
                  </div>
                  <button className="rounded-lg bg-primaryRed p-2 text-white transition-colors hover:bg-red-700">
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}