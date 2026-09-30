"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface DropdownItem {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
  menuClassName,
  disabled = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  const handleItemClick = (
    item: DropdownItem
  ) => {
    if (item.disabled) return;

    item.onClick?.();
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-block text-left",
        className
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {trigger}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[180px] overflow-hidden",
            "rounded-lg border border-gray-200 bg-white py-1",
            "shadow-lg",
            align === "right"
              ? "right-0"
              : "left-0",
            menuClassName
          )}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              key={
                item.value ??
                `${item.label}-${index}`
              }
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() =>
                handleItemClick(item)
              }
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5",
                "text-left text-sm transition-colors",
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50",
                item.disabled &&
                  "cursor-not-allowed opacity-50"
              )}
            >
              {item.icon && (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {item.icon}
                </span>
              )}

              <span className="flex-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface DropdownButtonProps {
  label: string;
  items: DropdownItem[];
  align?: "left" | "right";
  disabled?: boolean;
}

export function DropdownButton({
  label,
  items,
  align = "right",
  disabled = false,
}: DropdownButtonProps) {
  return (
    <Dropdown
      items={items}
      align={align}
      disabled={disabled}
      trigger={
        <span className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
          {label}

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
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      }
    />
  );
}

export default Dropdown;