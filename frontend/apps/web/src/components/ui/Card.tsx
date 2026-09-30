"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  title,
  description,
  actions,
  padding = "md",
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm",
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {(title || description || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({
  children,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 flex items-center justify-between gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({
  children,
  className,
  ...props
}: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({
  children,
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={cn(
        "mt-1 text-sm text-gray-500",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn("", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({
  children,
  className,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        "mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;