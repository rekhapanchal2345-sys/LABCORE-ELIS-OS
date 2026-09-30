"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "children"
  > {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export function Select({
  label,
  options,
  placeholder = "Select an option",
  error,
  helperText,
  containerClassName,
  className,
  id,
  required,
  ...props
}: SelectProps) {
  const selectId =
    id ||
    (label
      ? `select-${label
          .toLowerCase()
          .replace(/\s+/g, "-")}`
      : undefined);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1.5",
        containerClassName
      )}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-gray-700"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <select
        id={selectId}
        required={required}
        className={cn(
          "h-10 w-full rounded-lg border bg-white px-3",
          "text-sm text-gray-900",
          "outline-none transition-colors",
          "focus:ring-2",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error
            ? `${selectId}-error`
            : helperText
              ? `${selectId}-helper`
              : undefined
        }
        {...props}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p
          id={`${selectId}-error`}
          className="text-xs text-red-600"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${selectId}-helper`}
          className="text-xs text-gray-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default Select;