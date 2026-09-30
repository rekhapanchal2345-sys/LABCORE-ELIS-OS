"use client";

import React from "react";
import Link from "next/link";

export interface LabResult {
  id: string | number;
  resultNumber?: string;
  patientId?: string | number;
  patientName?: string;
  orderId?: string | number;
  orderNumber?: string;
  testId?: string | number;
  testName?: string;
  testCode?: string;
  resultValue?: string | number;
  unit?: string;
  referenceRange?: string;
  status?: string;
  enteredBy?: string;
  approvedBy?: string;
  createdAt?: string;
  approvedAt?: string;
}

interface ResultTableProps {
  results: LabResult[];
  loading?: boolean;
  onDelete?: (result: LabResult) => void;
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
    value === "approved" ||
    value === "completed" ||
    value === "normal"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    value === "rejected" ||
    value === "cancelled" ||
    value === "abnormal"
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    value === "pending" ||
    value === "draft" ||
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

export default function ResultTable({
  results,
  loading = false,
  onDelete,
}: ResultTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Result
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Patient
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Test
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Result Value
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Reference
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRows />
            ) : results.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-16 text-center"
                >
                  <div className="text-3xl">
                    🧪
                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    No results found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Laboratory test results will appear
                    here.
                  </p>
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr
                  key={result.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/results/${result.id}`}
                      className="text-sm font-semibold text-gray-900 hover:underline"
                    >
                      {result.resultNumber ||
                        `RES-${result.id}`}
                    </Link>

                    <p className="mt-1 text-xs text-gray-500">
                      ID: {result.id}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    {result.patientId ? (
                      <Link
                        href={`/patients/${result.patientId}`}
                        className="text-sm font-medium text-gray-800 hover:underline"
                      >
                        {result.patientName ||
                          `Patient #${result.patientId}`}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {result.patientName ||
                          "—"}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-gray-800">
                      {result.testName ||
                        "Laboratory Test"}
                    </p>

                    {result.testCode && (
                      <p className="mt-1 font-mono text-xs text-gray-400">
                        {result.testCode}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {result.resultValue ?? "—"}
                    </span>

                    {result.unit && (
                      <span className="ml-1 text-xs text-gray-500">
                        {result.unit}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {result.referenceRange || "—"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                        result.status
                      )}`}
                    >
                      {result.status || "Pending"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatDate(result.createdAt)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/results/${result.id}`}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </Link>

                      <Link
                        href={`/results/${result.id}?edit=true`}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() =>
                            onDelete(result)
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