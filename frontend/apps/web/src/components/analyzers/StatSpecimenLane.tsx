"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Barcode,
  Send,
  Plus,
  RefreshCw,
  User,
  Activity,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Timer,
  TestTube,
  FlaskConical,
  Download,
  Microscope,
  X,
} from "lucide-react";
import { Analyzer } from "@/types";
import { analyzersApi } from "@/lib/api";

export interface StatTube {
  id: string;
  barcode: string;
  patientName: string;
  mrn: string;
  department: string;
  targetAnalyzerId: string;
  targetAnalyzerName: string;
  testCodes: string[];
  priority: "STAT_IMMEDIATE" | "URGENT_30MIN" | "HIGH_PRIORITY";
  status: "QUEUED" | "SENT_TO_LANE" | "ASPIRATING" | "ANALYSIS_COMPLETE" | "RESULT_RELEASED";
  insertedAt: Date;
  tatTargetMinutes: number;
  tatRemainingSeconds: number;
  criticalResultFlag?: boolean;
}

const LIFECYCLE_STEPS = [
  { key: "QUEUED", label: "Queued", icon: Clock, color: "text-slate-400" },
  { key: "SENT_TO_LANE", label: "Sent to Lane", icon: Activity, color: "text-blue-400" },
  { key: "ASPIRATING", label: "Aspirating", icon: FlaskConical, color: "text-amber-400" },
  { key: "ANALYSIS_COMPLETE", label: "Analysis Done", icon: Microscope, color: "text-cyan-400" },
  { key: "RESULT_RELEASED", label: "Result Released", icon: CheckCircle2, color: "text-emerald-400" },
];

const PRIORITY_LABELS: Record<string, { label: string; bg: string; text: string; border: string; tatMin: number }> = {
  STAT_IMMEDIATE: {
    label: "STAT — 15 MIN",
    bg: "bg-rose-500/20",
    text: "text-rose-300",
    border: "border-rose-500/50",
    tatMin: 15,
  },
  URGENT_30MIN: {
    label: "URGENT — 30 MIN",
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/40",
    tatMin: 30,
  },
  HIGH_PRIORITY: {
    label: "HIGH PRIORITY — 60 MIN",
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    border: "border-blue-500/40",
    tatMin: 60,
  },
};

interface StatSpecimenLaneProps {
  analyzers: Analyzer[];
  onResultReady?: (barcode: string) => void;
}

export default function StatSpecimenLane({ analyzers, onResultReady }: StatSpecimenLaneProps) {
  const [statTubes, setStatTubes] = useState<StatTube[]>([
    {
      id: "stat-1",
      barcode: "STAT-EMG-9021",
      patientName: "Rajesh Malhotra",
      mrn: "MRN-ICU-8812",
      department: "Emergency ICU",
      targetAnalyzerId: analyzers[0]?.id || "an-1",
      targetAnalyzerName: analyzers[0]?.name || "Sysmex XN-550 (Hematology)",
      testCodes: ["CBC_DIFF", "PLT_STAT", "ESR"],
      priority: "STAT_IMMEDIATE",
      status: "ASPIRATING",
      insertedAt: new Date(Date.now() - 6 * 60 * 1000),
      tatTargetMinutes: 15,
      tatRemainingSeconds: 9 * 60,
    },
    {
      id: "stat-2",
      barcode: "STAT-CCU-4402",
      patientName: "Meenakshi Sundaram",
      mrn: "MRN-CCU-9104",
      department: "Cardiac Care Unit",
      targetAnalyzerId: analyzers[1]?.id || "an-2",
      targetAnalyzerName: analyzers[1]?.name || "Roche Cobas e411 (Immuno)",
      testCodes: ["TROP_I_HS", "CK_MB", "NT_PRO_BNP"],
      priority: "STAT_IMMEDIATE",
      status: "SENT_TO_LANE",
      insertedAt: new Date(Date.now() - 3 * 60 * 1000),
      tatTargetMinutes: 20,
      tatRemainingSeconds: 17 * 60,
    },
    {
      id: "stat-3",
      barcode: "URG-OT-1198",
      patientName: "Kabir Khan",
      mrn: "MRN-OT-3321",
      department: "Operation Theatre 3",
      targetAnalyzerId: analyzers[2]?.id || "an-3",
      targetAnalyzerName: analyzers[2]?.name || "Beckman Coulter AU480",
      testCodes: ["K_ELECTROLYTE", "CREAT_STAT", "BUN"],
      priority: "URGENT_30MIN",
      status: "ANALYSIS_COMPLETE",
      insertedAt: new Date(Date.now() - 14 * 60 * 1000),
      tatTargetMinutes: 30,
      tatRemainingSeconds: 16 * 60,
      criticalResultFlag: true,
    },
    {
      id: "stat-4",
      barcode: "STAT-NICU-0033",
      patientName: "Baby of Priya Iyer",
      mrn: "MRN-NICU-0021",
      department: "NICU",
      targetAnalyzerId: analyzers[0]?.id || "an-1",
      targetAnalyzerName: analyzers[0]?.name || "Sysmex XN-550 (Hematology)",
      testCodes: ["CBC_DIFF", "BILIRUBIN_TOTAL", "CRP"],
      priority: "STAT_IMMEDIATE",
      status: "QUEUED",
      insertedAt: new Date(Date.now() - 1 * 60 * 1000),
      tatTargetMinutes: 15,
      tatRemainingSeconds: 14 * 60,
    },
  ]);

  const [showInjectModal, setShowInjectModal] = useState(false);
  const [newBarcode, setNewBarcode] = useState("");
  const [newPatient, setNewPatient] = useState("");
  const [newMrn, setNewMrn] = useState("");
  const [newDept, setNewDept] = useState("Emergency ICU");
  const [newAnalyzerId, setNewAnalyzerId] = useState(analyzers[0]?.id || "");
  const [selectedTests, setSelectedTests] = useState<string[]>(["CBC_DIFF"]);
  const [priority, setPriority] = useState<"STAT_IMMEDIATE" | "URGENT_30MIN" | "HIGH_PRIORITY">("STAT_IMMEDIATE");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [tatBreachAlert, setTatBreachAlert] = useState<string | null>(null);

  // Real-time TAT countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setStatTubes((prev) =>
        prev.map((tube) => {
          if (tube.status === "RESULT_RELEASED") return tube;
          const remaining = Math.max(0, tube.tatRemainingSeconds - 1);
          if (remaining === 0 && tube.tatRemainingSeconds > 0) {
            setTatBreachAlert(tube.barcode);
          }
          return { ...tube, tatRemainingSeconds: remaining };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-dismiss breach alert
  useEffect(() => {
    if (tatBreachAlert) {
      const t = setTimeout(() => setTatBreachAlert(null), 6000);
      return () => clearTimeout(t);
    }
  }, [tatBreachAlert]);

  const handleGenerateBarcode = () => {
    const dept = newDept.split(" ").map((w) => w[0]).join("").toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setNewBarcode(`STAT-${dept}-${rand}`);
  };

  const handleInjectSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarcode.trim() || !newPatient.trim()) return;
    const chosenAnalyzer = analyzers.find((a) => a.id === newAnalyzerId) || analyzers[0];
    const tatMin = priority === "STAT_IMMEDIATE" ? 15 : priority === "URGENT_30MIN" ? 30 : 60;

    const newTube: StatTube = {
      id: `stat-${Date.now()}`,
      barcode: newBarcode.trim().toUpperCase(),
      patientName: newPatient.trim(),
      mrn: newMrn.trim() || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      department: newDept,
      targetAnalyzerId: chosenAnalyzer?.id || "an-1",
      targetAnalyzerName: chosenAnalyzer?.name || "Primary Analyzer",
      testCodes: selectedTests,
      priority,
      status: "QUEUED",
      insertedAt: new Date(),
      tatTargetMinutes: tatMin,
      tatRemainingSeconds: tatMin * 60,
    };

    setStatTubes((prev) => [newTube, ...prev]);
    setNewBarcode("");
    setNewPatient("");
    setNewMrn("");
    setShowInjectModal(false);

    analyzersApi.createWorklistEntry({
      barcode: newTube.barcode,
      analyzerId: newTube.targetAnalyzerId,
      priority: "STAT",
      status: "SENT_TO_ANALYZER",
      testCode: selectedTests.join(","),
    }).catch(() => {});
  };

  const handleAdvanceStatus = (tubeId: string) => {
    setStatTubes((prev) =>
      prev.map((t) => {
        if (t.id !== tubeId) return t;
        if (t.status === "QUEUED") return { ...t, status: "SENT_TO_LANE" };
        if (t.status === "SENT_TO_LANE") return { ...t, status: "ASPIRATING" };
        if (t.status === "ASPIRATING") return { ...t, status: "ANALYSIS_COMPLETE" };
        if (t.status === "ANALYSIS_COMPLETE") {
          onResultReady?.(t.barcode);
          return { ...t, status: "RESULT_RELEASED" };
        }
        return t;
      })
    );
  };

  const handleExportTATReport = () => {
    const rows = [
      ["Barcode", "Patient", "MRN", "Department", "Priority", "Status", "TAT Target (min)", "TAT Remaining (sec)", "Inserted At"].join(","),
      ...statTubes.map((t) =>
        [t.barcode, t.patientName, t.mrn, t.department, t.priority, t.status, t.tatTargetMinutes, t.tatRemainingSeconds, t.insertedAt.toISOString()].join(",")
      ),
    ].join("\n");

    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(rows);
    a.download = `STAT_TAT_Compliance_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const filteredTubes = filterStatus === "ALL"
    ? statTubes
    : statTubes.filter((t) => t.status === filterStatus);

  const breachedCount = statTubes.filter((t) => t.tatRemainingSeconds === 0 && t.status !== "RESULT_RELEASED").length;
  const activeCount = statTubes.filter((t) => t.status !== "RESULT_RELEASED").length;
  const releasedCount = statTubes.filter((t) => t.status === "RESULT_RELEASED").length;

  return (
    <div className="space-y-4">
      {/* TAT Breach Alert Toast */}
      {tatBreachAlert && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-rose-500/60 bg-rose-950/90 px-5 py-3.5 text-white shadow-2xl shadow-rose-500/30 backdrop-blur-md animate-in slide-in-from-top-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-rose-300">⚠ TAT BREACH ALARM</p>
            <p className="text-sm font-bold text-white">{tatBreachAlert} exceeded turnaround time!</p>
          </div>
          <button onClick={() => setTatBreachAlert(null)} className="ml-2 text-rose-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-500/40 bg-gradient-to-br from-rose-950/80 via-slate-950 to-slate-900 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-pink-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-rose-500/50 bg-rose-500/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-rose-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                Live STAT Priority Engine
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">
                NABL ISO 15189 TAT Policy
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
              🚨 STAT & Emergency Specimen Priority Lane
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-300 leading-relaxed">
              Critical care specimen lifecycle management — ICU, CCU, OT, and NICU samples fast-tracked directly into analyzer carousel position 1.
              Real-time TAT countdown with breach alarms and pathologist alert notifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                handleGenerateBarcode();
                setShowInjectModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-red-500 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-rose-600/30 hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4" />
              Inject Emergency STAT Tube
            </button>
            <button
              type="button"
              onClick={handleExportTATReport}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            >
              <Download className="h-4 w-4" />
              TAT Compliance Export
            </button>
          </div>
        </div>

        {/* Live Summary Stats */}
        <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
          <div className="text-center">
            <p className="text-xl font-black text-rose-300">{activeCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active in Queue</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-black ${breachedCount > 0 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
              {breachedCount === 0 ? "✓ 0" : `⚠ ${breachedCount}`}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TAT Breaches</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-emerald-300">{releasedCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Results Released</p>
          </div>
        </div>
      </div>

      {/* Pipeline Visualizer */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pipeline Overview</p>
        <div className="relative flex items-center justify-between gap-1">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const count = statTubes.filter((t) => t.status === step.key).length;
            const StepIcon = step.icon;
            return (
              <React.Fragment key={step.key}>
                <button
                  onClick={() => setFilterStatus(filterStatus === step.key ? "ALL" : step.key)}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-center transition-all flex-1 ${
                    filterStatus === step.key
                      ? "border-blue-500/60 bg-blue-500/15 shadow-lg shadow-blue-500/10"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <StepIcon className={`h-4 w-4 ${step.color}`} />
                  <span className="text-[10px] font-bold text-slate-300">{step.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${count > 0 ? "bg-blue-500/20 text-blue-300" : "bg-slate-800 text-slate-500"}`}>
                    {count}
                  </span>
                </button>
                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-700" />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {filterStatus !== "ALL" && (
          <button
            onClick={() => setFilterStatus("ALL")}
            className="mt-2 text-[10px] font-bold text-blue-400 hover:underline"
          >
            ← Show all specimens
          </button>
        )}
      </div>

      {/* STAT Lane Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {filteredTubes.map((tube) => {
          const minutes = Math.floor(tube.tatRemainingSeconds / 60);
          const seconds = tube.tatRemainingSeconds % 60;
          const isOverdue = tube.tatRemainingSeconds === 0 && tube.status !== "RESULT_RELEASED";
          const isComplete = tube.status === "RESULT_RELEASED";
          const isAspiranting = tube.status === "ASPIRATING";
          const pCfg = PRIORITY_LABELS[tube.priority] || PRIORITY_LABELS.STAT_IMMEDIATE;
          const stepIdx = LIFECYCLE_STEPS.findIndex((s) => s.key === tube.status);
          const tatPercent = isComplete ? 100 : Math.max(0, Math.min(100, (1 - tube.tatRemainingSeconds / (tube.tatTargetMinutes * 60)) * 100));

          return (
            <div
              key={tube.id}
              className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 shadow-xl transition-all duration-300 ${
                isOverdue
                  ? "border-rose-600/80 bg-gradient-to-br from-rose-950/60 to-slate-950 animate-pulse"
                  : isComplete
                  ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-950"
                  : tube.criticalResultFlag
                  ? "border-rose-500/50 bg-gradient-to-br from-rose-950/30 to-slate-950"
                  : isAspiranting
                  ? "border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-slate-950"
                  : "border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950"
              }`}
            >
              {/* Critical Badge */}
              {tube.criticalResultFlag && (
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-rose-500/60 bg-rose-500/20 px-2 py-0.5 text-[9px] font-extrabold text-rose-300 uppercase">
                  <ShieldAlert className="h-3 w-3" />
                  CRITICAL VALUE
                </div>
              )}

              {/* Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${pCfg.bg} ${pCfg.text} ${pCfg.border}`}>
                    <Zap className="h-3 w-3" />
                    {pCfg.label}
                  </span>
                  <div className="mt-2 text-sm font-extrabold text-white">{tube.patientName}</div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {tube.mrn} · <span className="text-slate-300">{tube.department}</span>
                  </div>
                </div>

                {/* TAT Countdown Clock */}
                {!isComplete && (
                  <div className="text-right shrink-0">
                    <div className={`flex items-center gap-1.5 justify-end font-mono text-sm font-black ${isOverdue ? "text-rose-400" : minutes < 5 ? "text-amber-300" : "text-white"}`}>
                      <Timer className={`h-4 w-4 ${isOverdue ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
                      {isOverdue ? "BREACH!" : `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      {isOverdue ? "TAT EXCEEDED" : "Remaining"}
                    </span>
                  </div>
                )}
                {isComplete && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-extrabold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    RELEASED
                  </span>
                )}
              </div>

              {/* TAT Progress Bar */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isOverdue ? "bg-rose-500" : tatPercent > 80 ? "bg-amber-500" : tatPercent > 50 ? "bg-blue-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${tatPercent}%` }}
                />
              </div>

              {/* Barcode & Target */}
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-cyan-300">
                    <Barcode className="h-3.5 w-3.5 text-cyan-400" />
                    {tube.barcode}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Carousel Bay 1
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400 truncate">
                  → <strong className="text-white">{tube.targetAnalyzerName}</strong>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {tube.testCodes.map((code) => (
                    <span
                      key={code}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-300"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lifecycle Stepper */}
              <div className="mt-3 flex items-center gap-1">
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isDone = idx < stepIdx;
                  const isCurrent = idx === stepIdx;
                  return (
                    <React.Fragment key={step.key}>
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all ${
                        isDone ? "bg-emerald-500/20 text-emerald-400" : isCurrent ? "bg-blue-500/30 text-blue-300 ring-1 ring-blue-400/50 ring-offset-1 ring-offset-slate-900" : "bg-slate-800 text-slate-600"
                      }`}>
                        <StepIcon className="h-2.5 w-2.5" />
                      </div>
                      {idx < LIFECYCLE_STEPS.length - 1 && (
                        <div className={`h-px flex-1 ${isDone ? "bg-emerald-500/40" : "bg-slate-800"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Action Row */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3">
                <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                  isComplete ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" : "bg-slate-800 text-slate-400 border-slate-700"
                }`}>
                  {tube.status.replace(/_/g, " ")}
                </div>

                {!isComplete && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus(tube.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-blue-700 hover:to-blue-600 px-3.5 py-1.5 text-[11px] font-bold text-white transition-all shadow-sm hover:shadow-blue-500/20"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                    Advance
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inject Modal */}
      {showInjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-rose-950/50 to-slate-950 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Emergency STAT Specimen Injector</h3>
                  <p className="text-[11px] text-slate-400">Force immediate priority dispatch to analyzer carousel position 1</p>
                </div>
              </div>
              <button
                onClick={() => setShowInjectModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInjectSample} className="space-y-4 p-6 text-xs">
              {/* Priority Selector */}
              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["STAT_IMMEDIATE", "URGENT_30MIN", "HIGH_PRIORITY"] as const).map((p) => {
                    const cfg = PRIORITY_LABELS[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`rounded-xl border px-2 py-2.5 text-[10px] font-bold transition-all ${
                          priority === p
                            ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                            : "border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Barcode */}
              <div>
                <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Sample Barcode
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    placeholder="e.g. STAT-ICU-9901"
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-300 hover:text-white transition-colors"
                    title="Auto-generate barcode"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Patient Name + MRN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatient}
                    onChange={(e) => setNewPatient(e.target.value)}
                    placeholder="e.g. Sumanth Verma"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    MRN / UHID #
                  </label>
                  <input
                    type="text"
                    value={newMrn}
                    onChange={(e) => setNewMrn(e.target.value)}
                    placeholder="e.g. MRN-7782"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Department + Analyzer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Source Location
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option>Emergency ICU</option>
                    <option>Cardiac Care Unit</option>
                    <option>Operation Theatre 1</option>
                    <option>Operation Theatre 2</option>
                    <option>NICU</option>
                    <option>Trauma Ward</option>
                    <option>Burns Unit</option>
                    <option>Neurosurgery ICU</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Target Instrument
                  </label>
                  <select
                    value={newAnalyzerId}
                    onChange={(e) => setNewAnalyzerId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white focus:border-rose-500 focus:outline-none"
                  >
                    {analyzers.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.department || "Lab"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Test Profiles */}
              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Urgent Test Profiles
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["CBC_DIFF", "TROPONIN_I_HS", "ELECTROLYTES_STAT", "PT_INR_STAT", "ARTERIAL_BLOOD_GAS", "D_DIMER", "CREATININE_STAT", "BILIRUBIN_STAT", "PROCALCITONIN", "FIBRINOGEN"].map((test) => {
                    const isSelected = selectedTests.includes(test);
                    return (
                      <button
                        key={test}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (selectedTests.length > 1) {
                              setSelectedTests(selectedTests.filter((t) => t !== test));
                            }
                          } else {
                            setSelectedTests([...selectedTests, test]);
                          }
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-all ${
                          isSelected
                            ? "bg-rose-600/90 text-white border-rose-500"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200"
                        }`}
                      >
                        {test}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Row */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInjectModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:scale-105 transition-all"
                >
                  <Send className="h-4 w-4" />
                  🚨 Dispatch STAT Tube
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
