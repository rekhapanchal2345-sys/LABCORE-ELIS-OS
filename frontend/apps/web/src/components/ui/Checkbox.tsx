"use client";

import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
}

const Checkbox = forwardRef<
  HTMLInputElement,
  CheckboxProps
>(
  (
    {
      label,
      description,
      error,
      containerClassName,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const checkboxId =
      id ||
      `checkbox-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

    return (
      <div
        className={cn(
          "w-full",
          containerClassName
        )}
      >
        <div className="flex items-start gap-3">
          <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              disabled={disabled}
              className={cn(
                "peer h-4 w-4 cursor-pointer appearance-none",
                "rounded border border-gray-300 bg-white",
                "transition-all",
                "checked:border-blue-600 checked:bg-blue-600",
                "focus:outline-none focus:ring-2",
                "focus:ring-blue-100",
                "disabled:cursor-not-allowed",
                "disabled:bg-gray-100",
                "disabled:opacity-60",
                error &&
                  "border-red-400",
                className
              )}
              {...props}
            />

            <svg
              className="pointer-events-none absolute hidden h-3 w-3 text-white peer-checked:block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>

          {(label || description) && (
            <div className="min-w-0 flex-1">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className={cn(
                    "cursor-pointer text-sm font-medium",
                    "text-gray-700",
                    disabled &&
                      "cursor-not-allowed opacity-60"
                  )}
                >
                  {label}
                </label>
              )}

              {description && (
                <p
                  className={cn(
                    "mt-0.5 text-xs text-gray-500",
                    label && "leading-5"
                  )}
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p
            className="mt-1.5 ml-8 text-xs text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

/* -------------------------------------------------------
   CHECKBOX GROUP
------------------------------------------------------- */

interface CheckboxOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  label?: string;
  options: CheckboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  error,
  disabled = false,
  className,
}: CheckboxGroupProps) {
  const handleChange = (
    value: string,
    checked: boolean
  ) => {
    if (checked) {
      onChange([...values, value]);
    } else {
      onChange(
        values.filter(
          (item) => item !== value
        )
      );
    }
  };

  return (
    <div
      className={cn(
        "w-full",
        className
      )}
    >
      {label && (
        <p className="mb-2 text-sm font-medium text-gray-700">
          {label}
        </p>
      )}

      <div className="space-y-3">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            checked={values.includes(
              option.value
            )}
            disabled={
              disabled || option.disabled
            }
            onChange={(event) =>
              handleChange(
                option.value,
                event.target.checked
              )
            }
          />
        ))}
      </div>

      {error && (
        <p
          className="mt-1.5 text-xs text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default Checkbox;