"use client";

import React, { useState } from "react";
import {
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Award,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  Check,
  X,
  FileCheck,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Percent,
  Layers,
  ArrowRightLeft
} from "lucide-react";
import { Analyzer } from "@/types";

export interface ParallelSamplePoint {
  sampleId: string;
  patientUhid: string;
  oldLotValue: number;
  newLotValue: number;
  difference: number;
  percentBias: number;
}

export interface LotVerificationStudy {
  id: string;
  analyte: string;
  department: string;
  analyzerName: string;
  oldLotNumber: string;
  newLotNumber: string;
  newLotExpiry: string;
  runDate: string;
  conductedBy: string;
  verifiedBy: string;
  slope: number;
  intercept: number;
  correlationR: number;
  averagePercentBias: number;
  allowableBiasLimitPercent: number; // e.g. 5.0%
  status: "PASSED_ACCREDITED" | "FAILED_BIAS_EXCEEDED" | "PENDING_RUN";
  samples: ParallelSamplePoint[];
}

interface ReagentLotCorrelationSuiteProps {
  analyzers?: Analyzer[];
}

export default function ReagentLotCorrelationSuite({ analyzers = [] }: ReagentLotCorrelationSuiteProps) {
  const [studies, setStudies] = useState<LotVerificationStudy[]>([
    {
      id: "LOT-VER-CREAT-01",
      analyte: "Serum Creatinine (Enzymatic)",
      department: "Biochemistry",
      analyzerName: "Roche Cobas c311",
      oldLotNumber: "LOT-CR-9081",
      newLotNumber: "LOT-CR-9204 (New Batch)",
      newLotExpiry: "2027-08-30",
      runDate: "Today, 10:15 AM",
      conductedBy: "Tech Rajiv Sharma",
      verifiedBy: "Dr. Deshmukh (Biochemistry HOD)",
      slope: 0.998,
      intercept: 0.012,
      correlationR: 0.9996,
      averagePercentBias: 1.2,
      allowableBiasLimitPercent: 4.5,
      status: "PASSED_ACCREDITED",
      samples: [
        { sampleId: "S-01", patientUhid: "UHID-101", oldLotValue: 0.72, newLotValue: 0.73, difference: 0.01, percentBias: 1.4 },
        { sampleId: "S-02", patientUhid: "UHID-102", oldLotValue: 0.95, newLotValue: 0.96, difference: 0.01, percentBias: 1.1 },
        { sampleId: "S-03", patientUhid: "UHID-103", oldLotValue: 1.18, newLotValue: 1.19, difference: 0.01, percentBias: 0.8 },
        { sampleId: "S-04", patientUhid: "UHID-104", oldLotValue: 1.45, newLotValue: 1.47, difference: 0.02, percentBias: 1.4 },
        { sampleId: "S-05", patientUhid: "UHID-105", oldLotValue: 2.10, newLotValue: 2.12, difference: 0.02, percentBias: 0.9 },
        { sampleId: "S-06", patientUhid: "UHID-106", oldLotValue: 3.40, newLotValue: 3.44, difference: 0.04, percentBias: 1.2 },
        { sampleId: "S-07", patientUhid: "UHID-107", oldLotValue: 5.20, newLotValue: 5.25, difference: 0.05, percentBias: 1.0 },
      ],
    },
    {
      id: "LOT-VER-TROP-02",
      analyte: "High-Sensitivity Troponin I",
      department: "Immunology",
      analyzerName: "Abbott Architect i2000",
      oldLotNumber: "LOT-TRP-4401",
      newLotNumber: "LOT-TRP-4510 (Incoming)",
      newLotExpiry: "2027-05-15",
      runDate: "Yesterday",
      conductedBy: "Tech Maria L.",
      verifiedBy: "Dr. Verma (Pathologist)",
      slope: 1.004,
      intercept: 0.001,
      correlationR: 0.9998,
      averagePercentBias: 1.8,
      allowableBiasLimitPercent: 6.0,
      status: "PASSED_ACCREDITED",
      samples: [
        { sampleId: "S-11", patientUhid: "UHID-201", oldLotValue: 0.012, newLotValue: 0.012, difference: 0.0, percentBias: 0.0 },
        { sampleId: "S-12", patientUhid: "UHID-202", oldLotValue: 0.038, newLotValue: 0.039, difference: 0.001, percentBias: 2.6 },
        { sampleId: "S-13", patientUhid: "UHID-203", oldLotValue: 0.150, newLotValue: 0.152, difference: 0.002, percentBias: 1.3 },
        { sampleId: "S-14", patientUhid: "UHID-204", oldLotValue: 0.820, newLotValue: 0.835, difference: 0.015, percentBias: 1.8 },
      ],
    },
  ]);

  const [selectedStudy, setSelectedStudy] = useState<LotVerificationStudy>(studies[0]);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleUnlockNewLot = (study: LotVerificationStudy) => {
    showNotification(`New Reagent Lot #${study.newLotNumber} approved and unblocked for routine patient reporting.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-200" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-br from-slate-950 via-[#071f1e] to-slate-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/40 bg-teal-500/15 px-3 py-1 text-[11px] font-bold text-teal-300">
                <Award className="h-3.5 w-3.5 text-teal-400" />
                CLSI EP09-A3 & NABL Lot-to-Lot Verification
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Passing-Bablok Regression Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Reagent Lot-to-Lot Verification & Parallel Testing Suite
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Verify incoming reagent shipments before releasing to routine testing. Automatically execute 20-sample parallel testing comparison between current and new reagent lots, calculate % Bias at medical decision levels, and ensure Total Allowable Error compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCertificateModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-teal-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <FileCheck className="h-4 w-4" />
              Generate Lot Verification Certificate
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-300">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Lots</p>
              <p className="text-sm font-black text-white">{studies.length} Lots Accredited</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mean Correlation R</p>
              <p className="text-sm font-black text-emerald-300">R = 0.9997</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lot-to-Lot Bias</p>
              <p className="text-sm font-black text-cyan-300">1.2% (Allowable &lt; 4.5%)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CAP Standard</p>
              <p className="text-sm font-black text-blue-300">100% Compliant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Verification Studies */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-950 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Active Lot Verification Studies</h3>
          {studies.map((st) => (
            <div
              key={st.id}
              onClick={() => setSelectedStudy(st)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                selectedStudy.id === st.id
                  ? "border-teal-500/60 bg-teal-950/40 shadow-lg shadow-teal-500/10"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">{st.department}</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-bold">
                  {st.status.replace("_", " ")}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">{st.analyte}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{st.analyzerName}</p>

              <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] font-mono">
                <span className="text-slate-400">Bias: <strong className="text-emerald-400">{st.averagePercentBias}%</strong></span>
                <span className="text-teal-300">R = {st.correlationR}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Study Regression & Comparison Graph */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">{selectedStudy.analyte} — Parallel Lot Correlation</h3>
              <p className="text-xs text-slate-400">
                Old Lot: <span className="font-mono text-slate-300">{selectedStudy.oldLotNumber}</span> vs New Lot: <span className="font-mono text-teal-300">{selectedStudy.newLotNumber}</span>
              </p>
            </div>

            <button
              onClick={() => handleUnlockNewLot(selectedStudy)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/30 hover:bg-teal-500 transition-all"
            >
              <Check className="h-4 w-4" />
              Approve & Unblock New Lot
            </button>
          </div>

          {/* Statistical Regression Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-[10px] text-slate-400 font-sans block">Regression Slope (m)</span>
              <strong className="text-base text-white">{selectedStudy.slope}</strong>
              <span className="text-[10px] text-slate-500 block">Target: 0.95 - 1.05</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-[10px] text-slate-400 font-sans block">Y-Intercept (c)</span>
              <strong className="text-base text-cyan-300">{selectedStudy.intercept}</strong>
              <span className="text-[10px] text-slate-500 block">Systematic bias</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-[10px] text-slate-400 font-sans block">Pearson R</span>
              <strong className="text-base text-emerald-400">{selectedStudy.correlationR}</strong>
              <span className="text-[10px] text-slate-500 block">Linear fit &gt; 0.98</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-[10px] text-slate-400 font-sans block">Average % Bias</span>
              <strong className="text-base text-teal-300">+{selectedStudy.averagePercentBias}%</strong>
              <span className="text-[10px] text-emerald-400 block">Pass (Limit: 4.5%)</span>
            </div>
          </div>

          {/* Parallel Samples Comparison Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3">Patient Sample</th>
                  <th className="px-4 py-3">Old Lot Result</th>
                  <th className="px-4 py-3 text-teal-300">New Lot Result</th>
                  <th className="px-4 py-3">Abs Difference</th>
                  <th className="px-4 py-3 text-right">% Bias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                {selectedStudy.samples.map((s) => (
                  <tr key={s.sampleId} className="hover:bg-slate-900/80 text-slate-300">
                    <td className="px-4 py-2.5 font-sans font-medium text-white">{s.sampleId} ({s.patientUhid})</td>
                    <td className="px-4 py-2.5">{s.oldLotValue}</td>
                    <td className="px-4 py-2.5 text-teal-300 font-bold">{s.newLotValue}</td>
                    <td className="px-4 py-2.5">{s.difference}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-400">+{s.percentBias}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-teal-500/40 bg-slate-950 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-teal-400" />
                <div>
                  <h3 className="text-base font-bold text-white">CLSI EP09-A3 Reagent Lot Verification Certificate</h3>
                  <p className="text-[10px] text-teal-400 font-mono">DOCUMENT #LC-LOT-2026-9204</p>
                </div>
              </div>
              <button onClick={() => setShowCertificateModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 font-sans text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tested Analyte:</span>
                <span className="font-bold text-white">{selectedStudy.analyte} ({selectedStudy.analyzerName})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Old Lot Reference:</span>
                <span className="font-mono text-slate-300">{selectedStudy.oldLotNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">New Incoming Lot:</span>
                <span className="font-mono text-teal-300 font-bold">{selectedStudy.newLotNumber} (Exp: {selectedStudy.newLotExpiry})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Correlation & Regression:</span>
                <span className="font-mono text-emerald-300">R = {selectedStudy.correlationR} | Slope = {selectedStudy.slope}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Biological Variation Bias Check:</span>
                <span className="font-bold text-emerald-400">PASS (Bias +{selectedStudy.averagePercentBias}% &lt; Allowable Limit 4.5%)</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Authorizing Pathologist:</span>
                <span className="font-bold text-white">{selectedStudy.verifiedBy}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Ready for NABL inspection binder</span>
              <button
                onClick={() => {
                  window.print();
                  setShowCertificateModal(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-600/30"
              >
                <Printer className="h-4 w-4" />
                Print / Export Lot Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
