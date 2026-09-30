"use client";

import React from "react";
import Link from "next/link";
import type { LabSample } from "./SampleTable";

interface SampleCardProps {
  sample: LabSample;
  onDelete?: (sample: LabSample) => void;
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
    value === "received" ||
    value === "approved"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    value === "rejected" ||
    value === "cancelled"
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    value === "pending" ||
    value === "collected" ||
    value === "processing"
  ) {
    return "bg-yellow-50 text-yellow-700";
  }

  return "bg-gray-100 text-gray-600";
}

export default function SampleCard({
  sample,
  onDelete,
}: SampleCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
            🧪
          </div>

          <div className="min-w-0">
            <Link
              href={`/samples/${sample.id}`}
              className="block truncate text-base font-semibold text-gray-900 hover:underline"
            >
              {sample.sampleNumber ||
                `SMP-${sample.id}`}
            </Link>

            <p className="mt-1 font-mono text-xs text-gray-500">
              {sample.barcode || "No barcode"}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
            sample.status
          )}`}
        >
          {sample.status || "Pending"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <p className="text-xs text-gray-400">
            Patient
          </p>

          {sample.patientId ? (
            <Link
              href={`/patients/${sample.patientId}`}
              className="mt-1 block text-sm font-semibold text-gray-800 hover:underline"
            >
              {sample.patientName ||
                `Patient #${sample.patientId}`}
            </Link>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {sample.patientName || "—"}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Order
          </p>

          {sample.orderId ? (
            <Link
              href={`/orders/${sample.orderId}`}
              className="mt-1 block text-sm font-medium text-gray-700 hover:underline"
            >
              {sample.orderNumber ||
                `ORD-${sample.orderId}`}
            </Link>
          ) : (
            <p className="mt-1 text-sm text-gray-700">
              —
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Sample Type
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {sample.sampleType || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Collected By
          </p>

          <p className="mt-1 text-sm text-gray-700">
            {sample.collectedBy || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Collected At
          </p>

          <p className="mt-1 text-sm text-gray-700">
            {formatDate(sample.collectedAt)}
          </p>
        </div>
      </div>

      {sample.rejectedReason && (
        <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs font-medium text-red-700">
            Rejection Reason
          </p>

          <p className="mt-1 text-sm text-red-600">
            {sample.rejectedReason}
          </p>
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Link
          href={`/samples/${sample.id}`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          View
        </Link>

        <Link
          href={`/samples/${sample.id}?edit=true`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit
        </Link>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(sample)}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}