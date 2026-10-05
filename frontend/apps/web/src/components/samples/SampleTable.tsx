"use client";

import React from "react";
import Link from "next/link";

export interface LabSample {
  id: string | number;
  sampleNumber?: string;
  barcode?: string;
  patientId?: string | number;
  patientName?: string;
  orderId?: string | number;
  orderNumber?: string;
  sampleType?: string;
  status?: string;
  collectedBy?: string;
  collectedAt?: string;
  receivedAt?: string;
  rejectedReason?: string;
}

interface SampleTableProps {
  samples: LabSample[];
  loading?: boolean;
  onDelete?: (sample: LabSample) => void;
}

function formatDate(date?: string) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status?: string) {
  const value = status?.toLowerCase();
  if (value === "completed" || value === "received" || value === "approved") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
  if (value === "rejected" || value === "cancelled") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  }
  if (value === "pending" || value === "collected" || value === "processing") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }
  return "border-slate-700 bg-slate-800 text-slate-400";
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, row) => (
        <tr key={row} className="border-t border-slate-800">
          {Array.from({ length: 8 }).map((__, cell) => (
            <td key={cell} className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function SampleTable({
  samples,
  loading = false,
  onDelete,
}: SampleTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/80">
      {/* Command bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 px-5 py-4 flex items-center gap-3">
        <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-400 shadow-lg shadow-cyan-500/10">🧪</span>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">Sample Worklist</h2>
          <p className="text-xs text-slate-400">Laboratory specimen tracking and chain of custody</p>
        </div>
        <span className="ml-auto rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold text-cyan-300">
          {samples.length} specimens
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
            <tr>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Sample</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Accession ID</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Barcode</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Tube label</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Patient</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Identity</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Order</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Accession chain</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Sample Type</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Specimen class</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Status</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Lifecycle state</span>
              </th>
              <th className="border-r border-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Collected</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Date + time</span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-300">
                <div>Actions</div>
                <span className="text-[9px] font-medium normal-case tracking-normal text-cyan-400">Workflow</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/70">
            {loading ? (
              <LoadingRows />
            ) : samples.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="text-3xl text-slate-600">🧪</div>
                  <p className="mt-2 text-sm font-semibold text-slate-300">No samples found</p>
                  <p className="mt-1 text-sm text-slate-500">Collected laboratory samples will appear here.</p>
                </td>
              </tr>
            ) : (
              samples.map((sample) => (
                <tr key={sample.id} className="group bg-slate-950 hover:bg-slate-900/60 transition-colors">
                  <td className="border-r border-slate-800 px-4 py-4">
                    <Link href={`/samples/${sample.id}`} className="font-mono text-sm font-bold text-white hover:text-cyan-300 transition-colors">
                      {sample.sampleNumber || `SMP-${sample.id}`}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      ID: {sample.id}
                    </p>
                  </td>

                  <td className="border-r border-slate-800 px-4 py-4">
                    <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-xs text-slate-300">
                      {sample.barcode || "—"}
                    </span>
                  </td>

                  <td className="border-r border-slate-800 px-4 py-4">
                    {sample.patientId ? (
                      <Link href={`/patients/${sample.patientId}`} className="text-sm font-semibold text-slate-200 hover:text-cyan-300 transition-colors">
                        {sample.patientName || `Patient #${sample.patientId}`}
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-400">{sample.patientName || "—"}</span>
                    )}
                  </td>

                  <td className="border-r border-slate-800 px-4 py-4">
                    {sample.orderId ? (
                      <Link href={`/orders/${sample.orderId}`} className="font-mono text-sm font-semibold text-slate-300 hover:text-cyan-300 transition-colors">
                        {sample.orderNumber || `ORD-${sample.orderId}`}
                      </Link>
                    ) : "—"}
                  </td>

                  <td className="border-r border-slate-800 px-4 py-4 text-sm text-slate-400">
                    {sample.sampleType || "—"}
                  </td>

                  <td className="border-r border-slate-800 px-4 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadge(sample.status)}`}>
                      {sample.status || "Pending"}
                    </span>
                  </td>

                  <td className="border-r border-slate-800 px-4 py-4 font-mono text-xs text-slate-400">
                    {formatDate(sample.collectedAt)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/samples/${sample.id}`}
                        className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/samples/${sample.id}?edit=true`}
                        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                      >
                        Edit
                      </Link>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(sample)}
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
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