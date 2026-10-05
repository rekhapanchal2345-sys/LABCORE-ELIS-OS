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
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status?: string) {
  const value = status?.toLowerCase();
  if (value === "approved" || value === "completed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
  if (value === "rejected" || value === "cancelled") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  }
  if (value?.includes("verified") || value === "ready") {
    return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-bold";
  }
  if (
    value?.includes("pending") ||
    value?.includes("entry") ||
    value === "submitted" ||
    value === "under_review" ||
    value === "registered"
  ) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }
  return "border-slate-700 bg-slate-800 text-slate-400";
}

function getAbnormalityBadge(count?: number, criticalValues?: string[]) {
  if (criticalValues && criticalValues.length > 0) {
    return (
      <div className="flex flex-col gap-0.5 items-start">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-300 animate-pulse">
          🚨 {criticalValues.length} Critical Panic
        </span>
        <span className="text-[10px] text-rose-400 font-semibold truncate max-w-[140px]" title={criticalValues.join(", ")}>
          {criticalValues.join(", ")}
        </span>
      </div>
    );
  }
  if (count && count > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
        ⚠️ {count} Abnormal
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
      ⚡ Normal
    </span>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, row) => (
        <tr key={row} className="border-t border-slate-800">
          {Array.from({ length: 9 }).map((__, cell) => (
            <td key={cell} className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
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
    if (onSelectAll) onSelectAll(checked);
  };

  const handleSelectApproval = (approvalId: string | number) => {
    if (onSelectApproval) onSelectApproval(approvalId);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/80">
      {/* Table command bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-cyan-400 shadow-lg shadow-cyan-500/10">
            📋
          </span>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Pathologist Approval Queue</h2>
            <p className="text-xs text-slate-400">Sign-off verification and clinical review lane</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 shadow-sm">
            {approvals.length} in queue
          </span>
          <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-300 shadow-sm">
            {approvals.filter(a => a.criticalValues && a.criticalValues.length > 0).length} critical
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 shadow-sm">
            {approvals.filter(a => !a.abnormalCount || a.abnormalCount === 0).length} normal
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
            <tr>
              <th className="border-r border-slate-800 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-cyan-500"
                />
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Order / Report ID</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Accession chain</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Patient Info</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Identity + UHID</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Test / Panel Name</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Clinical scope</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Abnormalities</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Flag severity</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Assigned Pathologist</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Sign-off owner</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Submission Time</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Verified at</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Status</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Queue state</span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Actions</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Workflow controls</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/70">
            {loading ? (
              <LoadingRows />
            ) : approvals.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center">
                  <div className="text-3xl text-slate-600">✓</div>
                  <p className="mt-2 text-sm font-semibold text-slate-300">No approvals found</p>
                  <p className="mt-1 text-sm text-slate-500">Results waiting for review will appear here.</p>
                </td>
              </tr>
            ) : (
              approvals.map((approval) => {
                const pending =
                  !approval.status ||
                  approval.status.toLowerCase() === "pending" ||
                  approval.status.toLowerCase() === "submitted" ||
                  approval.status.toLowerCase() === "under_review" ||
                  approval.status.toLowerCase() === "verified";

                const isCritical = approval.criticalValues && approval.criticalValues.length > 0;
                const isSelected = selectedApprovals.has(approval.id);

                return (
                  <tr
                    key={approval.id}
                    className={`group transition-colors ${
                      isCritical
                        ? "border-l-4 border-l-rose-500 bg-rose-950/10 hover:bg-rose-950/20"
                        : isSelected
                          ? "border-l-4 border-l-cyan-500 bg-cyan-950/10"
                          : "bg-slate-950 hover:bg-slate-900/60"
                    }`}
                  >
                    <td className="border-r border-slate-800 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectApproval(approval.id)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-cyan-500"
                      />
                    </td>

                    <td className="border-r border-slate-800 px-4 py-4">
                      <div className="space-y-1">
                        {approval.orderNumber && (
                          <Link
                            href={`/orders/${approval.orderId}`}
                            className="font-mono text-sm font-bold text-white hover:text-cyan-300 transition-colors"
                          >
                            {approval.orderNumber}
                          </Link>
                        )}
                        {approval.barcode && (
                          <p className="font-mono text-xs text-slate-500">
                            {approval.barcode}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="border-r border-slate-800 px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-[10px] ring-1 ring-cyan-500/30 shadow-md shadow-cyan-600/20 shrink-0">
                            {(approval.patientName || "?").slice(0, 2).toUpperCase()}
                          </span>
                          {approval.patientId ? (
                            <Link
                              href={`/patients/${approval.patientId}`}
                              className="text-sm font-semibold text-slate-200 hover:text-cyan-300 transition-colors"
                            >
                              {approval.patientName || `Patient #${approval.patientId}`}
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-300">
                              {approval.patientName || "—"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 pl-9">
                          {approval.patientUhid && (
                            <span className="font-mono">{approval.patientUhid}</span>
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

                    <td className="border-r border-slate-800 px-4 py-4">
                      <p className="text-sm font-semibold text-slate-200">
                        {approval.testName || "Laboratory Test"}
                      </p>
                      {approval.testCode && (
                        <p className="mt-1 font-mono text-xs text-slate-500">
                          {approval.testCode}
                        </p>
                      )}
                    </td>

                    <td className="border-r border-slate-800 px-4 py-4">
                      {getAbnormalityBadge(approval.abnormalCount, approval.criticalValues)}
                    </td>

                    <td className="border-r border-slate-800 px-4 py-4 text-sm text-slate-400">
                      {approval.assignedPathologist || "—"}
                    </td>

                    <td className="border-r border-slate-800 px-4 py-4 font-mono text-xs text-slate-400">
                      {formatDate(approval.submittedAt)}
                    </td>

                    <td className="border-r border-slate-800 px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadge(approval.status)}`}
                      >
                        {approval.status || "Pending"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {approval.status?.toLowerCase().includes("pending") || approval.status === "PENDING" ? (
                          <Link
                            href="/results"
                            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors inline-flex items-center gap-1.5 shadow-sm"
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
                                className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 transition-all"
                              >
                                Review & Sign
                              </button>
                            )}

                            {pending && onApprove && (
                              <button
                                type="button"
                                onClick={() => onApprove(approval)}
                                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 shadow-sm transition-colors"
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
                                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
                              >
                                Rerun Sample
                              </button>
                            )}

                            {pending && onReject && (
                              <button
                                type="button"
                                onClick={() => onReject(approval)}
                                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
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
