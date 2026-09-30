"use client";

import {
  Activity,
  AlertTriangle,
  Gauge,
  ShieldCheck,
  Timer,
  Wifi,
} from "lucide-react";
import type { Analyzer } from "@/types";

interface AnalyzerCommandCenterProps {
  analyzers: Analyzer[];
}

function getHealthScore(analyzers: Analyzer[]) {
  if (analyzers.length === 0) return 0;

  const score = analyzers.reduce((total, analyzer) => {
    if (analyzer.status === "ONLINE") return total + 100;
    if (analyzer.status === "BUSY" || analyzer.status === "IDLE") return total + 85;
    if (analyzer.status === "MAINTENANCE") return total + 55;
    if (analyzer.status === "ERROR") return total + 25;
    return total;
  }, 0);

  return Math.round(score / analyzers.length);
}

export default function AnalyzerCommandCenter({
  analyzers,
}: AnalyzerCommandCenterProps) {
  const total = analyzers.length;
  const online = analyzers.filter((analyzer) => analyzer.status === "ONLINE").length;
  const attention = analyzers.filter((analyzer) =>
    ["ERROR", "OFFLINE", "CALIBRATION_REQUIRED", "MAINTENANCE"].includes(
      analyzer.status
    )
  );
  const measured = analyzers.filter(
    (analyzer) => typeof analyzer.connectionLatency === "number"
  );
  const averageLatency = measured.length
    ? Math.round(
        measured.reduce(
          (sum, analyzer) => sum + (analyzer.connectionLatency || 0),
          0
        ) / measured.length
      )
    : null;
  const healthScore = getHealthScore(analyzers);
  const coverage = total ? Math.round((online / total) * 100) : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-900/10">
      <div className="flex flex-col gap-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">
            <Activity className="h-4 w-4" />
            Premium Operations Intelligence
          </div>
          <h2 className="mt-1 text-lg font-bold">Analyzer Command Center</h2>
          <p className="mt-1 text-xs text-slate-300">
            Live readiness, connectivity quality, and exception prioritization
            across your instrument fleet.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 md:self-auto">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Fleet monitoring active
        </div>
      </div>

      <div className="grid gap-px bg-white/10 md:grid-cols-4">
        <div className="bg-slate-950/90 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">Fleet health score</span>
            <Gauge className="h-4 w-4 text-blue-300" />
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-bold">{healthScore}</span>
            <span className="mb-1 text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all"
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950/90 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">Online coverage</span>
            <Wifi className="h-4 w-4 text-emerald-300" />
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-bold">{coverage}%</span>
            <span className="mb-1 text-xs text-slate-400">
              {online}/{total || 0} instruments
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Readiness for bidirectional worklist dispatch
          </p>
        </div>

        <div className="bg-slate-950/90 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">Average roundtrip</span>
            <Timer className="h-4 w-4 text-violet-300" />
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-bold">
              {averageLatency === null ? "—" : averageLatency}
            </span>
            {averageLatency !== null && (
              <span className="mb-1 text-xs text-slate-400">ms</span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Based on reported analyzer telemetry
          </p>
        </div>

        <div className="bg-slate-950/90 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">Needs attention</span>
            <AlertTriangle className="h-4 w-4 text-amber-300" />
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-bold">{attention.length}</span>
            <span className="mb-1 text-xs text-slate-400">exceptions</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Offline, error, maintenance, or calibration risk
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          Automated readiness checks are evaluating every connected interface.
        </div>
        {attention.length > 0 && (
          <span className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-200">
            Review {attention.length} prioritized exception
            {attention.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </section>
  );
}
