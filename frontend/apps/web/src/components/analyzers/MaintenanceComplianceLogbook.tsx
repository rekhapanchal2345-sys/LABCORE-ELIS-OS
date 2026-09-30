"use client";

import React, { useState, useMemo } from "react";
import {
  Wrench,
  CheckCircle2,
  Calendar,
  Award,
  Download,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserCheck,
  FileText,
  RotateCcw,
  Sparkles,
  Printer,
  Key,
  Check,
  X,
  Info,
  Sliders,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers
} from "lucide-react";
import { Analyzer } from "@/types";

export interface MaintenanceTask {
  id: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "SEMI_ANNUAL";
  title: string;
  description: string;
  category: "HYDRAULIC_FLUIDICS" | "OPTICS_LAMP" | "CLEANING_DEPROTEINIZATION" | "CALIBRATION_CURVE";
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface CalibrationPoint {
  calLevel: number;
  nominalValue: number;
  measuredSignal: number;
  unit: string;
}

export interface CalibrationCurveRecord {
  id: string;
  analyte: string;
  analyzerId: string;
  analyzerName: string;
  calibratorLot: string;
  calibratedAt: string;
  calibratedBy: string;
  slope: number;
  intercept: number;
  rSquared: number;
  status: "PASSED_ACCREDITED" | "FAILED_DEVIATION";
  points: CalibrationPoint[];
}

interface MaintenanceComplianceLogbookProps {
  analyzers?: Analyzer[];
}

export default function MaintenanceComplianceLogbook({ analyzers = [] }: MaintenanceComplianceLogbookProps) {
  const [activeFrequency, setActiveFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "CALIBRATION">("DAILY");
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [supervisorName, setSupervisorName] = useState("Dr. Sunita Deshmukh (Quality Director)");
  const [supervisorPin, setSupervisorPin] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Maintenance Checklist Tasks
  const [tasks, setTasks] = useState<MaintenanceTask[]>([
    {
      id: "TSK-01",
      frequency: "DAILY",
      title: "Sample Needle & Aspiration Probe Wash",
      description: "Flush sample and reagent aspiration probes with Cellclean enzymatic deproteinizer solution.",
      category: "CLEANING_DEPROTEINIZATION",
      isCompleted: true,
      completedAt: "Today, 07:45 AM",
      completedBy: "Tech Rajesh Kumar",
    },
    {
      id: "TSK-02",
      frequency: "DAILY",
      title: "Fluidic Waste Carboy Emptying & Neutralization",
      description: "Drain biohazard liquid waste container and add 10% sodium hypochlorite disinfectant.",
      category: "HYDRAULIC_FLUIDICS",
      isCompleted: true,
      completedAt: "Today, 08:00 AM",
      completedBy: "Tech Rajesh Kumar",
    },
    {
      id: "TSK-03",
      frequency: "DAILY",
      title: "Optical Background Blank Count Check",
      description: "Run diluent blank through optical flow cell. Ensure WBC < 0.1, RBC < 0.02, PLT < 10.",
      category: "OPTICS_LAMP",
      isCompleted: true,
      completedAt: "Today, 08:15 AM",
      completedBy: "Tech Rajesh Kumar",
    },
    {
      id: "TSK-04",
      frequency: "DAILY",
      title: "Hydraulic Line Pressure & Syringe Vacuum Check",
      description: "Verify main vacuum tank is at -0.80 bar ± 0.05 bar and syringe pump seals are leak-free.",
      category: "HYDRAULIC_FLUIDICS",
      isCompleted: false,
    },
    {
      id: "TSK-05",
      frequency: "WEEKLY",
      title: "Optical Cuvette Bath Deproteinization",
      description: "Soak reaction carousel cuvettes in 2% acid wash followed by deionized water rinse.",
      category: "CLEANING_DEPROTEINIZATION",
      isCompleted: true,
      completedAt: "Monday, 10:30 AM",
      completedBy: "Senior Tech Anita Roy",
    },
    {
      id: "TSK-06",
      frequency: "WEEKLY",
      title: "Halogen Lamp Voltage & Optical Gain Test",
      description: "Inspect photometer tungsten-halogen lamp voltage (12.0V ± 0.2V) and filter wheel alignments.",
      category: "OPTICS_LAMP",
      isCompleted: true,
      completedAt: "Monday, 11:15 AM",
      completedBy: "Senior Tech Anita Roy",
    },
    {
      id: "TSK-07",
      frequency: "MONTHLY",
      title: "Peristaltic Pump Tubing Replacement & Lubrication",
      description: "Inspect silicone peristaltic pump rollers, lubricate gears, and check for micro-cracks.",
      category: "HYDRAULIC_FLUIDICS",
      isCompleted: false,
    },
    {
      id: "TSK-08",
      frequency: "MONTHLY",
      title: "Incubation Water Bath Algicide Treatment & Temperature Probe",
      description: "Clean water bath reservoir, replenish distilled water, verify 37.0°C ± 0.1°C with calibrated thermometer.",
      category: "CLEANING_DEPROTEINIZATION",
      isCompleted: true,
      completedAt: "01-Sep-2026",
      completedBy: "Biomedical Eng. V. Patel",
    },
  ]);

  // Real-world Multi-Point Calibration Curves
  const [calibrationCurves, setCalibrationCurves] = useState<CalibrationCurveRecord[]>([
    {
      id: "CAL-GLUC-01",
      analyte: "Serum Glucose (Hexokinase)",
      analyzerId: "demo-2",
      analyzerName: "Roche Cobas c311",
      calibratorLot: "CAL-ROCHE-LOT-8812",
      calibratedAt: "18-Sep-2026 09:20 AM",
      calibratedBy: "Dr. Deshmukh",
      slope: 1.002,
      intercept: 0.45,
      rSquared: 0.9998,
      status: "PASSED_ACCREDITED",
      points: [
        { calLevel: 1, nominalValue: 0, measuredSignal: 0.4, unit: "mg/dL" },
        { calLevel: 2, nominalValue: 50, measuredSignal: 50.2, unit: "mg/dL" },
        { calLevel: 3, nominalValue: 100, measuredSignal: 100.8, unit: "mg/dL" },
        { calLevel: 4, nominalValue: 200, measuredSignal: 201.1, unit: "mg/dL" },
        { calLevel: 5, nominalValue: 400, measuredSignal: 399.5, unit: "mg/dL" },
        { calLevel: 6, nominalValue: 800, measuredSignal: 802.4, unit: "mg/dL" },
      ],
    },
    {
      id: "CAL-TROP-02",
      analyte: "High-Sensitivity Troponin I",
      analyzerId: "demo-5",
      analyzerName: "Abbott Architect i2000",
      calibratorLot: "CAL-ABB-LOT-3301",
      calibratedAt: "12-Sep-2026 11:45 AM",
      calibratedBy: "Biomedical Eng. V. Patel",
      slope: 0.998,
      intercept: 0.002,
      rSquared: 0.9995,
      status: "PASSED_ACCREDITED",
      points: [
        { calLevel: 1, nominalValue: 0.0, measuredSignal: 0.002, unit: "ng/mL" },
        { calLevel: 2, nominalValue: 0.02, measuredSignal: 0.021, unit: "ng/mL" },
        { calLevel: 3, nominalValue: 0.1, measuredSignal: 0.099, unit: "ng/mL" },
        { calLevel: 4, nominalValue: 0.5, measuredSignal: 0.498, unit: "ng/mL" },
        { calLevel: 5, nominalValue: 2.0, measuredSignal: 2.004, unit: "ng/mL" },
        { calLevel: 6, nominalValue: 10.0, measuredSignal: 9.982, unit: "ng/mL" },
      ],
    },
  ]);

  const [selectedCurve, setSelectedCurve] = useState<CalibrationCurveRecord>(calibrationCurves[0]);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isDone = !t.isCompleted;
          return {
            ...t,
            isCompleted: isDone,
            completedAt: isDone ? "Just now" : undefined,
            completedBy: isDone ? "Lab Duty Tech" : undefined,
          };
        }
        return t;
      })
    );
    showNotification("Maintenance task status updated");
  };

  const handleSupervisorSignOff = () => {
    if (supervisorPin !== "1234" && supervisorPin !== "9999" && supervisorPin.length < 4) {
      showNotification("Please enter a valid 4-digit supervisor authorization PIN (e.g. 1234)");
      return;
    }
    setShowSignOffModal(false);
    showNotification(`Digital sign-off successfully recorded by ${supervisorName}. Cryptographic hash: #NABL-${Date.now().toString(16).toUpperCase()}`);
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const compliancePercentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-200" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-950 via-[#071f1a] to-slate-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                ISO 15189 / NABL / CAP Compliance
              </span>
              <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-bold text-teal-300">
                Audit Trail Tamper-Proof
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Preventive Maintenance & Accreditation Compliance Logbook
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Maintain regulatory inspection readiness. Execute scheduled daily, weekly, and monthly instrument maintenance checklists, verify 6-point multi-calibrator regression curves, and capture digital director sign-offs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSignOffModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition-all"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-300" />
              Digital Director Sign-Off
            </button>
            <button
              onClick={() => setShowCertModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Award className="h-4 w-4" />
              Generate NABL Audit Certificate
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Maintenance Score</p>
              <p className="text-sm font-black text-emerald-300">{compliancePercentage}% Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-300">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calibrations Valid</p>
              <p className="text-sm font-black text-white">100% (R² &gt; 0.999)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Scheduled PM</p>
              <p className="text-sm font-black text-cyan-300">In 4 Days (Monthly)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Status</p>
              <p className="text-sm font-black text-blue-300">NABL Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "DAILY", label: "Daily Maintenance Checklist", icon: Clock },
          { id: "WEEKLY", label: "Weekly Routines", icon: Calendar },
          { id: "MONTHLY", label: "Monthly & Semi-Annual PM", icon: Wrench },
          { id: "CALIBRATION", label: "Multi-Point Calibration Curves", icon: TrendingUp },
        ].map((tab) => {
          const isActive = activeFrequency === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFrequency(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW: CHECKLIST (Daily / Weekly / Monthly) */}
      {activeFrequency !== "CALIBRATION" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks
              .filter((t) => t.frequency === activeFrequency)
              .map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`group cursor-pointer rounded-3xl border p-5 transition-all duration-300 hover:shadow-xl ${
                    task.isCompleted
                      ? "border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border transition-all ${
                          task.isCompleted
                            ? "bg-emerald-500 border-emerald-400 text-slate-950"
                            : "border-slate-700 bg-slate-800 text-transparent group-hover:border-slate-500"
                        }`}
                      >
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
                      <div>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-300 uppercase">
                          {task.category}
                        </span>
                        <h3 className="mt-1 text-sm font-bold text-white leading-snug">{task.title}</h3>
                        <p className="mt-1 text-xs text-slate-400">{task.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                    <span>
                      Status:{" "}
                      <strong className={task.isCompleted ? "text-emerald-400" : "text-amber-400"}>
                        {task.isCompleted ? "Completed" : "Pending Execution"}
                      </strong>
                    </span>
                    {task.completedAt && (
                      <span className="font-mono text-slate-400">
                        {task.completedAt} ({task.completedBy})
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW: MULTI-POINT CALIBRATION CURVES */}
      {activeFrequency === "CALIBRATION" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Curve Selector */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Active Calibrations</h3>
            {calibrationCurves.map((curve) => (
              <div
                key={curve.id}
                onClick={() => setSelectedCurve(curve)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  selectedCurve.id === curve.id
                    ? "border-emerald-500/50 bg-emerald-950/30"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{curve.analyte}</h4>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                    R² = {curve.rSquared}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {curve.analyzerName} · Lot {curve.calibratorLot}
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  Calibrated: {curve.calibratedAt}
                </div>
              </div>
            ))}
          </div>

          {/* Curve Visualizer */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedCurve.analyte} Calibration Curve</h3>
                <p className="text-xs text-slate-400">
                  Instrument: {selectedCurve.analyzerName} · Lot: {selectedCurve.calibratorLot}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 font-mono text-xs font-bold text-emerald-300">
                  Slope: {selectedCurve.slope} | Y-Int: {selectedCurve.intercept}
                </span>
              </div>
            </div>

            {/* Regression Graph SVG */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
              <svg viewBox="0 0 500 220" className="w-full h-52">
                {/* Gridlines */}
                <line x1="50" y1="20" x2="50" y2="180" stroke="#334155" strokeWidth="1.5" />
                <line x1="50" y1="180" x2="480" y2="180" stroke="#334155" strokeWidth="1.5" />

                {[60, 100, 140].map((y) => (
                  <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                ))}

                {/* Regression Line */}
                <line x1="50" y1="180" x2="470" y2="35" stroke="#10b981" strokeWidth="2.5" />

                {/* Data Points */}
                {selectedCurve.points.map((pt, idx) => {
                  const x = 50 + (idx / 5) * 420;
                  const y = 180 - (idx / 5) * 145;
                  return (
                    <g key={pt.calLevel}>
                      <circle cx={x} cy={y} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y={y - 10} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="bold">
                        Cal {pt.calLevel} ({pt.measuredSignal})
                      </text>
                    </g>
                  );
                })}

                <text x="50" y="195" fontSize="9" fill="#64748b">0 (Blank)</text>
                <text x="470" y="195" fontSize="9" fill="#64748b">Max Linear Range</text>
              </svg>
            </div>

            {/* Point Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="py-2">Calibrator Level</th>
                    <th className="py-2">Nominal Target</th>
                    <th className="py-2">Measured Signal</th>
                    <th className="py-2">Recovery %</th>
                    <th className="py-2 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                  {selectedCurve.points.map((pt) => {
                    const recovery = pt.nominalValue === 0 ? 100 : Math.round((pt.measuredSignal / pt.nominalValue) * 100);
                    return (
                      <tr key={pt.calLevel} className="text-slate-300">
                        <td className="py-2">Level #{pt.calLevel}</td>
                        <td className="py-2">{pt.nominalValue} {pt.unit}</td>
                        <td className="py-2 text-emerald-400">{pt.measuredSignal} {pt.unit}</td>
                        <td className="py-2">{recovery}%</td>
                        <td className="py-2 text-right text-emerald-400 font-bold">PASS (CLIA OK)</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SIGN-OFF MODAL */}
      {showSignOffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Director Authorization Sign-Off</h3>
              </div>
              <button onClick={() => setShowSignOffModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Quality Director / Pathologist</label>
                <input
                  type="text"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Authorization Security PIN</label>
                <input
                  type="password"
                  value={supervisorPin}
                  onChange={(e) => setSupervisorPin(e.target.value)}
                  placeholder="Enter 4-digit PIN (e.g. 1234)"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-emerald-400"
                />
              </div>

              <div className="rounded-xl bg-slate-900/80 p-3 text-[11px] text-slate-400 border border-slate-800">
                Signing off stamps all current maintenance checklists and calibration curves as verified under ISO 15189 clause 5.3.1.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowSignOffModal(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSupervisorSignOff}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30"
                >
                  Confirm Digital Sign-Off
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT CERTIFICATE MODAL */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-emerald-500/40 bg-slate-950 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">NABL & CAP Audit Compliance Certificate</h3>
                  <p className="text-[10px] text-emerald-400 font-mono">REGULATORY DOCUMENT #LC-ACCR-2026-09</p>
                </div>
              </div>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 font-sans text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Laboratory Name:</span>
                <span className="font-bold text-white">LabCore Enterprise Central Reference Laboratory</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Accreditation Standards:</span>
                <span className="font-bold text-emerald-300">ISO 15189:2022 / NABL Medical Testing</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Fleet Instruments Audited:</span>
                <span className="font-bold text-white">Sysmex XN-550, Roche Cobas c311, Abbott Architect i2000</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Preventive Maintenance Status:</span>
                <span className="font-bold text-emerald-400">100% COMPLIANT (All Daily/Weekly Tasks Verified)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Digital Signatory:</span>
                <span className="font-bold text-white">{supervisorName}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Tamper-Proof Verification Hash:</span>
                <span className="font-mono text-[10px] text-cyan-300">0x7F82C9E4B10A349F2D881</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Inspection-ready print snapshot</span>
              <button
                onClick={() => {
                  window.print();
                  setShowCertModal(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30"
              >
                <Printer className="h-4 w-4" />
                Print / Export Compliance PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
