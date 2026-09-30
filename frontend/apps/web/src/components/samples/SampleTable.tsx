"use client";

import React from "react";
import Link from "next/link";

export interface LabSample {
  id: string | number;
  sampleNumber?: string;
  barcode?: string;
  patientId?: string | number;
  patientName?: string;
  orderId?: string | number;
  orderNumber?: string;
  sampleType?: string;
  status?: string;
  collectedBy?: string;
  collectedAt?: string;
  receivedAt?: string;
  rejectedReason?: string;
}

interface SampleTableProps {
  samples: LabSample[];
  loading?: boolean;
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

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, row) => (
        <tr key={row}>
          {Array.from({ length: 8 }).map((__, cell) => (
            <td key={cell} className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function SampleTable({
  samples,
  loading = false,
  onDelete,
}: SampleTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sample
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Barcode
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Patient
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Order
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sample Type
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Collected
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRows />
            ) : samples.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-16 text-center"
                >
                  <div className="text-2xl">
                    🧪
                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    No samples found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Collected laboratory samples will
                    appear here.
                  </p>
                </td>
              </tr>
            ) : (
              samples.map((sample) => (
                <tr
                  key={sample.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/samples/${sample.id}`}
                      className="text-sm font-semibold text-gray-900 hover:underline"
                    >
                      {sample.sampleNumber ||
                        `SMP-${sample.id}`}
                    </Link>

                    <p className="mt-1 text-xs text-gray-500">
                      ID: {sample.id}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                      {sample.barcode || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {sample.patientId ? (
                      <Link
                        href={`/patients/${sample.patientId}`}
                        className="text-sm font-medium text-gray-800 hover:underline"
                      >
                        {sample.patientName ||
                          `Patient #${sample.patientId}`}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {sample.patientName || "—"}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {sample.orderId ? (
                      <Link
                        href={`/orders/${sample.orderId}`}
                        className="text-sm font-medium text-gray-700 hover:underline"
                      >
                        {sample.orderNumber ||
                          `ORD-${sample.orderId}`}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {sample.sampleType || "—"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                        sample.status
                      )}`}
                    >
                      {sample.status || "Pending"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatDate(sample.collectedAt)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/samples/${sample.id}`}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </Link>

                      <Link
                        href={`/samples/${sample.id}?edit=true`}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() =>
                            onDelete(sample)
                          }
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
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