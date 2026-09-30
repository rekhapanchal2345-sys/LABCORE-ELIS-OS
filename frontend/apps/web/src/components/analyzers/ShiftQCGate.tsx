"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Play,
  RotateCcw,
  FileCheck,
  TrendingUp,
  Activity,
  Award,
  Download,
  AlertCircle,
  Key,
  UserCheck,
  Sliders,
  ChevronDown,
  Info,
  Calendar,
  X
} from "lucide-react";
import { Analyzer } from "@/types";

export interface QCDataPoint {
  shiftNumber: number;
  date: string;
  value: number;
  zScore: number; // in standard deviations
  status: "NORMAL" | "WARNING" | "BREACH";
  breachType?: "1_3s" | "2_2s" | "R_4s" | "4_1s" | "10_x";
  operator: string;
}

export interface QCShiftEntry {
  analyzerId: string;
  analyzerName: string;
  department: string;
  analyte: string;
  unit: string;
  mean: number;
  sd: number;
  shift: "MORNING" | "EVENING" | "NIGHT";
  runDate: string;
  level1Status: "PASSED" | "FAILED" | "PENDING";
  level2Status: "PASSED" | "FAILED" | "PENDING";
  level3Status: "PASSED" | "FAILED" | "PENDING";
  westgardRule: "ALL_RULES_PASSED" | "1_3s" | "2_2s" | "R_4s" | "4_1s" | "10_x" | "PENDING_RUN";
  lockoutActive: boolean;
  signedOffBy?: string;
  signedOffAt?: string;
  correctiveAction?: string;
  cvPercentage: number;
  dataPoints: QCDataPoint[];
}

interface ShiftQCGateProps {
  analyzers: Analyzer[];
}

const SAMPLE_POINTS_1: QCDataPoint[] = [
  { shiftNumber: 1, date: "09-01", value: 13.9, zScore: -0.2, status: "NORMAL", operator: "Tech Sarah M." },
  { shiftNumber: 2, date: "09-02", value: 14.1, zScore: 0.2, status: "NORMAL", operator: "Tech Rajiv K." },
  { shiftNumber: 3, date: "09-03", value: 14.0, zScore: 0.0, status: "NORMAL", operator: "Tech Sarah M." },
  { shiftNumber: 4, date: "09-04", value: 14.3, zScore: 0.6, status: "NORMAL", operator: "Tech Rajiv K." },
  { shiftNumber: 5, date: "09-05", value: 14.2, zScore: 0.4, status: "NORMAL", operator: "Tech Maria L." },
  { shiftNumber: 6, date: "09-06", value: 14.0, zScore: 0.0, status: "NORMAL", operator: "Tech Sarah M." },
  { shiftNumber: 7, date: "09-07", value: 13.8, zScore: -0.4, status: "NORMAL", operator: "Tech Rajiv K." },
  { shiftNumber: 8, date: "09-08", value: 14.1, zScore: 0.2, status: "NORMAL", operator: "Tech Maria L." },
  { shiftNumber: 9, date: "09-09", value: 14.2, zScore: 0.4, status: "NORMAL", operator: "Tech Rajiv K." },
  { shiftNumber: 10, date: "09-10", value: 14.0, zScore: 0.0, status: "NORMAL", operator: "Tech Sarah M." },
  { shiftNumber: 11, date: "09-11", value: 14.3, zScore: 0.6, status: "NORMAL", operator: "Tech Rajiv K." },
  { shiftNumber: 12, date: "09-12", value: 14.1, zScore: 0.2, status: "NORMAL", operator: "Tech Maria L." },
  { shiftNumber: 13, date: "09-13", value: 14.0, zScore: 0.0, status: "NORMAL", operator: "Tech Sarah M." },
  { shiftNumber: 14, date: "09-14", value: 14.2, zScore: 0.4, status: "NORMAL", operator: "Tech Sarah M." },
];

const SAMPLE_POINTS_BREACH: QCDataPoint[] = [
  { shiftNumber: 1, date: "09-01", value: 92.4, zScore: 0.2, status: "NORMAL", operator: "Tech Ananya V." },
  { shiftNumber: 2, date: "09-02", value: 93.1, zScore: 0.4, status: "NORMAL", operator: "Tech John D." },
  { shiftNumber: 3, date: "09-03", value: 91.8, zScore: -0.1, status: "NORMAL", operator: "Tech Ananya V." },
  { shiftNumber: 4, date: "09-04", value: 94.0, zScore: 0.7, status: "NORMAL", operator: "Tech John D." },
  { shiftNumber: 5, date: "09-05", value: 95.2, zScore: 1.1, status: "NORMAL", operator: "Tech John D." },
  { shiftNumber: 6, date: "09-06", value: 96.8, zScore: 1.6, status: "NORMAL", operator: "Tech Ananya V." },
  { shiftNumber: 7, date: "09-07", value: 98.4, zScore: 2.1, status: "WARNING", breachType: "2_2s", operator: "Tech John D." },
  { shiftNumber: 8, date: "09-08", value: 99.1, zScore: 2.4, status: "WARNING", breachType: "2_2s", operator: "Tech Ananya V." },
  { shiftNumber: 9, date: "09-09", value: 97.5, zScore: 1.8, status: "NORMAL", operator: "Tech John D." },
  { shiftNumber: 10, date: "09-10", value: 98.2, zScore: 2.1, status: "WARNING", breachType: "2_2s", operator: "Tech Ananya V." },
  { shiftNumber: 11, date: "09-11", value: 99.8, zScore: 2.6, status: "WARNING", breachType: "2_2s", operator: "Tech John D." },
  { shiftNumber: 12, date: "09-12", value: 98.6, zScore: 2.2, status: "WARNING", breachType: "2_2s", operator: "Tech Ananya V." },
  { shiftNumber: 13, date: "09-13", value: 102.5, zScore: 3.5, status: "BREACH", breachType: "1_3s", operator: "Tech John D." },
  { shiftNumber: 14, date: "09-14", value: 101.9, zScore: 3.3, status: "BREACH", breachType: "1_3s", operator: "Tech Ananya V." },
];

const SAMPLE_POINTS_3: QCDataPoint[] = [
  { shiftNumber: 1, date: "09-01", value: 4.8, zScore: 0.1, status: "NORMAL", operator: "Tech Dave W." },
  { shiftNumber: 2, date: "09-02", value: 4.7, zScore: -0.2, status: "NORMAL", operator: "Tech Dave W." },
  { shiftNumber: 3, date: "09-03", value: 4.9, zScore: 0.3, status: "NORMAL", operator: "Tech Karen P." },
  { shiftNumber: 4, date: "09-04", value: 4.8, zScore: 0.1, status: "NORMAL", operator: "Tech Dave W." },
  { shiftNumber: 5, date: "09-05", value: 4.6, zScore: -0.5, status: "NORMAL", operator: "Tech Karen P." },
  { shiftNumber: 6, date: "09-06", value: 4.8, zScore: 0.1, status: "NORMAL", operator: "Tech Dave W." },
  { shiftNumber: 7, date: "09-07", value: 4.9, zScore: 0.3, status: "NORMAL", operator: "Tech Dave W." },
  { shiftNumber: 8, date: "09-08", value: 4.7, zScore: -0.2, status: "NORMAL", operator: "Tech Karen P." },
  { shiftNumber: 9, date: "09-09", value: 4.8, zScore: 0.1, status: "NORMAL", operator: "Tech Dave W." },
  { shiftNumber: 10, date: "09-10", value: 4.9, zScore: 0.3, status: "NORMAL", operator: "Tech Dave W." },
  { shiftNumber: 11, date: "09-11", value: 4.7, zScore: -0.2, status: "NORMAL", operator: "Tech Karen P." },
  { shiftNumber: 12, date: "09-12", value: 4.8, zScore: 0.1, status: "NORMAL", operator: "Tech Dave W." },
  { shiftNumber: 13, date: "09-13", value: 4.8, zScore: 0.1, status: "NORMAL", operator: "Tech Dave W." },
  { shiftNumber: 14, date: "09-14", value: 4.9, zScore: 0.3, status: "NORMAL", operator: "Tech Karen P." },
];

export default function ShiftQCGate({ analyzers }: ShiftQCGateProps) {
  const [qcEntries, setQcEntries] = useState<QCShiftEntry[]>([
    {
      analyzerId: analyzers[0]?.id || "an-1",
      analyzerName: analyzers[0]?.name || "Sysmex XN-550 (Hematology)",
      department: "Hematology",
      analyte: "Hemoglobin (Hgb)",
      unit: "g/dL",
      mean: 14.0,
      sd: 0.5,
      shift: "MORNING",
      runDate: new Date().toISOString().slice(0, 10),
      level1Status: "PASSED",
      level2Status: "PASSED",
      level3Status: "PASSED",
      westgardRule: "ALL_RULES_PASSED",
      lockoutActive: false,
      signedOffBy: "Dr. Ananya Ray (Chief Pathologist)",
      signedOffAt: "Today, 07:15 AM",
      cvPercentage: 1.4,
      dataPoints: SAMPLE_POINTS_1,
    },
    {
      analyzerId: analyzers[1]?.id || "an-2",
      analyzerName: analyzers[1]?.name || "Roche Cobas c311 (Biochemistry)",
      department: "Biochemistry",
      analyte: "Serum Glucose (Hexokinase)",
      unit: "mg/dL",
      mean: 92.0,
      sd: 3.0,
      shift: "MORNING",
      runDate: new Date().toISOString().slice(0, 10),
      level1Status: "PASSED",
      level2Status: "FAILED",
      level3Status: "PASSED",
      westgardRule: "1_3s",
      lockoutActive: true,
      signedOffBy: undefined,
      cvPercentage: 3.8,
      dataPoints: SAMPLE_POINTS_BREACH,
    },
    {
      analyzerId: analyzers[2]?.id || "an-3",
      analyzerName: analyzers[2]?.name || "Roche Cobas e411 (Immuno)",
      department: "Immunology",
      analyte: "Free Triiodothyronine (FT3)",
      unit: "pmol/L",
      mean: 4.8,
      sd: 0.35,
      shift: "MORNING",
      runDate: new Date().toISOString().slice(0, 10),
      level1Status: "PASSED",
      level2Status: "PASSED",
      level3Status: "PASSED",
      westgardRule: "ALL_RULES_PASSED",
      lockoutActive: false,
      signedOffBy: "Dr. Vikram Sethi (Sr. Biochemist)",
      signedOffAt: "Today, 06:45 AM",
      cvPercentage: 1.9,
      dataPoints: SAMPLE_POINTS_3,
    },
  ]);

  const [simulatingRun, setSimulatingRun] = useState<string | null>(null);
  const [selectedChartEntry, setSelectedChartEntry] = useState<QCShiftEntry | null>(qcEntries[1]);
  const [hoveredPoint, setHoveredPoint] = useState<QCDataPoint | null>(null);

  // Digital sign-off modal state
  const [signOffTarget, setSignOffTarget] = useState<QCShiftEntry | null>(null);
  const [pathologistName, setPathologistName] = useState("Dr. Ananya Ray, MD Path (NABL Signatory)");
  const [pathologistPin, setPathologistPin] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState(
    "Recalibrated with fresh lot CalSet #8891. Reagent bay flushed. 3-level control rerun within ±1.5 SD."
  );

  const handleRunQCBatch = (analyzerId: string) => {
    setSimulatingRun(analyzerId);
    setTimeout(() => {
      setQcEntries((prev) =>
        prev.map((e) => {
          if (e.analyzerId !== analyzerId) return e;
          const freshDataPoints: QCDataPoint[] = e.dataPoints.map((p, idx) => {
            if (idx === e.dataPoints.length - 1) {
              return {
                ...p,
                value: Number(e.mean.toFixed(1)),
                zScore: 0.1,
                status: "NORMAL",
                breachType: undefined,
              };
            }
            return p;
          });

          return {
            ...e,
            level1Status: "PASSED",
            level2Status: "PASSED",
            level3Status: "PASSED",
            westgardRule: "ALL_RULES_PASSED",
            lockoutActive: false,
            signedOffBy: "Auto-Verified (Control Batch Rerun Passed)",
            signedOffAt: "Just now",
            cvPercentage: 1.2,
            dataPoints: freshDataPoints,
          };
        })
      );
      setSimulatingRun(null);
    }, 1500);
  };

  const handleDigitalSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signOffTarget) return;

    setQcEntries((prev) =>
      prev.map((entry) => {
        if (entry.analyzerId !== signOffTarget.analyzerId) return entry;
        return {
          ...entry,
          lockoutActive: false,
          signedOffBy: pathologistName,
          signedOffAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          correctiveAction,
          westgardRule: "ALL_RULES_PASSED",
          level2Status: "PASSED",
        };
      })
    );

    setSignOffTarget(null);
    setPathologistPin("");
  };

  const lockedCount = qcEntries.filter((e) => e.lockoutActive).length;

  // Render Levey-Jennings SVG
  const renderLeveyJennings = (entry: QCShiftEntry) => {
    const width = 640;
    const height = 220;
    const padX = 50;
    const padY = 30;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    // Y scale: -3.5 SD to +3.5 SD
    const minZ = -3.5;
    const maxZ = 3.5;
    const getY = (z: number) => padY + ((maxZ - z) / (maxZ - minZ)) * innerH;
    const getX = (index: number) => padX + (index / (entry.dataPoints.length - 1)) * innerW;

    const meanY = getY(0);
    const p1sY = getY(1);
    const m1sY = getY(-1);
    const p2sY = getY(2);
    const m2sY = getY(-2);
    const p3sY = getY(3);
    const m3sY = getY(-3);

    // Path points
    const pointsStr = entry.dataPoints
      .map((p, i) => `${getX(i)},${getY(Math.max(-3.5, Math.min(3.5, p.zScore)))}`)
      .join(" ");

    return (
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Background Shading: ±1SD Greenish, ±2SD Yellowish, ±3SD Reddish */}
          <rect x={padX} y={p3sY} width={innerW} height={p2sY - p3sY} fill="#ef4444" fillOpacity="0.12" />
          <rect x={padX} y={p2sY} width={innerW} height={p1sY - p2sY} fill="#f59e0b" fillOpacity="0.10" />
          <rect x={padX} y={p1sY} width={innerW} height={m1sY - p1sY} fill="#10b981" fillOpacity="0.12" />
          <rect x={padX} y={m1sY} width={innerW} height={m2sY - m1sY} fill="#f59e0b" fillOpacity="0.10" />
          <rect x={padX} y={m2sY} width={innerW} height={m3sY - m2sY} fill="#ef4444" fillOpacity="0.12" />

          {/* Reference Lines */}
          <line x1={padX} y1={meanY} x2={width - padX} y2={meanY} stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
          <line x1={padX} y1={p1sY} x2={width - padX} y2={p1sY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
          <line x1={padX} y1={m1sY} x2={width - padX} y2={m1sY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
          <line x1={padX} y1={p2sY} x2={width - padX} y2={p2sY} stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3,2" />
          <line x1={padX} y1={m2sY} x2={width - padX} y2={m2sY} stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3,2" />
          <line x1={padX} y1={p3sY} x2={width - padX} y2={p3sY} stroke="#ef4444" strokeWidth="1.5" />
          <line x1={padX} y1={m3sY} x2={width - padX} y2={m3sY} stroke="#ef4444" strokeWidth="1.5" />

          {/* Left Labels */}
          <text x={padX - 8} y={meanY + 3} textAnchor="end" fontSize="9" fill="#10b981" fontWeight="bold">Mean</text>
          <text x={padX - 8} y={p1sY + 3} textAnchor="end" fontSize="8" fill="#64748b">+1s</text>
          <text x={padX - 8} y={m1sY + 3} textAnchor="end" fontSize="8" fill="#64748b">-1s</text>
          <text x={padX - 8} y={p2sY + 3} textAnchor="end" fontSize="8" fill="#d97706" fontWeight="bold">+2s</text>
          <text x={padX - 8} y={m2sY + 3} textAnchor="end" fontSize="8" fill="#d97706" fontWeight="bold">-2s</text>
          <text x={padX - 8} y={p3sY + 3} textAnchor="end" fontSize="8" fill="#ef4444" fontWeight="bold">+3s</text>
          <text x={padX - 8} y={m3sY + 3} textAnchor="end" fontSize="8" fill="#ef4444" fontWeight="bold">-3s</text>

          {/* Right Labels (Actual calculated values) */}
          <text x={width - padX + 8} y={meanY + 3} textAnchor="start" fontSize="9" fill="#10b981" fontWeight="bold">{entry.mean}</text>
          <text x={width - padX + 8} y={p2sY + 3} textAnchor="start" fontSize="8" fill="#d97706">{(entry.mean + 2 * entry.sd).toFixed(1)}</text>
          <text x={width - padX + 8} y={m2sY + 3} textAnchor="start" fontSize="8" fill="#d97706">{(entry.mean - 2 * entry.sd).toFixed(1)}</text>
          <text x={width - padX + 8} y={p3sY + 3} textAnchor="start" fontSize="8" fill="#ef4444">{(entry.mean + 3 * entry.sd).toFixed(1)}</text>

          {/* Connective Line */}
          <polyline points={pointsStr} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* Data Points */}
          {entry.dataPoints.map((p, i) => {
            const cx = getX(i);
            const cy = getY(Math.max(-3.5, Math.min(3.5, p.zScore)));
            const isBreach = p.status === "BREACH";
            const isWarn = p.status === "WARNING";

            return (
              <g
                key={i}
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isBreach ? 6 : isWarn ? 5 : 4}
                  fill={isBreach ? "#ef4444" : isWarn ? "#f59e0b" : "#38bdf8"}
                  stroke="#ffffff"
                  strokeWidth={isBreach || isWarn ? "2" : "1.5"}
                  className={isBreach ? "animate-pulse" : ""}
                />
                {/* Date labels at bottom */}
                <text x={cx} y={height - 8} textAnchor="middle" fontSize="7.5" fill="#64748b">
                  {p.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 z-20 rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur-md text-white min-w-[200px]">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
              <span className="font-bold text-sky-400">Shift #{hoveredPoint.shiftNumber}</span>
              <span className="text-slate-400 font-mono text-[10px]">{hoveredPoint.date}</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Measured Value:</span>
                <span className="font-bold font-mono text-white">{hoveredPoint.value} {entry.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Z-Score (SD):</span>
                <span className={`font-bold font-mono ${hoveredPoint.zScore > 2 || hoveredPoint.zScore < -2 ? "text-rose-400" : "text-emerald-400"}`}>
                  {hoveredPoint.zScore > 0 ? `+${hoveredPoint.zScore}` : hoveredPoint.zScore}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Operator:</span>
                <span className="text-slate-300">{hoveredPoint.operator}</span>
              </div>
              {hoveredPoint.breachType && (
                <div className="mt-2 rounded-md bg-rose-500/20 border border-rose-500/40 p-1.5 text-center text-rose-300 font-bold text-[10px]">
                  Westgard Rule Breached: {hoveredPoint.breachType}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Shift QC Header */}
      <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
                ISO 15189 / NABL / CAP Accredited Quality Gate
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Westgard Multi-Rule Engine Active
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Shift Quality Control & Westgard Release Lockout
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl">
              Strict lockout mechanism prevents patient diagnostic reports from being released if morning/evening Level 1 (Low), Level 2 (Normal), or Level 3 (High) controls violate standard deviation rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const csvData = qcEntries.map(e => `"${e.analyzerName}","${e.analyte}","${e.shift}","${e.westgardRule}","${e.cvPercentage}%","${e.signedOffBy || 'PENDING'}"`).join("\n");
                const blob = new Blob([`Analyzer,Analyte,Shift,WestgardRule,CV,Signatory\n${csvData}`], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `qc-audit-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export QC Audit Log
            </button>

            <span
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold shadow-lg ${
                lockedCount > 0
                  ? "bg-rose-500/20 text-rose-200 border border-rose-500/40 shadow-rose-900/30"
                  : "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-emerald-900/30"
              }`}
            >
              {lockedCount > 0 ? (
                <>
                  <Lock className="h-4 w-4 text-rose-400 animate-pulse" />
                  {lockedCount} Instrument Auto-Locked Out
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 text-emerald-400" />
                  All Instruments QC Verified
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* QC Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {qcEntries.map((qc) => {
          const isLocked = qc.lockoutActive;
          const isSimulating = simulatingRun === qc.analyzerId;
          const isSelectedForChart = selectedChartEntry?.analyzerId === qc.analyzerId;

          return (
            <div
              key={qc.analyzerId}
              onClick={() => setSelectedChartEntry(qc)}
              className={`group relative rounded-3xl border p-5 shadow-xl transition-all cursor-pointer ${
                isSelectedForChart
                  ? "border-sky-500 bg-slate-900/95 ring-2 ring-sky-500/30 shadow-sky-950/40"
                  : isLocked
                  ? "border-rose-500/40 bg-slate-900/80 hover:border-rose-400/60"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                    {qc.analyzerName}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {qc.department} · <span className="text-sky-400 font-semibold">{qc.analyte}</span>
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                    isLocked
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  {isLocked ? "LOCKOUT ACTIVE" : "PATIENT RUN READY"}
                </span>
              </div>

              {/* 3-Level Controls Matrix */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Level 1 (Low)", status: qc.level1Status },
                  { label: "Level 2 (Normal)", status: qc.level2Status },
                  { label: "Level 3 (High)", status: qc.level3Status },
                ].map((lvl) => (
                  <div
                    key={lvl.label}
                    className={`rounded-xl border p-2.5 text-center transition-all ${
                      lvl.status === "PASSED"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-rose-500/30 bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20"
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase block text-slate-400">
                      {lvl.label}
                    </span>
                    <span className="mt-1 flex items-center justify-center gap-1 font-bold text-xs">
                      {lvl.status === "PASSED" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-rose-400" />
                      )}
                      {lvl.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Westgard & CV% Info */}
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Westgard Multi-Rule:</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      qc.westgardRule === "ALL_RULES_PASSED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {qc.westgardRule.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Mean ± SD:</span>
                  <span className="font-mono text-slate-200">
                    {qc.mean} ± {qc.sd} {qc.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Coefficient of Variation:</span>
                  <span className="font-mono font-bold text-sky-400">{qc.cvPercentage}% CV</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px]">
                  <span className="text-slate-400">Verified By:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[180px]">
                    {qc.signedOffBy || "Pending Pathologist"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
                {isLocked ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSignOffTarget(qc);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition-all"
                  >
                    <Key className="h-3 w-3" />
                    Pathologist Sign-Off
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approved for Run
                  </span>
                )}

                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunQCBatch(qc.analyzerId);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/20 disabled:opacity-50 transition-all"
                >
                  <Play className={`h-3 w-3 ${isSimulating ? "animate-spin" : ""}`} />
                  {isSimulating ? "Aspirating QC..." : "Rerun Controls"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Levey-Jennings Interactive Chart Section */}
      {selectedChartEntry && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">
                  Levey-Jennings Chart: {selectedChartEntry.analyte}
                </h3>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-300">
                  {selectedChartEntry.analyzerName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                14-Shift Longitudinal Quality Control Drift Analysis with Mean, ±1s, ±2s, and ±3s standard deviation envelopes.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Mean ({selectedChartEntry.mean})
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> ±2s Warning
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> ±3s Rejection
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          {renderLeveyJennings(selectedChartEntry)}

          {/* Westgard Rules Legend */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-sky-400" />
              Westgard Multi-Rule Evaluation Engine Reference
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
                <span className="font-mono font-bold text-rose-400">1:3s Rule (Random/Systemic)</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  1 control observation exceeds the Mean ± 3SD. Run is <strong className="text-rose-400">rejected</strong> immediately.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
                <span className="font-mono font-bold text-amber-400">2:2s Rule (Systemic Error)</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  2 consecutive control observations exceed the same +2SD or -2SD limit. Run is <strong className="text-amber-400">rejected</strong>.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
                <span className="font-mono font-bold text-sky-400">R:4s & 10:x Rules</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Range between 2 controls exceeds 4s or 10 consecutive runs fall on one side of Mean. Requires recalibration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pathologist Digital Sign-Off & Lockout Release Modal */}
      {signOffTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Pathologist Lockout Override</h3>
                  <p className="text-xs text-slate-400">
                    Release {signOffTarget.analyzerName} for Patient Diagnostics
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSignOffTarget(null)}
                className="rounded-xl border border-slate-800 p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDigitalSignOff} className="mt-4 space-y-4">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  CAP/NABL Compliance Notice
                </p>
                This action releases an instrument that triggered a <strong>{signOffTarget.westgardRule}</strong> violation. Every override is cryptographically logged to the laboratory audit chain with your digital credentials.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Authorized Signatory Pathologist
                </label>
                <input
                  type="text"
                  required
                  value={pathologistName}
                  onChange={(e) => setPathologistName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Corrective Action Taken
                </label>
                <textarea
                  required
                  rows={3}
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none resize-none"
                  placeholder="e.g., Replaced diluent lot, probe wash performed, 3-level control rerun verified."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Security Sign-Off PIN / Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter 4-digit pathologist PIN"
                  value={pathologistPin}
                  onChange={(e) => setPathologistPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setSignOffTarget(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all"
                >
                  <UserCheck className="h-4 w-4" />
                  Authorize & Release Lockout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

