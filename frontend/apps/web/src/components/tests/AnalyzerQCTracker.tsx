"use client";

import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Sliders,
  ExternalLink,
} from "lucide-react";

interface AnalyzerDevice {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  department: string;
  location: string;
  status: "ONLINE_READY" | "QC_DUE" | "MAINTENANCE" | "OFFLINE";
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  calibrationDaysRemaining: number;
  qcStatus: "PASSED" | "WARNING" | "FAILED";
  qcRunTime: string;
  qcRulesViolated?: string;
  assignedTestsCount: number;
  assignedTests: string[];
}

const DEFAULT_ANALYZERS: AnalyzerDevice[] = [
  {
    id: "inst-01",
    name: "Central Automated Hematology System",
    model: "Sysmex XN-550 (Automated 5-Part Diff)",
    manufacturer: "Sysmex Corporation",
    serialNumber: "SYX-550-98241",
    department: "Hematology & Coagulation",
    location: "Core Pathology Bay 1",
    status: "ONLINE_READY",
    lastCalibrationDate: "2026-09-15",
    nextCalibrationDate: "2026-12-15",
    calibrationDaysRemaining: 68,
    qcStatus: "PASSED",
    qcRunTime: "Today, 07:30 AM",
    assignedTestsCount: 14,
    assignedTests: ["Complete Blood Count (CBC)", "Platelet Count", "ESR Automated", "Absolute Neutrophil Count", "RBC Indices"],
  },
  {
    id: "inst-02",
    name: "Clinical Chemistry Integrated Workstation",
    model: "Roche Cobas c 311 Clinical Analyzer",
    manufacturer: "Roche Diagnostics",
    serialNumber: "RCH-C311-54019",
    department: "Clinical Biochemistry",
    location: "Biochemistry Bay 2",
    status: "ONLINE_READY",
    lastCalibrationDate: "2026-09-01",
    nextCalibrationDate: "2026-11-30",
    calibrationDaysRemaining: 53,
    qcStatus: "PASSED",
    qcRunTime: "Today, 08:00 AM",
    assignedTestsCount: 42,
    assignedTests: ["Liver Function Test (LFT)", "Kidney Function Test (KFT)", "Lipid Profile", "Serum Electrolytes (Na/K/Cl)", "Serum Uric Acid"],
  },
  {
    id: "inst-03",
    name: "Automated Chemiluminescence Immunoassay",
    model: "Abbott Architect i1000SR",
    manufacturer: "Abbott Laboratories",
    serialNumber: "ABT-I1000-8842",
    department: "Immunology & Endocrinology",
    location: "Immunoassay Bay 3",
    status: "QC_DUE",
    lastCalibrationDate: "2026-08-20",
    nextCalibrationDate: "2026-11-20",
    calibrationDaysRemaining: 43,
    qcStatus: "WARNING",
    qcRunTime: "Yesterday, 06:15 PM",
    qcRulesViolated: "Westgard 1:2s Warning (TSH Level 2 Control at +2.1 SD)",
    assignedTestsCount: 28,
    assignedTests: ["Thyroid Profile (T3, T4, TSH)", "Vitamin D (25-OH)", "Vitamin B12", "Ferritin", "Beta HCG", "Troponin I High-Sensitivity"],
  },
  {
    id: "inst-04",
    name: "High-Performance Liquid Chromatography (HPLC)",
    model: "Bio-Rad D-10 Hemoglobin Testing System",
    manufacturer: "Bio-Rad Laboratories",
    serialNumber: "BRD-D10-31892",
    department: "Hematology & Diabetes",
    location: "Diabetes Screening Bay",
    status: "ONLINE_READY",
    lastCalibrationDate: "2026-09-10",
    nextCalibrationDate: "2026-12-10",
    calibrationDaysRemaining: 63,
    qcStatus: "PASSED",
    qcRunTime: "Today, 07:45 AM",
    assignedTestsCount: 3,
    assignedTests: ["Glycosylated Hemoglobin (HbA1c)", "Hb Variant Screening", "Thalassemia Profile HPLC"],
  },
  {
    id: "inst-05",
    name: "Automated Coagulation Analyzer",
    model: "Stago STA Compact Max",
    manufacturer: "Diagnostica Stago",
    serialNumber: "STG-STA-44910",
    department: "Coagulation & Thrombosis",
    location: "Core Pathology Bay 1",
    status: "ONLINE_READY",
    lastCalibrationDate: "2026-09-22",
    nextCalibrationDate: "2026-12-22",
    calibrationDaysRemaining: 75,
    qcStatus: "PASSED",
    qcRunTime: "Today, 08:10 AM",
    assignedTestsCount: 6,
    assignedTests: ["Prothrombin Time (PT / INR)", "APTT", "D-Dimer Quantitative", "Fibrinogen"],
  },
];

export default function AnalyzerQCTracker() {
  const [analyzers, setAnalyzers] = useState<AnalyzerDevice[]>(DEFAULT_ANALYZERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedAnalyzer, setSelectedAnalyzer] = useState<AnalyzerDevice | null>(DEFAULT_ANALYZERS[0]);

  const filtered = analyzers.filter((a) => {
    if (selectedDept !== "ALL" && !a.department.toLowerCase().includes(selectedDept.toLowerCase())) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q) ||
        a.manufacturer.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const readyCount = analyzers.filter((a) => a.status === "ONLINE_READY").length;
  const qcDueCount = analyzers.filter((a) => a.status === "QC_DUE" || a.qcStatus !== "PASSED").length;

  return (
    <div className="space-y-6">
      {/* Light White Professional Clinical Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100/70 px-3.5 py-1 text-xs font-bold text-blue-800">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>NABL ISO 15189 Clause 5.3 Analyzer Traceability &amp; IQC</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Laboratory Analyzer Instruments &amp; Internal Quality Control (IQC)
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Track primary analyzer routing, daily two-level quality control runs (Level 1 Normal &amp; Level 2 Pathological), calibration validities, and Westgard multi-rule evaluations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 shadow-xs">
              <div className="flex h-3 w-3 items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-xs font-extrabold text-emerald-900 block">{readyCount} Analyzers Online</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">All Critical IQC Validated</span>
              </div>
            </div>

            {qcDueCount > 0 && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-xs">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <div className="text-left">
                  <span className="text-xs font-extrabold text-amber-900 block">{qcDueCount} Action Required</span>
                  <span className="text-[10px] text-amber-700 font-semibold block">Westgard Review / QC Due</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search analyzer name, model (e.g. Sysmex XN-550, Cobas c311), serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {["ALL", "Hematology", "Biochemistry", "Immunology", "Coagulation"].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedDept === dept
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {dept === "ALL" ? "All Departments" : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Analyzers List + Selected Analyzer Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Analyzers List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filtered.map((device) => {
            const isSelected = selectedAnalyzer?.id === device.id;
            return (
              <div
                key={device.id}
                onClick={() => setSelectedAnalyzer(device)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/60 border-blue-400 ring-2 ring-blue-500/10 shadow-sm"
                    : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {device.serialNumber}
                      </span>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {device.department}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {device.model}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {device.name} · {device.manufacturer}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      device.status === "ONLINE_READY"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${
                        device.status === "ONLINE_READY" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      <span>{device.status === "ONLINE_READY" ? "Online / Ready" : "QC Review"}</span>
                    </span>

                    <span className="text-[11px] text-slate-500 font-medium">
                      {device.assignedTestsCount} tests mapped
                    </span>
                  </div>
                </div>

                {/* Sub-strip: Calibration & IQC */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Next Calib: <strong className="text-slate-800">{device.nextCalibrationDate}</strong> ({device.calibrationDaysRemaining}d remaining)</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">IQC:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      device.qcStatus === "PASSED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {device.qcStatus === "PASSED" ? "✓ Levels 1 & 2 Passed" : "⚠ 1:2s Warning"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Analyzer Detail Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedAnalyzer ? (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  Instrument Dossier &amp; Traceability
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedAnalyzer.model}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAnalyzer.location} · Serial #{selectedAnalyzer.serialNumber}
                </p>
              </div>

              {/* IQC Control Card */}
              <div className={`p-4 rounded-2xl border ${
                selectedAnalyzer.qcStatus === "PASSED"
                  ? "bg-emerald-50/60 border-emerald-200"
                  : "bg-amber-50/70 border-amber-200"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Daily IQC Run Status</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedAnalyzer.qcStatus === "PASSED" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}>
                    {selectedAnalyzer.qcStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Last IQC Evaluation: <strong className="text-slate-800">{selectedAnalyzer.qcRunTime}</strong>
                </p>
                {selectedAnalyzer.qcRulesViolated && (
                  <div className="mt-2 text-xs font-semibold text-amber-900 bg-amber-100 p-2.5 rounded-xl border border-amber-300">
                    {selectedAnalyzer.qcRulesViolated}
                  </div>
                )}
              </div>

              {/* Mapped Tests Directory */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Routing Investigations ({selectedAnalyzer.assignedTests.length})</span>
                  <span className="text-[10px] text-blue-600 font-bold">Auto-Routed</span>
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {selectedAnalyzer.assignedTests.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800"
                    >
                      <span>{t}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Calibration Detail */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Last Multi-Point Calibration:</span>
                  <strong className="text-slate-800">{selectedAnalyzer.lastCalibrationDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Calibration Expiry / Due Date:</span>
                  <strong className="text-slate-800">{selectedAnalyzer.nextCalibrationDate}</strong>
                </div>
                <div className="flex justify-between text-blue-700 font-bold">
                  <span>Validation Window:</span>
                  <span>{selectedAnalyzer.calibrationDaysRemaining} days remaining</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => alert(`IQC log exported for ${selectedAnalyzer.model} (ISO 15189 Compliant).`)}
                  className="w-full py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs text-center cursor-pointer"
                >
                  Download NABL IQC Levey-Jennings Audit Log
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
              Select an analyzer to inspect IQC and calibration status
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
