/*
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
  */

export type SortOption =
  | "featured"
  | "newest"
  | "price_asc"
  | "price_desc";

export const sortOptions: Record<SortOption, string> = {
  featured: "Featured",
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
};

export interface FilterState {
  brands: string[];
  priceRange: [number, number];
  onSale: boolean;
  categories: string[];
}

export interface BrandFilterOption {
  id: string;
  name: string;
  count: number;
}

export type CategoryFilterOption = {
  id: string;
  name: string;
  count: number;
};

export interface ShopProduct {
  id: string;
  name: string;
  slug: string;

  brand: string;
  category?: string | null;

  image: string;
  imageAlt: string;

  price: number;
  originalPrice?: number | null;

  variantId: string;
  variantTitle: string;
  color?: string | null;
  stock: number;

  shortDescription?: string | null;

  badge?: "New" | "Sale" | "Featured" | "Out of Stock";
}

export interface ShopPagination {
  currentPage: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
}