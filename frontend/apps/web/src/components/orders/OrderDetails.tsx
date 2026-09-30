"use client";

import React from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import type { LabOrder } from "./OrderTable";

interface OrderDetailsProps {
  order: LabOrder;
  tests?: Array<{
    id: string | number;
    name: string;
    code?: string;
    price?: number;
  }>;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) {
    return "₹0.00";
  }

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status?: string) {
  const value = status?.toLowerCase();

  if (
    value === "completed" ||
    value === "approved" ||
    value === "paid"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    value === "cancelled" ||
    value === "rejected"
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    value === "pending" ||
    value === "processing" ||
    value === "collected"
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

export default function OrderDetails({
  order,
  tests = [],
  onEdit,
  onDelete,
}: OrderDetailsProps) {
  const total = Number(order.totalAmount || 0);
  const paid = Number(order.paidAmount || 0);

  const pending =
    order.pendingAmount !== undefined
      ? Number(order.pendingAmount)
      : Math.max(0, total - paid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm avoid-break">
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {order.orderNumber ||
                    `ORD-${order.id}`}
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                    order.status
                  )}`}
                >
                  {order.status || "Pending"}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Created {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 no-print">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit Order
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>

              <Link
                href={`/invoices?orderId=${order.id}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Invoice
              </Link>

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

      {/* Patient & Doctor */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm avoid-break">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Patient & Referral
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Patient"
            value={
              order.patientId ? (
                <Link
                  href={`/patients/${order.patientId}`}
                  className="hover:underline"
                >
                  {order.patientName ||
                    `Patient #${order.patientId}`}
                </Link>
              ) : (
                order.patientName
              )
            }
          />

          <InfoItem
            label="Patient ID"
            value={order.patientId}
          />

          <InfoItem
            label="Referring Doctor"
            value={order.doctorName}
          />

          <InfoItem
            label="Priority"
            value={order.priority || "Normal"}
          />
        </dl>
      </section>

      {/* Tests */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm avoid-break">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Ordered Tests
          </h2>
        </div>

        {tests.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No test details available for this order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Test
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Code
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {test.name}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {test.code || "—"}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-gray-800">
                      {formatCurrency(test.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Billing */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm avoid-break">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Billing Summary
          </h2>
        </div>

        <div className="p-5">
          <div className="ml-auto max-w-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Total Amount
              </span>

              <span className="font-semibold text-gray-800">
                {formatCurrency(total)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Paid Amount
              </span>

              <span className="font-semibold text-green-700">
                {formatCurrency(paid)}
              </span>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="font-semibold text-gray-900">
                Pending Amount
              </span>

              <span
                className={`font-bold ${
                  pending > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {formatCurrency(pending)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Status */}

      {order.sampleStatus && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm avoid-break">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Sample Status
            </h2>
          </div>

          <div className="p-5">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${statusClass(
                order.sampleStatus
              )}`}
            >
              {order.sampleStatus}
            </span>
          </div>
        </section>
      )}

      {/* Actions */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm no-print">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Quick Actions
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 p-5">
          <Link
            href={`/samples?orderId=${order.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Manage Sample
          </Link>

          <Link
            href={`/results?orderId=${order.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Results
          </Link>

          <Link
            href={`/payments?orderId=${order.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Payments
          </Link>
        </div>
      </section>
    </div>
  );
}