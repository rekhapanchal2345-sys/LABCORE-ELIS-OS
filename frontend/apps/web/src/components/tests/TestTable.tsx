"use client";

import React from "react";
import Link from "next/link";

export interface LabTest {
  id: string | number;
  testId?: string;
  code?: string;
  name?: string;
  category?: string;
  department?: string;
  sampleType?: string;
  price?: number;
  turnaroundTime?: string;
  isActive?: boolean;
}

interface TestTableProps {
  tests: LabTest[];
  loading?: boolean;
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

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: 7 }).map((__, cell) => (
            <td key={cell} className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function TestTable({
  tests,
  loading = false,
  onDelete,
}: TestTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Test
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Code
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Category
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sample
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Price
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRows />
            ) : tests.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center"
                >
                  <div className="text-2xl">🧪</div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    No tests found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Laboratory tests will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              tests.map((test) => {
                const active =
                  test.isActive !== false;

                return (
                  <tr
                    key={test.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/tests/${test.id}`}
                        className="text-sm font-semibold text-gray-900 hover:underline"
                      >
                        {test.name || "Unnamed Test"}
                      </Link>

                      {test.department && (
                        <p className="mt-1 text-xs text-gray-500">
                          {test.department}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {test.code ||
                        test.testId ||
                        "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {test.category || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {test.sampleType || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-gray-800">
                      {formatPrice(test.price)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          active
                            ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                        }
                      >
                        {active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/tests/${test.id}`}
                          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </Link>

                        <Link
                          href={`/tests/${test.id}?edit=true`}
                          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </Link>

                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(test)}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}