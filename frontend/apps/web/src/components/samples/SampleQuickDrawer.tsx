"use client";

import React, { useState } from "react";
import { 
  X, Activity, Clock3, AlertTriangle, Printer, MapPin, 
  ShieldCheck, FlaskConical, ScanLine, UserRound, Droplet, 
  CheckCircle2, ArrowRight, FileText, Phone, Building2, 
  ExternalLink, Sparkles, Loader2, ShieldAlert
} from "lucide-react";
import Link from "next/link";

interface QuickDrawerSample {
  id: string;
  sampleNumber: string;
  barcode: string;
  patientId: string;
  orderId: string;
  testId: string;
  sampleType: string;
  status: string;
  priority?: string;
  collectedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  collectedBy?: {
    fullName: string;
    employeeCode: string;
  };
  order: {
    id: string;
    orderNumber: string;
    patient: {
      id: string;
      uhid: string;
      firstName: string;
      lastName: string;
      gender: string;
      age?: number;
      phone?: string;
    };
    doctor?: {
      fullName: string;
      specialization?: string;
    };
  };
  test: {
    testCode: string;
    testName: string;
    sampleType: string;
    sampleContainer: string;
    processingDepartment?: string;
  };
}

interface SampleQuickDrawerProps {
  sample: QuickDrawerSample | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvance: (sample: QuickDrawerSample, action: "collect" | "receive" | "process" | "complete") => void;
  onReject: (sampleId: string) => void;
  onPrintLabel: (sample: QuickDrawerSample) => void;
  onPrintSheet: (sample: QuickDrawerSample) => void;
  updating: boolean;
}

export default function SampleQuickDrawer({
  sample,
  isOpen,
  onClose,
  onAdvance,
  onReject,
  onPrintLabel,
  onPrintSheet,
  updating,
}: SampleQuickDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "chain" | "sop">("overview");

  if (!isOpen || !sample) return null;

  const isStat = sample.priority === "STAT" || sample.priority === "URGENT";

  const getNextAction = (status: string) => {
    switch (status) {
      case "PENDING": return { label: "Mark Collected (Phlebotomy)", action: "collect" as const };
      case "COLLECTED": return { label: "Receive in Central Lab", action: "receive" as const };
      case "RECEIVED": return { label: "Start Analyzer Run", action: "process" as const };
      case "PROCESSING": return { label: "Complete & Validate", action: "complete" as const };
      default: return null;
    }
  };

  const nextStep = getNextAction(sample.status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-slate-800 bg-slate-950 text-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
          
          <div className="relative flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-0.5 font-mono text-[11px] font-bold text-cyan-300">
                  {sample.sampleNumber}
                </span>
                {isStat && (
                  <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-lg shadow-rose-900/50">
                    STAT / CRITICAL
                  </span>
                )}
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${
                  sample.status === "COMPLETED" ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300" :
                  sample.status === "PROCESSING" ? "border-violet-500/40 bg-violet-500/20 text-violet-300" :
                  sample.status === "RECEIVED" ? "border-cyan-500/40 bg-cyan-500/20 text-cyan-300" :
                  sample.status === "COLLECTED" ? "border-indigo-500/40 bg-indigo-500/20 text-indigo-300" :
                  sample.status === "REJECTED" ? "border-rose-500/40 bg-rose-500/20 text-rose-300" :
                  "border-amber-500/40 bg-amber-500/20 text-amber-300"
                }`}>
                  {sample.status}
                </span>
              </div>
              <h2 className="text-xl font-black text-white">{sample.test.testName}</h2>
              <p className="font-mono text-xs text-slate-400 flex items-center gap-2">
                <ScanLine className="h-3.5 w-3.5 text-cyan-400" /> Barcode: {sample.barcode} · Order: #{sample.order.orderNumber}
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-t border-slate-800/80 pt-4 mt-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`rounded-xl px-4 py-2 transition-all ${
                activeTab === "overview"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              Specimen Overview
            </button>
            <button
              onClick={() => setActiveTab("chain")}
              className={`rounded-xl px-4 py-2 transition-all ${
                activeTab === "chain"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              Chain of Custody
            </button>
            <button
              onClick={() => setActiveTab("sop")}
              className={`rounded-xl px-4 py-2 transition-all ${
                activeTab === "sop"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              Clinical Handling SOP
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Patient Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                    <UserRound className="h-4 w-4" /> Patient Demographics
                  </div>
                  <Link
                    href={`/patients/${sample.order.patient.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-cyan-300"
                  >
                    Patient Profile <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Full Name</p>
                    <p className="font-bold text-slate-100 text-sm mt-0.5">
                      {sample.order.patient.firstName} {sample.order.patient.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">UHID / Patient ID</p>
                    <p className="font-mono font-bold text-cyan-300 text-sm mt-0.5">{sample.order.patient.uhid}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Age & Gender</p>
                    <p className="font-semibold text-slate-300 mt-0.5">{sample.order.patient.age || "—"} Years · {sample.order.patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Referring Clinician</p>
                    <p className="font-semibold text-slate-300 mt-0.5">{sample.order.doctor?.fullName || "OPD / Self Requisition"}</p>
                  </div>
                </div>
              </div>

              {/* Specimen Integrity & Container Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                    <FlaskConical className="h-4 w-4" /> Container & Pre-Analytical Quality
                  </div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                    QC VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Container Type</p>
                    <p className="font-bold text-slate-100 mt-1">{sample.test.sampleContainer || "Standard Specimen Tube"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Specimen Matrix</p>
                    <p className="font-bold text-slate-100 mt-1">{sample.sampleType}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Hemolysis / Lipemia Index</p>
                    <p className="font-bold text-emerald-300 mt-1">Normal (&lt;15 mg/dL)</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Sample Volume</p>
                    <p className="font-bold text-emerald-300 mt-1">Adequate (3.0 mL)</p>
                  </div>
                </div>
              </div>

              {/* Quick Print Hub */}
              <div className="flex gap-3">
                <button
                  onClick={() => onPrintLabel(sample)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-950/40 p-3 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 transition-colors"
                >
                  <Printer className="h-4 w-4" /> Print Barcode Tube Label
                </button>
                <button
                  onClick={() => onPrintSheet(sample)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-950/40 p-3 text-xs font-bold text-indigo-300 hover:bg-indigo-900/50 transition-colors"
                >
                  <FileText className="h-4 w-4" /> Print Collection Sheet
                </button>
              </div>
            </>
          )}

          {activeTab === "chain" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Immutable Audit & Chain-of-Custody Log
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  <div className="relative">
                    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
                    <p className="text-xs font-bold text-slate-200">Requisition Registered</p>
                    <p className="text-[10px] text-slate-500">Order #{sample.order.orderNumber} created in ELIS</p>
                    <span className="text-[9px] font-mono text-slate-400">{new Date(sample.createdAt).toLocaleString()}</span>
                  </div>

                  {sample.collectedAt && (
                    <div className="relative">
                      <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-indigo-400 shadow-[0_0_8px_#818CF8]" />
                      <p className="text-xs font-bold text-slate-200">Specimen Collected (Phlebotomy)</p>
                      <p className="text-[10px] text-slate-500">Drawn by: {sample.collectedBy?.fullName || "Staff Phlebotomist"}</p>
                      <span className="text-[9px] font-mono text-slate-400">{new Date(sample.collectedAt).toLocaleString()}</span>
                    </div>
                  )}

                  {sample.receivedAt && (
                    <div className="relative">
                      <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
                      <p className="text-xs font-bold text-slate-200">Central Lab Accession & Integrity Passed</p>
                      <p className="text-[10px] text-slate-500">Received at Laboratory Reception</p>
                      <span className="text-[9px] font-mono text-slate-400">{new Date(sample.receivedAt).toLocaleString()}</span>
                    </div>
                  )}

                  {sample.completedAt && (
                    <div className="relative">
                      <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                      <p className="text-xs font-bold text-slate-200">Processing Completed & Validated</p>
                      <p className="text-[10px] text-slate-500">Ready for Diagnostic Reporting</p>
                      <span className="text-[9px] font-mono text-slate-400">{new Date(sample.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "sop" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <FlaskConical className="h-4 w-4" /> Clinical Specimen Handling Protocol
              </h3>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="font-bold text-slate-200">Inversion Protocol</p>
                  <p className="text-slate-400 mt-1">
                    Gently invert 8–10 times immediately after venipuncture to ensure uniform mixing with anticoagulant. Do not shake vigorously.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="font-bold text-slate-200">Centrifugation Speed & Time</p>
                  <p className="text-slate-400 mt-1">
                    Allow serum tubes to clot for 30 minutes at room temperature. Centrifuge at 3,500 RPM for 10 minutes at 20°C.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="font-bold text-slate-200">Storage & Stability</p>
                  <p className="text-slate-400 mt-1">
                    Stable at room temperature (20–25°C) for up to 4 hours. Store in refrigerated archive (2–8°C) for up to 72 hours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="border-t border-slate-800 bg-slate-950 p-5 flex items-center justify-between gap-3">
          {sample.status !== "REJECTED" && sample.status !== "COMPLETED" && (
            <button
              onClick={() => onReject(sample.id)}
              className="rounded-2xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs font-bold text-rose-300 hover:bg-rose-900/50 transition-colors"
            >
              Reject / Redraw
            </button>
          )}

          {nextStep ? (
            <button
              onClick={() => onAdvance(sample, nextStep.action)}
              disabled={updating}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>{nextStep.label}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> Sample Lifecycle Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
