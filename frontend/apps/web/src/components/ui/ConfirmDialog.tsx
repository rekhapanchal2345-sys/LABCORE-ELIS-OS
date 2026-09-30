"use client";

import React from "react";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  title?: string;
  message?: string;

  confirmText?: string;
  cancelText?: string;

  variant?: "danger" | "warning" | "primary";

  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!loading}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={
            variant === "danger"
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"
              : variant === "warning"
                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600"
                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
          }
        >
          {variant === "danger" ? (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>
          ) : variant === "warning" ? (
            <svg
              className="h-5 w-5"
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
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          )}
        </div>

        <div>
          <p className="text-sm leading-6 text-gray-600">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;