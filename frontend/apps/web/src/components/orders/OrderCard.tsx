"use client";

import React from "react";
import Link from "next/link";
import type { LabOrder } from "./OrderTable";

interface OrderCardProps {
  order: LabOrder;
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

  if (
    value === "urgent" ||
    value === "stat"
  ) {
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  }

  if (value === "high") {
    return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
  }

  return "bg-purple-500/20 text-purple-300/60 border border-purple-500/30";
}

export default function OrderCard({
  order,
  onDelete,
}: OrderCardProps) {
  return (
    <article className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl p-5 shadow-lg shadow-purple-500/20 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/orders/${order.id}`}
            className="text-base font-bold text-purple-200 hover:text-cyan-400 transition-colors"
          >
            {order.orderNumber ||
              `ORD-${order.id}`}
          </Link>

          <p className="mt-1 text-xs text-purple-300/70">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
            order.status
          )}`}
        >
          {order.status || "Pending"}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs text-purple-400/60">
            Patient
          </p>

          {order.patientId ? (
            <Link
              href={`/patients/${order.patientId}`}
              className="mt-1 block text-sm font-semibold text-purple-200 hover:text-cyan-400 transition-colors"
            >
              {order.patientName ||
                `Patient #${order.patientId}`}
            </Link>
          ) : (
            <p className="mt-1 text-sm font-semibold text-purple-200">
              {order.patientName || "—"}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-purple-400/60">
            Referring Doctor
          </p>

          <p className="mt-1 text-sm text-purple-300/80">
            {order.doctorName || "—"}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-400/60">
              Priority
            </p>

            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass(
                order.priority
              )}`}
            >
              {order.priority || "Normal"}
            </span>
          </div>

          <div className="text-right">
            <p className="text-xs text-purple-400/60">
              Total
            </p>

            <p className="mt-1 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        {order.pendingAmount !==
          undefined && (
          <div className="rounded-lg bg-purple-500/10 px-3 py-2 border border-purple-500/20">
            <div className="flex justify-between">
              <span className="text-xs text-purple-400/60">
                Amount Due
              </span>

              <span className="text-xs font-semibold text-purple-200">
                {formatCurrency(
                  order.pendingAmount
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-purple-500/20 pt-4">
        <Link
          href={`/orders/${order.id}`}
          className="rounded-lg border border-purple-500/30 px-3 py-2 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20 hover:border-cyan-500/50 hover:text-cyan-400"
        >
          View
        </Link>

        <Link
          href={`/orders/${order.id}?edit=true`}
          className="rounded-lg border border-purple-500/30 px-3 py-2 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20 hover:border-cyan-500/50 hover:text-cyan-400"
        >
          Edit
        </Link>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(order)}
            className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}