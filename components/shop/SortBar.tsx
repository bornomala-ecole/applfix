"use client";

import { SortOption, sortOptions } from "@/lib/types/shop";
import { Grid, List } from "lucide-react";

interface SortBarProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export default function SortBar({
  currentSort,
  onSortChange,
  totalResults,
  viewMode,
  onViewModeChange,
}: SortBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{totalResults}</span> results
      </p>
      <div className="flex items-center gap-4">
        {/* View Mode Toggle */}
        <div className="flex gap-1 border border-gray-300 rounded">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-primaryRed text-white"
                : "bg-white text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Grid View"
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded transition-colors ${
              viewMode === "list"
                ? "bg-primaryRed text-white"
                : "bg-white text-gray-400 hover:text-gray-600"
            }`}
            aria-label="List View"
          >
            <List size={20} />
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Sort by:</span>
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primaryRed"
          >
            {Object.entries(sortOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}