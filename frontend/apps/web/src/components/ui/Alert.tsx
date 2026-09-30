"use client";

import React from "react";
import { cn } from "../../lib/utils";

export type AlertVariant =
  | "info"
  | "success"
  | "warning"
  | "error";

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  message?: string;
  onClose?: () => void;
}

const variantClasses: Record<
  AlertVariant,
  string
> = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success:
    "border-green-200 bg-green-50 text-green-800",
  warning:
    "border-yellow-200 bg-yellow-50 text-yellow-800",
  error:
    "border-red-200 bg-red-50 text-red-800",
};

const iconClasses: Record<
  AlertVariant,
  string
> = {
  info: "text-blue-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
};

function AlertIcon({
  variant,
}: {
  variant: AlertVariant;
}) {
  if (variant === "success") {
    return (
      <svg
        className={cn("h-5 w-5", iconClasses[variant])}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (variant === "warning") {
    return (
      <svg
        className={cn("h-5 w-5", iconClasses[variant])}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (variant === "error") {
    return (
      <svg
        className={cn("h-5 w-5", iconClasses[variant])}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    );
  }

  return (
    <svg
      className={cn("h-5 w-5", iconClasses[variant])}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function Alert({
  variant = "info",
  title,
  message,
  children,
  onClose,
  className,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-4",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <div className="mt-0.5 shrink-0">
        <AlertIcon variant={variant} />
      </div>

      <div className="min-w-0 flex-1">
        {title && (
          <h3 className="text-sm font-semibold">
            {title}
          </h3>
        )}

        {message && (
          <p
            className={cn(
              "text-sm",
              title && "mt-1"
            )}
          >
            {message}
          </p>
        )}

        {children}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
          aria-label="Close alert"
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Alert;