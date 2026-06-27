"use client";

import { Search, RotateCcw } from "lucide-react";
import {
  BrandFilterOption,
  FilterState,
  CategoryFilterOption,
} from "@/lib/types/shop";

interface FiltersSidebarProps {
  query: string;
  onQueryChange: (value: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableBrands: BrandFilterOption[];
  priceBounds: [number, number];
  onReset: () => void;
  availableCategories: CategoryFilterOption[];
  showBrandFilter?: boolean;
  showCategoryFilter?: boolean;
}

export default function FiltersSidebar({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  availableBrands,
  priceBounds,
  onReset,
  availableCategories,
  showBrandFilter = true,
  showCategoryFilter = true,
}: FiltersSidebarProps) {
  function toggleBrand(brandName: string) {
    const exists = filters.brands.includes(brandName);

    onFiltersChange({
      ...filters,
      brands: exists
        ? filters.brands.filter((brand) => brand !== brandName)
        : [...filters.brands, brandName],
    });
  }

  function toggleCategory(categoryName: string) {
    const exists = filters.categories.includes(categoryName);

    onFiltersChange({
      ...filters,
      categories: exists
        ? filters.categories.filter((category) => category !== categoryName)
        : [...filters.categories, categoryName],
    });
  }

  function updateMinPrice(value: string) {
    const min = Number(value) || priceBounds[0];

    onFiltersChange({
      ...filters,
      priceRange: [min, Math.max(min, filters.priceRange[1])],
    });
  }

  function updateMaxPrice(value: string) {
    const max = Number(value) || priceBounds[1];

    onFiltersChange({
      ...filters,
      priceRange: [filters.priceRange[0], Math.max(filters.priceRange[0], max)],
    });
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Filters</h2>
          <p className="mt-1 text-xs text-gray-500">Live search and refine</p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-primaryRed hover:text-primaryRed"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="shop-search"
            className="mb-2 block text-sm font-semibold text-gray-950"
          >
            Search
          </label>

          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="shop-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search phones..."
              className="h-11 w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-primaryRed focus:ring-2 focus:ring-red-100"
            />
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Results update automatically as you type.
          </p>
        </div>

        {showBrandFilter && (
          <div className="border-t border-gray-100 pt-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-950">Brand</h3>

            {availableBrands.length > 0 ? (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {availableBrands.map((brand) => (
                  <label
                    key={brand.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand.name)}
                        onChange={() => toggleBrand(brand.name)}
                        className="h-4 w-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                      />

                      <span className="text-sm font-medium text-gray-700">
                        {brand.name}
                      </span>
                    </span>

                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {brand.count}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No brands found.</p>
            )}
          </div>
        )}



        {showCategoryFilter && (
          <div className="border-t border-gray-200 pt-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Category
            </h3>

            {availableCategories.length > 0 ? (
              <div className="space-y-2">
                {availableCategories.map((category) => (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.name)}
                        onChange={() => toggleCategory(category.name)}
                        className="h-4 w-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
                      />

                      <span className="text-gray-700">{category.name}</span>
                    </span>

                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      {category.count}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No categories found.</p>
            )}
          </div>
        )}



        <div className="border-t border-gray-100 pt-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-950">
            Price Range
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-1 block text-xs font-medium text-gray-500">
                Min
              </span>

              <input
                type="number"
                min={priceBounds[0]}
                max={priceBounds[1]}
                value={filters.priceRange[0]}
                onChange={(event) => updateMinPrice(event.target.value)}
                className="h-11 w-full rounded-2xl border border-gray-200 px-3 text-sm outline-none transition focus:border-primaryRed focus:ring-2 focus:ring-red-100"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-gray-500">
                Max
              </span>

              <input
                type="number"
                min={priceBounds[0]}
                max={priceBounds[1]}
                value={filters.priceRange[1]}
                onChange={(event) => updateMaxPrice(event.target.value)}
                className="h-11 w-full rounded-2xl border border-gray-200 px-3 text-sm outline-none transition focus:border-primaryRed focus:ring-2 focus:ring-red-100"
              />
            </label>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Available range: ${priceBounds[0]} - ${priceBounds[1]}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-gray-50">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  onSale: event.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
            />

            <span className="text-sm font-semibold text-gray-700">
              Sale products only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}