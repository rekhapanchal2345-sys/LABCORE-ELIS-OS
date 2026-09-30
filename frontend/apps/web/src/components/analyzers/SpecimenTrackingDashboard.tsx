"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Barcode,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  ArrowRight,
  Microscope,
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Zap,
  FlaskConical,
  Layers,
  Eye,
  Download,
  Filter,
  MapPin,
} from "lucide-react";
import { Analyzer } from "@/types";

interface SpecimenTrackingDashboardProps {
  analyzers: Analyzer[];
}

type SpecimenStatus =
  | "COLLECTED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "PROCESSING"
  | "RESULTED"
  | "VALIDATED"
  | "REPORTED"
  | "REJECTED";

interface TrackingEvent {
  timestamp: string;
  event: string;
  location: string;
  operator: string;
  details?: string;
}

interface Specimen {
  id: string;
  barcode: string;
  patientName: string;
  patientId: string;
  sampleType: "Serum" | "EDTA" | "Citrate" | "Urine" | "CSF" | "Fluoride";
  priority: "STAT" | "ROUTINE" | "URGENT";
  status: SpecimenStatus;
  collectedAt: string;
  receivedAt?: string;
  resultedAt?: string;
  reportedAt?: string;
  department: string;
  analyzer?: string;
  tests: string[];
  tatMinutes: number;
  tatTarget: number;
  events: TrackingEvent[];
  isOverdue: boolean;
  tubeCount: number;
  volume: string;
  rejectionReason?: string;
}

const DEMO_SPECIMENS: Specimen[] = [
  {
    id: "S001",
    barcode: "LAB2024-001",
    patientName: "Ravi Sharma",
    patientId: "IP-4521",
    sampleType: "Serum",
    priority: "STAT",
    status: "PROCESSING",
    collectedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    receivedAt: new Date(Date.now() - 18 * 60000).toISOString(),
    resultedAt: undefined,
    department: "Biochemistry",
    analyzer: "Beckman AU680",
    tests: ["LFT", "KFT", "Electrolytes"],
    tatMinutes: 25,
    tatTarget: 30,
    events: [
      { timestamp: new Date(Date.now() - 25 * 60000).toISOString(), event: "Sample Collected", location: "Ward 4B", operator: "Nurse Priya" },
      { timestamp: new Date(Date.now() - 18 * 60000).toISOString(), event: "Received at Lab", location: "Central Lab", operator: "Lab Tech Anjali" },
      { timestamp: new Date(Date.now() - 12 * 60000).toISOString(), event: "Centrifugation Complete", location: "Pre-Analytical", operator: "Lab Tech Anjali" },
      { timestamp: new Date(Date.now() - 5 * 60000).toISOString(), event: "Loaded on Analyzer", location: "Biochemistry Bay", operator: "Auto (LAS)" },
    ],
    isOverdue: false,
    tubeCount: 3,
    volume: "4.5 mL",
  },
  {
    id: "S002",
    barcode: "LAB2024-002",
    patientName: "Anjali Gupta",
    patientId: "OP-7832",
    sampleType: "EDTA",
    priority: "STAT",
    status: "RESULTED",
    collectedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    receivedAt: new Date(Date.now() - 38 * 60000).toISOString(),
    resultedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    department: "Hematology",
    analyzer: "Sysmex XN-3000",
    tests: ["CBC with Diff", "Retic Count"],
    tatMinutes: 35,
    tatTarget: 30,
    events: [
      { timestamp: new Date(Date.now() - 45 * 60000).toISOString(), event: "Sample Collected", location: "OPD Phlebotomy", operator: "Nurse Kavya" },
      { timestamp: new Date(Date.now() - 38 * 60000).toISOString(), event: "Received at Lab", location: "Hematology Lab", operator: "Lab Tech Rahul" },
      { timestamp: new Date(Date.now() - 25 * 60000).toISOString(), event: "Loaded on Analyzer", location: "Hematology Bay", operator: "Auto (LAS)" },
      { timestamp: new Date(Date.now() - 10 * 60000).toISOString(), event: "Results Ready", location: "Hematology Bay", operator: "Sysmex XN-3000" },
    ],
    isOverdue: true,
    tubeCount: 1,
    volume: "2 mL",
  },
  {
    id: "S003",
    barcode: "LAB2024-003",
    patientName: "Mohammed Irfan",
    patientId: "IP-2219",
    sampleType: "Citrate",
    priority: "URGENT",
    status: "VALIDATED",
    collectedAt: new Date(Date.now() - 70 * 60000).toISOString(),
    receivedAt: new Date(Date.now() - 62 * 60000).toISOString(),
    resultedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    reportedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    department: "Coagulation",
    analyzer: "Stago STA-R Max",
    tests: ["PT/INR", "APTT", "Fibrinogen"],
    tatMinutes: 50,
    tatTarget: 60,
    events: [
      { timestamp: new Date(Date.now() - 70 * 60000).toISOString(), event: "Sample Collected", location: "ICU", operator: "Nurse Deepa" },
      { timestamp: new Date(Date.now() - 62 * 60000).toISOString(), event: "Received at Lab", location: "Coagulation Lab", operator: "Lab Tech Suresh" },
      { timestamp: new Date(Date.now() - 50 * 60000).toISOString(), event: "Sample Accepted", location: "Pre-Analytical", operator: "Lab Tech Suresh", details: "Citrate:Blood ratio verified 1:9" },
      { timestamp: new Date(Date.now() - 35 * 60000).toISOString(), event: "Analysis Complete", location: "Coagulation Bay", operator: "Stago STA-R Max" },
      { timestamp: new Date(Date.now() - 20 * 60000).toISOString(), event: "Validated by Pathologist", location: "Reporting Room", operator: "Dr. Nair", details: "INR 3.2 – Critical, doctor notified" },
    ],
    isOverdue: false,
    tubeCount: 2,
    volume: "2.7 mL",
  },
  {
    id: "S004",
    barcode: "LAB2024-004",
    patientName: "Sunita Patel",
    patientId: "OP-9901",
    sampleType: "Serum",
    priority: "ROUTINE",
    status: "RECEIVED",
    collectedAt: new Date(Date.now() - 55 * 60000).toISOString(),
    receivedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    department: "Immunology",
    tests: ["Thyroid Profile", "HbA1c"],
    tatMinutes: 40,
    tatTarget: 120,
    events: [
      { timestamp: new Date(Date.now() - 55 * 60000).toISOString(), event: "Sample Collected", location: "OPD Phlebotomy", operator: "Nurse Priya" },
      { timestamp: new Date(Date.now() - 40 * 60000).toISOString(), event: "Received at Lab", location: "Immunology Lab", operator: "Lab Tech Meena" },
    ],
    isOverdue: false,
    tubeCount: 2,
    volume: "3 mL",
  },
  {
    id: "S005",
    barcode: "LAB2024-005",
    patientName: "Vikram Singh",
    patientId: "ER-1122",
    sampleType: "EDTA",
    priority: "STAT",
    status: "REJECTED",
    collectedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    receivedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    department: "Hematology",
    tests: ["CBC"],
    tatMinutes: 10,
    tatTarget: 30,
    events: [
      { timestamp: new Date(Date.now() - 15 * 60000).toISOString(), event: "Sample Collected", location: "Emergency", operator: "Nurse Ramu" },
      { timestamp: new Date(Date.now() - 10 * 60000).toISOString(), event: "Received at Lab", location: "Hematology Lab", operator: "Lab Tech Rahul" },
      { timestamp: new Date(Date.now() - 7 * 60000).toISOString(), event: "Sample Rejected", location: "Pre-Analytical", operator: "Lab Tech Rahul", details: "Grossly hemolyzed – Rebleed requested" },
    ],
    isOverdue: false,
    tubeCount: 1,
    volume: "1.2 mL",
    rejectionReason: "Grossly hemolyzed – Rebleed requested",
  },
  {
    id: "S006",
    barcode: "LAB2024-006",
    patientName: "Pooja Mehta",
    patientId: "IP-6683",
    sampleType: "Urine",
    priority: "ROUTINE",
    status: "REPORTED",
    collectedAt: new Date(Date.now() - 180 * 60000).toISOString(),
    receivedAt: new Date(Date.now() - 170 * 60000).toISOString(),
    resultedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    reportedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    department: "Clinical Pathology",
    analyzer: "Sysmex UX-2000",
    tests: ["Urine R/M", "Urine Culture"],
    tatMinutes: 90,
    tatTarget: 120,
    events: [
      { timestamp: new Date(Date.now() - 180 * 60000).toISOString(), event: "Sample Collected", location: "Ward 2A", operator: "Patient Self" },
      { timestamp: new Date(Date.now() - 170 * 60000).toISOString(), event: "Received at Lab", location: "CP Lab", operator: "Lab Tech Asha" },
      { timestamp: new Date(Date.now() - 120 * 60000).toISOString(), event: "Analysis Complete", location: "CP Bay", operator: "Sysmex UX-2000" },
      { timestamp: new Date(Date.now() - 90 * 60000).toISOString(), event: "Report Dispatched", location: "LIS Server", operator: "Auto (LIS)" },
    ],
    isOverdue: false,
    tubeCount: 1,
    volume: "15 mL",
  },
  {
    id: "S007",
    barcode: "LAB2024-007",
    patientName: "Krishnamurthy V",
    patientId: "IP-3344",
    sampleType: "CSF",
    priority: "STAT",
    status: "PROCESSING",
    collectedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    receivedAt: new Date(Date.now() - 28 * 60000).toISOString(),
    department: "Microbiology",
    analyzer: "Beckman Iris IQ",
    tests: ["CSF Analysis", "Protein", "Glucose", "Cell Count", "Gram Stain"],
    tatMinutes: 28,
    tatTarget: 45,
    events: [
      { timestamp: new Date(Date.now() - 35 * 60000).toISOString(), event: "CSF Collected", location: "Neuro ICU", operator: "Dr. Kapoor", details: "Lumbar puncture procedure" },
      { timestamp: new Date(Date.now() - 28 * 60000).toISOString(), event: "Priority Received", location: "Microbiology Lab", operator: "Lab Tech Ajay" },
      { timestamp: new Date(Date.now() - 15 * 60000).toISOString(), event: "Cell Count Started", location: "Microscopy Bay", operator: "Lab Tech Ajay" },
    ],
    isOverdue: false,
    tubeCount: 3,
    volume: "3 mL",
  },
];

const statusConfig: Record<SpecimenStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  COLLECTED: { label: "Collected", color: "text-slate-300", bgColor: "bg-slate-800", borderColor: "border-slate-700", icon: <FlaskConical className="h-3.5 w-3.5" /> },
  IN_TRANSIT: { label: "In Transit", color: "text-blue-300", bgColor: "bg-blue-500/15", borderColor: "border-blue-500/30", icon: <ArrowRight className="h-3.5 w-3.5" /> },
  RECEIVED: { label: "Received", color: "text-cyan-300", bgColor: "bg-cyan-500/15", borderColor: "border-cyan-500/30", icon: <MapPin className="h-3.5 w-3.5" /> },
  PROCESSING: { label: "Processing", color: "text-amber-300", bgColor: "bg-amber-500/15", borderColor: "border-amber-500/30", icon: <Activity className="h-3.5 w-3.5 animate-pulse" /> },
  RESULTED: { label: "Resulted", color: "text-violet-300", bgColor: "bg-violet-500/15", borderColor: "border-violet-500/30", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  VALIDATED: { label: "Validated", color: "text-emerald-300", bgColor: "bg-emerald-500/15", borderColor: "border-emerald-500/30", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REPORTED: { label: "Reported", color: "text-teal-300", bgColor: "bg-teal-500/15", borderColor: "border-teal-500/30", icon: <Printer className="h-3.5 w-3.5" /> },
  REJECTED: { label: "Rejected", color: "text-rose-300", bgColor: "bg-rose-500/15", borderColor: "border-rose-500/30", icon: <XCircle className="h-3.5 w-3.5" /> },
};

const PIPELINE_STAGES: SpecimenStatus[] = ["COLLECTED", "RECEIVED", "PROCESSING", "RESULTED", "VALIDATED", "REPORTED"];

const priorityConfig = {
  STAT: { color: "text-rose-300", bgColor: "bg-rose-500/20", borderColor: "border-rose-500/40", label: "🚨 STAT" },
  URGENT: { color: "text-amber-300", bgColor: "bg-amber-500/20", borderColor: "border-amber-500/40", label: "⚡ URGENT" },
  ROUTINE: { color: "text-slate-300", bgColor: "bg-slate-700/50", borderColor: "border-slate-600", label: "ROUTINE" },
};

function getTATColor(tatMinutes: number, tatTarget: number) {
  const ratio = tatMinutes / tatTarget;
  if (ratio < 0.7) return "text-emerald-400";
  if (ratio < 0.9) return "text-amber-400";
  if (ratio <= 1.0) return "text-orange-400";
  return "text-rose-400";
}

function formatMinutes(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function timeSince(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

export default function SpecimenTrackingDashboard({ analyzers }: SpecimenTrackingDashboardProps) {
  const [specimens] = useState<Specimen[]>(DEMO_SPECIMENS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");
  const [now, setNow] = useState(Date.now());

  // Live clock tick every 30s for TAT updates
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    return specimens.filter((s) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !s.barcode.toLowerCase().includes(q) &&
          !s.patientName.toLowerCase().includes(q) &&
          !s.patientId.toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && s.priority !== priorityFilter) return false;
      return true;
    });
  }, [specimens, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total: specimens.length,
    stat: specimens.filter((s) => s.priority === "STAT").length,
    processing: specimens.filter((s) => s.status === "PROCESSING").length,
    overdue: specimens.filter((s) => s.tatMinutes > s.tatTarget).length,
    rejected: specimens.filter((s) => s.status === "REJECTED").length,
    avgTAT: Math.round(specimens.filter((s) => s.resultedAt).reduce((sum, s) => sum + s.tatMinutes, 0) / Math.max(specimens.filter((s) => s.resultedAt).length, 1)),
  }), [specimens]);

  const pipelineGroups = useMemo(() => {
    const groups: Record<SpecimenStatus, Specimen[]> = {} as any;
    PIPELINE_STAGES.forEach((stage) => {
      groups[stage] = filtered.filter((s) => s.status === stage);
    });
    groups["REJECTED"] = filtered.filter((s) => s.status === "REJECTED");
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-[#061020] to-indigo-950/30 p-5 shadow-2xl">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold text-indigo-400">
                <Barcode className="h-3.5 w-3.5" />
                Real-Time Specimen Tracking
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-mono text-slate-300">
                Chain of Custody
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Specimen Tracking & TAT Dashboard</h2>
            <p className="mt-0.5 text-xs text-slate-400">Live barcode tracking from phlebotomy chair to verified result — full chain of custody</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex rounded-xl border border-slate-700 bg-slate-800 p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${viewMode === "list" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
              >
                <Layers className="h-3.5 w-3.5 inline mr-1" />List
              </button>
              <button
                onClick={() => setViewMode("pipeline")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${viewMode === "pipeline" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
              >
                <Activity className="h-3.5 w-3.5 inline mr-1" />Pipeline
              </button>
            </div>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all">
              <Download className="h-3.5 w-3.5" />Export
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total Specimens", value: stats.total, color: "text-white", sub: "Today" },
            { label: "STAT Active", value: stats.stat, color: "text-rose-400", sub: "Priority" },
            { label: "In Processing", value: stats.processing, color: "text-amber-400", sub: "On Analyzer" },
            { label: "TAT Breaches", value: stats.overdue, color: stats.overdue > 0 ? "text-rose-400" : "text-emerald-400", sub: "Overdue" },
            { label: "Avg TAT", value: `${stats.avgTAT}m`, color: "text-violet-400", sub: "Resulted" },
            { label: "Rejected", value: stats.rejected, color: stats.rejected > 0 ? "text-rose-400" : "text-emerald-400", sub: "Re-bleed" },
          ].map((kpi, i) => (
            <div key={i} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</p>
              <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-slate-500">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search barcode, patient name, patient ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            {(Object.keys(statusConfig) as SpecimenStatus[]).map((s) => (
              <option key={s} value={s}>{statusConfig[s].label}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">Priority: All</option>
            <option value="STAT">STAT</option>
            <option value="URGENT">Urgent</option>
            <option value="ROUTINE">Routine</option>
          </select>
        </div>
        <span className="text-xs text-slate-400 ml-auto">
          <span className="font-bold text-white">{filtered.length}</span> of {specimens.length} specimens
        </span>
      </div>

      {/* ───────── LIST VIEW ───────── */}
      {viewMode === "list" && (
        <div className="space-y-2.5">
          {filtered.map((specimen) => {
            const sc = statusConfig[specimen.status];
            const pc = priorityConfig[specimen.priority];
            const isExpanded = expandedId === specimen.id;
            const tatColor = getTATColor(specimen.tatMinutes, specimen.tatTarget);
            const tatPercent = Math.min((specimen.tatMinutes / specimen.tatTarget) * 100, 100);
            const stageIndex = PIPELINE_STAGES.indexOf(specimen.status);

            return (
              <div
                key={specimen.id}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${specimen.status === "REJECTED"
                  ? "border-rose-500/30 bg-rose-950/20"
                  : specimen.isOverdue
                    ? "border-amber-500/30 bg-amber-950/10"
                    : specimen.priority === "STAT"
                      ? "border-rose-500/20 bg-slate-900/80"
                      : "border-slate-800 bg-slate-900/60"
                  }`}
              >
                {/* Main Row */}
                <div
                  className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : specimen.id)}
                >
                  {/* Priority indicator */}
                  <div
                    className={`flex-shrink-0 rounded-xl border px-2.5 py-1 text-[10px] font-extrabold ${pc.color} ${pc.bgColor} ${pc.borderColor}`}
                  >
                    {pc.label}
                  </div>

                  {/* Barcode + Patient */}
                  <div className="min-w-[160px]">
                    <div className="flex items-center gap-1.5">
                      <Barcode className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="font-mono text-xs font-bold text-indigo-300">{specimen.barcode}</span>
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-white">{specimen.patientName}</div>
                    <div className="text-[10px] text-slate-400">{specimen.patientId} · {specimen.sampleType}</div>
                  </div>

                  {/* Tests */}
                  <div className="flex-1 min-w-[140px]">
                    <div className="flex flex-wrap gap-1">
                      {specimen.tests.slice(0, 3).map((t, i) => (
                        <span key={i} className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                          {t}
                        </span>
                      ))}
                      {specimen.tests.length > 3 && (
                        <span className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
                          +{specimen.tests.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400">{specimen.department} · {specimen.analyzer || "Pending"}</div>
                  </div>

                  {/* Status */}
                  <div className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${sc.color} ${sc.bgColor} ${sc.borderColor}`}>
                    {sc.icon}
                    {sc.label}
                  </div>

                  {/* TAT */}
                  <div className="min-w-[90px] text-right">
                    <div className={`text-xs font-black ${tatColor}`}>{formatMinutes(specimen.tatMinutes)}</div>
                    <div className="text-[10px] text-slate-500">Target: {formatMinutes(specimen.tatTarget)}</div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-700 overflow-hidden w-20 ml-auto">
                      <div
                        className={`h-full rounded-full transition-all ${specimen.tatMinutes > specimen.tatTarget ? "bg-rose-500" : specimen.tatMinutes > specimen.tatTarget * 0.8 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${tatPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Collected */}
                  <div className="text-right min-w-[70px]">
                    <div className="text-[10px] text-slate-400">Collected</div>
                    <div className="text-xs font-bold text-slate-300">{timeSince(specimen.collectedAt)}</div>
                  </div>

                  {/* Expand */}
                  <div className="flex-shrink-0 text-slate-400">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>

                {/* EXPANDED: Pipeline + Events */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/60 px-5 py-4 space-y-4">
                    {/* Pipeline Progress */}
                    {specimen.status !== "REJECTED" && (
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-3">Sample Journey</p>
                        <div className="flex items-center gap-1 overflow-x-auto pb-1">
                          {PIPELINE_STAGES.map((stage, idx) => {
                            const done = idx <= stageIndex;
                            const active = PIPELINE_STAGES[stageIndex] === stage;
                            const stConf = statusConfig[stage];
                            return (
                              <React.Fragment key={stage}>
                                <div className={`flex-shrink-0 flex flex-col items-center gap-1 ${done ? stConf.color : "text-slate-600"}`}>
                                  <div className={`rounded-xl border p-2 text-xs transition-all ${active ? `${stConf.bgColor} ${stConf.borderColor} ring-2 ring-offset-1 ring-offset-slate-950` : done ? `${stConf.bgColor} ${stConf.borderColor}` : "bg-slate-800/60 border-slate-700"}`}>
                                    {stConf.icon}
                                  </div>
                                  <span className="text-[9px] font-bold whitespace-nowrap">{stConf.label}</span>
                                </div>
                                {idx < PIPELINE_STAGES.length - 1 && (
                                  <div className={`flex-1 min-w-[20px] h-0.5 rounded-full ${idx < stageIndex ? "bg-indigo-500" : "bg-slate-700"}`} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Rejection Banner */}
                    {specimen.rejectionReason && (
                      <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                        <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-rose-300">Rejection Reason</p>
                          <p className="text-xs text-rose-200 mt-0.5">{specimen.rejectionReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Chain of Custody Events */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-3">Chain of Custody</p>
                      <div className="space-y-2">
                        {specimen.events.map((event, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className="h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />
                              {idx < specimen.events.length - 1 && <div className="w-0.5 h-full bg-slate-700/60 my-1" style={{ minHeight: 16 }} />}
                            </div>
                            <div className="flex-1 pb-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-white">{event.event}</span>
                                <span className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{event.location}</span>
                                <span className="text-[10px] text-slate-500">by {event.operator}</span>
                                <span className="ml-auto text-[10px] font-mono text-slate-500">{timeSince(event.timestamp)}</span>
                              </div>
                              {event.details && (
                                <p className="mt-1 text-[11px] text-amber-300 italic">{event.details}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Specimen Metadata */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { label: "Tube Count", value: `${specimen.tubeCount} tube(s)` },
                        { label: "Volume", value: specimen.volume },
                        { label: "Sample Type", value: specimen.sampleType },
                        { label: "Department", value: specimen.department },
                      ].map((meta) => (
                        <div key={meta.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{meta.label}</p>
                          <p className="text-xs font-bold text-white mt-0.5">{meta.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ───────── PIPELINE / KANBAN VIEW ───────── */}
      {viewMode === "pipeline" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {[...PIPELINE_STAGES, "REJECTED" as SpecimenStatus].map((stage) => {
              const sc = statusConfig[stage];
              const stageSpecimens = pipelineGroups[stage] || [];
              return (
                <div key={stage} className="w-[220px] flex-shrink-0">
                  <div className={`mb-3 flex items-center justify-between rounded-xl border px-3 py-2 ${sc.bgColor} ${sc.borderColor}`}>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${sc.color}`}>
                      {sc.icon}
                      {sc.label}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${sc.bgColor} ${sc.color}`}>
                      {stageSpecimens.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {stageSpecimens.map((s) => {
                      const pc = priorityConfig[s.priority];
                      return (
                        <div
                          key={s.id}
                          className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 cursor-pointer hover:border-indigo-500/50 transition-all"
                          onClick={() => { setViewMode("list"); setExpandedId(s.id); }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-bold ${pc.color}`}>{pc.label}</span>
                            <span className={`text-xs font-black ${getTATColor(s.tatMinutes, s.tatTarget)}`}>{formatMinutes(s.tatMinutes)}</span>
                          </div>
                          <div className="font-mono text-[11px] font-bold text-indigo-300">{s.barcode}</div>
                          <div className="text-xs font-semibold text-white mt-0.5 truncate">{s.patientName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{s.department}</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {s.tests.slice(0, 2).map((t, i) => (
                              <span key={i} className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[9px] text-slate-300">{t}</span>
                            ))}
                            {s.tests.length > 2 && <span className="text-[9px] text-slate-500">+{s.tests.length - 2}</span>}
                          </div>
                        </div>
                      );
                    })}
                    {stageSpecimens.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-[11px] text-slate-600">
                        No specimens
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
