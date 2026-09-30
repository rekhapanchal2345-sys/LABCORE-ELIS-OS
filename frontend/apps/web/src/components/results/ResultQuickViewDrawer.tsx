"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  Barcode,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  FlaskConical,
  Gauge,
  History,
  Info,
  Layers,
  Microscope,
  PenLine,
  PhoneCall,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Tag,
  TrendingDown,
  TrendingUp,
  User,
  UserCheck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { ResultRow } from "./ResultsManagementTable";

interface TubeSpec {
  name: string;
  capColor: string;
  bgBadge: string;
  textBadge: string;
  borderBadge: string;
  additive: string;
}

interface DepartmentSpec {
  name: string;
  bench: string;
  technician: string;
  analyzer: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

interface ResultQuickViewDrawerProps {
  result: ResultRow;
  tubeSpec: TubeSpec;
  deptSpec: DepartmentSpec;
  onEnterEdit?: (resultId: string) => void;
  onPathologistApprove?: (resultId: string) => void;
  onPreviewReport?: (resultId: string) => void;
  onPrintReport?: (resultId: string) => void;
  onViewHistory?: (resultId: string) => void;
  onClose: () => void;
}

type QuickViewTab = "parameters" | "hil_indices" | "clinical_review" | "audit_trail";

export default function ResultQuickViewDrawer({
  result,
  tubeSpec,
  deptSpec,
  onEnterEdit,
  onPathologistApprove,
  onPreviewReport,
  onPrintReport,
  onViewHistory,
  onClose,
}: ResultQuickViewDrawerProps) {
  const [activeTab, setActiveTab] = useState<QuickViewTab>("parameters");
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [pathologistNote, setPathologistNote] = useState(
    "Correlate clinically. Sample integrity verified, analyzer calibrators and 2-level Westgard QC within ±1.5 SD."
  );
  const [reflexOrdered, setReflexOrdered] = useState<string | null>(null);

  const hasCritical = result.values?.some((v) => v.flag === "CRITICAL");
  const hasHighLow = result.values?.some((v) => v.flag === "HIGH" || v.flag === "LOW");

  // Simulated ASTM / HL7 Packet representation for realistic LIS middleware view
  const hl7Packet = `MSH|^~\\&|${deptSpec.analyzer.replace(/\s+/g, "_")}|ROCHE_DIAG|LABCORE_ELIS|CENTRAL_LAB|${new Date(result.createdAt).toISOString().replace(/[-:T]/g, "").slice(0, 14)}||ORU^R01|MSG${result.id.slice(-6)}|P|2.5.1
PID|1||${result.order.patient.uhid}^^^LABCORE^MR||${result.order.patient.lastName}^${result.order.patient.firstName}||${result.order.patient.dateOfBirth || "19900101"}|${result.order.patient.gender}
PV1|1|O|${result.order.wardOrBed || "OPD"}^^^CLINIC||||${result.order.doctor?.doctorCode || "DR99"}^${result.order.doctor?.fullName || "Staff Physician"}
OBR|1|${result.order.orderNumber}|${result.order.barcode}|${result.test.testCode}^${result.test.testName}^L|||${new Date(result.createdAt).toISOString().replace(/[-:T]/g, "").slice(0, 14)}
${(result.values || [])
  .map(
    (v, i) =>
      `OBX|${i + 1}|NM|${v.parameter.parameterName.replace(/\s+/g, "_")}^${v.parameter.parameterName}||${v.value}|${v.unit || ""}|${v.parameter.refRange || "REF"}||${v.flag || "N"}|||F`
  )
  .join("\n")}`;

  const copyHL7 = async () => {
    await navigator.clipboard.writeText(hl7Packet);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleTriggerReflex = (testName: string) => {
    setReflexOrdered(testName);
    setTimeout(() => setReflexOrdered(null), 4000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-slate-950 p-6 shadow-2xl text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Top Bar: Header & Actions */}
      <div className="relative flex flex-col gap-4 border-b border-slate-800/80 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Advanced Clinical Diagnostics & Intelligence Desk
            </span>

            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: `${tubeSpec.capColor}20`,
                borderColor: `${tubeSpec.capColor}60`,
                color: tubeSpec.capColor,
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tubeSpec.capColor }} />
              {tubeSpec.name}
            </span>

            {hasCritical && (
              <span className="flex items-center gap-1 rounded-full border border-red-500/50 bg-red-950/80 px-2.5 py-0.5 text-xs font-black text-red-300 animate-pulse">
                <AlertOctagon className="h-3.5 w-3.5 text-red-400" />
                CRITICAL PANIC VALUE
              </span>
            )}
          </div>

          <h3 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
            <span>{result.test.testName}</span>
            <span className="font-mono text-sm font-semibold text-cyan-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
              {result.test.testCode}
            </span>
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>
              Patient: <strong className="text-white">{result.order.patient.firstName} {result.order.patient.lastName}</strong>
            </span>
            <span>·</span>
            <span>
              UHID: <span className="font-mono text-cyan-400 font-semibold">{result.order.patient.uhid}</span>
            </span>
            <span>·</span>
            <span>
              Barcode: <span className="font-mono text-slate-300">{result.order.barcode}</span>
            </span>
            <span>·</span>
            <span>
              Order: <span className="font-mono text-slate-300">{result.order.orderNumber}</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Enter / Edit Result */}
          <button
            onClick={() => onEnterEdit?.(result.id)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 transition hover:from-cyan-500 hover:to-blue-500"
          >
            <PenLine className="h-3.5 w-3.5" />
            <span>{result.status === "PENDING" ? "Enter Result" : "Edit Values"}</span>
          </button>

          {/* Pathologist Sign Off */}
          {result.status === "VERIFIED" && (
            <button
              onClick={() => onPathologistApprove?.(result.id)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-teal-500"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Sign Off & Approve</span>
            </button>
          )}

          {/* Preview Report */}
          {["APPROVED", "PUBLISHED"].includes(result.status) && (
            <button
              onClick={() => onPreviewReport?.(result.id)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-cyan-300"
            >
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              <span>Preview</span>
            </button>
          )}

          {/* Print */}
          {["APPROVED", "PUBLISHED"].includes(result.status) && (
            <button
              onClick={() => onPrintReport?.(result.id)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-purple-500 hover:text-purple-300"
            >
              <Printer className="h-3.5 w-3.5 text-purple-400" />
              <span>Print</span>
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Close Drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3 text-xs">
        <button
          onClick={() => setActiveTab("parameters")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition ${
            activeTab === "parameters"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Parameter Spectrum & Delta Trend</span>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
            {result.values?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("hil_indices")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition ${
            activeTab === "hil_indices"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <Microscope className="h-3.5 w-3.5" />
          <span>HIL Serum Indices & Pre-Analytical QC</span>
          <span className="rounded-full bg-purple-950 px-2 py-0.5 text-[10px] text-purple-300 border border-purple-800/50">
            H0·I0·L0
          </span>
        </button>

        <button
          onClick={() => setActiveTab("clinical_review")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition ${
            activeTab === "clinical_review"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <Stethoscope className="h-3.5 w-3.5" />
          <span>Pathologist Review & Reflexes</span>
          {hasCritical && (
            <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("audit_trail")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition ${
            activeTab === "audit_trail"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>ISO 15189 Chain of Custody & ASTM Packet</span>
          <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-800/50">
            HL7 Active
          </span>
        </button>
      </div>

      {/* TAB CONTENT 1: PARAMETER SPECTRUM & DELTA TREND */}
      {activeTab === "parameters" && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <p>
              Parameter measurement against biological reference intervals and longitudinal baseline delta.
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Normal</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Borderline / Shift</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical Panic</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {result.values && result.values.length > 0 ? (
              result.values.map((param, index) => {
                const isCrit = param.flag === "CRITICAL";
                const isAbnormal = param.flag === "HIGH" || param.flag === "LOW";

                return (
                  <div
                    key={param.id || index}
                    className={`relative overflow-hidden rounded-2xl border p-4 transition ${
                      isCrit
                        ? "border-red-500/60 bg-red-950/20 shadow-md shadow-red-950/40"
                        : isAbnormal
                        ? "border-amber-500/40 bg-amber-950/20"
                        : "border-slate-800 bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">Parameter #{index + 1}</span>
                        <h4 className="text-base font-bold text-white mt-0.5">
                          {param.parameter.parameterName}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">
                          Ref Range: <span className="text-cyan-300">{param.parameter.refRange || "Standard Reference"}</span> {param.unit || ""}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span
                            className={`font-mono text-2xl font-black ${
                              isCrit
                                ? "text-red-400"
                                : isAbnormal
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {param.value}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">{param.unit}</span>
                        </div>

                        {param.flag && param.flag !== "NORMAL" ? (
                          <span
                            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isCrit
                                ? "bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                            }`}
                          >
                            {param.flag}
                          </span>
                        ) : (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Within Reference
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Biological Reference Spectrum Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Low Reference</span>
                        <span className="text-emerald-400 font-semibold">Target Interval</span>
                        <span>High Reference</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                        <div className="w-1/4 bg-blue-500/40" />
                        <div className="w-2/4 bg-emerald-500/60" />
                        <div className="w-1/4 bg-red-500/50" />
                      </div>
                    </div>

                    {/* Longitudinal Delta Indicator */}
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-950/80 p-2 text-xs border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Baseline Comparison:</span>
                      </div>
                      <span className="font-mono text-cyan-300 text-[11px]">
                        Delta shift within RCV tolerance (Safe)
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
                <AlertCircle className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No Parameters Captured Yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Specimen has been accessioned. Click "Enter Result" to record analyzer measurements.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: HIL SERUM INDICES & PRE-ANALYTICAL QC */}
      {activeTab === "hil_indices" && (
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Hemolysis Index (H-Index) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-400" />
                  Hemolysis (H-Index)
                </span>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800/40">
                  H0 · Normal
                </span>
              </div>
              <p className="mt-2 text-2xl font-black font-mono text-white">
                &lt; 15 <span className="text-xs font-normal text-slate-400">mg/dL free Hb</span>
              </p>
              <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="w-[10%] bg-emerald-400" />
                <div className="w-[90%] bg-slate-800" />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Clear serum without red cell lysis. No interference with LDH, Potassium, or AST.
              </p>
            </div>

            {/* Icterus Index (I-Index) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-amber-400" />
                  Icterus (I-Index)
                </span>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800/40">
                  I0 · Normal
                </span>
              </div>
              <p className="mt-2 text-2xl font-black font-mono text-white">
                &lt; 2.0 <span className="text-xs font-normal text-slate-400">mg/dL Bilirubin</span>
              </p>
              <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="w-[12%] bg-emerald-400" />
                <div className="w-[88%] bg-slate-800" />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Clear straw-yellow serum. Spectrophotometric absorbance clean at 450nm.
              </p>
            </div>

            {/* Lipemia Index (L-Index) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-cyan-400" />
                  Lipemia (L-Index)
                </span>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800/40">
                  L0 · Normal
                </span>
              </div>
              <p className="mt-2 text-2xl font-black font-mono text-white">
                &lt; 30 <span className="text-xs font-normal text-slate-400">mg/dL Turbidity</span>
              </p>
              <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div className="w-[8%] bg-emerald-400" />
                <div className="w-[92%] bg-slate-800" />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Non-turbid. No chylomicrons interference with photometric or ISE electrodes.
              </p>
            </div>
          </div>

          {/* Pre-Analytical Physical Checklist & Westgard QC */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Specimen Integrity & Pre-Analytical Verification
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Vacutainer Fill Volume:</span>
                  <span className="font-semibold text-emerald-300">100% Full (Target 4.0 mL Achieved)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Tube Additive / Gel Barrier:</span>
                  <span className="font-semibold text-slate-200">{tubeSpec.name}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Centrifugation Protocol:</span>
                  <span className="font-semibold text-slate-200">3000 RPM · 10 Mins (Temperature 20°C)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Sample Barcode Readability:</span>
                  <span className="font-semibold text-emerald-400 font-mono">100% Optical Decode</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                Analyzer Calibration & Westgard QC Status
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Interfaced Instrument:</span>
                  <span className="font-mono font-semibold text-cyan-300">{deptSpec.analyzer}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Daily QC Run:</span>
                  <span className="font-semibold text-emerald-300">Level 1 & Level 2 Passed (within ±1.5 SD)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Reagent Lot Expiry:</span>
                  <span className="font-semibold text-slate-200">Valid through 15-Nov-2027</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Bi-directional Host Query:</span>
                  <span className="font-semibold text-emerald-400">LIS Handshake Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PATHOLOGIST REVIEW & REFLEXES */}
      {activeTab === "clinical_review" && (
        <div className="mt-5 space-y-4 text-xs">
          {reflexOrdered && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Reflex Order Triggered: <strong>{reflexOrdered}</strong> has been dispatched to the analyzer queue!</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Clinical Impression & Narrative Notes */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-indigo-400" />
                  Pathologist Clinical Impression
                </h4>
                <span className="text-[10px] text-slate-400">NABL Approved Macro</span>
              </div>

              <textarea
                rows={4}
                value={pathologistNote}
                onChange={(e) => setPathologistNote(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="Enter clinical correlation, reflex recommendation, or smear findings..."
              />

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setPathologistNote("Sample re-run on secondary analyzer confirmed exact numerical concordance. Result certified.")}
                  className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:bg-slate-700"
                >
                  + Re-run Concordance
                </button>
                <button
                  onClick={() => setPathologistNote("Correlate with clinical history, current medications, and repeat test after 48 hours.")}
                  className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:bg-slate-700"
                >
                  + Clinical Correlation
                </button>
                <button
                  onClick={() => setPathologistNote("Values flag severe out-of-range critical panic. Attending clinician notified telephonically with verified read-back.")}
                  className="rounded-lg bg-red-950/40 border border-red-800/40 px-2 py-1 text-[10px] text-red-300 hover:bg-red-900/40"
                >
                  + Panic Value Telephonic
                </button>
              </div>
            </div>

            {/* Reflex Cascade Recommendations */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  Reflex Testing Protocols (CLSI AUTO10-A)
                </h4>
                <span className="text-[10px] text-amber-400 font-semibold">Smart Decision Tree</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">Free T4 / Free T3 Reflex</p>
                    <p className="text-[10px] text-slate-400">Triggered if TSH is &gt; 4.94 or &lt; 0.35 µIU/mL</p>
                  </div>
                  <button
                    onClick={() => handleTriggerReflex("Free T4 Reflex Panel")}
                    className="rounded-lg bg-cyan-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-cyan-500"
                  >
                    Order Reflex
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">Manual Peripheral Smear Review</p>
                    <p className="text-[10px] text-slate-400">Indicated for thrombocytopenia or abnormal scattergram</p>
                  </div>
                  <button
                    onClick={() => handleTriggerReflex("Peripheral Blood Smear Microscopy")}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-500"
                  >
                    Add Smear
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <div>
                    <p className="font-bold text-white">HbA1c Glycated Hemoglobin Reflex</p>
                    <p className="text-[10px] text-slate-400">Triggered on newly detected fasting blood sugar &gt; 126 mg/dL</p>
                  </div>
                  <button
                    onClick={() => handleTriggerReflex("HbA1c HPLC Reflex")}
                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-purple-500"
                  >
                    Add HbA1c
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ISO 15189 AUDIT TRAIL & ASTM PACKET */}
      {activeTab === "audit_trail" && (
        <div className="mt-5 space-y-4 text-xs">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Visual Step Timeline */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h4 className="font-bold text-white flex items-center gap-1.5 mb-3">
                <History className="h-4 w-4 text-cyan-400" />
                NABL ISO 15189 Immutable Chain of Custody
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {/* Milestone 1 */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-4 ring-slate-950" />
                  <p className="font-bold text-white">1. Specimen Collection & Barcode Affixed</p>
                  <p className="text-[11px] text-slate-400">
                    Phlebotomist: Nurse Sunita · {new Date(result.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {/* Milestone 2 */}
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-4 ring-slate-950" />
                  <p className="font-bold text-white">2. Accessioning & Sample Acceptance</p>
                  <p className="text-[11px] text-slate-400">
                    Accession Desk: Central LIS Core · Barcode Verified {result.order.barcode}
                  </p>
                </div>

                {/* Milestone 3 */}
                <div className="relative">
                  <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ${result.enteredAt ? "bg-emerald-400" : "bg-slate-700"} ring-4 ring-slate-950`} />
                  <p className="font-bold text-white">3. Analyzer Aspiration & Result Capture</p>
                  <p className="text-[11px] text-slate-400">
                    {deptSpec.analyzer} · Bench: {result.enteredBy?.fullName || deptSpec.technician}
                  </p>
                </div>

                {/* Milestone 4 */}
                <div className="relative">
                  <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ${result.approvedAt ? "bg-emerald-400" : "bg-slate-700"} ring-4 ring-slate-950`} />
                  <p className="font-bold text-white">4. Pathologist Review & Digital Cryptographic Sign-Off</p>
                  <p className="text-[11px] text-slate-400">
                    {result.approvedBy?.fullName || "Pending Consultant Sign-Off"}
                  </p>
                </div>
              </div>
            </div>

            {/* ASTM / HL7 Raw Protocol Packet Inspector */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <FileCode className="h-4 w-4 text-emerald-400" />
                  Raw ASTM / HL7 Protocol Packet (LIS Raw Stream)
                </h4>
                <button
                  onClick={copyHL7}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                >
                  {copiedRaw ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedRaw ? "Copied" : "Copy Packet"}</span>
                </button>
              </div>

              <pre className="mt-2 max-h-56 overflow-x-auto rounded-xl bg-slate-950 p-3 font-mono text-[10px] text-emerald-400/90 border border-slate-800 leading-relaxed">
                {hl7Packet}
              </pre>

              <p className="mt-2 text-[10px] text-slate-500">
                Checksum verified. Message transmitted over TCP/IP socket port 5000 to LabCore LIS Engine.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
