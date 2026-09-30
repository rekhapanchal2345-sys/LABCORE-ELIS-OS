"use client";

import React from "react";
import Link from "next/link";
import type { Invoice } from "./InvoiceTable";

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete?: (invoice: Invoice) => void;
}

function formatCurrency(amount?: number) {
  return `₹${Number(amount || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status?: string) {
  const value = status?.toLowerCase();

  if (
    value === "paid" ||
    value === "completed"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    value === "overdue" ||
    value === "cancelled" ||
    value === "failed"
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    value === "partial" ||
    value === "pending"
  ) {
    return "bg-yellow-50 text-yellow-700";
  }

  return "bg-gray-100 text-gray-600";
}

export default function InvoiceCard({
  invoice,
  onDelete,
}: InvoiceCardProps) {
  const total = Number(
    invoice.totalAmount || 0
  );

  const paid = Number(
    invoice.paidAmount || 0
  );

  const due =
    invoice.pendingAmount !== undefined
      ? Number(invoice.pendingAmount)
      : Math.max(0, total - paid);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
            🧾
          </div>

          <div className="min-w-0">
            <Link
              href={`/invoices/${invoice.id}`}
              className="block truncate text-base font-semibold text-gray-900 hover:underline"
            >
              {invoice.invoiceNumber ||
                `INV-${invoice.id}`}
            </Link>

            <p className="mt-1 text-xs text-gray-500">
              {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
            invoice.paymentStatus ||
              invoice.status
          )}`}
        >
          {invoice.paymentStatus ||
            invoice.status ||
            "Pending"}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs text-gray-400">
            Patient
          </p>

          {invoice.patientId ? (
            <Link
              href={`/patients/${invoice.patientId}`}
              className="mt-1 block text-sm font-semibold text-gray-800 hover:underline"
            >
              {invoice.patientName ||
                `Patient #${invoice.patientId}`}
            </Link>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {invoice.patientName || "—"}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Order
          </p>

          {invoice.orderId ? (
            <Link
              href={`/orders/${invoice.orderId}`}
              className="mt-1 block text-sm text-gray-700 hover:underline"
            >
              {invoice.orderNumber ||
                `ORD-${invoice.orderId}`}
            </Link>
          ) : (
            <p className="mt-1 text-sm text-gray-700">
              —
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3">
          <div>
            <p className="text-xs text-gray-400">
              Total
            </p>

            <p className="mt-1 text-sm font-bold text-gray-800">
              {formatCurrency(total)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Paid
            </p>

            <p className="mt-1 text-sm font-bold text-green-700">
              {formatCurrency(paid)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Due
            </p>

            <p className="mt-1 text-sm font-bold text-red-600">
              {formatCurrency(due)}
            </p>
          </div>
        </div>

        {invoice.dueDate && (
          <div>
            <p className="text-xs text-gray-400">
              Due Date
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Link
          href={`/invoices/${invoice.id}`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          View
        </Link>

        <Link
          href={`/invoices/${invoice.id}?edit=true`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit
        </Link>

        <Link
          href={`/invoices/${invoice.id}?print=true`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Print
        </Link>

        <Link
          href={`/invoices/${invoice.id}?download=true`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Download
        </Link>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(invoice)}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}