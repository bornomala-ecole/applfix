"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShopPagination } from "@/lib/types/shop";

interface PaginationProps {
  pagination: ShopPagination;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pagination,
  onPageChange,
}: PaginationProps) {
  const { currentPage, hasPreviousPage, hasNextPage } = pagination;

  if (!hasPreviousPage && !hasNextPage) {
    return null;
  }

  return (
    <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Page{" "}
          <span className="font-semibold text-gray-950">{currentPage}</span>
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {hasPreviousPage ? (
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              className="inline-flex h-10 items-center gap-1 rounded-2xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-primaryRed hover:text-primaryRed"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
          ) : (
            <span className="inline-flex h-10 cursor-not-allowed items-center gap-1 rounded-2xl border border-gray-100 px-3 text-sm font-semibold text-gray-300">
              <ChevronLeft size={16} />
              Prev
            </span>
          )}

          <span
            aria-current="page"
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border border-primaryRed bg-primaryRed px-4 text-sm font-semibold text-white"
          >
            {currentPage}
          </span>

          {hasNextPage ? (
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              className="inline-flex h-10 items-center gap-1 rounded-2xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-primaryRed hover:text-primaryRed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <span className="inline-flex h-10 cursor-not-allowed items-center gap-1 rounded-2xl border border-gray-100 px-3 text-sm font-semibold text-gray-300">
              Next
              <ChevronRight size={16} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}