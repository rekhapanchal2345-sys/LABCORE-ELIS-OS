"use client";

import React from "react";
import Link from "next/link";
import type { LabResult } from "./ResultTable";

interface ResultDetailsProps {
  result: LabResult;

  interpretation?: string;
  comments?: string;
  criticalValue?: boolean;

  onEdit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
}

function formatDate(
  date?: string,
  includeTime = false
) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
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

export default function ResultDetails({
  result,
  interpretation,
  comments,
  criticalValue = false,
  onEdit,
  onApprove,
  onReject,
  onDelete,
  onPrint,
}: ResultDetailsProps) {
  const status = result.status?.toLowerCase();

  const canApprove =
    status !== "approved" &&
    status !== "completed" &&
    status !== "rejected";

  return (
    <div className="space-y-6">
      {/* Header */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {result.resultNumber ||
                    `RES-${result.id}`}
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                    result.status
                  )}`}
                >
                  {result.status || "Pending"}
                </span>

                {criticalValue && (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    Critical
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Created:{" "}
                {formatDate(result.createdAt, true)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
              )}

              {canApprove && onApprove && (
                <button
                  type="button"
                  onClick={onApprove}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Approve
                </button>
              )}

              {canApprove && onReject && (
                <button
                  type="button"
                  onClick={onReject}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Reject
                </button>
              )}

              <button
                type="button"
                onClick={
                  onPrint || (() => window.print())
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Print
              </button>

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

      {/* Patient / Order / Test */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Result Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Patient"
            value={
              result.patientId ? (
                <Link
                  href={`/patients/${result.patientId}`}
                  className="hover:underline"
                >
                  {result.patientName ||
                    `Patient #${result.patientId}`}
                </Link>
              ) : (
                result.patientName
              )
            }
          />

          <InfoItem
            label="Patient ID"
            value={result.patientId}
          />

          <InfoItem
            label="Order"
            value={
              result.orderId ? (
                <Link
                  href={`/orders/${result.orderId}`}
                  className="hover:underline"
                >
                  {result.orderNumber ||
                    `ORD-${result.orderId}`}
                </Link>
              ) : (
                "—"
              )
            }
          />

          <InfoItem
            label="Test"
            value={
              <span>
                {result.testName ||
                  "Laboratory Test"}

                {result.testCode && (
                  <span className="ml-2 font-mono text-xs text-gray-400">
                    {result.testCode}
                  </span>
                )}
              </span>
            }
          />
        </dl>
      </section>

      {/* Result Value */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Laboratory Result
          </h2>
        </div>

        <div className="p-5">
          <div
            className={`rounded-xl border p-6 ${
              criticalValue
                ? "border-red-200 bg-red-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Observed Value
            </p>

            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {result.resultValue ?? "—"}
              </span>

              {result.unit && (
                <span className="text-base font-medium text-gray-500">
                  {result.unit}
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Reference Range
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {result.referenceRange ||
                    "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Result Status
                </p>

                <p className="mt-1">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                      result.status
                    )}`}
                  >
                    {result.status || "Pending"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interpretation */}

      {(interpretation ||
        comments ||
        criticalValue) && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Clinical Information
            </h2>
          </div>

          <div className="space-y-5 p-5">
            {criticalValue && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-800">
                  Critical Result Alert
                </p>

                <p className="mt-1 text-sm text-red-700">
                  This result has been marked as
                  critical and should be reviewed
                  according to your laboratory's
                  clinical procedures.
                </p>
              </div>
            )}

            {interpretation && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Interpretation
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {interpretation}
                </p>
              </div>
            )}

            {comments && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Comments
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {comments}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Audit / Approval */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Result Workflow
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Entered By"
            value={result.enteredBy}
          />

          <InfoItem
            label="Created"
            value={formatDate(
              result.createdAt,
              true
            )}
          />

          <InfoItem
            label="Approved By"
            value={result.approvedBy}
          />

          <InfoItem
            label="Approved At"
            value={formatDate(
              result.approvedAt,
              true
            )}
          />
        </dl>
      </section>

      {/* Navigation */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 p-5">
          {result.patientId && (
            <Link
              href={`/patients/${result.patientId}`}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Patient
            </Link>
          )}

          {result.orderId && (
            <Link
              href={`/orders/${result.orderId}`}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Order
            </Link>
          )}

          <Link
            href="/results"
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            All Results
          </Link>
        </div>
      </section>
    </div>
  );
}