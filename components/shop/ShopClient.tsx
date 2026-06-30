"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import FiltersSidebar from "@/components/shop/FilterSidebar";
import Pagination from "@/components/shop/Pagination";
import ProductView from "@/components/shop/ProductView";
import SortBar from "@/components/shop/SortBar";

import {
  BrandFilterOption,
  CategoryFilterOption,
  FilterState,
  ShopPagination,
  ShopProduct,
  SortOption,
} from "@/lib/types/shop";

interface ShopClientProps {
  query: string;
  products: ShopProduct[];
  pagination: ShopPagination;
  availableBrands: BrandFilterOption[];
  availableCategories: CategoryFilterOption[];
  priceBounds: [number, number];
  initialFilters: FilterState;
  initialSort: SortOption;
  showBrandFilter?: boolean;
  showCategoryFilter?: boolean;
}

type ShopProductsApiResponse = {
  products: ShopProduct[];
  pagination: ShopPagination;
  query: string;
  filters: FilterState;
  sort: SortOption;
};

export default function ShopClient({
  query,
  products,
  pagination,
  availableBrands,
  availableCategories,
  priceBounds,
  initialFilters,
  initialSort,
  showBrandFilter = true,
  showCategoryFilter = true,
}: ShopClientProps) {
  const pathname = usePathname();
  const didMountRef = useRef(false);

  const [draftQuery, setDraftQuery] = useState(query);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [currentPage, setCurrentPage] = useState(pagination.currentPage);

  const [shopProducts, setShopProducts] = useState<ShopProduct[]>(products);
  const [shopPagination, setShopPagination] =
    useState<ShopPagination>(pagination);

  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const savedViewMode = localStorage.getItem("viewMode");

    if (savedViewMode === "grid" || savedViewMode === "list") {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  function buildShopParams(
    nextQuery: string,
    nextFilters: FilterState,
    nextSort: SortOption,
    nextPage = 1
  ) {
    const params = new URLSearchParams();

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    }

    if (showBrandFilter) {
      nextFilters.brands.forEach((brand) => {
        params.append("brand", brand);
      });
    }

    if (showCategoryFilter) {
      nextFilters.categories.forEach((category) => {
        params.append("category", category);
      });
    }

    if (nextFilters.priceRange[0] > priceBounds[0]) {
      params.set("min_price", String(nextFilters.priceRange[0]));
    }

    if (nextFilters.priceRange[1] < priceBounds[1]) {
      params.set("max_price", String(nextFilters.priceRange[1]));
    }

    if (nextFilters.onSale) {
      params.set("on_sale", "true");
    }

    if (nextSort !== "featured") {
      params.set("sort", nextSort);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    return params;
  }

  function updateBrowserUrl(params: URLSearchParams) {
    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    window.history.replaceState(null, "", nextUrl);
  }

  async function fetchShopProducts(
    nextQuery: string,
    nextFilters: FilterState,
    nextSort: SortOption,
    nextPage = 1,
    signal?: AbortSignal
  ) {
    const params = buildShopParams(
      nextQuery,
      nextFilters,
      nextSort,
      nextPage
    );

    updateBrowserUrl(params);

    const queryString = params.toString();
    const apiUrl = queryString
      ? `/api/shop/products?${queryString}`
      : "/api/shop/products";

    try {
      setIsLoading(true);

      const res = await fetch(apiUrl, {
        method: "GET",
        cache: "no-store",
        signal,
      });

      const data = (await res.json()) as
      | ShopProductsApiResponse
      | {
          message?: string;
        };
    
    if (!res.ok) {
      const errorMessage = "message" in data ? data.message : undefined;
    
      toast.error(errorMessage || "Failed to load products");
      return;
    }
    
    const shopData = data as ShopProductsApiResponse;

      setShopProducts(shopData.products);
      setShopPagination(shopData.pagination);
      setCurrentPage(shopData.pagination.currentPage);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }

  function handleQueryChange(value: string) {
    setDraftQuery(value);
    setCurrentPage(1);
  }

  function handleFiltersChange(nextFilters: FilterState) {
    setFilters(nextFilters);
    setCurrentPage(1);
  }

  function handleSortChange(nextSort: SortOption) {
    setSort(nextSort);
    setCurrentPage(1);
  }

  function handlePageChange(nextPage: number) {
    setCurrentPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleReset() {
    const cleanFilters: FilterState = {
      brands: showBrandFilter ? [] : initialFilters.brands,
      categories: showCategoryFilter ? [] : initialFilters.categories,
      priceRange: priceBounds,
      onSale: false,
    };

    setDraftQuery("");
    setFilters(cleanFilters);
    setSort("featured");
    setCurrentPage(1);
  }

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      fetchShopProducts(
        draftQuery,
        filters,
        sort,
        currentPage,
        controller.signal
      );
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [draftQuery, filters, sort, currentPage]);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <FiltersSidebar
          query={draftQuery}
          onQueryChange={handleQueryChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableBrands={availableBrands}
          availableCategories={availableCategories}
          priceBounds={priceBounds}
          onReset={handleReset}
          showBrandFilter={showBrandFilter}
          showCategoryFilter={showCategoryFilter}
        />
      </aside>

      <main className="min-w-0">
        <div className="relative">
          <SortBar
            currentSort={sort}
            onSortChange={handleSortChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isPending={isLoading}
          />

          {isLoading && (
            <div className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
              <Loader2 size={14} className="animate-spin text-primaryRed" />
              Updating
            </div>
          )}
        </div>

        <div className="relative mt-5">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-[1px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                <Loader2 size={16} className="animate-spin text-primaryRed" />
                Loading products...
              </div>
            </div>
          )}

          <ProductView products={shopProducts} viewMode={viewMode} />
        </div>

        <Pagination
          pagination={shopPagination}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}