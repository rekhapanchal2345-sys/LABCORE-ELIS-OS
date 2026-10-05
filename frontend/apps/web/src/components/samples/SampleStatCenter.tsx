"use client";

import React from "react";
import { 
  Flame, Clock3, AlertTriangle, ArrowRight, ShieldAlert, 
  FlaskConical, UserRound, ScanLine, Printer, CheckCircle2, 
  Activity, Sparkles, Building2, BellRing
} from "lucide-react";

interface StatSample {
  id: string;
  sampleNumber: string;
  barcode: string;
  sampleType: string;
  status: string;
  priority?: string;
  createdAt: string;
  order: {
    orderNumber: string;
    patient: {
      firstName: string;
      lastName: string;
      uhid: string;
      gender: string;
      age?: number;
    };
    doctor?: {
      fullName: string;
    };
  };
  test: {
    testCode: string;
    testName: string;
    sampleContainer: string;
    processingDepartment?: string;
  };
}

interface SampleStatCenterProps {
  samples: StatSample[];
  onSelectSample: (sample: StatSample) => void;
  onAdvanceStatus: (sample: StatSample, nextStatus: string) => void;
  onPrintLabel: (sample: StatSample) => void;
  updatingSampleId: string | null;
}

function calculateTimeRemaining(createdAt: string, targetHours: number = 2) {
  const elapsedMs = Date.now() - new Date(createdAt).getTime();
  const targetMs = targetHours * 60 * 60 * 1000;
  const remainingMs = targetMs - elapsedMs;

  const isBreached = remainingMs <= 0;
  const absDiff = Math.abs(remainingMs);
  const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
  const hours = Math.floor(absDiff / (1000 * 60 * 60));

  return {
    isBreached,
    text: isBreached ? `${hours}h ${minutes}m OVERDUE` : `${hours}h ${minutes}m remaining`,
    percentElapsed: Math.min(100, Math.round((elapsedMs / targetMs) * 100)),
  };
}

export default function SampleStatCenter({
  samples,
  onSelectSample,
  onAdvanceStatus,
  onPrintLabel,
  updatingSampleId,
}: SampleStatCenterProps) {
  const statSamples = samples.filter(
    (s) => (s.priority === "STAT" || s.priority === "URGENT") && s.status !== "COMPLETED" && s.status !== "REJECTED"
  );

  const completedStatCount = samples.filter(
    (s) => (s.priority === "STAT" || s.priority === "URGENT") && s.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-6">
      {/* STAT Command Header */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-500/40 bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-950 p-6 text-white shadow-2xl shadow-rose-950/30">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl animate-pulse" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/20 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-rose-200 backdrop-blur-md">
              <Flame className="h-4 w-4 fill-rose-400 text-rose-400 animate-bounce" /> Emergency / ICU / STAT Turnaround Escalation Desk
            </div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Critical Specimen Fast-Track Queue
            </h2>
            <p className="text-xs text-rose-200/80 sm:text-sm max-w-2xl">
              Real-time turnaround time (TAT) monitoring for high-priority ICU, Emergency, and Cardiac Marker specimens with automated breach prevention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-center min-w-[120px] shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-300">Active STAT</p>
              <p className="text-2xl font-black text-white mt-0.5">{statSamples.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-center min-w-[120px] shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Completed Today</p>
              <p className="text-2xl font-black text-white mt-0.5">{completedStatCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* STAT Cards Grid */}
      {statSamples.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/60 p-12 text-center text-slate-500 space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">Zero Critical STAT Backlog</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              All emergency and ICU specimens are currently processed and delivered within clinical SLA targets.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {statSamples.map((sample) => {
            const tat = calculateTimeRemaining(sample.createdAt, 2);
            const isUpdating = updatingSampleId === sample.id;

            const nextStep =
              sample.status === "PENDING" ? { label: "Fast-Track Phlebotomy", next: "COLLECTED" } :
              sample.status === "COLLECTED" ? { label: "Direct Lab Receive", next: "RECEIVED" } :
              sample.status === "RECEIVED" ? { label: "Load on STAT Analyzer", next: "PROCESSING" } :
              sample.status === "PROCESSING" ? { label: "Validate Critical Result", next: "COMPLETED" } : null;

            return (
              <div
                key={sample.id}
                className={`relative overflow-hidden rounded-3xl border p-5 shadow-xl transition-all duration-300 ${
                  tat.isBreached
                    ? "border-rose-500 bg-gradient-to-br from-rose-950/50 via-slate-900 to-slate-950 ring-2 ring-rose-500/40"
                    : "border-amber-500/50 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950"
                }`}
              >
                {/* Header with Countdown Bar */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-white">{sample.sampleNumber}</span>
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-md">
                        STAT
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
                        {sample.status}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-400 flex items-center gap-1.5">
                      <ScanLine className="h-3.5 w-3.5 text-cyan-400" /> {sample.barcode}
                    </p>
                  </div>

                  <div className={`rounded-xl border px-3 py-1.5 text-right font-mono text-xs font-black ${
                    tat.isBreached
                      ? "border-rose-500/50 bg-rose-500/20 text-rose-200 animate-pulse"
                      : "border-amber-500/50 bg-amber-500/20 text-amber-200"
                  }`}>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Target TAT (2h)</p>
                    <p className="mt-0.5">{tat.text}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      tat.isBreached ? "bg-rose-500" : "bg-gradient-to-r from-amber-400 to-rose-500"
                    }`}
                    style={{ width: `${tat.percentElapsed}%` }}
                  />
                </div>

                {/* Patient & Test Specs */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-500">Patient</p>
                    <p className="font-bold text-slate-200 mt-0.5">
                      {sample.order.patient.firstName} {sample.order.patient.lastName}
                    </p>
                    <p className="text-slate-400 text-[11px]">UHID: {sample.order.patient.uhid}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-500">Critical Test</p>
                    <p className="font-bold text-rose-300 mt-0.5">{sample.test.testName}</p>
                    <p className="text-slate-400 text-[11px]">{sample.test.sampleContainer}</p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onSelectSample(sample)}
                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    Inspect Dossier
                  </button>
                  <button
                    onClick={() => onPrintLabel(sample)}
                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    🏷️ Label
                  </button>
                  {nextStep && (
                    <button
                      onClick={() => onAdvanceStatus(sample, nextStep.next)}
                      disabled={isUpdating}
                      className="ml-auto flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-rose-900/40 hover:from-rose-400 hover:to-red-500 disabled:opacity-50 transition-all"
                    >
                      <span>{nextStep.label}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
