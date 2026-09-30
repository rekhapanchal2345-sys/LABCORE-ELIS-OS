"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const ResultRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      <Skeleton className="w-5 h-5 rounded" />
      <Skeleton className="flex-1 h-4 rounded" />
      <Skeleton className="w-24 h-4 rounded" />
      <Skeleton className="w-20 h-4 rounded" />
      <Skeleton className="w-32 h-4 rounded" />
      <Skeleton className="w-24 h-4 rounded" />
    </div>
  );
};

export const ResultCardSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-5/6 rounded" />
        <Skeleton className="h-3 w-4/6 rounded" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <Skeleton className="h-4 w-1/4 rounded" />
      </div>
      
      {/* Rows */}
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <ResultRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};