"use client";

import React from "react";
import Link from "next/link";
import type { LabResult } from "./ResultTable";

interface ResultCardProps {
  result: LabResult;
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

export default function ResultCard({
  result,
  onDelete,
}: ResultCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
            🧪
          </div>

          <div className="min-w-0">
            <Link
              href={`/results/${result.id}`}
              className="block truncate text-base font-semibold text-gray-900 hover:underline"
            >
              {result.resultNumber ||
                `RES-${result.id}`}
            </Link>

            <p className="mt-1 text-xs text-gray-500">
              {formatDate(result.createdAt)}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
            result.status
          )}`}
        >
          {result.status || "Pending"}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs text-gray-400">
            Patient
          </p>

          {result.patientId ? (
            <Link
              href={`/patients/${result.patientId}`}
              className="mt-1 block text-sm font-semibold text-gray-800 hover:underline"
            >
              {result.patientName ||
                `Patient #${result.patientId}`}
            </Link>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {result.patientName || "—"}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Test
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-800">
            {result.testName ||
              "Laboratory Test"}
          </p>

          {result.testCode && (
            <p className="mt-1 font-mono text-xs text-gray-400">
              {result.testCode}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs text-gray-400">
            Result Value
          </p>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">
              {result.resultValue ?? "—"}
            </span>

            {result.unit && (
              <span className="text-sm text-gray-500">
                {result.unit}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Reference:{" "}
            {result.referenceRange || "Not specified"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">
              Entered By
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {result.enteredBy || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Approved By
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {result.approvedBy || "—"}
            </p>
          </div>
        </div>

        {result.approvedAt && (
          <div>
            <p className="text-xs text-gray-400">
              Approved At
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDate(result.approvedAt)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Link
          href={`/results/${result.id}`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          View
        </Link>

        <Link
          href={`/results/${result.id}?edit=true`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit
        </Link>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(result)}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}