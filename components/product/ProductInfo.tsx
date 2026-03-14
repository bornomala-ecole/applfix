import { Star } from "lucide-react";
import Link from "next/link";
import { DetailedProduct } from "@/lib/types/shop";

const StarRating = ({ rating }: { rating: number }) => {
  // ... (same StarRating component as before)
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

interface ProductInfoProps {
  product: DetailedProduct;
  currentPrice: number;
}

export default function ProductInfo({ product, currentPrice }: ProductInfoProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
      <p className="mt-1 text-lg text-gray-500">{product.brand}</p>

      {/* Rating */}
      <div className="mt-2 flex items-center gap-2">
        <StarRating rating={product.rating} />
        <Link href="#reviews" className="text-sm text-gray-600 hover:underline">
          {product.reviews} Reviews
        </Link>
      </div>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-gray-900">${currentPrice}</span>
        {product.originalPrice && (
          <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
        )}
      </div>

      {/* Description */}
      <p className="mt-6 text-gray-600">{product.description}</p>
    </div>
  );
}