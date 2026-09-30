"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  containerClassName,
  id,
  ...props
}: InputProps) {
  const inputId =
    id ||
    (label
      ? `input-${label
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
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}

          {props.required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          className={cn(
            "h-10 w-full rounded-lg border bg-white px-3",
            "text-sm text-gray-900",
            "placeholder:text-gray-400",
            "transition-colors",
            "outline-none",
            "focus:ring-2",
            "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />

        {rightIcon && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-xs text-red-600"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${inputId}-helper`}
          className="text-xs text-gray-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default Input;