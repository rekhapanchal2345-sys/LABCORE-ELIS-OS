"use client";

import React from "react";
import Link from "next/link";
import type { Approval } from "./ApprovalTable";

interface ApprovalCardProps {
  approval: Approval;
  onApprove?: (approval: Approval) => void;
  onReject?: (approval: Approval) => void;
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
    value === "completed"
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
    value === "submitted" ||
    value === "under_review"
  ) {
    return "bg-yellow-50 text-yellow-700";
  }

  return "bg-gray-100 text-gray-600";
}

export default function ApprovalCard({
  approval,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const pending =
    !approval.status ||
    ["pending", "submitted", "under_review"].includes(
      approval.status.toLowerCase()
    );

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
            ✓
          </div>

          <div className="min-w-0">
            {approval.resultId ? (
              <Link
                href={`/results/${approval.resultId}`}
                className="block truncate text-base font-semibold text-gray-900 hover:underline"
              >
                {approval.resultNumber ||
                  `RES-${approval.resultId}`}
              </Link>
            ) : (
              <p className="truncate text-base font-semibold text-gray-900">
                {approval.resultNumber ||
                  `APR-${approval.id}`}
              </p>
            )}

            <p className="mt-1 text-xs text-gray-500">
              Submitted{" "}
              {formatDate(
                approval.submittedAt
              )}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
            approval.status
          )}`}
        >
          {approval.status || "Pending"}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs text-gray-400">
            Patient
          </p>

          {approval.patientId ? (
            <Link
              href={`/patients/${approval.patientId}`}
              className="mt-1 block text-sm font-semibold text-gray-800 hover:underline"
            >
              {approval.patientName ||
                `Patient #${approval.patientId}`}
            </Link>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {approval.patientName || "—"}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Test
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-800">
            {approval.testName ||
              "Laboratory Test"}
          </p>

          {approval.testCode && (
            <p className="mt-1 font-mono text-xs text-gray-400">
              {approval.testCode}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
          <div>
            <p className="text-xs text-gray-400">
              Submitted By
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {approval.submittedBy || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Approved By
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {approval.approvedBy || "—"}
            </p>
          </div>
        </div>

        {approval.rejectionReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold text-red-800">
              Rejection Reason
            </p>

            <p className="mt-1 text-sm text-red-700">
              {approval.rejectionReason}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
        {approval.resultId && (
          <Link
            href={`/results/${approval.resultId}`}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Review Result
          </Link>
        )}

        {pending && onApprove && (
          <button
            type="button"
            onClick={() => onApprove(approval)}
            className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
          >
            Approve
          </button>
        )}

        {pending && onReject && (
          <button
            type="button"
            onClick={() => onReject(approval)}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Reject
          </button>
        )}
      </div>
    </article>
  );
}