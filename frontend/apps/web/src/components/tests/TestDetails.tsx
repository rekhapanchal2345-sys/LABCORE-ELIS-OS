"use client";

import React from "react";
import Link from "next/link";
import type { LabTest } from "./TestTable";

interface TestDetailsProps {
  test: LabTest;
  onEdit?: () => void;
  onDelete?: () => void;
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

export default function TestDetails({
  test,
  onEdit,
  onDelete,
}: TestDetailsProps) {
  const active = test.isActive !== false;

  return (
    <div className="space-y-6">
      {/* Header */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                🧪
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">
                    {test.name || "Unnamed Test"}
                  </h1>

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

                <p className="mt-1 text-sm text-gray-500">
                  Test Code:{" "}
                  <span className="font-medium text-gray-700">
                    {test.code ||
                      test.testId ||
                      test.id}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit Test
                </button>
              )}

              <Link
                href={`/orders/new?testId=${test.id}`}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Create Order
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

      {/* Test Information */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Test Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Test Name"
            value={test.name}
          />

          <InfoItem
            label="Test Code"
            value={test.code || test.testId}
          />

          <InfoItem
            label="Category"
            value={test.category}
          />

          <InfoItem
            label="Department"
            value={test.department}
          />

          <InfoItem
            label="Sample Type"
            value={test.sampleType}
          />

          <InfoItem
            label="Price"
            value={formatPrice(test.price)}
          />

          <InfoItem
            label="Turnaround Time"
            value={test.turnaroundTime}
          />

          <InfoItem
            label="Status"
            value={active ? "Active" : "Inactive"}
          />
        </dl>
      </section>

      {/* Operational Information */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Operational Information
          </h2>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-gray-400">
              Laboratory Department
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              {test.department || "Not specified"}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-gray-400">
              Sample Type
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              {test.sampleType || "Not specified"}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-gray-400">
              Turnaround Time
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              {test.turnaroundTime || "Not specified"}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Quick Actions
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 p-5">
          <Link
            href={`/orders/new?testId=${test.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Create Test Order
          </Link>

          <Link
            href={`/results?testId=${test.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Results
          </Link>

          <Link
            href={`/reports?testId=${test.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Reports
          </Link>
        </div>
      </section>
    </div>
  );
}