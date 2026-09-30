"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Microscope,
  RefreshCw,
  Download,
  Info,
  ChevronDown,
  Activity,
  Layers,
  Target,
  Sigma,
  FlaskConical,
} from "lucide-react";
import { Analyzer } from "@/types";

interface CrossAnalyzerQCCorrelationProps {
  analyzers: Analyzer[];
}

interface QCDataPoint {
  analyzer: string;
  analyzerShort: string;
  mean: number;
  sd: number;
  cv: number;
  bias: number;
  status: "PASS" | "WARN" | "FAIL";
  westgardViolation?: string;
  n: number;
  lastRun: string;
}

interface AnalyteGroup {
  analyte: string;
  unit: string;
  targetMean: number;
  allowableBias: number;
  allowableCV: number;
  teaLimit: number;
  biologicalCV: number;
  qcData: QCDataPoint[];
}

const DEMO_CORRELATION_DATA: AnalyteGroup[] = [
  {
    analyte: "Glucose",
    unit: "mg/dL",
    targetMean: 100.0,
    allowableBias: 2.5,
    allowableCV: 3.0,
    teaLimit: 6.5,
    biologicalCV: 5.7,
    qcData: [
      { analyzer: "Beckman AU680", analyzerShort: "AU680", mean: 101.2, sd: 1.8, cv: 1.78, bias: 1.2, status: "PASS", n: 48, lastRun: "07:30" },
      { analyzer: "Roche Cobas C702", analyzerShort: "C702", mean: 99.1, sd: 2.1, cv: 2.12, bias: -0.9, status: "PASS", n: 52, lastRun: "07:15" },
      { analyzer: "Siemens ADVIA 1800", analyzerShort: "ADVIA", mean: 103.8, sd: 3.5, cv: 3.37, bias: 3.8, status: "WARN", westgardViolation: "2s violation on Level 2", n: 44, lastRun: "08:00" },
      { analyzer: "Abbott Architect c8000", analyzerShort: "c8000", mean: 100.4, sd: 1.5, cv: 1.49, bias: 0.4, status: "PASS", n: 50, lastRun: "07:45" },
    ],
  },
  {
    analyte: "Creatinine",
    unit: "mg/dL",
    targetMean: 1.0,
    allowableBias: 3.0,
    allowableCV: 4.0,
    teaLimit: 8.8,
    biologicalCV: 4.3,
    qcData: [
      { analyzer: "Beckman AU680", analyzerShort: "AU680", mean: 1.02, sd: 0.025, cv: 2.45, bias: 2.0, status: "PASS", n: 48, lastRun: "07:30" },
      { analyzer: "Roche Cobas C702", analyzerShort: "C702", mean: 0.98, sd: 0.031, cv: 3.16, bias: -2.0, status: "PASS", n: 52, lastRun: "07:15" },
      { analyzer: "Siemens ADVIA 1800", analyzerShort: "ADVIA", mean: 1.09, sd: 0.055, cv: 5.05, bias: 9.0, status: "FAIL", westgardViolation: "10x / R4s — Bias exceeds TEa", n: 44, lastRun: "08:00" },
      { analyzer: "Abbott Architect c8000", analyzerShort: "c8000", mean: 0.995, sd: 0.022, cv: 2.21, bias: -0.5, status: "PASS", n: 50, lastRun: "07:45" },
    ],
  },
  {
    analyte: "Sodium",
    unit: "mmol/L",
    targetMean: 140.0,
    allowableBias: 0.9,
    allowableCV: 1.1,
    teaLimit: 2.0,
    biologicalCV: 0.7,
    qcData: [
      { analyzer: "Beckman AU680", analyzerShort: "AU680", mean: 140.3, sd: 0.92, cv: 0.66, bias: 0.21, status: "PASS", n: 48, lastRun: "07:30" },
      { analyzer: "Roche Cobas C702", analyzerShort: "C702", mean: 139.8, sd: 1.05, cv: 0.75, bias: -0.14, status: "PASS", n: 52, lastRun: "07:15" },
      { analyzer: "Siemens ADVIA 1800", analyzerShort: "ADVIA", mean: 141.2, sd: 1.15, cv: 0.81, bias: 0.86, status: "WARN", westgardViolation: "Approaching bias limit", n: 44, lastRun: "08:00" },
      { analyzer: "Abbott Architect c8000", analyzerShort: "c8000", mean: 140.1, sd: 0.88, cv: 0.63, bias: 0.07, status: "PASS", n: 50, lastRun: "07:45" },
    ],
  },
  {
    analyte: "ALT (SGPT)",
    unit: "U/L",
    targetMean: 45.0,
    allowableBias: 15.0,
    allowableCV: 12.0,
    teaLimit: 28.5,
    biologicalCV: 17.6,
    qcData: [
      { analyzer: "Beckman AU680", analyzerShort: "AU680", mean: 44.5, sd: 3.2, cv: 7.19, bias: -1.1, status: "PASS", n: 48, lastRun: "07:30" },
      { analyzer: "Roche Cobas C702", analyzerShort: "C702", mean: 46.1, sd: 4.1, cv: 8.89, bias: 2.4, status: "PASS", n: 52, lastRun: "07:15" },
      { analyzer: "Siemens ADVIA 1800", analyzerShort: "ADVIA", mean: 48.5, sd: 5.8, cv: 11.96, bias: 7.8, status: "PASS", n: 44, lastRun: "08:00" },
      { analyzer: "Abbott Architect c8000", analyzerShort: "c8000", mean: 43.2, sd: 3.5, cv: 8.10, bias: -4.0, status: "PASS", n: 50, lastRun: "07:45" },
    ],
  },
  {
    analyte: "Hemoglobin",
    unit: "g/dL",
    targetMean: 12.5,
    allowableBias: 2.5,
    allowableCV: 2.8,
    teaLimit: 6.0,
    biologicalCV: 3.2,
    qcData: [
      { analyzer: "Sysmex XN-3000 (Unit 1)", analyzerShort: "XN-3000 #1", mean: 12.55, sd: 0.20, cv: 1.59, bias: 0.4, status: "PASS", n: 60, lastRun: "08:00" },
      { analyzer: "Sysmex XN-3000 (Unit 2)", analyzerShort: "XN-3000 #2", mean: 12.38, sd: 0.28, cv: 2.26, bias: -0.96, status: "PASS", n: 58, lastRun: "07:55" },
      { analyzer: "Mindray BC-6900", analyzerShort: "BC-6900", mean: 12.82, sd: 0.42, cv: 3.28, bias: 2.56, status: "WARN", westgardViolation: "CV exceeds allowable limit", n: 52, lastRun: "07:40" },
    ],
  },
  {
    analyte: "Troponin I",
    unit: "ng/mL",
    targetMean: 0.50,
    allowableBias: 10.0,
    allowableCV: 8.0,
    teaLimit: 20.0,
    biologicalCV: 15.3,
    qcData: [
      { analyzer: "Abbott Architect i2000SR", analyzerShort: "i2000SR", mean: 0.503, sd: 0.022, cv: 4.37, bias: 0.6, status: "PASS", n: 40, lastRun: "07:00" },
      { analyzer: "Roche Cobas e801", analyzerShort: "e801", mean: 0.491, sd: 0.031, cv: 6.31, bias: -1.8, status: "PASS", n: 42, lastRun: "07:10" },
      { analyzer: "Siemens Atellica IM", analyzerShort: "Atellica", mean: 0.531, sd: 0.055, cv: 10.36, bias: 6.2, status: "WARN", westgardViolation: "CV exceeds 8% limit at LoQ level", n: 38, lastRun: "07:20" },
    ],
  },
];

const statusConfig = {
  PASS: { color: "text-emerald-400", bgColor: "bg-emerald-500/15", borderColor: "border-emerald-500/30", icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "PASS" },
  WARN: { color: "text-amber-400", bgColor: "bg-amber-500/15", borderColor: "border-amber-500/30", icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "WARNING" },
  FAIL: { color: "text-rose-400", bgColor: "bg-rose-500/15", borderColor: "border-rose-500/30", icon: <XCircle className="h-3.5 w-3.5" />, label: "FAIL" },
};

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-400 w-10 text-right">{value.toFixed(2)}</span>
    </div>
  );
}

function SDChart({ points }: { points: QCDataPoint[] }) {
  // Simple visual representation of SD distribution
  const means = points.map((p) => p.mean);
  const minMean = Math.min(...means);
  const maxMean = Math.max(...means);
  const range = maxMean - minMean || 1;

  return (
    <div className="space-y-1.5 mt-2">
      {points.map((p, i) => {
        const normalizedPos = ((p.mean - minMean) / range) * 80; // 0–80%
        const sdWidth = (p.sd / (range || 1)) * 80 * 2;
        const sc = statusConfig[p.status];
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="w-20 text-right text-[10px] font-mono text-slate-400 truncate">{p.analyzerShort}</span>
            <div className="flex-1 relative h-6 rounded-lg bg-slate-800/80 overflow-hidden">
              {/* Target line */}
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-indigo-500/60 z-10" />
              {/* SD range bar */}
              <div
                className={`absolute inset-y-1 rounded opacity-40 ${p.status === "PASS" ? "bg-emerald-500" : p.status === "WARN" ? "bg-amber-500" : "bg-rose-500"}`}
                style={{
                  left: `calc(${normalizedPos}% - ${sdWidth / 2}px + 10%)`,
                  width: `max(${sdWidth}px, 4px)`,
                }}
              />
              {/* Mean point */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-slate-900 z-20 ${p.status === "PASS" ? "bg-emerald-400" : p.status === "WARN" ? "bg-amber-400" : "bg-rose-400"}`}
                style={{ left: `calc(${normalizedPos}% + 10%)` }}
              />
            </div>
            <span className={`text-[10px] font-bold w-14 text-right ${sc.color}`}>{p.mean.toFixed(p.mean > 10 ? 1 : 3)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CrossAnalyzerQCCorrelation({ analyzers }: CrossAnalyzerQCCorrelationProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PASS" | "WARN" | "FAIL">("ALL");
  const [sortBy, setSortBy] = useState<"analyte" | "violations">("violations");

  const filteredData = useMemo(() => {
    let data = [...DEMO_CORRELATION_DATA];
    if (filterStatus !== "ALL") {
      data = data.filter((g) => g.qcData.some((q) => q.status === filterStatus));
    }
    if (sortBy === "violations") {
      data.sort((a, b) => {
        const aFails = a.qcData.filter((q) => q.status === "FAIL").length * 10 + a.qcData.filter((q) => q.status === "WARN").length;
        const bFails = b.qcData.filter((q) => q.status === "FAIL").length * 10 + b.qcData.filter((q) => q.status === "WARN").length;
        return bFails - aFails;
      });
    }
    return data;
  }, [filterStatus, sortBy]);

  const globalStats = useMemo(() => {
    const allPoints = DEMO_CORRELATION_DATA.flatMap((g) => g.qcData);
    return {
      total: allPoints.length,
      pass: allPoints.filter((p) => p.status === "PASS").length,
      warn: allPoints.filter((p) => p.status === "WARN").length,
      fail: allPoints.filter((p) => p.status === "FAIL").length,
      analyteCount: DEMO_CORRELATION_DATA.length,
      analyzerCount: new Set(allPoints.map((p) => p.analyzer)).size,
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-[#071030] to-violet-950/20 p-5 shadow-2xl">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[11px] font-bold text-violet-400">
                <Sigma className="h-3.5 w-3.5" />
                ISO 15189 / EFLM Biological Variation
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-mono text-slate-300">
                Sigma Metrics
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Multi-Instrument QC Correlation Matrix</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Cross-analyzer bias, CV%, and Sigma comparison — identify instrument drift before it affects patient results
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all">
              <Download className="h-3.5 w-3.5" />Export Report
            </button>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all">
              <RefreshCw className="h-3.5 w-3.5" />Sync QC
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Analytes Monitored", value: globalStats.analyteCount, color: "text-white" },
            { label: "Analyzers Compared", value: globalStats.analyzerCount, color: "text-indigo-400" },
            { label: "Total QC Points", value: globalStats.total, color: "text-slate-300" },
            { label: "Passing", value: `${globalStats.pass}/${globalStats.total}`, color: "text-emerald-400" },
            { label: "Warnings", value: globalStats.warn, color: globalStats.warn > 0 ? "text-amber-400" : "text-emerald-400" },
            { label: "Failures", value: globalStats.fail, color: globalStats.fail > 0 ? "text-rose-400" : "text-emerald-400" },
          ].map((kpi, i) => (
            <div key={i} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</p>
              <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Filter:</span>
          {(["ALL", "PASS", "WARN", "FAIL"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${filterStatus === s
                ? s === "ALL" ? "bg-violet-600 border-violet-500 text-white"
                  : s === "PASS" ? "bg-emerald-600 border-emerald-500 text-white"
                    : s === "WARN" ? "bg-amber-600 border-amber-500 text-white"
                      : "bg-rose-600 border-rose-500 text-white"
                : "border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] font-bold text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="violations">By Violations</option>
            <option value="analyte">By Analyte</option>
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="space-y-4">
        {filteredData.map((group) => {
          const hasFailure = group.qcData.some((q) => q.status === "FAIL");
          const hasWarning = group.qcData.some((q) => q.status === "WARN");
          const isExpanded = selectedGroup === group.analyte;
          const worstStatus = hasFailure ? "FAIL" : hasWarning ? "WARN" : "PASS";
          const wsc = statusConfig[worstStatus];

          return (
            <div
              key={group.analyte}
              className={`overflow-hidden rounded-2xl border transition-all ${hasFailure ? "border-rose-500/30" : hasWarning ? "border-amber-500/20" : "border-slate-800"} bg-slate-900/60`}
            >
              {/* Header */}
              <button
                className="w-full flex flex-wrap items-center gap-4 p-4 hover:bg-slate-800/40 transition-colors text-left"
                onClick={() => setSelectedGroup(isExpanded ? null : group.analyte)}
              >
                <div className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${wsc.color} ${wsc.bgColor} ${wsc.borderColor}`}>
                  {wsc.icon}
                  {wsc.label}
                </div>

                <div className="flex-1 min-w-[120px]">
                  <div className="text-sm font-black text-white">{group.analyte}</div>
                  <div className="text-[11px] text-slate-400">
                    Target: <span className="font-bold text-slate-200">{group.targetMean} {group.unit}</span>
                    &nbsp;·&nbsp;TEa: <span className="font-bold text-violet-300">±{group.teaLimit}%</span>
                    &nbsp;·&nbsp;BioCV: <span className="font-bold text-indigo-300">{group.biologicalCV}%</span>
                  </div>
                </div>

                {/* Mini status strip */}
                <div className="flex items-center gap-2">
                  {group.qcData.map((q, i) => {
                    const qsc = statusConfig[q.status];
                    return (
                      <div key={i} title={`${q.analyzerShort}: ${q.status}`} className={`flex-shrink-0 h-8 w-8 rounded-xl border flex items-center justify-center ${qsc.bgColor} ${qsc.borderColor}`}>
                        <span className={`text-[9px] font-black ${qsc.color}`}>{q.analyzerShort.split(" ")[0].slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>

                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-slate-800 bg-slate-950/60 p-5 space-y-5">
                  {/* Per-Analyzer Table */}
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-3">Per-Instrument QC Performance</p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] text-xs">
                        <thead>
                          <tr className="border-b border-slate-800">
                            {["Analyzer", "Mean (n)", "SD", "CV%", "Bias%", "Sigma", "Last QC", "Status"].map((h) => (
                              <th key={h} className="px-4 py-2 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {group.qcData.map((q, i) => {
                            const sigma = (group.teaLimit - Math.abs(q.bias)) / q.cv;
                            const sigmaColor = sigma >= 6 ? "text-emerald-400" : sigma >= 4 ? "text-cyan-400" : sigma >= 3 ? "text-amber-400" : "text-rose-400";
                            const qsc = statusConfig[q.status];
                            return (
                              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-3 font-bold text-white">{q.analyzer}</td>
                                <td className="px-4 py-3 font-mono">
                                  <span className="text-white font-bold">{q.mean.toFixed(q.mean > 10 ? 1 : 3)}</span>
                                  <span className="text-slate-500 text-[10px]"> (n={q.n})</span>
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-300">{q.sd.toFixed(q.sd > 1 ? 2 : 3)}</td>
                                <td className="px-4 py-3">
                                  <span className={`font-mono font-bold ${q.cv > group.allowableCV ? "text-rose-400" : q.cv > group.allowableCV * 0.8 ? "text-amber-400" : "text-emerald-400"}`}>
                                    {q.cv.toFixed(2)}%
                                  </span>
                                  <span className="text-slate-600 text-[10px]"> / {group.allowableCV}%</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`font-mono font-bold ${Math.abs(q.bias) > group.allowableBias ? "text-rose-400" : Math.abs(q.bias) > group.allowableBias * 0.7 ? "text-amber-400" : "text-emerald-400"}`}>
                                    {q.bias > 0 ? "+" : ""}{q.bias.toFixed(2)}%
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`font-mono font-black ${sigmaColor}`}>
                                    {sigma > 0 ? sigma.toFixed(1) : "—"}σ
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-400">{q.lastRun}</td>
                                <td className="px-4 py-3">
                                  <div className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[10px] font-bold ${qsc.color} ${qsc.bgColor} ${qsc.borderColor}`}>
                                    {qsc.icon}
                                    {qsc.label}
                                  </div>
                                  {q.westgardViolation && (
                                    <div className="mt-1 text-[10px] text-amber-400 italic">{q.westgardViolation}</div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Visual Distribution Chart */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-3.5 w-3.5 text-violet-400" />
                      <p className="text-[11px] font-bold text-slate-300">Mean Distribution Across Analyzers (target at center line)</p>
                    </div>
                    <SDChart points={group.qcData} />
                  </div>

                  {/* Bias & CV Bar Charts */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                      <p className="text-[11px] font-bold text-slate-300 mb-3">CV% vs Allowable Limit ({group.allowableCV}%)</p>
                      <div className="space-y-2">
                        {group.qcData.map((q) => (
                          <div key={q.analyzerShort}>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                              <span>{q.analyzerShort}</span>
                              <span className={q.cv > group.allowableCV ? "text-rose-400 font-bold" : "text-emerald-400"}>{q.cv.toFixed(2)}%</span>
                            </div>
                            <MiniBar
                              value={q.cv}
                              max={group.allowableCV * 1.5}
                              color={q.cv > group.allowableCV ? "bg-rose-500" : q.cv > group.allowableCV * 0.8 ? "bg-amber-500" : "bg-emerald-500"}
                            />
                          </div>
                        ))}
                        {/* Limit marker visual hint */}
                        <div className="border-t border-violet-500/30 pt-1 mt-2 text-[10px] text-violet-400 italic">
                          Allowable CV limit: {group.allowableCV}%
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                      <p className="text-[11px] font-bold text-slate-300 mb-3">|Bias%| vs Allowable Bias ({group.allowableBias}%)</p>
                      <div className="space-y-2">
                        {group.qcData.map((q) => (
                          <div key={q.analyzerShort}>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                              <span>{q.analyzerShort}</span>
                              <span className={Math.abs(q.bias) > group.allowableBias ? "text-rose-400 font-bold" : "text-emerald-400"}>
                                {q.bias > 0 ? "+" : ""}{q.bias.toFixed(2)}%
                              </span>
                            </div>
                            <MiniBar
                              value={Math.abs(q.bias)}
                              max={group.allowableBias * 1.5}
                              color={Math.abs(q.bias) > group.allowableBias ? "bg-rose-500" : Math.abs(q.bias) > group.allowableBias * 0.7 ? "bg-amber-500" : "bg-emerald-500"}
                            />
                          </div>
                        ))}
                        <div className="border-t border-violet-500/30 pt-1 mt-2 text-[10px] text-violet-400 italic">
                          Allowable bias limit: ±{group.allowableBias}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Allowable TEa info */}
                  <div className="flex items-start gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                    <Info className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-300">
                      <strong className="text-indigo-300">TEa limit ({group.teaLimit}%)</strong> based on EFLM Biological Variation database.
                      Sigma = (TEa − |Bias|) ÷ CV. Sigma ≥ 6: world-class; ≥ 4: acceptable; &lt; 3: requires intervention.
                      Allowable bias: <strong>{group.allowableBias}%</strong> &nbsp;|&nbsp; Allowable CV: <strong>{group.allowableCV}%</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
