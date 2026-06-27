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

export type ShopProductVariant = {
  id: string;
  sku: string;
  title: string;
  color: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
};

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  image: string;
  imageAlt: string;
  brand: string;
  category?: string;
  shortDescription?: string | null;

  price: number;
  originalPrice?: number | null;
  stock: number;
  variantTitle: string;
  badge?: "Sale" | "New" | "Featured" | "Out of Stock";

  variants: ShopProductVariant[];
};

export interface ShopPagination {
  currentPage: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
}