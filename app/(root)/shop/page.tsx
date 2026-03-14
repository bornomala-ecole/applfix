"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FiltersSidebar from "@/components/shop/FilterSidebar";
import SortBar from "@/components/shop/SortBar";
import ProductView from "@/components/shop/ProductView"; // Renamed import
import { allProducts } from "@/lib/products";
import { FilterState, SortOption } from "@/lib/types/shop";

// Helper functions remain the same...
const getInitialFilters = (searchParams: URLSearchParams): FilterState => {
  const brands = searchParams.getAll("brand");
  const minPrice = Number(searchParams.get("min_price")) || 0;
  const maxPrice = Number(searchParams.get("max_price")) || 2000;
  const onSale = searchParams.get("on_sale") === "true";
  return { brands, priceRange: [minPrice, maxPrice], onSale };
};

const getInitialSort = (searchParams: URLSearchParams): SortOption => {
  return (searchParams.get("sort") as SortOption) || "featured";
};

export default function ShopPage() {
  const searchParams = useSearchParams();

  // State for filters, sorting, and VIEW MODE
  const [filters, setFilters] = useState<FilterState>(() => getInitialFilters(searchParams));
  const [sort, setSort] = useState<SortOption>(() => getInitialSort(searchParams));
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    // Try to get view mode from localStorage, default to 'grid'
    if (typeof window !== "undefined") {
      return (localStorage.getItem("viewMode") as "grid" | "list") || "grid";
    }
    return "grid";
  });

  // Sync state with URL (filters and sort)
  useEffect(() => {
    const params = new URLSearchParams();
    filters.brands.forEach((brand) => params.append("brand", brand));
    if (filters.priceRange[0] > 0) params.set("min_price", filters.priceRange[0].toString());
    if (filters.priceRange[1] < 2000) params.set("max_price", filters.priceRange[1].toString());
    if (filters.onSale) params.set("on_sale", "true");
    if (sort !== "featured") params.set("sort", sort);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [filters, sort]);

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("viewMode", viewMode);
    }
  }, [viewMode]);

  // Memoize filtered and sorted products (logic remains the same)
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }
    result = result.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
    if (filters.onSale) {
      result = result.filter((p) => !!p.originalPrice);
    }
    switch (sort) {
      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating_desc":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }
    return result;
  }, [filters, sort]);

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Shop All Phones</h1>
      
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="hidden w-full max-w-xs shrink-0 lg:block">
          <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <SortBar
            currentSort={sort}
            onSortChange={setSort}
            totalResults={filteredAndSortedProducts.length}
            viewMode={viewMode} // Pass viewMode
            onViewModeChange={setViewMode} // Pass handler
          />
          <ProductView
            products={filteredAndSortedProducts}
            viewMode={viewMode} // Pass viewMode
          />
        </main>
      </div>
    </div>
  );
}