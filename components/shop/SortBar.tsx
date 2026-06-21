"use client";

import { SortOption, sortOptions } from "@/lib/types/shop";
import { Grid, List } from "lucide-react";
import { Loader2 } from "lucide-react";

interface SortBarProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isPending?: boolean;
}

export default function SortBar({
  currentSort,
  onSortChange,
  totalResults,
  viewMode,
  onViewModeChange,
  isPending = false,
}: SortBarProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-950">
            {totalResults} {totalResults === 1 ? "product" : "products"} found
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            Use filters to narrow your search.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex w-fit rounded-2xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                viewMode === "grid"
                  ? "bg-primaryRed text-white shadow-sm"
                  : "text-gray-400 hover:bg-white hover:text-gray-700"
              }`}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                viewMode === "list"
                  ? "bg-primaryRed text-white shadow-sm"
                  : "text-gray-400 hover:bg-white hover:text-gray-700"
              }`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="shop-sort"
              className="whitespace-nowrap text-sm font-medium text-gray-600"
            >
              Sort by
            </label>

            <div className="relative">
              <select
                id="shop-sort"
                value={currentSort}
                onChange={(event) =>
                  onSortChange(event.target.value as SortOption)
                }
                className="h-11 rounded-2xl border border-gray-200 bg-white px-4 pr-10 text-sm font-medium text-gray-700 outline-none transition focus:border-primaryRed focus:ring-2 focus:ring-red-100"
              >
                {Object.entries(sortOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              {isPending && (
                <Loader2
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primaryRed"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}