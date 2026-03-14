import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { Product } from "@/lib/types/shop";

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, index) => (
        <Star key={`full-${index}`} size={16} className="fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && <Star size={16} className="fill-yellow-400/50 text-yellow-400" />}
      {[...Array(5 - Math.ceil(rating))].map((_, index) => (
        <Star key={`empty-${index}`} size={16} className="fill-gray-200 text-gray-200" />
      ))}
    </div>
  );
};

interface ProductViewProps {
  products: Product[];
  viewMode: "grid" | "list";
}

export default function ProductView({ products, viewMode }: ProductViewProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <p className="text-gray-500">No products found matching your criteria.</p>
      </div>
    );
  }

  // LIST VIEW
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-lg sm:flex-row"
          >
            <Link href={`/product/${product.slug}`} className="flex-shrink-0">
              <Image
                src={product.image}
                alt={product.name}
                width={150}
                height={150}
                className="h-32 w-32 object-contain p-2"
              />
            </Link>
            <div className="flex flex-1 flex-col justify-between sm:justify-center">
              <div>
                <p className="mb-1 text-xs text-gray-500">{product.brand}</p>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors hover:text-primaryRed">
                    {product.name}
                  </h3>
                </Link>
                <div className="mb-2 flex items-center gap-2">
                  <StarRating rating={product.rating} />
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between sm:mt-0">
                <div>
                  <p className="text-xl font-semibold text-gray-900">${product.price}</p>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-400 line-through">${product.originalPrice}</p>
                  )}
                </div>
                <button className="rounded-lg bg-primaryRed px-4 py-2 text-white transition-colors hover:bg-red-700">
                  <ShoppingCart size={20} className="inline-block mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // GRID VIEW (Default)
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
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
              <span className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-semibold text-white ${product.badge === "New" ? "bg-green-500" : "bg-red-500"}`}>
                {product.badge}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <p className="mb-1 text-xs text-gray-500">{product.brand}</p>
              <Link href={`/product/${product.slug}`}>
                <h3 className="mb-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-primaryRed">
                  {product.name}
                </h3>
              </Link>
              <div className="mb-2 flex items-center gap-2">
                <StarRating rating={product.rating} />
                <span className="text-xs text-gray-500">({product.reviews})</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">${product.price}</p>
                {product.originalPrice && (
                  <p className="text-xs text-gray-400 line-through">${product.originalPrice}</p>
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
  );
}