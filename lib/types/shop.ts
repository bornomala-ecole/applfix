export interface Product {
  id: number;
  name: string;
  brand: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: "New" | "Sale";
}

export interface FilterState {
  brands: string[];
  priceRange: [number, number];
  onSale: boolean;
}

export const sortOptions = {
  featured: "Featured",
  newest: "Newest",
  price_desc: "Price: High to Low",
  price_asc: "Price: Low to High",
  rating_desc: "Avg. Customer Review",
} as const;

export type SortOption = keyof typeof sortOptions;



export interface DetailedProduct extends Product {
  images: string[]; // Array of image URLs
  description: string;
  specifications: { label: string; value: string }[];
  variants: {
    color: { name: string; hex: string }[];
    storage: { size: string; price: number }[];
  };
}