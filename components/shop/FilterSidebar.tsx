"use client";

import { useState, useEffect } from "react";
import { FilterState } from "@/lib/types/shop";
import { X } from "lucide-react";

interface FiltersSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const brands = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi"];

export default function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange);

  const handleBrandChange = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handlePriceChange = () => {
    onFiltersChange({ ...filters, priceRange });
  };

  const handleSaleChange = () => {
    onFiltersChange({ ...filters, onSale: !filters.onSale });
  };

  // Clear all filters
  const clearFilters = () => {
    onFiltersChange({ brands: [], priceRange: [0, 2000], onSale: false });
    setPriceRange([0, 2000]);
  };

  return (
    <div className="rounded-lg border p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-primaryRed">
          Clear All
        </button>
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <h4 className="mb-3 font-medium">Brand</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="mr-3 h-4 w-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
              />
              <span className="text-sm text-gray-700">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h4 className="mb-3 font-medium">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="w-full rounded border px-3 py-1 text-sm"
            placeholder="Min"
          />
          <span>-</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full rounded border px-3 py-1 text-sm"
            placeholder="Max"
          />
        </div>
        <button onClick={handlePriceChange} className="mt-2 w-full rounded bg-gray-100 py-1 text-sm hover:bg-gray-200">
          Apply
        </button>
      </div>

      {/* Sale Filter */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.onSale}
            onChange={handleSaleChange}
            className="mr-3 h-4 w-4 rounded border-gray-300 text-primaryRed focus:ring-primaryRed"
          />
          <span className="text-sm font-medium text-gray-700">On Sale</span>
        </label>
      </div>
    </div>
  );
}