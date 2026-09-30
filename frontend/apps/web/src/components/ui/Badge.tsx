"use client";

import React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary"
  | "outline";

export type BadgeSize =
  | "sm"
  | "md"
  | "lg";

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantClasses: Record<
  BadgeVariant,
  string
> = {
  default:
    "bg-gray-100 text-gray-700",

  success:
    "bg-green-100 text-green-700",

  warning:
    "bg-yellow-100 text-yellow-700",

  error:
    "bg-red-100 text-red-700",

  info:
    "bg-blue-100 text-blue-700",

  secondary:
    "bg-purple-100 text-purple-700",

  outline:
    "border border-gray-300 bg-white text-gray-700",
};

const dotClasses: Record<
  BadgeVariant,
  string
> = {
  default:
    "bg-gray-500",

  success:
    "bg-green-500",

  warning:
    "bg-yellow-500",

  error:
    "bg-red-500",

  info:
    "bg-blue-500",

  secondary:
    "bg-purple-500",

  outline:
    "bg-gray-500",
};

const sizeClasses: Record<
  BadgeSize,
  string
> = {
  sm:
    "px-2 py-0.5 text-[10px] gap-1",

  md:
    "px-2.5 py-1 text-xs gap-1.5",

  lg:
    "px-3 py-1.5 text-sm gap-2",
};

const dotSizeClasses: Record<
  BadgeSize,
  string
> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-full font-medium",
        "whitespace-nowrap",
        "leading-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "shrink-0 rounded-full",
            dotClasses[variant],
            dotSizeClasses[size]
          )}
          aria-hidden="true"
        />
      )}

      {children}
    </span>
  );
}

/* -------------------------------------------------------
   STATUS BADGE
------------------------------------------------------- */

interface StatusBadgeProps {
  status: string;
  size?: BadgeSize;
  className?: string;
}

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const normalizedStatus =
    status.toLowerCase().trim();

  let variant: BadgeVariant = "default";

  if (
    [
      "active",
      "approved",
      "completed",
      "paid",
      "success",
      "verified",
      "available",
      "normal",
      "released",
    ].includes(normalizedStatus)
  ) {
    variant = "success";
  }

  if (
    [
      "pending",
      "processing",
      "waiting",
      "in progress",
      "partial",
      "due",
      "review",
    ].includes(normalizedStatus)
  ) {
    variant = "warning";
  }

  if (
    [
      "failed",
      "error",
      "rejected",
      "cancelled",
      "canceled",
      "inactive",
      "blocked",
      "critical",
    ].includes(normalizedStatus)
  ) {
    variant = "error";
  }

  if (
    [
      "new",
      "info",
      "scheduled",
      "draft",
      "collected",
      "received",
    ].includes(normalizedStatus)
  ) {
    variant = "info";
  }

  return (
    <Badge
      variant={variant}
      size={size}
      dot
      className={className}
    >
      {status}
    </Badge>
  );
}

/* -------------------------------------------------------
   PAYMENT STATUS
------------------------------------------------------- */

interface PaymentStatusBadgeProps {
  status: string;
  size?: BadgeSize;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  size = "md",
  className,
}: PaymentStatusBadgeProps) {
  const normalized =
    status.toLowerCase().trim();

  let variant: BadgeVariant = "default";

  switch (normalized) {
    case "paid":
      variant = "success";
      break;

    case "partial":
      variant = "warning";
      break;

    case "pending":
      variant = "warning";
      break;

    case "refunded":
      variant = "info";
      break;

    case "failed":
      variant = "error";
      break;

    case "cancelled":
    case "canceled":
      variant = "error";
      break;
  }

  return (
    <Badge
      variant={variant}
      size={size}
      dot
      className={className}
    >
      {status}
    </Badge>
  );
}

/* -------------------------------------------------------
   ORDER STATUS
------------------------------------------------------- */

interface OrderStatusBadgeProps {
  status: string;
  size?: BadgeSize;
  className?: string;
}

export function OrderStatusBadge({
  status,
  size = "md",
  className,
}: OrderStatusBadgeProps) {
  const normalized =
    status.toLowerCase().trim();

  let variant: BadgeVariant = "default";

  switch (normalized) {
    case "completed":
      variant = "success";
      break;

    case "processing":
      variant = "info";
      break;

    case "pending":
      variant = "warning";
      break;

    case "cancelled":
    case "canceled":
      variant = "error";
      break;

    case "draft":
      variant = "secondary";
      break;
  }

  return (
    <Badge
      variant={variant}
      size={size}
      dot
      className={className}
    >
      {status}
    </Badge>
  );
}

/* -------------------------------------------------------
   SAMPLE STATUS
------------------------------------------------------- */

interface SampleStatusBadgeProps {
  status: string;
  size?: BadgeSize;
  className?: string;
}

export function SampleStatusBadge({
  status,
  size = "md",
  className,
}: SampleStatusBadgeProps) {
  const normalized =
    status.toLowerCase().trim();

  let variant: BadgeVariant = "default";

  switch (normalized) {
    case "collected":
      variant = "success";
      break;

    case "received":
      variant = "info";
      break;

    case "processing":
      variant = "warning";
      break;

    case "rejected":
      variant = "error";
      break;

    case "pending":
      variant = "warning";
      break;
  }

  return (
    <Badge
      variant={variant}
      size={size}
      dot
      className={className}
    >
      {status}
    </Badge>
  );
}

/* -------------------------------------------------------
   RESULT STATUS
------------------------------------------------------- */

interface ResultStatusBadgeProps {
  status: string;
  size?: BadgeSize;
  className?: string;
}

export function ResultStatusBadge({
  status,
  size = "md",
  className,
}: ResultStatusBadgeProps) {
  const normalized =
    status.toLowerCase().trim();

  let variant: BadgeVariant = "default";

  switch (normalized) {
    case "normal":
      variant = "success";
      break;

    case "abnormal":
      variant = "warning";
      break;

    case "critical":
      variant = "error";
      break;

    case "pending":
      variant = "warning";
      break;

    case "released":
    case "approved":
      variant = "success";
      break;

    case "draft":
      variant = "secondary";
      break;
  }

  return (
    <Badge
      variant={variant}
      size={size}
      dot
      className={className}
    >
      {status}
    </Badge>
  );
}

/* -------------------------------------------------------
   EXPORT
------------------------------------------------------- */

export default Badge;