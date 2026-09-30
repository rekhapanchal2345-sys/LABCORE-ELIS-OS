"use client";

import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
  showCharacterCount?: boolean;
}

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      containerClassName,
      showCharacterCount = false,
      className,
      id,
      maxLength,
      value,
      defaultValue,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id ||
      `textarea-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

    const currentLength =
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
          ? defaultValue.length
          : 0;

    return (
      <div
        className={cn(
          "w-full",
          containerClassName
        )}
      >
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}

            {required && (
              <span
                className="ml-1 text-red-500"
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
                ? `${textareaId}-helper`
                : undefined
          }
          className={cn(
            "min-h-[100px] w-full resize-y rounded-lg border",
            "bg-white px-3 py-2.5 text-sm text-gray-900",
            "placeholder:text-gray-400",
            "outline-none transition-all",
            "focus:ring-2 focus:ring-offset-0",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
            "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
            "read-only:bg-gray-50",
            className
          )}
          {...props}
        />

        <div className="mt-1.5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {error ? (
              <p
                id={`${textareaId}-error`}
                className="text-xs text-red-600"
                role="alert"
              >
                {error}
              </p>
            ) : helperText ? (
              <p
                id={`${textareaId}-helper`}
                className="text-xs text-gray-500"
              >
                {helperText}
              </p>
            ) : null}
          </div>

          {showCharacterCount &&
            maxLength && (
              <span className="shrink-0 text-xs text-gray-500">
                {currentLength}/{maxLength}
              </span>
            )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;