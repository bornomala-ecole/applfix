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
  lockedFilters?: Partial<Pick<FilterState, "brands" | "categories">>;
}

type ShopProductsApiResponse = {
  products: ShopProduct[];
  pagination: ShopPagination;
  query: string;
  filters: FilterState;
  sort: SortOption;
};

function mergeLockedFilters(
  filters: FilterState,
  lockedFilters?: Partial<Pick<FilterState, "brands" | "categories">>
): FilterState {
  return {
    ...filters,
    brands: lockedFilters?.brands ?? filters.brands,
    categories: lockedFilters?.categories ?? filters.categories,
  };
}

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
  lockedFilters,
}: ShopClientProps) {
  const pathname = usePathname();
  const didMountRef = useRef(false);

  const [draftQuery, setDraftQuery] = useState(query);
  const [filters, setFilters] = useState<FilterState>(
    mergeLockedFilters(initialFilters, lockedFilters)
  );
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
    const requestFilters = mergeLockedFilters(nextFilters, lockedFilters);

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    }

    /**
     * Important:
     * UI visibility should not control API scope.
     *
     * On brand/category pages, the checkbox can be hidden, but the locked
     * brand/category still must be sent to the API request.
     */
    requestFilters.brands.forEach((brand) => {
      params.append("brand", brand);
    });

    requestFilters.categories.forEach((category) => {
      params.append("category", category);
    });

    if (requestFilters.priceRange[0] > priceBounds[0]) {
      params.set("min_price", String(requestFilters.priceRange[0]));
    }

    if (requestFilters.priceRange[1] < priceBounds[1]) {
      params.set("max_price", String(requestFilters.priceRange[1]));
    }

    if (requestFilters.onSale) {
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
    const browserParams = new URLSearchParams(params);

    /**
     * Keep locked filters out of the visible URL.
     * The page path already represents the locked scope:
     * /brand/apple, /category/phones, etc.
     */
    lockedFilters?.brands?.forEach((brand) => {
      const values = browserParams.getAll("brand");
      browserParams.delete("brand");

      values
        .filter((value) => value !== brand)
        .forEach((value) => browserParams.append("brand", value));
    });

    lockedFilters?.categories?.forEach((category) => {
      const values = browserParams.getAll("category");
      browserParams.delete("category");

      values
        .filter((value) => value !== category)
        .forEach((value) => browserParams.append("category", value));
    });

    const queryString = browserParams.toString();
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

    console.log("[ShopClient] fetch shop products", {
      apiUrl,
      lockedFilters,
      nextFilters,
    });

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

      console.error("[ShopClient] failed to fetch products", error);
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
    setFilters(mergeLockedFilters(nextFilters, lockedFilters));
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
    const cleanFilters = mergeLockedFilters(
      {
        brands: showBrandFilter ? [] : initialFilters.brands,
        categories: showCategoryFilter ? [] : initialFilters.categories,
        priceRange: priceBounds,
        onSale: false,
      },
      lockedFilters
    );

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
  }, [draftQuery, filters, sort, currentPage, lockedFilters]);

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