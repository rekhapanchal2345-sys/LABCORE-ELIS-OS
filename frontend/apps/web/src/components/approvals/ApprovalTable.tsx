"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface Approval {
  id: string | number;
  resultId?: string | number;
  resultNumber?: string;
  orderId?: string;
  orderNumber?: string;
  barcode?: string;
  patientId?: string | number;
  patientName?: string;
  patientUhid?: string;
  patientAge?: number;
  patientGender?: string;
  testId?: string | number;
  testName?: string;
  testCode?: string;
  submittedBy?: string;
  submittedAt?: string;
  assignedPathologist?: string;
  status?: string;
  abnormalCount?: number;
  criticalValues?: string[];
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  remarks?: string;
  onReview?: () => void;
  onRerun?: () => void;
}

interface ApprovalTableProps {
  approvals: Approval[];
  loading?: boolean;
  onApprove?: (approval: Approval) => void;
  onReject?: (approval: Approval) => void;
  onReview?: (approval: Approval) => void;
  onRerun?: (approval: Approval, reason: string) => void;
  selectedApprovals?: Set<string | number>;
  onSelectApproval?: (approvalId: string | number) => void;
  onSelectAll?: (selected: boolean) => void;
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status?: string) {
  const value = status?.toLowerCase();

  if (
    value === "approved" ||
    value === "completed"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (
    value === "rejected" ||
    value === "cancelled"
  ) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (
    value?.includes("verified") ||
    value === "ready"
  ) {
    return "bg-blue-50 text-blue-700 border-blue-200 font-bold";
  }

  if (
    value?.includes("pending") ||
    value?.includes("entry") ||
    value === "submitted" ||
    value === "under_review" ||
    value === "registered"
  ) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }

  return "bg-gray-100 text-gray-600 border-gray-200";
}

function getAbnormalityBadge(count?: number, criticalValues?: string[]) {
  if (criticalValues && criticalValues.length > 0) {
    return (
      <div className="flex flex-col gap-0.5 items-start">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200 animate-pulse">
          🚨 {criticalValues.length} Critical Panic
        </span>
        <span className="text-[10px] text-red-600 font-semibold truncate max-w-[140px]" title={criticalValues.join(", ")}>
          {criticalValues.join(", ")}
        </span>
      </div>
    );
  }

  if (count && count > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
        ⚠️ {count} Abnormal
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
      ⚡ Normal
    </span>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, row) => (
        <tr key={row}>
          {Array.from({ length: 9 }).map((__, cell) => (
            <td key={cell} className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ApprovalTable({
  approvals,
  loading = false,
  onApprove,
  onReject,
  onReview,
  onRerun,
  selectedApprovals = new Set(),
  onSelectApproval,
  onSelectAll,
}: ApprovalTableProps) {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (onSelectAll) {
      onSelectAll(checked);
    }
  };

  const handleSelectApproval = (approvalId: string | number) => {
    if (onSelectApproval) {
      onSelectApproval(approvalId);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Order / Report ID
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Patient Info
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Test / Panel Name
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Abnormalities
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Assigned Pathologist
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Submission Time
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
            ) : approvals.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-16 text-center"
                >
                  <div className="text-3xl">
                    ✓
                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    No approvals found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Results waiting for review will
                    appear here.
                  </p>
                </td>
              </tr>
            ) : (
              approvals.map((approval) => {
                const pending =
                  !approval.status ||
                  approval.status.toLowerCase() ===
                    "pending" ||
                  approval.status.toLowerCase() ===
                    "submitted" ||
                  approval.status.toLowerCase() ===
                    "under_review" ||
                  approval.status.toLowerCase() ===
                    "verified";

                const isSelected = selectedApprovals.has(approval.id);

                return (
                  <tr
                    key={approval.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectApproval(approval.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {approval.orderNumber && (
                          <Link
                            href={`/orders/${approval.orderId}`}
                            className="text-sm font-semibold text-gray-900 hover:underline"
                          >
                            {approval.orderNumber}
                          </Link>
                        )}
                        {approval.barcode && (
                          <p className="font-mono text-xs text-gray-400">
                            {approval.barcode}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {approval.patientId ? (
                          <Link
                            href={`/patients/${approval.patientId}`}
                            className="text-sm font-medium text-gray-800 hover:underline"
                          >
                            {approval.patientName ||
                              `Patient #${approval.patientId}`}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-600">
                            {approval.patientName || "—"}
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {approval.patientUhid && (
                            <span className="font-mono">
                              {approval.patientUhid}
                            </span>
                          )}
                          {approval.patientAge && (
                            <>
                              <span>•</span>
                              <span>{approval.patientAge}Y</span>
                            </>
                          )}
                          {approval.patientGender && (
                            <>
                              <span>•</span>
                              <span>{approval.patientGender}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {approval.testName || "Laboratory Test"}
                      </p>

                      {approval.testCode && (
                        <p className="mt-1 font-mono text-xs text-gray-400">
                          {approval.testCode}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {getAbnormalityBadge(approval.abnormalCount, approval.criticalValues)}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {approval.assignedPathologist || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(approval.submittedAt)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${statusClass(
                          approval.status
                        )}`}
                      >
                        {approval.status || "Pending"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {approval.status?.toLowerCase().includes("pending") || approval.status === "PENDING" ? (
                          <Link
                            href="/results"
                            className="rounded-lg bg-amber-50 border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <span>✍️</span>
                            <span>Enter Results</span>
                          </Link>
                        ) : (
                          <>
                            {onReview && (
                              <button
                                type="button"
                                onClick={() => onReview(approval)}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-colors"
                              >
                                Review & Sign
                              </button>
                            )}

                            {pending && onApprove && (
                              <button
                                type="button"
                                onClick={() => onApprove(approval)}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-colors"
                              >
                                Quick Approve
                              </button>
                            )}

                            {pending && onRerun && (
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = prompt("Please enter the rerun reason (required):");
                                  if (reason && reason.trim()) {
                                    onRerun(approval, reason);
                                  }
                                }}
                                className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                              >
                                Rerun Sample
                              </button>
                            )}

                            {pending && onReject && (
                              <button
                                type="button"
                                onClick={() => onReject(approval)}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Reject
                              </button>
                            )}
                          </>
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
