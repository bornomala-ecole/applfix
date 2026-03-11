"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";

// We can reuse the Product type from FeaturedProducts
type Product = {
  id: number;
  name: string;
  brand: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number; // Average rating, e.g., 4.5
  reviews: number; // Total number of reviews
};

// Sample data for best-selling products
// In a real app, this data would be fetched based on sales volume.
const bestSellers: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    brand: "Apple",
    slug: "iphone-15-pro",
    price: 999,
    image: "/images/products/iphone-15-pro.png",
    rating: 4.8,
    reviews: 325,
  },
  {
    id: 2,
    name: "Galaxy S24",
    brand: "Samsung",
    slug: "galaxy-s24",
    price: 799,
    originalPrice: 899,
    image: "/images/products/galaxy-s24.png",
    rating: 4.6,
    reviews: 210,
  },
  {
    id: 3,
    name: "OnePlus 12",
    brand: "OnePlus",
    slug: "oneplus-12",
    price: 799,
    image: "/images/products/oneplus-12.png",
    rating: 4.7,
    reviews: 189,
  },
  {
    id: 4,
    name: "iPhone 14",
    brand: "Apple",
    slug: "iphone-14",
    price: 699,
    image: "/images/products/iphone-14.png",
    rating: 4.9,
    reviews: 450,
  },
  {
    id: 5,
    name: "Pixel 8",
    brand: "Google",
    slug: "pixel-8",
    price: 699,
    image: "/images/products/pixel-8.png",
    rating: 4.5,
    reviews: 150,
  },
];

// Helper component to render star rating with decimals
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, index) => (
        <Star
          key={`full-${index}`}
          size={16}
          className="fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <Star size={16} className="fill-yellow-400/50 text-yellow-400" />
      )}
      {[...Array(5 - Math.ceil(rating))].map((_, index) => (
        <Star
          key={`empty-${index}`}
          size={16}
          className="fill-gray-200 text-gray-200"
        />
      ))}
    </div>
  );
};

export default function BestSellers() {
  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="container">
        {/* Section Header */}
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Our Best Sellers</h2>
          <Link
            href="/shop?sort=bestsellers"
            className="text-sm font-medium text-primaryRed hover:underline"
          >
            View All
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {bestSellers.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Product Image */}
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
                  {/* Rating and Reviews */}
                  <div className="mb-2 flex items-center gap-2">
                    <StarRating rating={product.rating} />
                    <span className="text-xs text-gray-500">
                      ({product.reviews})
                    </span>
                  </div>
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