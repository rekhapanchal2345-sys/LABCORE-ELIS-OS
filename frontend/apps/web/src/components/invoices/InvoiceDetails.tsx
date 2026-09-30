"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Printer, Crown } from "lucide-react";
import type { Invoice } from "./InvoiceTable";
import ProfessionalInvoice from "./ProfessionalInvoice";
import LuxuryGSTInvoice from "./LuxuryGSTInvoice";

interface InvoiceItem {
  id: string | number;
  testName?: string;
  testCode?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  amount?: number;
}

interface InvoiceDetailsProps {
  invoice: Invoice;
  items?: InvoiceItem[];
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  patientInfo?: {
    age?: string;
    gender?: string;
    phone?: string;
    address?: string;
    email?: string;
  };
  doctorInfo?: {
    name?: string;
    qualification?: string;
    gstin?: string;
    address?: string;
  };
  payments?: Array<{
    amount: number;
    method: string;
    transactionId?: string;
    paidAt: string;
  }>;

  onEdit?: () => void;
  onDelete?: () => void;
  onRecordPayment?: () => void;
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
    month: "long",
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

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium text-gray-800">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function InvoiceDetails({
  invoice,
  items = [],
  taxAmount = 0,
  discountAmount = 0,
  notes,
  patientInfo,
  doctorInfo,
  payments,
  onEdit,
  onDelete,
  onRecordPayment,
}: InvoiceDetailsProps) {
  const [viewMode, setViewMode] = useState<"details" | "professional" | "luxury">("details");

  const handlePrint = () => {
    if (viewMode === "luxury") {
      // Don't handle print here - let LuxuryGSTInvoice handle it
      return;
    }
    window.print();
  };

  const total = Number(
    invoice.totalAmount || 0
  );

  const paid = Number(
    invoice.paidAmount || 0
  );

  const pending =
    invoice.pendingAmount !== undefined
      ? Number(invoice.pendingAmount)
      : Math.max(0, total - paid);

  if (viewMode === "professional") {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setViewMode("details")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Details
          </button>
        </div>
        <ProfessionalInvoice
          invoice={invoice}
          items={items}
          taxAmount={taxAmount}
          discountAmount={discountAmount}
          notes={notes}
        />
      </div>
    );
  }

  if (viewMode === "luxury") {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setViewMode("details")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Details
          </button>
        </div>
        <LuxuryGSTInvoice
          invoice={invoice}
          items={items}
          taxAmount={taxAmount}
          discountAmount={discountAmount}
          notes={notes}
          patientInfo={patientInfo}
          doctorInfo={doctorInfo}
          payments={payments}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm avoid-break">
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {invoice.invoiceNumber ||
                    `INV-${invoice.id}`}
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                    invoice.paymentStatus ||
                      invoice.status
                  )}`}
                >
                  {invoice.paymentStatus ||
                    invoice.status ||
                    "Pending"}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Invoice date:{" "}
                {formatDate(invoice.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 no-print">
              <button
                type="button"
                onClick={() => setViewMode("professional")}
                className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                Professional View
              </button>

              <button
                type="button"
                onClick={() => setViewMode("luxury")}
                className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Luxury View
              </button>

              {(viewMode === "details" || viewMode === "professional") && (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
              )}

              {onRecordPayment && pending > 0 && (
                <button
                  type="button"
                  onClick={onRecordPayment}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Record Payment
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Patient Information */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm avoid-break">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Patient & Order Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Patient"
            value={
              invoice.patientId ? (
                <Link
                  href={`/patients/${invoice.patientId}`}
                  className="hover:underline"
                >
                  {invoice.patientName ||
                    `Patient #${invoice.patientId}`}
                </Link>
              ) : (
                invoice.patientName
              )
            }
          />

          <InfoItem
            label="Patient ID"
            value={invoice.patientId}
          />

          <InfoItem
            label="Order"
            value={
              invoice.orderId ? (
                <Link
                  href={`/orders/${invoice.orderId}`}
                  className="hover:underline"
                >
                  {invoice.orderNumber ||
                    `ORD-${invoice.orderId}`}
                </Link>
              ) : (
                "—"
              )
            }
          />

          <InfoItem
            label="Due Date"
            value={formatDate(invoice.dueDate)}
          />
        </dl>
      </section>

      {/* Invoice Items */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm avoid-break">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Invoice Items
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No invoice line items available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Test / Service
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Qty
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Unit Price
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Discount
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const quantity = Number(
                    item.quantity || 1
                  );

                  const amount =
                    item.amount !== undefined
                      ? Number(item.amount)
                      : Number(
                          item.unitPrice || 0
                        ) * quantity;

                  return (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {item.testName ||
                            "Laboratory Service"}
                        </p>

                        {item.testCode && (
                          <p className="mt-1 font-mono text-xs text-gray-400">
                            {item.testCode}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center text-sm text-gray-700">
                        {quantity}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-gray-700">
                        {formatCurrency(
                          item.unitPrice
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-gray-700">
                        {formatCurrency(
                          item.discount
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-semibold text-gray-800">
                        {formatCurrency(amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Summary */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm avoid-break">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Payment Summary
          </h2>
        </div>

        <div className="p-5">
          <div className="ml-auto max-w-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-medium text-gray-800">
                {formatCurrency(
                  total -
                    Number(taxAmount || 0) +
                    Number(discountAmount || 0)
                )}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Discount
                </span>

                <span className="font-medium text-red-600">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            {taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Tax
                </span>

                <span className="font-medium text-gray-800">
                  {formatCurrency(taxAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="font-semibold text-gray-900">
                Total
              </span>

              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(total)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Paid
              </span>

              <span className="font-semibold text-green-700">
                {formatCurrency(paid)}
              </span>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="font-semibold text-gray-900">
                Amount Due
              </span>

              <span className="text-lg font-bold text-red-600">
                {formatCurrency(pending)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}

      {notes && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm avoid-break">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Notes
            </h2>
          </div>

          <div className="p-5">
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {notes}
            </p>
          </div>
        </section>
      )}

      {/* Quick Actions */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm no-print">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Quick Actions
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 p-5">
          {invoice.orderId && (
            <Link
              href={`/orders/${invoice.orderId}`}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Order
            </Link>
          )}

          {invoice.patientId && (
            <Link
              href={`/patients/${invoice.patientId}`}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Patient
            </Link>
          )}

          <Link
            href={`/payments?invoiceId=${invoice.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Payment History
          </Link>
        </div>
      </section>
    </div>
  );
}