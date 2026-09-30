"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  BarChart3,
  Target,
  Layers,
  Download,
  RefreshCw,
  Zap,
  FlaskConical,
  ChevronUp,
  ChevronDown,
  Server,
} from "lucide-react";
import { Analyzer } from "@/types";

interface LabThroughputAnalyticsProps {
  analyzers: Analyzer[];
}

interface TATBreachRecord {
  id: string;
  barcode: string;
  test: string;
  department: string;
  analyzer: string;
  priority: "STAT" | "URGENT" | "ROUTINE";
  targetTAT: number;
  actualTAT: number;
  breachBy: number;
  rootCause: string;
  time: string;
}

interface HourlyVolume {
  hour: string;
  count: number;
  statCount: number;
  avgTAT: number;
}

interface DepartmentMetric {
  department: string;
  icon: string;
  totalTests: number;
  completed: number;
  avgTAT: number;
  targetTAT: number;
  tatCompliance: number;
  throughputPerHour: number;
  pendingCount: number;
  statusColor: string;
}

interface BottleneckAlert {
  id: string;
  stage: string;
  description: string;
  impact: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  affectedTests: number;
  suggestedAction: string;
}

const HOURLY_VOLUME: HourlyVolume[] = [
  { hour: "00", count: 12, statCount: 4, avgTAT: 28 },
  { hour: "01", count: 8, statCount: 3, avgTAT: 25 },
  { hour: "02", count: 6, statCount: 2, avgTAT: 22 },
  { hour: "03", count: 5, statCount: 1, avgTAT: 20 },
  { hour: "04", count: 7, statCount: 2, avgTAT: 23 },
  { hour: "05", count: 18, statCount: 3, avgTAT: 32 },
  { hour: "06", count: 45, statCount: 8, avgTAT: 38 },
  { hour: "07", count: 82, statCount: 12, avgTAT: 45 },
  { hour: "08", count: 124, statCount: 18, avgTAT: 52 },
  { hour: "09", count: 156, statCount: 22, avgTAT: 48 },
  { hour: "10", count: 143, statCount: 16, avgTAT: 44 },
  { hour: "11", count: 118, statCount: 11, avgTAT: 42 },
  { hour: "12", count: 89, statCount: 9, avgTAT: 40 },
  { hour: "13", count: 95, statCount: 14, avgTAT: 41 },
  { hour: "14", count: 112, statCount: 13, avgTAT: 46 },
  { hour: "15", count: 131, statCount: 17, avgTAT: 49 },
  { hour: "16", count: 108, statCount: 10, avgTAT: 43 },
  { hour: "17", count: 76, statCount: 8, avgTAT: 39 },
  { hour: "18", count: 58, statCount: 6, avgTAT: 35 },
  { hour: "19", count: 42, statCount: 5, avgTAT: 31 },
  { hour: "20", count: 33, statCount: 4, avgTAT: 28 },
  { hour: "21", count: 28, statCount: 5, avgTAT: 26 },
  { hour: "22", count: 22, statCount: 4, avgTAT: 25 },
  { hour: "23", count: 16, statCount: 3, avgTAT: 24 },
];

const DEPARTMENT_METRICS: DepartmentMetric[] = [
  { department: "Biochemistry", icon: "🧪", totalTests: 487, completed: 462, avgTAT: 44, targetTAT: 60, tatCompliance: 94.2, throughputPerHour: 62, pendingCount: 25, statusColor: "emerald" },
  { department: "Hematology", icon: "🩸", totalTests: 312, completed: 298, avgTAT: 28, targetTAT: 30, tatCompliance: 88.5, throughputPerHour: 40, pendingCount: 14, statusColor: "violet" },
  { department: "Immunology", icon: "🛡", totalTests: 198, completed: 175, avgTAT: 85, targetTAT: 120, tatCompliance: 97.0, throughputPerHour: 22, pendingCount: 23, statusColor: "blue" },
  { department: "Coagulation", icon: "⚗", totalTests: 124, completed: 118, avgTAT: 38, targetTAT: 60, tatCompliance: 95.1, throughputPerHour: 15, pendingCount: 6, statusColor: "teal" },
  { department: "Microbiology", icon: "🔬", totalTests: 89, completed: 45, avgTAT: 240, targetTAT: 480, tatCompliance: 82.3, throughputPerHour: 6, pendingCount: 44, statusColor: "amber" },
  { department: "Clinical Pathology", icon: "🧫", totalTests: 156, completed: 140, avgTAT: 55, targetTAT: 90, tatCompliance: 91.0, throughputPerHour: 20, pendingCount: 16, statusColor: "cyan" },
];

const BOTTLENECK_ALERTS: BottleneckAlert[] = [
  {
    id: "B001",
    stage: "Pre-Analytical",
    description: "Centrifuge #2 is offline — all serum specimens routing to single centrifuge",
    impact: "TAT increase of ~15 min for biochemistry samples",
    severity: "CRITICAL",
    affectedTests: 38,
    suggestedAction: "Activate backup centrifuge or redistribute specimens to Centrifuge #3",
  },
  {
    id: "B002",
    stage: "Hematology Analysis",
    description: "Sysmex XN-3000 #1 running at 94% capacity — queue building",
    impact: "Expected STAT TAT breach in next 20 minutes",
    severity: "HIGH",
    affectedTests: 12,
    suggestedAction: "Route new EDTA STATs to Sysmex XN-3000 #2 via Smart Balancer",
  },
  {
    id: "B003",
    stage: "Validation & Reporting",
    description: "Pathologist workstation queue: 22 results awaiting clinical validation",
    impact: "Report dispatch delay for 22 patients — avg 18 min pending",
    severity: "HIGH",
    affectedTests: 22,
    suggestedAction: "Alert on-call pathologist. Enable auto-validation for normal routine CBC results",
  },
  {
    id: "B004",
    stage: "Immunology – Long TAT",
    description: "Thyroid/autoimmune panel analyzer reagent low — 2 runs remaining",
    impact: "Potential stop in immunology testing within 1 hour",
    severity: "MEDIUM",
    affectedTests: 8,
    suggestedAction: "Load new reagent kit from refrigerator. Notify store for next-day delivery",
  },
];

const TAT_BREACHES: TATBreachRecord[] = [
  { id: "T001", barcode: "LAB-4421", test: "LFT Panel", department: "Biochemistry", analyzer: "ADVIA 1800", priority: "STAT", targetTAT: 30, actualTAT: 47, breachBy: 17, rootCause: "Centrifuge queue", time: "09:14" },
  { id: "T002", barcode: "LAB-4389", test: "CBC", department: "Hematology", analyzer: "XN-3000 #1", priority: "STAT", targetTAT: 30, actualTAT: 38, breachBy: 8, rootCause: "Analyzer queue overflow", time: "08:52" },
  { id: "T003", barcode: "LAB-4301", test: "Troponin I", department: "Immunology", analyzer: "Atellica IM", priority: "STAT", targetTAT: 45, actualTAT: 61, breachBy: 16, rootCause: "Reagent change mid-batch", time: "08:30" },
  { id: "T004", barcode: "LAB-4265", test: "PT/INR", department: "Coagulation", analyzer: "STA-R Max", priority: "URGENT", targetTAT: 60, actualTAT: 78, breachBy: 18, rootCause: "Clotted sample detected — rebleed needed", time: "07:58" },
];

function HourlyBarChart({ data }: { data: HourlyVolume[] }) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const currentHour = new Date().getHours();

  return (
    <div className="flex items-end gap-px h-28 w-full">
      {data.map((d, i) => {
        const height = (d.count / maxCount) * 100;
        const isCurrentHour = i === currentHour;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-0.5 group relative"
            title={`${d.hour}:00 — ${d.count} tests, ${d.statCount} STAT, Avg TAT: ${d.avgTAT}m`}
          >
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
              <div className="rounded-xl border border-slate-700 bg-slate-800 px-2 py-1.5 text-[10px] whitespace-nowrap shadow-lg">
                <div className="font-bold text-white">{d.hour}:00 — {d.count} tests</div>
                <div className="text-rose-300">{d.statCount} STAT</div>
                <div className="text-cyan-300">Avg TAT: {d.avgTAT}m</div>
              </div>
            </div>
            <div className="w-full flex flex-col justify-end" style={{ height: "100%" }}>
              {/* STAT overlay */}
              <div
                className="w-full bg-rose-500/60 rounded-t"
                style={{ height: `${(d.statCount / maxCount) * 100}%` }}
              />
              {/* Routine portion */}
              <div
                className={`w-full rounded-t ${isCurrentHour ? "bg-indigo-500" : i < currentHour ? "bg-blue-600/70" : "bg-slate-700/60"}`}
                style={{ height: `${(Math.max(d.count - d.statCount, 0) / maxCount) * 100}%` }}
              />
            </div>
            {i % 4 === 0 && (
              <span className="text-[9px] text-slate-500 font-mono">{d.hour}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TATComplianceDonut({ compliance }: { compliance: number }) {
  const angle = (compliance / 100) * 360;
  const color = compliance >= 95 ? "#10b981" : compliance >= 85 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative h-14 w-14 flex-shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${compliance * 0.942} 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-black" style={{ color }}>{compliance.toFixed(0)}%</span>
      </div>
    </div>
  );
}

const severityConfig = {
  CRITICAL: { color: "text-rose-300", bgColor: "bg-rose-500/15", borderColor: "border-rose-500/40", dot: "bg-rose-500" },
  HIGH: { color: "text-amber-300", bgColor: "bg-amber-500/15", borderColor: "border-amber-500/30", dot: "bg-amber-500" },
  MEDIUM: { color: "text-blue-300", bgColor: "bg-blue-500/15", borderColor: "border-blue-500/30", dot: "bg-blue-500" },
};

export default function LabThroughputAnalytics({ analyzers }: LabThroughputAnalyticsProps) {
  const [activeView, setActiveView] = useState<"overview" | "breaches" | "bottlenecks">("overview");
  const [sortDept, setSortDept] = useState<"name" | "tatCompliance" | "pending">("tatCompliance");

  const sortedDepts = useMemo(() => {
    const d = [...DEPARTMENT_METRICS];
    if (sortDept === "name") d.sort((a, b) => a.department.localeCompare(b.department));
    if (sortDept === "tatCompliance") d.sort((a, b) => a.tatCompliance - b.tatCompliance);
    if (sortDept === "pending") d.sort((a, b) => b.pendingCount - a.pendingCount);
    return d;
  }, [sortDept]);

  const totalTests = DEPARTMENT_METRICS.reduce((s, d) => s + d.totalTests, 0);
  const totalCompleted = DEPARTMENT_METRICS.reduce((s, d) => s + d.completed, 0);
  const avgCompliance = DEPARTMENT_METRICS.reduce((s, d) => s + d.tatCompliance, 0) / DEPARTMENT_METRICS.length;
  const totalPending = DEPARTMENT_METRICS.reduce((s, d) => s + d.pendingCount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-[#061818] to-teal-950/20 p-5 shadow-2xl">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-teal-600/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-bold text-teal-400">
                <BarChart3 className="h-3.5 w-3.5" />
                Real-Time Laboratory Analytics
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-mono text-slate-300">
                ISO 15189 KPIs
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Lab Throughput & TAT Analytics Hub</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Real-time bottleneck detection, TAT compliance monitoring, and department-wise throughput KPIs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all">
              <Download className="h-3.5 w-3.5" />Export KPI Report
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4 sm:grid-cols-4">
          {[
            { label: "Total Tests Today", value: totalTests.toLocaleString(), color: "text-white", sub: `${totalCompleted} completed` },
            { label: "Avg TAT Compliance", value: `${avgCompliance.toFixed(1)}%`, color: avgCompliance >= 90 ? "text-emerald-400" : "text-amber-400", sub: "All departments" },
            { label: "Pending Worklist", value: totalPending, color: totalPending > 50 ? "text-amber-400" : "text-slate-300", sub: "Awaiting results" },
            { label: "Active Bottlenecks", value: BOTTLENECK_ALERTS.filter((b) => b.severity !== "MEDIUM").length, color: "text-rose-400", sub: "Critical + High" },
          ].map((kpi, i) => (
            <div key={i} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</p>
              <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-slate-500">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5">
        {[
          { key: "overview", label: "📊 Department Overview", icon: <Layers className="h-3.5 w-3.5" /> },
          { key: "bottlenecks", label: "🔥 Active Bottlenecks", icon: <AlertTriangle className="h-3.5 w-3.5" />, badge: BOTTLENECK_ALERTS.length },
          { key: "breaches", label: "⏰ TAT Breaches", icon: <Clock className="h-3.5 w-3.5" />, badge: TAT_BREACHES.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${activeView === tab.key
              ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${activeView === tab.key ? "bg-white/20" : "bg-rose-500/30 text-rose-300 border border-rose-500/30"}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW: Hourly Volume + Department Table ── */}
      {activeView === "overview" && (
        <div className="space-y-4">
          {/* Hourly Volume Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Hourly Test Volume (Today)</h3>
                <p className="text-[11px] text-slate-400">Blue = Routine · Red = STAT · Bright = Current hour</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-blue-600/70 inline-block" /> Routine</span>
                <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-rose-500/60 inline-block" /> STAT</span>
                <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-indigo-500 inline-block" /> Now</span>
              </div>
            </div>
            <HourlyBarChart data={HOURLY_VOLUME} />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { label: "Peak Hour", value: `${HOURLY_VOLUME.reduce((a, b) => a.count > b.count ? a : b).hour}:00 (${Math.max(...HOURLY_VOLUME.map((d) => d.count))} tests)`, color: "text-white" },
                { label: "Total Today", value: `${HOURLY_VOLUME.reduce((s, d) => s + d.count, 0)} tests`, color: "text-teal-400" },
                { label: "STAT Total", value: `${HOURLY_VOLUME.reduce((s, d) => s + d.statCount, 0)} STAT`, color: "text-rose-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                  <p className="text-[10px] text-slate-400">{stat.label}</p>
                  <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Department Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <h3 className="text-sm font-bold text-white">Department Performance Matrix</h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Sort by:</span>
                <select
                  value={sortDept}
                  onChange={(e) => setSortDept(e.target.value as any)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="tatCompliance">TAT Compliance</option>
                  <option value="pending">Pending Count</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
            <div className="divide-y divide-slate-800/60">
              {sortedDepts.map((dept) => {
                const compColor = dept.tatCompliance >= 95 ? "bg-emerald-500" : dept.tatCompliance >= 85 ? "bg-amber-500" : "bg-rose-500";
                const textColor = dept.tatCompliance >= 95 ? "text-emerald-400" : dept.tatCompliance >= 85 ? "text-amber-400" : "text-rose-400";
                return (
                  <div key={dept.department} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors">
                    {/* Donut */}
                    <TATComplianceDonut compliance={dept.tatCompliance} />

                    {/* Dept name */}
                    <div className="min-w-[130px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{dept.icon}</span>
                        <span className="text-sm font-bold text-white">{dept.department}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Target TAT: <span className="font-bold text-slate-200">{dept.targetTAT}m</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 flex-1">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400">Tests</p>
                        <p className="text-sm font-black text-white">{dept.totalTests}</p>
                        <p className="text-[10px] text-emerald-400">{dept.completed} done</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400">Avg TAT</p>
                        <p className={`text-sm font-black ${dept.avgTAT > dept.targetTAT ? "text-rose-400" : "text-emerald-400"}`}>{dept.avgTAT}m</p>
                        <p className="text-[10px] text-slate-500">vs {dept.targetTAT}m</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400">Throughput</p>
                        <p className="text-sm font-black text-teal-300">{dept.throughputPerHour}/hr</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400">Pending</p>
                        <p className={`text-sm font-black ${dept.pendingCount > 20 ? "text-amber-400" : "text-slate-300"}`}>{dept.pendingCount}</p>
                        <p className="text-[10px] text-slate-500">awaiting</p>
                      </div>
                    </div>

                    {/* Compliance Bar */}
                    <div className="min-w-[140px]">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400">TAT Compliance</span>
                        <span className={`font-black ${textColor}`}>{dept.tatCompliance.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${compColor}`} style={{ width: `${dept.tatCompliance}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTLENECKS ── */}
      {activeView === "bottlenecks" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-300">{BOTTLENECK_ALERTS.filter((b) => ["CRITICAL", "HIGH"].includes(b.severity)).length} Active Bottlenecks Detected</p>
              <p className="text-xs text-slate-400 mt-0.5">Real-time workflow analysis identified these process constraints. Address in priority order to maintain TAT compliance.</p>
            </div>
          </div>

          {BOTTLENECK_ALERTS.map((alert) => {
            const sc = severityConfig[alert.severity];
            return (
              <div key={alert.id} className={`rounded-2xl border p-5 ${sc.bgColor} ${sc.borderColor}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${sc.dot} ${alert.severity === "CRITICAL" ? "animate-pulse" : ""}`} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-extrabold uppercase ${sc.color}`}>{alert.severity}</span>
                        <span className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-300">{alert.stage}</span>
                        <span className={`text-[10px] ${sc.color}`}>{alert.affectedTests} tests affected</span>
                      </div>
                      <p className="mt-1.5 text-sm font-bold text-white">{alert.description}</p>
                      <p className="mt-1 text-xs text-slate-300">⚠ Impact: {alert.impact}</p>
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-300"><strong>Suggested Action:</strong> {alert.suggestedAction}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all">
                      ✓ Acknowledge
                    </button>
                    <button className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all">
                      Escalate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAT BREACHES ── */}
      {activeView === "breaches" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-300">{TAT_BREACHES.length} TAT Breaches Today</p>
              <p className="text-xs text-slate-400 mt-0.5">Each breach triggers a root-cause investigation. Use this log for NABL/CAP audit evidence and process improvement.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
            <table className="w-full min-w-[800px] text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90">
                  {["Priority", "Barcode", "Test", "Department", "Analyzer", "Target TAT", "Actual TAT", "Breach By", "Root Cause", "Time"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {TAT_BREACHES.map((breach) => (
                  <tr key={breach.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`rounded-xl px-2 py-1 text-[10px] font-extrabold border ${breach.priority === "STAT" ? "border-rose-500/40 bg-rose-500/20 text-rose-300" : breach.priority === "URGENT" ? "border-amber-500/40 bg-amber-500/20 text-amber-300" : "border-slate-700 bg-slate-800 text-slate-300"}`}>
                        {breach.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-300">{breach.barcode}</td>
                    <td className="px-4 py-3 font-bold text-white">{breach.test}</td>
                    <td className="px-4 py-3 text-slate-300">{breach.department}</td>
                    <td className="px-4 py-3 text-slate-400">{breach.analyzer}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{breach.targetTAT}m</td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-400">{breach.actualTAT}m</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-2 py-1 text-[10px] font-black text-rose-400">
                        +{breach.breachBy}m
                      </span>
                    </td>
                    <td className="px-4 py-3 text-amber-300 italic">{breach.rootCause}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{breach.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
