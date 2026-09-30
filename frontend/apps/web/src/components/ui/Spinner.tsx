"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
  xl: "h-12 w-12 border-4",
};

export function Spinner({
  size = "md",
  className,
  label = "Loading...",
}: SpinnerProps) {
  return (
    <span
      className="inline-flex items-center justify-center"
      role="status"
      aria-label={label}
    >
      <span
        className={cn(
          "animate-spin rounded-full border-gray-300 border-t-blue-600",
          sizeClasses[size],
          className
        )}
      />
      <span className="sr-only">
        {label}
      </span>
    </span>
  );
}

export function LoadingScreen({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">
          {message}
        </p>
      </div>
    </div>
  );
}

export function LoadingOverlay({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-gray-600">
          {message}
        </p>
      </div>
    </div>
  );
}

export default Spinner;