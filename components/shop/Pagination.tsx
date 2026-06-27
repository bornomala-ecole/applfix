"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShopPagination } from "@/lib/types/shop";

interface PaginationProps {
  pagination: ShopPagination;
  onPageChange: (page: number) => void;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages: number[] = [];

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  return pages;
}

export default function Pagination({
  pagination,
  onPageChange,
}: PaginationProps) {
  const { currentPage, totalPages, totalProducts, pageSize } = pagination;

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalProducts);

  return (
    <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-950">{startItem}</span> to{" "}
          <span className="font-semibold text-gray-950">{endItem}</span> of{" "}
          <span className="font-semibold text-gray-950">{totalProducts}</span>{" "}
          products
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {currentPage > 1 ? (
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

          {visiblePages[0] > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 transition hover:border-primaryRed hover:text-primaryRed"
              >
                1
              </button>

              {visiblePages[0] > 2 && (
                <span className="px-1 text-sm text-gray-400">...</span>
              )}
            </>
          )}

          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              disabled={page === currentPage}
              aria-current={page === currentPage ? "page" : undefined}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                page === currentPage
                  ? "cursor-default border-primaryRed bg-primaryRed text-white"
                  : "border-gray-200 text-gray-700 hover:border-primaryRed hover:text-primaryRed"
              }`}
            >
              {page}
            </button>
          ))}

          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-1 text-sm text-gray-400">...</span>
              )}

              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 transition hover:border-primaryRed hover:text-primaryRed"
              >
                {totalPages}
              </button>
            </>
          )}

          {currentPage < totalPages ? (
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