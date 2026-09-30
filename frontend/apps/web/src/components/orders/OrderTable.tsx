"use client";

import React from "react";
import Link from "next/link";

export interface LabOrder {
  id: string | number;
  orderNumber?: string;
  patientId?: string | number;
  patientName?: string;
  doctorName?: string;
  status?: string;
  priority?: string;
  totalAmount?: number;
  paidAmount?: number;
  pendingAmount?: number;
  sampleStatus?: string;
  createdAt?: string;
}

interface OrderTableProps {
  orders: LabOrder[];
  loading?: boolean;
  onDelete?: (order: LabOrder) => void;
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

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status?: string) {
  const value = status?.toLowerCase();

  if (
    value === "completed" ||
    value === "approved" ||
    value === "paid"
  ) {
    return "bg-green-500/20 text-green-400 border border-green-500/30";
  }

  if (
    value === "cancelled" ||
    value === "rejected"
  ) {
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  }

  if (
    value === "pending" ||
    value === "processing" ||
    value === "collected"
  ) {
    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  }

  return "bg-purple-500/20 text-purple-300/60 border border-purple-500/30";
}

function priorityClass(priority?: string) {
  const value = priority?.toLowerCase();

  if (value === "urgent" || value === "stat") {
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  }

  if (value === "high") {
    return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
  }

  return "bg-purple-500/20 text-purple-300/60 border border-purple-500/30";
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, row) => (
        <tr key={row}>
          {Array.from({ length: 8 }).map((__, cell) => (
            <td key={cell} className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-purple-500/20" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function OrderTable({
  orders,
  loading = false,
  onDelete,
}: OrderTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-lg shadow-purple-500/20">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-purple-500/20">
          <thead className="bg-purple-500/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-300/80">
                Order
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-300/80">
                Patient
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-300/80">
                Doctor
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-300/80">
                Priority
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-300/80">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-300/80">
                Amount
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-300/80">
                Date
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-purple-300/80">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-purple-500/20 bg-black/40">
            {loading ? (
              <LoadingRows />
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-16 text-center"
                >
                  <div className="text-2xl">📋</div>

                  <p className="mt-2 text-sm font-semibold text-purple-200">
                    No orders found
                  </p>

                  <p className="mt-1 text-sm text-purple-300/70">
                    Laboratory orders will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-purple-500/10 transition-colors"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-sm font-semibold text-purple-200 hover:text-cyan-400 transition-colors"
                    >
                      {order.orderNumber ||
                        `ORD-${order.id}`}
                    </Link>

                    <p className="mt-1 text-xs text-purple-300/70">
                      ID: {order.id}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    {order.patientId ? (
                      <Link
                        href={`/patients/${order.patientId}`}
                        className="text-sm font-medium text-purple-200 hover:text-cyan-400 transition-colors"
                      >
                        {order.patientName ||
                          `Patient #${order.patientId}`}
                      </Link>
                    ) : (
                      <span className="text-sm text-purple-300/80">
                        {order.patientName || "—"}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-purple-300/80">
                    {order.doctorName || "—"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass(
                        order.priority
                      )}`}
                    >
                      {order.priority || "Normal"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                        order.status
                      )}`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      {formatCurrency(
                        order.totalAmount
                      )}
                    </p>

                    {order.pendingAmount !==
                      undefined && (
                      <p className="mt-1 text-xs text-purple-300/70">
                        Due:{" "}
                        {formatCurrency(
                          order.pendingAmount
                        )}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-purple-300/80">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="rounded-md border border-purple-500/30 px-3 py-1.5 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20 hover:border-cyan-500/50 hover:text-cyan-400"
                      >
                        View
                      </Link>

                      <Link
                        href={`/orders/${order.id}?edit=true`}
                        className="rounded-md border border-purple-500/30 px-3 py-1.5 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20 hover:border-cyan-500/50 hover:text-cyan-400"
                      >
                        Edit
                      </Link>

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() =>
                            onDelete(order)
                          }
                          className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}