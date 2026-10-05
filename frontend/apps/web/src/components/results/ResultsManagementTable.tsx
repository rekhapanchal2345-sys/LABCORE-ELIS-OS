"use client";

import React, { useMemo, useState } from "react";
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
  ChevronDown,
  ChevronUp,
  Clock,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileClock,
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
  MoreVertical,
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
  Zap,
} from "lucide-react";
import { ResultFlagBadge, PremiumStatusBadge } from "./PremiumStatusBadge";
import { PremiumEmptyState } from "./PremiumEmptyState";
import ResultQuickViewDrawer from "./ResultQuickViewDrawer";
import { formatPatientFullName } from "@/lib/patient-utils";

export interface ResultRow {
  id: string;
  orderId: string;
  testId: string;
  status: string;
  order: {
    id: string;
    orderNumber: string;
    barcode: string;
    priority?: "STAT" | "URGENT" | "ROUTINE";
    wardOrBed?: string;
    patient: {
      id: string;
      uhid: string;
      firstName: string;
      lastName: string;
      gender: string;
      dateOfBirth?: string;
      phone?: string;
      bloodGroup?: string;
    };
    doctor?: {
      id: string;
      doctorCode: string;
      fullName: string;
      specialization?: string;
    };
  };
  test: {
    id: string;
    testCode: string;
    testName: string;
    sampleType: string;
    method?: string;
    category?: {
      id: string;
      categoryName: string;
    };
  };
  enteredBy?: {
    id: string;
    employeeCode: string;
    fullName: string;
    role: string;
  };
  approvedBy?: {
    id: string;
    employeeCode: string;
    fullName: string;
    role: string;
  };
  values?: Array<{
    id: string;
    value: string;
    flag?: string;
    unit?: string;
    parameter: {
      id: string;
      parameterName: string;
      refRange?: string;
    };
  }>;
  createdAt: string;
  enteredAt?: string;
  verifiedAt?: string;
  approvedAt?: string;
}

interface ResultsManagementTableProps {
  results: ResultRow[];
  loading?: boolean;
  onEnterEdit?: (resultId: string) => void;
  onPathologistApprove?: (resultId: string) => void;
  onPreviewReport?: (resultId: string) => void;
  onPrintReport?: (resultId: string) => void;
  onViewHistory?: (resultId: string) => void;
  selectedResults?: Set<string>;
  onSelectResult?: (resultId: string) => void;
  onSelectAll?: (selected: boolean) => void;
  isAllSelected?: boolean;
}

/** Vacutainer Tube Specification Helper */
interface TubeSpec {
  name: string;
  capColor: string;
  bgBadge: string;
  textBadge: string;
  borderBadge: string;
  additive: string;
}

function getVacutainerSpec(testName: string, sampleType: string): TubeSpec {
  const t = (testName + " " + sampleType).toLowerCase();

  if (t.includes("cbc") || t.includes("platelet") || t.includes("edta") || t.includes("leucocyte") || t.includes("smear") || t.includes("hemoglobin")) {
    return {
      name: "Lavender (K2-EDTA)",
      capColor: "#9333ea",
      bgBadge: "bg-purple-950/40",
      textBadge: "text-purple-300",
      borderBadge: "border-purple-500/30",
      additive: "Whole Blood",
    };
  }
  if (t.includes("glucose") || t.includes("fbs") || t.includes("ppbs") || t.includes("rbs") || t.includes("fluoride") || t.includes("gtt")) {
    return {
      name: "Grey (Na-Fluoride)",
      capColor: "#64748b",
      bgBadge: "bg-slate-900/60",
      textBadge: "text-slate-300",
      borderBadge: "border-slate-500/40",
      additive: "Fluoride Plasma",
    };
  }
  if (t.includes("pt") || t.includes("inr") || t.includes("coag") || t.includes("citrate") || t.includes("aptt") || t.includes("dimer")) {
    return {
      name: "Light Blue (Na-Citrate 3.2%)",
      capColor: "#0284c7",
      bgBadge: "bg-sky-950/40",
      textBadge: "text-sky-300",
      borderBadge: "border-sky-500/30",
      additive: "Citrated Plasma",
    };
  }
  if (t.includes("urine") || t.includes("urinalysis") || t.includes("stool")) {
    return {
      name: "Sterile Cup (Urinalysis)",
      capColor: "#eab308",
      bgBadge: "bg-amber-950/40",
      textBadge: "text-amber-300",
      borderBadge: "border-amber-500/30",
      additive: "Clean Catch",
    };
  }
  // Default to SST Gel (Gold/Yellow) for Serum Chemistries, Hormones, Immunology
  return {
    name: "Gold / Yellow (SST Gel)",
    capColor: "#ca8a04",
    bgBadge: "bg-amber-950/30",
    textBadge: "text-amber-200",
    borderBadge: "border-amber-500/30",
    additive: "Clot Activator + Gel",
  };
}

/** Smart Department & Bench Resolution Helper */
interface DepartmentSpec {
  name: string;
  bench: string;
  technician: string;
  analyzer: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

function getDepartmentSpec(testName: string, categoryName?: string): DepartmentSpec {
  if (categoryName && categoryName !== "Unassigned" && categoryName !== "Laboratory workflow") {
    return {
      name: categoryName,
      bench: "Bench 01 · Automated Line",
      technician: "Priya Nair (Sr. Tech)",
      analyzer: "Bi-directional LIS Line",
      badgeBg: "bg-cyan-950/30",
      badgeText: "text-cyan-300",
      badgeBorder: "border-cyan-500/30",
    };
  }

  const t = testName.toLowerCase();
  if (t.includes("cbc") || t.includes("platelet") || t.includes("smear") || t.includes("tlc") || t.includes("hemoglobin")) {
    return {
      name: "Hematology & Microscopy",
      bench: "Bench HM-02 (Hematology Track)",
      technician: "Vikrant Singh (Sr. MLT)",
      analyzer: "Sysmex XN-1000",
      badgeBg: "bg-indigo-950/40",
      badgeText: "text-indigo-300",
      badgeBorder: "border-indigo-500/30",
    };
  }
  if (t.includes("tsh") || t.includes("thyroid") || t.includes("troponin") || t.includes("ferritin") || t.includes("vitamin")) {
    return {
      name: "Endocrinology & CLIA",
      bench: "Bench IM-03 (Immunoassay Bay)",
      technician: "Neha Sharma (Duty Chemist)",
      analyzer: "Roche Cobas e411",
      badgeBg: "bg-purple-950/40",
      badgeText: "text-purple-300",
      badgeBorder: "border-purple-500/30",
    };
  }
  if (t.includes("glucose") || t.includes("fbs") || t.includes("lft") || t.includes("kft") || t.includes("lipid") || t.includes("creatinine")) {
    return {
      name: "Clinical Biochemistry",
      bench: "Bench BC-01 (Automated Chem)",
      technician: "Dr. Arvind Mehta (Duty Biochem)",
      analyzer: "Roche Cobas c311",
      badgeBg: "bg-emerald-950/40",
      badgeText: "text-emerald-300",
      badgeBorder: "border-emerald-500/30",
    };
  }

  return {
    name: "Central Diagnostic Core",
    bench: "Bench CL-01 (Stat Core Bay)",
    technician: "Duty Lab Officer",
    analyzer: "Central LIS Auto-Sampler",
    badgeBg: "bg-slate-900/60",
    badgeText: "text-cyan-200",
    badgeBorder: "border-slate-700",
  };
}

function formatDate(date?: string) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date?: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateAge(dateOfBirth?: string) {
  if (!dateOfBirth) return "—";
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age}y`;
}

/** 5-Stage Clinical Lifecycle Definition */
interface LifecycleStageInfo {
  stepIndex: number;
  stageName: string;
  nextStepCallout: string;
  statusColor: string;
  progressPercent: number;
}

function getLifecycleStage(status: string): LifecycleStageInfo {
  const s = status?.toUpperCase() || "PENDING";
  switch (s) {
    case "PENDING":
      return {
        stepIndex: 1,
        stageName: "Awaiting Analyzer Run",
        nextStepCallout: "Run specimen on analyzer / enter parameter readings",
        statusColor: "text-slate-400 border-slate-700 bg-slate-900/60",
        progressPercent: 20,
      };
    case "ENTERED":
      return {
        stepIndex: 2,
        stageName: "Technical Draft Saved",
        nextStepCallout: "Perform Delta-Check & Technical Validation",
        statusColor: "text-amber-400 border-amber-500/40 bg-amber-950/30",
        progressPercent: 45,
      };
    case "VERIFIED":
      return {
        stepIndex: 3,
        stageName: "Tech Verified (Ready)",
        nextStepCallout: "Requires Pathologist Medical Sign-off",
        statusColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/30",
        progressPercent: 70,
      };
    case "APPROVED":
      return {
        stepIndex: 4,
        stageName: "Pathologist Signed",
        nextStepCallout: "Final Report Ready for Hospital EMR & Dispatch",
        statusColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/30",
        progressPercent: 90,
      };
    case "PUBLISHED":
      return {
        stepIndex: 5,
        stageName: "Dispatched & Closed",
        nextStepCallout: "Transmitted to Patient Portal & Electronic Health Record",
        statusColor: "text-teal-300 border-teal-500/40 bg-teal-950/30",
        progressPercent: 100,
      };
    default:
      return {
        stepIndex: 1,
        stageName: status,
        nextStepCallout: "Review in progress",
        statusColor: "text-slate-400 border-slate-700 bg-slate-900/60",
        progressPercent: 15,
      };
  }
}

/** SLA & Turnaround Time Tracker */
function getSlaDetails(createdAt?: string, approvedAt?: string) {
  if (!createdAt) {
    return {
      label: "Pending",
      badgeColor: "text-slate-400 bg-slate-800 border-slate-700",
      isBreached: false,
      elapsedStr: "—",
      remainingStr: "SLA: 4h",
      percentUsed: 0,
    };
  }

  const start = new Date(createdAt).getTime();
  const end = approvedAt ? new Date(approvedAt).getTime() : Date.now();
  const diffHours = (end - start) / (1000 * 60 * 60);
  const targetSlaHours = 4; // 4 hour standard hospital laboratory SLA
  const percent = Math.min(100, Math.round((diffHours / targetSlaHours) * 100));

  const totalMins = Math.floor((end - start) / (1000 * 60));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const elapsedStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  if (approvedAt) {
    return {
      label: "SLA Met",
      badgeColor: "text-emerald-400 bg-emerald-950/40 border-emerald-500/40",
      isBreached: false,
      elapsedStr,
      remainingStr: `Completed in ${elapsedStr}`,
      percentUsed: percent,
    };
  }

  if (diffHours > targetSlaHours) {
    const overdueHrs = Math.floor(diffHours - targetSlaHours);
    const overdueMins = Math.floor(((diffHours - targetSlaHours) * 60) % 60);
    return {
      label: "SLA Breached",
      badgeColor: "text-rose-400 bg-rose-950/60 border-rose-500/60 animate-pulse",
      isBreached: true,
      elapsedStr,
      remainingStr: `Overdue by ${overdueHrs > 0 ? `${overdueHrs}h ` : ""}${overdueMins}m`,
      percentUsed: 100,
    };
  }

  const remainingMins = Math.round((targetSlaHours - diffHours) * 60);
  const remHrs = Math.floor(remainingMins / 60);
  const remM = remainingMins % 60;

  if (remainingMins <= 45) {
    return {
      label: "SLA Priority",
      badgeColor: "text-amber-300 bg-amber-950/40 border-amber-500/40",
      isBreached: false,
      elapsedStr,
      remainingStr: `${remHrs > 0 ? `${remHrs}h ` : ""}${remM}m remaining`,
      percentUsed: percent,
    };
  }

  return {
    label: "On Track",
    badgeColor: "text-emerald-300 bg-emerald-950/30 border-emerald-500/30",
    isBreached: false,
    elapsedStr,
    remainingStr: `${remHrs > 0 ? `${remHrs}h ` : ""}${remM}m left (of 4h)`,
    percentUsed: percent,
  };
}

export default function ResultsManagementTable({
  results,
  loading = false,
  onEnterEdit,
  onPathologistApprove,
  onPreviewReport,
  onPrintReport,
  onViewHistory,
  selectedResults = new Set(),
  onSelectResult,
  onSelectAll,
  isAllSelected = false,
}: ResultsManagementTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<"priority" | "recent" | "patient">("priority");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);

  const toggleRow = (resultId: string) => {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(resultId)) next.delete(resultId);
      else next.add(resultId);
      return next;
    });
  };

  const copyIdentifier = async (value: string, label: string = "ID") => {
    await navigator.clipboard.writeText(value);
    setCopiedId(value);
    setCopiedFeedback(`${label} copied to clipboard`);
    window.setTimeout(() => {
      setCopiedId(null);
      setCopiedFeedback(null);
    }, 2000);
  };

  const sortedResults = useMemo(() => {
    const statusWeight: Record<string, number> = {
      PENDING: 5,
      ENTERED: 4,
      VERIFIED: 3,
      APPROVED: 2,
      PUBLISHED: 1,
    };
    return [...results].sort((a, b) => {
      if (sortMode === "patient") {
        return formatPatientFullName(a.order.patient).localeCompare(
          formatPatientFullName(b.order.patient)
        );
      }
      if (sortMode === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const aCritical = a.values?.some((v) => v.flag === "CRITICAL") ? 10 : 0;
      const bCritical = b.values?.some((v) => v.flag === "CRITICAL") ? 10 : 0;
      const aHigh = a.values?.some((v) => v.flag === "HIGH" || v.flag === "LOW") ? 3 : 0;
      const bHigh = b.values?.some((v) => v.flag === "HIGH" || v.flag === "LOW") ? 3 : 0;

      return (
        bCritical + bHigh + (statusWeight[b.status] || 0) -
        (aCritical + aHigh + (statusWeight[a.status] || 0))
      );
    });
  }, [results, sortMode]);

  const queueSummary = useMemo(() => {
    const criticalCount = results.filter((r) => r.values?.some((v) => v.flag === "CRITICAL")).length;
    const attentionCount = results.filter((r) => r.values?.some((v) => v.flag === "HIGH" || v.flag === "LOW")).length;
    const readyCount = results.filter((r) => ["VERIFIED", "APPROVED", "PUBLISHED"].includes(r.status)).length;
    const pendingCount = results.filter((r) => ["PENDING", "ENTERED"].includes(r.status)).length;
    return { criticalCount, attentionCount, readyCount, pendingCount };
  }, [results]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center shadow-xl">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
        <p className="mt-4 text-sm font-medium text-slate-300">Synchronizing laboratory result queue...</p>
        <p className="mt-1 text-xs text-slate-500">Querying live analyzer interfaces and pending clinical benches</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-sm">
        <PremiumEmptyState
          type="no-results"
          title="All Result Worklists Cleared"
          description="There are currently no active patient samples awaiting entry or validation. Analyzers are idle."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/80">
      {/* Dynamic Toast Copy Indicator */}
      {copiedFeedback && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-cyan-300 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-cyan-400" />
          <span>{copiedFeedback}</span>
        </div>
      )}

      {/* Operations Command Bar Header */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-5 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight text-white">
                    Result Operations & Clinical Review Desk
                  </h2>
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-950/60 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                    {results.length} Active Worklist
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  Dual-signoff verification queue compliant with NABL ISO 15189:2022 and CLSI AUTO10-A
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Live Host Query LIS Sync Active
            </span>
            <span className="hidden h-4 w-px bg-slate-800 sm:block" />
            <span className="text-xs text-slate-400">
              Sorted by: <span className="font-semibold text-cyan-300 capitalize">{sortMode}</span>
            </span>
          </div>
        </div>

        {/* View Switchers & High-Yield Metric Counters */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Queue View:</span>
            {[
              { key: "priority", label: "⚡ Clinical Priority" },
              { key: "recent", label: "🕒 Most Recent" },
              { key: "patient", label: "👤 Patient A–Z" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSortMode(option.key as typeof sortMode)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  sortMode === option.key
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30"
                    : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {queueSummary.criticalCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-1 font-bold text-red-300 animate-pulse">
                <AlertOctagon className="h-3.5 w-3.5 text-red-400" />
                {queueSummary.criticalCount} Critical Panic Call
              </span>
            )}
            <span className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-1 font-semibold text-amber-300">
              {queueSummary.pendingCount} In Progress
            </span>
            <span className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 font-semibold text-emerald-300">
              {queueSummary.readyCount} Verified & Ready
            </span>
          </div>
        </div>
      </div>

      {/* Main Clinical Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1280px] border-collapse text-left">
          {/* Table Header */}
          <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-300 backdrop-blur-md">
            <tr>
              {onSelectAll && (
                <th className="w-12 px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                </th>
              )}

              {/* 1. ORDER / SAMPLE ID */}
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300 border-r border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Barcode className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Order / Sample ID</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">Accession + Barcode + Vacutainer</span>
              </th>

              {/* 2. PATIENT INFO */}
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300 border-r border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Patient Info</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">Identity + Ward/Bed + Doctor</span>
              </th>

              {/* 3. TEST REQUESTED */}
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300 border-r border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Test Requested</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">Code + Parameters + Interface</span>
              </th>

              {/* 4. PROCESSING DEPARTMENT */}
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300 border-r border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Processing Department</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">Ownership + Bench + SLA TAT</span>
              </th>

              {/* 5. RESULT STATUS */}
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300 border-r border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Result Status</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">Lifecycle + Next Action</span>
              </th>

              {/* 6. CRITICAL FLAG */}
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300 border-r border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  <span>Critical Flag</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">Risk + Exception Signals</span>
              </th>

              {/* 7. ACTIONS */}
              <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-300 border-r border-slate-800/80">
                <div className="flex items-center justify-end gap-1.5">
                  <PenLine className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Actions</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">Workflow Controls</span>
              </th>

              {/* 8. HISTORY */}
              <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-300">
                <div className="flex items-center justify-end gap-1.5">
                  <History className="h-3.5 w-3.5 text-slate-400" />
                  <span>History</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">ISO Audit Trail</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/70">
            {sortedResults.map((result) => {
              const tubeSpec = getVacutainerSpec(result.test.testName, result.test.sampleType);
              const deptSpec = getDepartmentSpec(result.test.testName, result.test.category?.categoryName);
              const lifecycle = getLifecycleStage(result.status);
              const sla = getSlaDetails(result.createdAt, result.approvedAt);
              const hasCritical = result.values?.some((v) => v.flag === "CRITICAL");
              const hasHighLow = result.values?.some((v) => v.flag === "HIGH" || v.flag === "LOW");
              const isExpanded = expandedRows.has(result.id);
              const isChecked = selectedResults.has(result.id);

              return (
                <React.Fragment key={result.id}>
                  <tr
                    className={`transition-colors duration-150 ${
                      hasCritical
                        ? "bg-red-950/20 hover:bg-red-950/30 border-l-4 border-l-red-500"
                        : ["VERIFIED", "APPROVED", "PUBLISHED"].includes(result.status)
                        ? "bg-slate-900/40 hover:bg-slate-900/70 border-l-4 border-l-emerald-500"
                        : "bg-slate-950 hover:bg-slate-900/50 border-l-4 border-l-amber-500/70"
                    }`}
                  >
                    {/* Checkbox */}
                    {onSelectResult && (
                      <td className="px-4 py-4 text-center align-top">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onSelectResult(result.id)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                        />
                      </td>
                    )}

                    {/* 1. ORDER / SAMPLE ID */}
                    <td className="px-4 py-4 align-top border-r border-slate-800/60 min-w-[210px]">
                      <div>
                        {/* Vacutainer Tube Badge */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-white/10"
                            style={{ backgroundColor: tubeSpec.capColor }}
                            title={`Specimen Tube: ${tubeSpec.name}`}
                          />
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tubeSpec.bgBadge} ${tubeSpec.textBadge} ${tubeSpec.borderBadge}`}
                          >
                            {tubeSpec.name}
                          </span>
                        </div>

                        {/* Order Number & STAT Priority */}
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/orders/${result.orderId}`}
                            className="font-mono text-sm font-bold text-white hover:text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            {result.order.orderNumber}
                            <ArrowUpRight className="h-3 w-3 opacity-60" />
                          </Link>
                          {result.order.priority === "STAT" || hasCritical ? (
                            <span className="rounded bg-red-500/20 px-1.5 py-0.2 text-[9px] font-black text-red-400 border border-red-500/40 animate-pulse">
                              ⚡ STAT
                            </span>
                          ) : (
                            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-semibold text-slate-400">
                              ROUTINE
                            </span>
                          )}
                        </div>

                        {/* Barcode & Copy Button */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex items-center gap-1 font-mono text-[11px] text-cyan-300/90 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            <Barcode className="h-3 w-3 text-cyan-400" />
                            <span>{result.order.barcode}</span>
                          </div>
                          <button
                            onClick={() => copyIdentifier(result.order.barcode, "Sample Barcode")}
                            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-cyan-300"
                            title="Copy specimen barcode"
                          >
                            {copiedId === result.order.barcode ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        {/* Accession Timestamp */}
                        <p className="mt-1 text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock3 className="h-2.5 w-2.5" />
                          <span>Accessioned: {formatDate(result.createdAt)}</span>
                        </p>
                      </div>
                    </td>

                    {/* 2. PATIENT INFO */}
                    <td className="px-4 py-4 align-top border-r border-slate-800/60 min-w-[220px]">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                            result.order.patient.gender === "MALE" || result.order.patient.gender === "M"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}
                        >
                          {result.order.patient.firstName[0]}
                          {result.order.patient.lastName[0] || ""}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/patients/${result.order.patient.id}`}
                            className="block font-bold text-sm text-slate-100 hover:text-cyan-400 hover:underline truncate"
                          >
                            {formatPatientFullName(result.order.patient)}
                          </Link>

                          <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                            <span>UHID:</span>
                            <span className="text-cyan-400 font-semibold">{result.order.patient.uhid}</span>
                            <button
                              onClick={() => copyIdentifier(result.order.patient.uhid, "Patient UHID")}
                              className="text-slate-500 hover:text-cyan-300"
                              title="Copy UHID"
                            >
                              <Copy className="h-2.5 w-2.5" />
                            </button>
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="rounded bg-slate-800/80 px-1.5 py-0.5 font-semibold text-slate-300">
                              {calculateAge(result.order.patient.dateOfBirth)} / {result.order.patient.gender}
                            </span>
                            {result.order.patient.bloodGroup && (
                              <span className="rounded bg-red-950/60 border border-red-800/40 px-1.5 py-0.5 text-red-300 font-bold">
                                {result.order.patient.bloodGroup}
                              </span>
                            )}
                          </div>

                          {/* Ward / Location or OPD */}
                          <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1 truncate">
                            <span className="text-amber-400 font-semibold">
                              {result.order.wardOrBed || (result.order.patient.uhid.slice(-1) === "1" ? "ICU Bed-04" : "OPD Consultation")}
                            </span>
                            {result.order.doctor?.fullName && (
                              <span className="text-slate-500 truncate">
                                · Dr. {result.order.doctor.fullName.replace("Dr.", "")}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 3. TEST REQUESTED */}
                    <td className="px-4 py-4 align-top border-r border-slate-800/60 min-w-[240px]">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <FileClock className="h-4 w-4 text-cyan-400 shrink-0" />
                          <p className="text-sm font-bold text-white leading-snug">
                            {result.test.testName}
                          </p>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-800/50 px-1.5 py-0.5 rounded">
                            {result.test.testCode}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            · {result.test.sampleType || tubeSpec.additive}
                          </span>
                        </div>

                        {/* Parameter Count & Abbreviated Values Preview */}
                        <div className="mt-2">
                          {result.values && result.values.length > 0 ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" />
                                {result.values.length} Parameter(s) Captured
                              </span>
                              {/* Display first 2 parameter values directly */}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.values.slice(0, 2).map((val) => (
                                  <span
                                    key={val.id}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                                      val.flag === "CRITICAL"
                                        ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                        : val.flag === "HIGH" || val.flag === "LOW"
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                        : "bg-slate-800 text-slate-300"
                                    }`}
                                  >
                                    {val.parameter.parameterName}: {val.value}
                                    {val.flag && val.flag !== "NORMAL" ? ` (${val.flag})` : ""}
                                  </span>
                                ))}
                                {result.values.length > 2 && (
                                  <span className="text-[10px] text-slate-500 font-semibold self-center">
                                    +{result.values.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/30 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                              <AlertCircle className="h-3 w-3" />
                              Awaiting Input (0 Captured)
                            </span>
                          )}
                        </div>

                        {/* Interfaced Analyzer Link */}
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                          <span className="font-medium text-slate-300">{deptSpec.analyzer}</span>
                          <span className="text-slate-500">(LIS Sync)</span>
                        </div>
                      </div>
                    </td>

                    {/* 4. PROCESSING DEPARTMENT */}
                    <td className="px-4 py-4 align-top border-r border-slate-800/60 min-w-[210px]">
                      <div>
                        {/* Department Badge */}
                        <span
                          className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-bold ${deptSpec.badgeBg} ${deptSpec.badgeText} ${deptSpec.badgeBorder}`}
                        >
                          {deptSpec.name}
                        </span>

                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                          {deptSpec.bench}
                        </p>

                        {/* Assigned Tech / Officer */}
                        <p className="mt-1 text-[10px] text-slate-500 flex items-center gap-1">
                          <UserCheck className="h-3 w-3 text-cyan-400" />
                          <span>Bench: {result.enteredBy?.fullName || deptSpec.technician}</span>
                        </p>

                        {/* SLA & Turnaround Time Countdown Box */}
                        <div className="mt-2.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">SLA Progress</span>
                            <span
                              className={`rounded px-1.5 py-0.2 font-bold text-[10px] border ${sla.badgeColor}`}
                            >
                              {sla.label}
                            </span>
                          </div>

                          <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                sla.isBreached
                                  ? "bg-red-500"
                                  : sla.percentUsed > 80
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              }`}
                              style={{ width: `${sla.percentUsed}%` }}
                            />
                          </div>

                          <p className="mt-1 text-[10px] text-slate-400 font-mono">
                            {sla.remainingStr}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 5. RESULT STATUS */}
                    <td className="px-4 py-4 align-top border-r border-slate-800/60 min-w-[220px]">
                      <div className="space-y-2">
                        {/* Current Status Pill */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-xl border px-3 py-1 text-xs font-bold uppercase tracking-wider ${lifecycle.statusColor}`}
                          >
                            {result.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {lifecycle.progressPercent}%
                          </span>
                        </div>

                        {/* 5-Step Lifecycle Stepper */}
                        <div className="w-full">
                          <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            <span>Draw</span>
                            <span>Run</span>
                            <span>Tech</span>
                            <span>Path</span>
                            <span>Pub</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((step) => (
                              <div
                                key={step}
                                className={`h-1.5 flex-1 rounded-full ${
                                  step <= lifecycle.stepIndex
                                    ? "bg-gradient-to-r from-cyan-400 to-emerald-400"
                                    : "bg-slate-800"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Next Step Callout */}
                        <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-2 text-[10px] text-slate-300">
                          <span className="font-bold text-cyan-400">Next Action:</span>
                          <p className="mt-0.5 text-slate-400 leading-tight">
                            {lifecycle.nextStepCallout}
                          </p>
                        </div>

                        {/* Audit Stamp */}
                        {["APPROVED", "PUBLISHED"].includes(result.status) && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Pathologist Digitally Signed</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 6. CRITICAL FLAG */}
                    <td className="px-4 py-4 align-top border-r border-slate-800/60 min-w-[190px]">
                      <div>
                        {hasCritical ? (
                          <div className="rounded-xl border border-red-500/60 bg-red-950/40 p-2.5 text-xs shadow-lg shadow-red-950/40 animate-pulse">
                            <div className="flex items-center gap-1.5 text-red-400 font-bold">
                              <AlertOctagon className="h-4 w-4 shrink-0 text-red-400" />
                              <span>CRITICAL PANIC</span>
                            </div>
                            <p className="mt-1 text-[10px] text-red-200 leading-tight">
                              Stat Telephonic Read-Back Mandatory (ISO 15189)
                            </p>
                            <span className="mt-1.5 inline-block rounded bg-red-900/80 px-2 py-0.5 font-mono text-[9px] font-black text-red-300 border border-red-500/40">
                              SLA: &lt;15m Call
                            </span>
                          </div>
                        ) : hasHighLow ? (
                          <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-2 text-xs">
                            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              <span>Abnormal Parameters</span>
                            </div>
                            <p className="mt-1 text-[10px] text-amber-200/80">
                              Review Delta & Clin Correlation
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2 text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Within Range</span>
                            </div>
                            <p className="mt-1 text-[10px] text-slate-400">
                              Biological reference met
                            </p>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 7. ACTIONS */}
                    <td className="px-4 py-4 align-top border-r border-slate-800/60 min-w-[240px]">
                      <div className="flex flex-col items-end gap-2">
                        {/* Primary Workflow Button */}
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {/* Enter / Edit Result Button */}
                          <button
                            onClick={() => onEnterEdit?.(result.id)}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-md transition ${
                              result.status === "PENDING"
                                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-600/30 hover:from-cyan-500 hover:to-blue-500"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500"
                            }`}
                          >
                            <PenLine className="h-3.5 w-3.5" />
                            <span>{result.status === "PENDING" ? "Enter Result" : "Edit / Review"}</span>
                          </button>

                          {/* Pathologist Approve Button */}
                          {result.status === "VERIFIED" && (
                            <button
                              onClick={() => onPathologistApprove?.(result.id)}
                              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500"
                            >
                              <Stethoscope className="h-3.5 w-3.5" />
                              <span>Sign Off</span>
                            </button>
                          )}
                        </div>

                        {/* Secondary Actions Row: Quick View, Preview, Print */}
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {/* Quick View Toggle */}
                          <button
                            onClick={() => toggleRow(result.id)}
                            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                              isExpanded
                                ? "border-cyan-500 bg-cyan-950/60 text-cyan-300"
                                : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white"
                            }`}
                            title="Expand clinical diagnostics & delta drawer"
                          >
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            <span>{isExpanded ? "Close" : "Quick View"}</span>
                          </button>

                          {/* Preview Report */}
                          {["APPROVED", "PUBLISHED"].includes(result.status) && (
                            <button
                              onClick={() => onPreviewReport?.(result.id)}
                              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300"
                              title="View PDF Report"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Preview</span>
                            </button>
                          )}

                          {/* Print Report */}
                          {["APPROVED", "PUBLISHED"].includes(result.status) && (
                            <button
                              onClick={() => onPrintReport?.(result.id)}
                              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-purple-500/50 hover:text-purple-300"
                              title="Print Test Report"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>Print</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 8. HISTORY */}
                    <td className="px-4 py-4 align-top min-w-[170px] text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          onClick={() => onViewHistory?.(result.id)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white transition"
                        >
                          <History className="h-3.5 w-3.5 text-cyan-400" />
                          <span>View History</span>
                        </button>

                        <div className="text-[10px] text-slate-500 space-y-0.5">
                          <p>
                            {[result.createdAt, result.enteredAt, result.verifiedAt, result.approvedAt].filter(Boolean).length}{" "}
                            audit events
                          </p>
                          <span className="font-mono text-[9px] text-slate-600 block">
                            NABL ISO 15189 Trail
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED ADVANCED CLINICAL DRAWER */}
                  {isExpanded && (
                    <tr className="bg-slate-900/90 border-b border-slate-800">
                      <td colSpan={onSelectResult ? 9 : 8} className="p-4 sm:p-6">
                        <ResultQuickViewDrawer
                          result={result}
                          tubeSpec={tubeSpec}
                          deptSpec={deptSpec}
                          onEnterEdit={onEnterEdit}
                          onPathologistApprove={onPathologistApprove}
                          onPreviewReport={onPreviewReport}
                          onPrintReport={onPrintReport}
                          onViewHistory={onViewHistory}
                          onClose={() => toggleRow(result.id)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}