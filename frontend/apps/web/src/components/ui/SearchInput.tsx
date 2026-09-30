"use client";

import React, {
  forwardRef,
  useEffect,
  useState,
} from "react";
import { cn } from "../../lib/utils";

export interface SearchInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange"
  > {
  value?: string;
  defaultValue?: string;
  onChange?: (
    value: string
  ) => void;

  onSearch?: (
    value: string
  ) => void;

  onClear?: () => void;

  placeholder?: string;
  loading?: boolean;
  showClearButton?: boolean;

  containerClassName?: string;
  inputClassName?: string;
}

const SearchInput = forwardRef<
  HTMLInputElement,
  SearchInputProps
>(
  (
    {
      value,
      defaultValue = "",
      onChange,
      onSearch,
      onClear,
      placeholder = "Search...",
      loading = false,
      showClearButton = true,
      containerClassName,
      inputClassName,
      className,
      disabled = false,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] =
      useState(defaultValue);

    const currentValue =
      value !== undefined
        ? value
        : internalValue;

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const handleChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const newValue = event.target.value;

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);
    };

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue("");
      }

      onChange?.("");
      onClear?.();
    };

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        onSearch?.(currentValue);
      }

      if (
        event.key === "Escape" &&
        currentValue
      ) {
        handleClear();
      }

      onKeyDown?.(event);
    };

    return (
      <div
        className={cn(
          "relative w-full",
          containerClassName,
          className
        )}
      >
        <div className="relative">
          {/* Search Icon */}

          <span
            className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-gray-400"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>

          <input
            ref={ref}
            type="search"
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            autoComplete="off"
            className={cn(
              "h-10 w-full rounded-lg border",
              "bg-white pl-10 pr-10",
              "text-sm text-gray-900",
              "placeholder:text-gray-400",
              "outline-none transition-all",
              "border-gray-300",
              "focus:border-blue-500",
              "focus:ring-2",
              "focus:ring-blue-100",
              "[&::-webkit-search-cancel-button]:appearance-none",
              "disabled:cursor-not-allowed",
              "disabled:bg-gray-100",
              "disabled:text-gray-500",
              inputClassName
            )}
            {...props}
          />

          {/* Loading Spinner */}

          {loading && (
            <span
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center"
              aria-label="Searching"
            >
              <svg
                className="h-4 w-4 animate-spin text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  className="opacity-25"
                  stroke="currentColor"
                  strokeWidth="3"
                />

                <path
                  d="M21 12a9 9 0 0 1-9 9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          )}

          {/* Clear Button */}

          {!loading &&
            showClearButton &&
            currentValue && (
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                aria-label="Clear search"
                className={cn(
                  "absolute right-2 top-1/2",
                  "flex h-7 w-7",
                  "-translate-y-1/2",
                  "items-center justify-center",
                  "rounded-md",
                  "text-gray-400",
                  "transition-colors",
                  "hover:bg-gray-100",
                  "hover:text-gray-600",
                  "focus:outline-none",
                  "focus:ring-2",
                  "focus:ring-blue-100",
                  "disabled:cursor-not-allowed"
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

/* -------------------------------------------------------
   SEARCH INPUT WITH BUTTON
------------------------------------------------------- */

interface SearchInputWithButtonProps
  extends SearchInputProps {
  buttonLabel?: string;
}

export function SearchInputWithButton({
  buttonLabel = "Search",
  onSearch,
  ...props
}: SearchInputWithButtonProps) {
  const [inputValue, setInputValue] =
    useState(
      props.value ??
        props.defaultValue ??
        ""
    );

  useEffect(() => {
    if (props.value !== undefined) {
      setInputValue(props.value);
    }
  }, [props.value]);

  const handleSearch = () => {
    onSearch?.(inputValue);
  };

  return (
    <div className="flex w-full gap-2">
      <SearchInput
        {...props}
        value={inputValue}
        onChange={(value) => {
          setInputValue(value);
          props.onChange?.(value);
        }}
        onSearch={onSearch}
        className="flex-1"
      />

      <button
        type="button"
        onClick={handleSearch}
        disabled={
          props.disabled ||
          props.loading
        }
        className={cn(
          "h-10 shrink-0 rounded-lg",
          "bg-blue-600 px-4",
          "text-sm font-medium text-white",
          "transition-colors",
          "hover:bg-blue-700",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-blue-200",
          "disabled:cursor-not-allowed",
          "disabled:opacity-50"
        )}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

/* -------------------------------------------------------
   SEARCH INPUT WITH FILTER BUTTON
------------------------------------------------------- */

interface SearchFilterInputProps
  extends SearchInputProps {
  onFilterClick?: () => void;
  filterLabel?: string;
}

export function SearchFilterInput({
  onFilterClick,
  filterLabel = "Filters",
  ...props
}: SearchFilterInputProps) {
  return (
    <div className="flex w-full gap-2">
      <SearchInput
        {...props}
        className="flex-1"
      />

      <button
        type="button"
        onClick={onFilterClick}
        disabled={props.disabled}
        className={cn(
          "flex h-10 shrink-0",
          "items-center gap-2",
          "rounded-lg border",
          "border-gray-300",
          "bg-white px-3",
          "text-sm font-medium",
          "text-gray-700",
          "transition-colors",
          "hover:bg-gray-50",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-blue-100",
          "disabled:cursor-not-allowed",
          "disabled:opacity-50"
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M4 6h16" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        </svg>

        <span>{filterLabel}</span>
      </button>
    </div>
  );
}

export default SearchInput;