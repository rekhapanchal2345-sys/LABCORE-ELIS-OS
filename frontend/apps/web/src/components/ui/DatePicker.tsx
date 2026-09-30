"use client";

import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/utils";

export interface DatePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;

  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;

  min?: string;
  max?: string;

  disabled?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;

  name?: string;
  id?: string;
}

const DatePicker = forwardRef<
  HTMLInputElement,
  DatePickerProps
>(
  (
    {
      value,
      defaultValue = "",
      onChange,
      label,
      placeholder = "Select date",
      error,
      helperText,
      min,
      max,
      disabled = false,
      required = false,
      className,
      containerClassName,
      name,
      id,
    },
    ref
  ) => {
    const inputId =
      id ||
      `date-picker-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

    const [internalValue, setInternalValue] =
      useState(defaultValue);

    const currentValue =
      value !== undefined
        ? value
        : internalValue;

    const handleChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const newValue = event.target.value;

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);
    };

    return (
      <div
        className={cn(
          "w-full",
          containerClassName
        )}
      >
        {label && (
          <label
            htmlFor={inputId}
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

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="date"
            value={currentValue}
            onChange={handleChange}
            min={min}
            max={max}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            className={cn(
              "h-10 w-full rounded-lg border",
              "bg-white px-3 py-2",
              "text-sm text-gray-900",
              "outline-none transition-all",
              "focus:ring-2 focus:ring-offset-0",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
              "disabled:cursor-not-allowed",
              "disabled:bg-gray-100",
              "disabled:text-gray-500",
              className
            )}
          />

          {!currentValue && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white pr-2 text-sm text-gray-400">
              {placeholder}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-xs text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

/* -------------------------------------------------------
   DATE RANGE PICKER
------------------------------------------------------- */

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;

  onStartDateChange?: (
    value: string
  ) => void;

  onEndDateChange?: (
    value: string
  ) => void;

  startLabel?: string;
  endLabel?: string;

  error?: string;

  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  startLabel = "Start Date",
  endLabel = "End Date",
  error,
  disabled = false,
  className,
}: DateRangePickerProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        className
      )}
    >
      <DatePicker
        label={startLabel}
        value={startDate}
        onChange={onStartDateChange}
        max={endDate || undefined}
        disabled={disabled}
        error={error}
      />

      <DatePicker
        label={endLabel}
        value={endDate}
        onChange={onEndDateChange}
        min={startDate || undefined}
        disabled={disabled}
      />
    </div>
  );
}

/* -------------------------------------------------------
   DATE TIME PICKER
------------------------------------------------------- */

interface DateTimePickerProps {
  value?: string;
  defaultValue?: string;

  onChange?: (value: string) => void;

  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;

  min?: string;
  max?: string;

  disabled?: boolean;
  required?: boolean;

  className?: string;
  containerClassName?: string;

  name?: string;
  id?: string;
}

export function DateTimePicker({
  value,
  defaultValue = "",
  onChange,
  label,
  placeholder = "Select date and time",
  error,
  helperText,
  min,
  max,
  disabled = false,
  required = false,
  className,
  containerClassName,
  name,
  id,
}: DateTimePickerProps) {
  const inputId =
    id ||
    `datetime-picker-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

  const [internalValue, setInternalValue] =
    useState(defaultValue);

  const currentValue =
    value !== undefined
      ? value
      : internalValue;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;

    if (value === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  return (
    <div
      className={cn(
        "w-full",
        containerClassName
      )}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        ref={undefined}
        name={name}
        type="datetime-local"
        value={currentValue}
        onChange={handleChange}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        className={cn(
          "h-10 w-full rounded-lg border",
          "bg-white px-3 py-2",
          "text-sm text-gray-900",
          "outline-none transition-all",
          "focus:ring-2 focus:ring-offset-0",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
          "disabled:cursor-not-allowed",
          "disabled:bg-gray-100",
          "disabled:text-gray-500",
          className
        )}
      />

      {error && (
        <p
          className="mt-1.5 text-xs text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="mt-1.5 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   MONTH PICKER
------------------------------------------------------- */

interface MonthPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;

  label?: string;
  error?: string;
  helperText?: string;

  min?: string;
  max?: string;

  disabled?: boolean;
  required?: boolean;

  className?: string;
}

export function MonthPicker({
  value,
  defaultValue = "",
  onChange,
  label,
  error,
  helperText,
  min,
  max,
  disabled = false,
  required = false,
  className,
}: MonthPickerProps) {
  const [internalValue, setInternalValue] =
    useState(defaultValue);

  const currentValue =
    value !== undefined
      ? value
      : internalValue;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;

    if (value === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <input
        type="month"
        value={currentValue}
        onChange={handleChange}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        className={cn(
          "h-10 w-full rounded-lg border",
          "bg-white px-3 py-2",
          "text-sm text-gray-900",
          "outline-none transition-all",
          "focus:border-blue-500",
          "focus:ring-2 focus:ring-blue-100",
          error &&
            "border-red-300 focus:border-red-500 focus:ring-red-100",
          "disabled:cursor-not-allowed",
          "disabled:bg-gray-100",
          className
        )}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="mt-1.5 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default DatePicker;