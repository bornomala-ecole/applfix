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
  categories: string[];
  priceRange: [number, number];
  onSale: boolean;
}

export interface BrandFilterOption {
  id: string;
  name: string;
  count: number;
}

export interface CategoryFilterOption {
  id: string;
  name: string;
  count: number;
}

export type ShopProductBadge = "Sale" | "New" | "Featured" | "Out of Stock";

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
  badge?: ShopProductBadge;

  /**
   * Keep this field for compatibility with existing frontend code.
   *
   * For the optimized shop list, this should be an empty array.
   * Full variants should be fetched lazily only when the user opens
   * the add-to-cart modal or product details.
   */
  variants: ShopProductVariant[];
};

export interface ShopPagination {
  currentPage: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}