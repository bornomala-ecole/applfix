"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import FiltersSidebar from "@/components/shop/FilterSidebar";
import Pagination from "@/components/shop/Pagination";
import ProductView from "@/components/shop/ProductView";
import SortBar from "@/components/shop/SortBar";

import {
  BrandFilterOption,
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
  priceBounds: [number, number];
  initialFilters: FilterState;
  initialSort: SortOption;
}

export default function ShopClient({
  query,
  products,
  pagination,
  availableBrands,
  priceBounds,
  initialFilters,
  initialSort,
}: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [draftQuery, setDraftQuery] = useState(query);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sort, setSort] = useState<SortOption>(initialSort);
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

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  function buildShopUrl(
    nextQuery: string,
    nextFilters: FilterState,
    nextSort: SortOption,
    nextPage = 1
  ) {
    const params = new URLSearchParams();

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    }

    nextFilters.brands.forEach((brand) => {
      params.append("brand", brand);
    });

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

    const queryString = params.toString();

    return queryString ? `${pathname}?${queryString}` : pathname;
  }

  function pushShopState(
    nextQuery: string,
    nextFilters: FilterState,
    nextSort: SortOption,
    nextPage = 1
  ) {
    const url = buildShopUrl(nextQuery, nextFilters, nextSort, nextPage);

    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  function handleReset() {
    const cleanFilters: FilterState = {
      brands: [],
      priceRange: priceBounds,
      onSale: false,
    };

    setDraftQuery("");
    setFilters(cleanFilters);
    setSort("featured");

    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      pushShopState(draftQuery, filters, sort, 1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [draftQuery, filters, sort]);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <FiltersSidebar
          query={draftQuery}
          onQueryChange={setDraftQuery}
          filters={filters}
          onFiltersChange={setFilters}
          availableBrands={availableBrands}
          priceBounds={priceBounds}
          onReset={handleReset}
        />
      </aside>

      <main className="min-w-0">
        <div className="relative">
          <SortBar
            currentSort={sort}
            onSortChange={setSort}
            totalResults={pagination.totalProducts}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isPending={isPending}
          />

          {isPending && (
            <div className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
              <Loader2 size={14} className="animate-spin text-primaryRed" />
              Updating
            </div>
          )}
        </div>

        <div className="mt-5 relative">
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-[1px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                <Loader2 size={16} className="animate-spin text-primaryRed" />
                Loading products...
              </div>
            </div>
          )}

          <ProductView products={products} viewMode={viewMode} />
        </div>

        <Pagination pagination={pagination} />
      </main>
    </div>
  );
}