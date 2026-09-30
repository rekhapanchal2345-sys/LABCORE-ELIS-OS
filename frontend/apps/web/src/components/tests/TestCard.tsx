"use client";

import React from "react";
import Link from "next/link";
import type { LabTest } from "./TestTable";

interface TestCardProps {
  test: LabTest;
  onDelete?: (test: LabTest) => void;
}

function formatPrice(price?: number) {
  if (price === undefined || price === null) {
    return "—";
  }

  return `₹${price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function TestCard({
  test,
  onDelete,
}: TestCardProps) {
  const active = test.isActive !== false;

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
            🧪
          </div>

          <div className="min-w-0">
            <Link
              href={`/tests/${test.id}`}
              className="block truncate text-base font-semibold text-gray-900 hover:underline"
            >
              {test.name || "Unnamed Test"}
            </Link>

            <p className="mt-1 text-xs text-gray-500">
              {test.code ||
                test.testId ||
                `Test #${test.id}`}
            </p>
          </div>
        </div>

        <span
          className={
            active
              ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
              : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
          }
        >
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400">
            Category
          </p>

          <p className="mt-1 truncate text-sm font-medium text-gray-800">
            {test.category || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Department
          </p>

          <p className="mt-1 truncate text-sm font-medium text-gray-800">
            {test.department || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Sample Type
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {test.sampleType || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Price
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-900">
            {formatPrice(test.price)}
          </p>
        </div>
      </div>

      {test.turnaroundTime && (
        <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-400">
            Turnaround Time
          </p>

          <p className="mt-1 text-sm text-gray-700">
            {test.turnaroundTime}
          </p>
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Link
          href={`/tests/${test.id}`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          View
        </Link>

        <Link
          href={`/tests/${test.id}?edit=true`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit
        </Link>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(test)}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}