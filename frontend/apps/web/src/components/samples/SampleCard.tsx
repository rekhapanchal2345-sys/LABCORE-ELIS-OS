"use client";

import React from "react";
import Link from "next/link";
import type { LabSample } from "./SampleTable";

interface SampleCardProps {
  sample: LabSample;
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
    return "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (
    value === "rejected" ||
    value === "cancelled"
  ) {
    return "border border-rose-500/30 bg-rose-500/10 text-rose-300";
  }

  if (
    value === "pending" ||
    value === "collected" ||
    value === "processing"
  ) {
    return "border border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border border-slate-700 bg-slate-800 text-slate-300";
}

export default function SampleCard({
  sample,
  onDelete,
}: SampleCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl transition hover:border-slate-700 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-lg">
            🧪
          </div>

          <div className="min-w-0">
            <Link
              href={`/samples/${sample.id}`}
              className="block truncate text-base font-semibold text-slate-100 hover:text-cyan-400 transition-colors"
            >
              {sample.sampleNumber ||
                `SMP-${sample.id}`}
            </Link>

            <p className="mt-1 font-mono text-xs text-cyan-400/80">
              {sample.barcode || "No barcode"}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${statusClass(
            sample.status
          )}`}
        >
          {sample.status || "Pending"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            Patient
          </p>

          {sample.patientId ? (
            <Link
              href={`/patients/${sample.patientId}`}
              className="mt-1 block text-sm font-semibold text-slate-200 hover:text-cyan-300 transition-colors"
            >
              {sample.patientName ||
                `Patient #${sample.patientId}`}
            </Link>
          ) : (
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {sample.patientName || "—"}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            Order
          </p>

          {sample.orderId ? (
            <Link
              href={`/orders/${sample.orderId}`}
              className="mt-1 block text-sm font-medium text-slate-300 hover:text-cyan-300 transition-colors"
            >
              {sample.orderNumber ||
                `ORD-${sample.orderId}`}
            </Link>
          ) : (
            <p className="mt-1 text-sm text-slate-400">
              —
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            Sample Type
          </p>

          <p className="mt-1 text-sm font-medium text-slate-200">
            {sample.sampleType || "—"}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            Collected By
          </p>

          <p className="mt-1 text-sm text-slate-300">
            {sample.collectedBy || "—"}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            Collected At
          </p>

          <p className="mt-1 text-sm text-slate-300">
            {formatDate(sample.collectedAt)}
          </p>
        </div>
      </div>

      {sample.rejectedReason && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
          <p className="text-xs font-semibold text-rose-300">
            Rejection Reason
          </p>

          <p className="mt-1 text-sm text-rose-200">
            {sample.rejectedReason}
          </p>
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2 border-t border-slate-800/80 pt-4">
        <Link
          href={`/samples/${sample.id}`}
          className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
        >
          View
        </Link>

        <Link
          href={`/samples/${sample.id}?edit=true`}
          className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
        >
          Edit
        </Link>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(sample)}
            className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}