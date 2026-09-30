"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "outline"
  | "ghost";

export type ButtonSize =
  | "sm"
  | "md"
  | "lg";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<
  ButtonVariant,
  string
> = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] focus:ring-[var(--primary)]",

  secondary:
    "bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border-medium)] hover:bg-[var(--background-tertiary)] focus:ring-[var(--primary)]",

  success:
    "bg-[var(--success)] text-white hover:bg-[var(--success-light)] focus:ring-[var(--success)]",

  danger:
    "bg-[var(--danger)] text-white hover:bg-[var(--danger-light)] focus:ring-[var(--danger)]",

  warning:
    "bg-[var(--warning)] text-white hover:bg-[var(--warning-light)] focus:ring-[var(--warning)]",

  outline:
    "border border-[var(--border-medium)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:bg-[var(--background-secondary)] hover:border-[var(--primary)] focus:ring-[var(--primary)]",

  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)] focus:ring-[var(--primary)]",
};

const sizeClasses: Record<
  ButtonSize,
  string
> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-lg font-medium",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "shadow-sm hover:shadow-md",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span
              className="shrink-0"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <span>{children}</span>

          {rightIcon && (
            <span
              className="shrink-0"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default Button;