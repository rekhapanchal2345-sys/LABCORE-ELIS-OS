"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxVisiblePages?: number;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number
): (number | "...")[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  const pages: (number | "...")[] = [];

  const sidePages = Math.floor(
    (maxVisiblePages - 3) / 2
  );

  const startPage = Math.max(
    2,
    currentPage - sidePages
  );

  const endPage = Math.min(
    totalPages - 1,
    currentPage + sidePages
  );

  pages.push(1);

  if (startPage > 2) {
    pages.push("...");
  }

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {
    pages.push(page);
  }

  if (endPage < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxVisiblePages = 7,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageNumbers(
    currentPage,
    totalPages,
    maxVisiblePages
  );

  const goToPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      className={cn(
        "flex items-center justify-between gap-4",
        className
      )}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={goToPrevious}
        disabled={currentPage === 1}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-lg border",
          "border-gray-300 bg-white px-3 text-sm font-medium",
          "text-gray-700 transition-colors",
          "hover:bg-gray-50",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        aria-label="Previous page"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>

        <span className="hidden sm:inline">
          Previous
        </span>
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center text-sm text-gray-500"
              >
                ...
              </span>
            );
          }

          const isActive =
            page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={
                isActive ? "page" : undefined
              }
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={goToNext}
        disabled={currentPage === totalPages}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-lg border",
          "border-gray-300 bg-white px-3 text-sm font-medium",
          "text-gray-700 transition-colors",
          "hover:bg-gray-50",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">
          Next
        </span>

        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}

export default Pagination;