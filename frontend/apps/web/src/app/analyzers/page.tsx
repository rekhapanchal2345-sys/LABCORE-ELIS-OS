"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { analyzersApi } from "@/lib/api";
import { Analyzer, AnalyzerStatus } from "@/types";
import AnalyzerStatusCards from "@/components/analyzers/AnalyzerStatusCards";
import AddAnalyzerModal from "@/components/analyzers/AddAnalyzerModal";
import ConnectionTestModal from "@/components/analyzers/ConnectionTestModal";
import LiveResultFeed from "@/components/analyzers/LiveResultFeed";
import UnmatchedResultsQueue from "@/components/analyzers/UnmatchedResultsQueue";
import AutoValidationEngine from "@/components/analyzers/AutoValidationEngine";
import CommunicationErrorLog from "@/components/analyzers/CommunicationErrorLog";
import ParameterCodeMappingTool from "@/components/analyzers/ParameterCodeMappingTool";
import TelemetryConsole from "@/components/analyzers/TelemetryConsole";
import AnalyzerCommandCenter from "@/components/analyzers/AnalyzerCommandCenter";
import HematologyWorkbench from "@/components/analyzers/HematologyWorkbench";
import BidirectionalQuerySystem from "@/components/analyzers/BidirectionalQuerySystem";
import AutoApprovalQC from "@/components/analyzers/AutoApprovalQC";
import StatSpecimenLane from "@/components/analyzers/StatSpecimenLane";
import RealWorldReagentTracker from "@/components/analyzers/RealWorldReagentTracker";
import ShiftQCGate from "@/components/analyzers/ShiftQCGate";
import VirtualAnalyzerSimulator from "@/components/analyzers/VirtualAnalyzerSimulator";
import ReflexCascadeEngine from "@/components/analyzers/ReflexCascadeEngine";
import SmartWorkloadBalancer from "@/components/analyzers/SmartWorkloadBalancer";
import MaintenanceComplianceLogbook from "@/components/analyzers/MaintenanceComplianceLogbook";
import MiddlewareDriverHub from "@/components/analyzers/MiddlewareDriverHub";
import PredictiveAnomalyEngine from "@/components/analyzers/PredictiveAnomalyEngine";
import ReagentLotCorrelationSuite from "@/components/analyzers/ReagentLotCorrelationSuite";
import CriticalPanicEscalationHub from "@/components/analyzers/CriticalPanicEscalationHub";
import SpecimenTrackingDashboard from "@/components/analyzers/SpecimenTrackingDashboard";
import CrossAnalyzerQCCorrelation from "@/components/analyzers/CrossAnalyzerQCCorrelation";
import LabThroughputAnalytics from "@/components/analyzers/LabThroughputAnalytics";
import {
  Activity,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Settings,
  Wrench,
  Trash2,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff,
  Network,
  BarChart3,
  Server,
  LayoutGrid,
  Table as TableIcon,
  Layers,
  Radio,
  Clock,
  ShieldCheck,
  FileQuestion,
  Sliders,
  ChevronRight,
  Heart,
  FileText,
  ArrowRightLeft,
  CheckCircle2,
  Download,
  Zap,
  Terminal,
  Sparkles,
  AlertTriangle,
  X,
  Send,
  SlidersHorizontal,
  Check,
  Cpu,
  Database,
  Droplets,
  Lock,
  Play,
  Award,
  PhoneCall,
  ShieldAlert,
  Flame
} from "lucide-react";

type ActiveTabType =
  | "inventory"
  | "stat_lane"
  | "workload_balancer"
  | "reagents"
  | "lot_correlation"
  | "reflex_engine"
  | "critical_panic"
  | "shift_qc"
  | "maintenance_audit"
  | "anomaly_forecast"
  | "driver_hub"
  | "simulator"
  | "bidirectional"
  | "live_feed"
  | "qc_validation"
  | "diagnostics"
  | "hematology"
  | "specimen_tracking"
  | "qc_correlation"
  | "throughput_analytics";

export default function AnalyzersPage() {
  const searchParams = useSearchParams();
  const initialSection = searchParams.get("section");

  const [analyzers, setAnalyzers] = useState<Analyzer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveTabType>(() => {
    const tabParam = initialSection || searchParams.get("tab");
    if (tabParam === "hematology" || tabParam === "section=hematology") return "hematology";
    if (tabParam === "stat_lane") return "stat_lane";
    if (tabParam === "workload_balancer") return "workload_balancer";
    if (tabParam === "reagents") return "reagents";
    if (tabParam === "lot_correlation") return "lot_correlation";
    if (tabParam === "reflex_engine") return "reflex_engine";
    if (tabParam === "critical_panic") return "critical_panic";
    if (tabParam === "shift_qc") return "shift_qc";
    if (tabParam === "maintenance_audit") return "maintenance_audit";
    if (tabParam === "anomaly_forecast") return "anomaly_forecast";
    if (tabParam === "driver_hub") return "driver_hub";
    if (tabParam === "simulator") return "simulator";
    if (tabParam === "bidirectional") return "bidirectional";
    if (tabParam === "live_feed") return "live_feed";
    if (tabParam === "qc_validation") return "qc_validation";
    if (tabParam === "diagnostics") return "diagnostics";
    if (tabParam === "specimen_tracking") return "specimen_tracking";
    if (tabParam === "qc_correlation") return "qc_correlation";
    if (tabParam === "throughput_analytics") return "throughput_analytics";
    return "inventory";
  });

  // View Mode for inventory: "cards" | "table"
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Filter and search state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [protocolFilter, setProtocolFilter] = useState<string>("");
  const [activeFilterChip, setActiveFilterChip] = useState<string>("ALL");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Modal visibility states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);
  const [showUnmatchedModal, setShowUnmatchedModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showErrorLogModal, setShowErrorLogModal] = useState(false);

  // Selected analyzer for modal contexts
  const [selectedAnalyzer, setSelectedAnalyzer] = useState<Analyzer | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unmatchedCount, setUnmatchedCount] = useState(3);
  const [isPingingFleet, setIsPingingFleet] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  // Live debounced search (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchAnalyzers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter) params.append("status", statusFilter);
      if (departmentFilter) params.append("department", departmentFilter);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const response = await analyzersApi.getAll(params.toString());

      if (response.success && response.data) {
        setAnalyzers(response.data.analyzers || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        // Fallback for demo mode
        const demoRes = await analyzersApi.getDemoData();
        if (demoRes.success && demoRes.data?.analyzers) {
          let list: Analyzer[] = demoRes.data.analyzers;
          if (debouncedSearch) {
            const term = debouncedSearch.toLowerCase();
            list = list.filter(
              (a) =>
                a.name.toLowerCase().includes(term) ||
                a.analyzerId.toLowerCase().includes(term) ||
                (a.manufacturer && a.manufacturer.toLowerCase().includes(term)) ||
                (a.model && a.model.toLowerCase().includes(term))
            );
          }
          if (statusFilter) {
            list = list.filter((a) => a.status === statusFilter);
          }
          if (departmentFilter) {
            list = list.filter((a) => a.department === departmentFilter);
          }
          setAnalyzers(list);
          setPagination((prev) => ({ ...prev, total: list.length, totalPages: 1 }));
        } else {
          setError(response.message || "Failed to fetch analyzers");
        }
      }
    } catch (err: any) {
      console.warn("API fetch notice:", err);
      try {
        const demoRes = await analyzersApi.getDemoData();
        if (demoRes.success && demoRes.data?.analyzers) {
          setAnalyzers(demoRes.data.analyzers);
        }
      } catch {
        setError(err.message || "Failed to fetch analyzers");
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, departmentFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchAnalyzers();
  }, [fetchAnalyzers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalyzers();
    setIsRefreshing(false);
    setToastMessage({ text: "Fleet telemetry & status synchronised", type: "success" });
  };

  const handleTestConnection = (analyzer: Analyzer) => {
    setSelectedAnalyzer(analyzer);
    setShowConnectionModal(true);
  };

  const handleConfigureMappings = (analyzer: Analyzer) => {
    setSelectedAnalyzer(analyzer);
    setShowMappingModal(true);
  };

  const handleShowTelemetry = (analyzer: Analyzer) => {
    setSelectedAnalyzer(analyzer);
    setShowTelemetryModal(true);
  };

  const handleArchive = async (analyzer: Analyzer) => {
    if (!confirm(`Are you sure you want to archive ${analyzer.name}? This will pause active worklists.`)) return;
    try {
      await analyzersApi.archive(analyzer.id);
      await fetchAnalyzers();
      setToastMessage({ text: `Analyzer ${analyzer.name} archived`, type: "info" });
    } catch (err: any) {
      setError(err.message || "Failed to archive analyzer");
    }
  };

  const handleToggleStatus = async (analyzer: Analyzer) => {
    const newStatus = analyzer.status === "ONLINE" ? "OFFLINE" : "ONLINE";
    try {
      await analyzersApi.updateStatus(analyzer.id, { status: newStatus });
      await fetchAnalyzers();
      setToastMessage({
        text: `${analyzer.name} marked as ${newStatus}`,
        type: newStatus === "ONLINE" ? "success" : "info",
      });
    } catch (err: any) {
      setError(err.message || "Failed to update analyzer status");
    }
  };

  // Batch Ping All Instruments Handshake
  const handlePingFleet = async () => {
    setIsPingingFleet(true);
    try {
      const pingPromises = analyzers.map(async (analyzer) => {
        const simulatedLatency = Math.floor(Math.random() * 25) + 10;
        try {
          await analyzersApi.heartbeat(analyzer.id, { latency: simulatedLatency });
        } catch {
          // ignore individual error in batch
        }
      });
      await Promise.all(pingPromises);
      await fetchAnalyzers();
      setToastMessage({
        text: `Batch handshake complete: ${analyzers.length} instruments responded to ping`,
        type: "success",
      });
    } catch (err) {
      setToastMessage({ text: "Batch handshake encountered timeout on some devices", type: "error" });
    } finally {
      setIsPingingFleet(false);
    }
  };

  // Export fleet registry snapshot as JSON
  const handleExportFleet = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analyzers, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `analyzers_fleet_audit_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToastMessage({ text: "Fleet configuration snapshot exported", type: "success" });
  };

  // Filter chips logic
  const filteredAnalyzers = useMemo(() => {
    return analyzers.filter((analyzer) => {
      // Search term
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        const matches =
          analyzer.name.toLowerCase().includes(term) ||
          analyzer.analyzerId.toLowerCase().includes(term) ||
          (analyzer.manufacturer && analyzer.manufacturer.toLowerCase().includes(term)) ||
          (analyzer.model && analyzer.model.toLowerCase().includes(term)) ||
          (analyzer.department && analyzer.department.toLowerCase().includes(term)) ||
          (analyzer.protocol && analyzer.protocol.toLowerCase().includes(term));
        if (!matches) return false;
      }

      // Chip filters
      if (activeFilterChip === "ONLINE" && analyzer.status !== "ONLINE") return false;
      if (activeFilterChip === "ATTENTION" && !["ERROR", "MAINTENANCE", "OFFLINE", "CALIBRATION_REQUIRED"].includes(analyzer.status)) return false;
      if (activeFilterChip === "HEMATOLOGY" && !`${analyzer.name} ${analyzer.department}`.toLowerCase().includes("hematol")) return false;
      if (activeFilterChip === "BIOCHEMISTRY" && !`${analyzer.name} ${analyzer.department}`.toLowerCase().includes("biochem")) return false;
      if (activeFilterChip === "IMMUNOLOGY" && !`${analyzer.name} ${analyzer.department}`.toLowerCase().includes("immuno")) return false;
      if (activeFilterChip === "ASTM" && !analyzer.protocol?.toUpperCase().includes("ASTM")) return false;
      if (activeFilterChip === "HL7" && !analyzer.protocol?.toUpperCase().includes("HL7")) return false;

      // Dropdown filters
      if (statusFilter && analyzer.status !== statusFilter) return false;
      if (departmentFilter && analyzer.department !== departmentFilter) return false;
      if (protocolFilter && analyzer.protocol !== protocolFilter) return false;

      return true;
    });
  }, [analyzers, debouncedSearch, activeFilterChip, statusFilter, departmentFilter, protocolFilter]);

  const onlineCount = analyzers.filter((a) => a.status === "ONLINE").length;
  const attentionCount = analyzers.filter((a) =>
    ["ERROR", "OFFLINE", "MAINTENANCE", "CALIBRATION_REQUIRED"].includes(a.status)
  ).length;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Laboratory Analyzers Hub">
        <div className="space-y-6 pb-16">
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-xs font-bold text-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${toastMessage.type === "success"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30"
                  : toastMessage.type === "error"
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-500/30"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30"
                }`}
            >
              {toastMessage.type === "success" && <CheckCircle2 className="h-4 w-4" />}
              {toastMessage.type === "error" && <AlertTriangle className="h-4 w-4" />}
              {toastMessage.type === "info" && <Radio className="h-4 w-4" />}
              <span>{toastMessage.text}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="ml-2 text-white/70 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* MASTER ENTERPRISE HEADER */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-[#071326] to-slate-900 p-6 shadow-2xl text-white">
            {/* Animated Glow Backdrop */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:28px_28px]" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    INTERFACE ENGINE ACTIVE
                  </span>
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-mono font-medium text-blue-300">
                    ASTM E1394 / HL7 v2.5
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-mono text-slate-300">
                    NABL / CAP Ready
                  </span>
                </div>

                <h1 className="mt-2.5 text-2xl md:text-3xl font-black tracking-tight text-white">
                  Enterprise Laboratory Analyzers & LIS Interface
                </h1>
                <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  Real-world hospital operations: STAT emergency specimen lane, on-board reagent tracking, daily 3-level Westgard QC gates, and interactive virtual testing console.
                </p>
              </div>

              {/* High-Impact Action Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-105 hover:from-blue-500 hover:to-indigo-500 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  Add New Analyzer
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("stat_lane")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-red-500 to-pink-600 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-rose-600/30 hover:scale-105 transition-all"
                  title="Open Emergency STAT Specimen Prioritization Lane"
                >
                  <Zap className="h-4 w-4" />
                  <span>STAT Lane</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("workload_balancer")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-blue-600 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-cyan-600/30 hover:scale-105 transition-all"
                  title="Smart Specimen Router & Workload Balancer"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>Smart Balancer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("reflex_engine")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
                  title="Reflex & Cascade Testing Rules Engine"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Reflex Engine</span>
                </button>

                <button
                  type="button"
                  onClick={handlePingFleet}
                  disabled={isPingingFleet || analyzers.length === 0}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-3 text-xs font-bold text-cyan-200 backdrop-blur-md transition-all hover:bg-cyan-500/25 hover:border-cyan-400 disabled:opacity-50"
                  title="Broadcast ping handshake across all connected analyzers"
                >
                  <Zap className={`h-4 w-4 text-cyan-300 ${isPingingFleet ? "animate-bounce" : ""}`} />
                  {isPingingFleet ? "Pinging..." : "Ping Fleet"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowUnmatchedModal(true)}
                  className="relative inline-flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-xs font-bold text-amber-200 backdrop-blur-md transition-all hover:bg-amber-500/25"
                  title="Open Orphan Queue to match unassigned results"
                >
                  <FileQuestion className="h-4 w-4 text-amber-400" />
                  <span>Orphan Queue</span>
                  {unmatchedCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
                      {unmatchedCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportFleet}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-3.5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all"
                  title="Export fleet configuration audit"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80 p-3 text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all disabled:opacity-50"
                  title="Synchronize all telemetry"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-5 sm:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Fleet</p>
                  <p className="text-sm font-black text-white">{analyzers.length} Instruments</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <Wifi className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Online Coverage</p>
                  <p className="text-sm font-black text-emerald-400">
                    {analyzers.length ? Math.round((onlineCount / analyzers.length) * 100) : 0}% ({onlineCount}/{analyzers.length})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LIS Protocol</p>
                  <p className="text-sm font-black text-violet-300">Bi-directional</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exceptions</p>
                  <p className={`text-sm font-black ${attentionCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {attentionCount === 0 ? "0 Flags (Optimal)" : `${attentionCount} Requiring Action`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TOP STATUS CARDS & COMMAND CENTER */}
          <AnalyzerStatusCards
            externalRefreshing={isRefreshing}
            onCardClick={(key) => {
              if (key === "feeds") setActiveTab("live_feed");
              else if (key === "autovalidation") setShowValidationModal(true);
              else if (key === "errors") setShowErrorLogModal(true);
              else setActiveTab("inventory");
            }}
          />

          <AnalyzerCommandCenter analyzers={analyzers} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ENTERPRISE COMMAND NAVIGATION BAR */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl">
            {/* Category Groups */}
            <div className="divide-y divide-slate-800/60">
              {/* ── Group 1: Operational ── */}
              <div className="px-3 pt-3 pb-2">
                <span className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                  ⚡ Operational
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {/* Fleet Inventory */}
                  <button
                    onClick={() => setActiveTab("inventory")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "inventory"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                      }`}
                  >
                    <Server className="h-3.5 w-3.5" />
                    <span>Fleet Inventory</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "inventory" ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"}`}>
                      {analyzers.length}
                    </span>
                  </button>

                  {/* STAT Emergency Lane */}
                  <button
                    onClick={() => setActiveTab("stat_lane")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "stat_lane"
                        ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30"
                        : "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:border-rose-400/60 hover:bg-rose-500/20"
                      }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>🚨 STAT Emergency Lane</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "stat_lane" ? "bg-white/20 text-white" : "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"}`}>
                      15m TAT
                    </span>
                  </button>

                  {/* Smart Workload Balancer */}
                  <button
                    onClick={() => setActiveTab("workload_balancer")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "workload_balancer"
                        ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25"
                        : "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/20"
                      }`}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>🔀 Smart Carousel Balancer</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "workload_balancer" ? "bg-white/20 text-white" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"}`}>
                      AI Router
                    </span>
                  </button>

                  {/* Reagents & Consumables */}
                  <button
                    onClick={() => setActiveTab("reagents")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "reagents"
                        ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25"
                        : "border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
                      }`}
                  >
                    <Droplets className="h-3.5 w-3.5" />
                    <span>Reagents & Consumables</span>
                  </button>

                  {/* Reagent Lot Verification */}
                  <button
                    onClick={() => setActiveTab("lot_correlation")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "lot_correlation"
                        ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25"
                        : "border border-teal-500/30 bg-teal-500/10 text-teal-300 hover:border-teal-400/60 hover:bg-teal-500/20"
                      }`}
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>🔬 Lot-to-Lot Verification</span>
                  </button>
                </div>
              </div>

              {/* ── Group 2: Quality & Assurance ── */}
              <div className="px-3 pt-3 pb-2">
                <span className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                  🛡 Quality & Assurance
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {/* Shift QC Gate */}
                  <button
                    onClick={() => setActiveTab("shift_qc")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "shift_qc"
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                        : "border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                      }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Shift QC & Westgard Gate</span>
                    {attentionCount > 0 && (
                      <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 text-[9px] font-black animate-pulse">
                        {attentionCount} lockout
                      </span>
                    )}
                  </button>

                  {/* NABL Maintenance Logbook */}
                  <button
                    onClick={() => setActiveTab("maintenance_audit")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "maintenance_audit"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                        : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-500/20"
                      }`}
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>📋 NABL Maintenance Logbook</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "maintenance_audit" ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"}`}>
                      ISO 15189
                    </span>
                  </button>

                  {/* AI Breakdown & Anomaly Forecasting */}
                  <button
                    onClick={() => setActiveTab("anomaly_forecast")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "anomaly_forecast"
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                        : "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:border-amber-400/60 hover:bg-amber-500/20"
                      }`}
                  >
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    <span>⚠️ AI Breakdown Forecasting</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "anomaly_forecast" ? "bg-white/20 text-white" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"}`}>
                      Predictive
                    </span>
                  </button>

                  {/* Auto-Approval QC Matrix */}
                  <button
                    onClick={() => setActiveTab("qc_validation")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "qc_validation"
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                        : "border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                      }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Auto-Approval QC Matrix</span>
                  </button>

                  {/* Hematology Suite */}
                  <button
                    onClick={() => setActiveTab("hematology")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "hematology"
                        ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/25"
                        : "border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                      }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>🧪 Hematology Suite</span>
                  </button>
                </div>
              </div>

              {/* ── Group 3: Intelligence & Traceability ── */}
              <div className="px-3 pt-2 pb-2">
                <span className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                  📦 Intelligence & Traceability
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {/* Specimen Tracking */}
                  <button
                    onClick={() => setActiveTab("specimen_tracking")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "specimen_tracking"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                        : "border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:border-indigo-400/60 hover:bg-indigo-500/20"
                      }`}
                  >
                    <span className="text-sm">📦</span>
                    <span>Specimen Chain-of-Custody</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "specimen_tracking" ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"}`}>
                      Live TAT
                    </span>
                  </button>

                  {/* QC Correlation Matrix */}
                  <button
                    onClick={() => setActiveTab("qc_correlation")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "qc_correlation"
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                        : "border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:border-violet-400/60 hover:bg-violet-500/20"
                      }`}
                  >
                    <span className="text-sm">Σ</span>
                    <span>Multi-Analyzer QC Correlation</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "qc_correlation" ? "bg-white/20 text-white" : "bg-violet-500/20 text-violet-300 border border-violet-500/40"}`}>
                      Sigma
                    </span>
                  </button>

                  {/* Throughput Analytics */}
                  <button
                    onClick={() => setActiveTab("throughput_analytics")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "throughput_analytics"
                        ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/25"
                        : "border border-teal-500/30 bg-teal-500/10 text-teal-300 hover:border-teal-400/60 hover:bg-teal-500/20"
                      }`}
                  >
                    <span className="text-sm">📊</span>
                    <span>Throughput & TAT Analytics</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "throughput_analytics" ? "bg-white/20 text-white" : "bg-teal-500/20 text-teal-300 border border-teal-500/40"}`}>
                      KPIs
                    </span>
                  </button>
                </div>
              </div>

              {/* ── Group 4: Interface & Connectivity ── */}
              <div className="px-3 pt-3 pb-3">
                <span className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                  🔌 Interface & Connectivity
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {/* Critical Panic Read-Back Escalation */}
                  <button
                    onClick={() => setActiveTab("critical_panic")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "critical_panic"
                        ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30"
                        : "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:border-rose-400/60 hover:bg-rose-500/20"
                      }`}
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                    <span>🚨 Critical Panic Escalation</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "critical_panic" ? "bg-white/20 text-white" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"}`}>
                      Read-Back
                    </span>
                  </button>

                  {/* Reflex & Cascade Rules Engine */}
                  <button
                    onClick={() => setActiveTab("reflex_engine")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "reflex_engine"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                        : "border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:border-indigo-400/60 hover:bg-indigo-500/20"
                      }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>⚡ Reflex & Cascade Rules</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "reflex_engine" ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"}`}>
                      Auto-Order
                    </span>
                  </button>

                  {/* LIS Protocol & Driver Hub */}
                  <button
                    onClick={() => setActiveTab("driver_hub")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "driver_hub"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:border-blue-400/60 hover:bg-blue-500/20"
                      }`}
                  >
                    <Network className="h-3.5 w-3.5" />
                    <span>🔌 LIS Driver Hub</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${activeTab === "driver_hub" ? "bg-white/20 text-white" : "bg-blue-500/20 text-blue-300 border border-blue-500/40"}`}>
                      ASTM/HL7
                    </span>
                  </button>

                  {/* Bidirectional Worklists */}
                  <button
                    onClick={() => setActiveTab("bidirectional")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "bidirectional"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                        : "border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                      }`}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>Bidirectional Worklists</span>
                  </button>

                  {/* Live Result Stream */}
                  <button
                    onClick={() => setActiveTab("live_feed")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "live_feed"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                        : "border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                      }`}
                  >
                    <Radio className={`h-3.5 w-3.5 ${activeTab !== "live_feed" ? "text-emerald-400 animate-pulse" : ""}`} />
                    <span>Live Result Stream</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${activeTab === "live_feed" ? "bg-white/20" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"}`}>
                      LIVE
                    </span>
                  </button>

                  {/* Virtual Protocol Simulator */}
                  <button
                    onClick={() => setActiveTab("simulator")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "simulator"
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                        : "border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300"
                      }`}
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Virtual Protocol Simulator</span>
                  </button>

                  {/* Diagnostics & Error Logs */}
                  <button
                    onClick={() => setActiveTab("diagnostics")}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${activeTab === "diagnostics"
                        ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/25"
                        : "border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                      }`}
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Diagnostics & Error Logs</span>
                    {attentionCount > 0 && (
                      <span className="rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 text-[9px] font-black">
                        {attentionCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* TAB: STAT EMERGENCY SPECIMEN LANE */}
          {activeTab === "stat_lane" && (
            <StatSpecimenLane analyzers={analyzers} />
          )}

          {/* TAB: SMART SPECIMEN WORKLOAD BALANCER */}
          {activeTab === "workload_balancer" && (
            <SmartWorkloadBalancer analyzers={analyzers} />
          )}

          {/* TAB: REFLEX & CASCADE TESTING RULES ENGINE */}
          {activeTab === "reflex_engine" && (
            <ReflexCascadeEngine analyzers={analyzers} />
          )}

          {/* TAB: CRITICAL PANIC ESCALATION */}
          {activeTab === "critical_panic" && (
            <CriticalPanicEscalationHub analyzers={analyzers} />
          )}

          {/* TAB: PREVENTIVE MAINTENANCE & NABL COMPLIANCE LOGBOOK */}
          {activeTab === "maintenance_audit" && (
            <MaintenanceComplianceLogbook analyzers={analyzers} />
          )}

          {/* TAB: AI BREAKDOWN & ANOMALY FORECASTING */}
          {activeTab === "anomaly_forecast" && (
            <PredictiveAnomalyEngine analyzers={analyzers} />
          )}

          {/* TAB: REAGENT LOT-TO-LOT VERIFICATION */}
          {activeTab === "lot_correlation" && (
            <ReagentLotCorrelationSuite analyzers={analyzers} />
          )}

          {/* TAB: SPECIMEN TRACKING DASHBOARD */}
          {activeTab === "specimen_tracking" && (
            <SpecimenTrackingDashboard analyzers={analyzers} />
          )}

          {/* TAB: CROSS-ANALYZER QC CORRELATION MATRIX */}
          {activeTab === "qc_correlation" && (
            <CrossAnalyzerQCCorrelation analyzers={analyzers} />
          )}

          {/* TAB: LAB THROUGHPUT & TAT ANALYTICS */}
          {activeTab === "throughput_analytics" && (
            <LabThroughputAnalytics analyzers={analyzers} />
          )}

          {/* TAB: LIS PROTOCOL & DRIVER HUB */}
          {activeTab === "driver_hub" && (
            <MiddlewareDriverHub analyzers={analyzers} />
          )}

          {/* TAB: REAGENTS & CONSUMABLES */}
          {activeTab === "reagents" && (
            <RealWorldReagentTracker analyzers={analyzers} />
          )}

          {/* TAB: SHIFT QC GATE */}
          {activeTab === "shift_qc" && (
            <ShiftQCGate analyzers={analyzers} />
          )}

          {/* TAB: VIRTUAL TEST BENCH SIMULATOR */}
          {activeTab === "simulator" && (
            <VirtualAnalyzerSimulator analyzers={analyzers} />
          )}

          {/* TAB 1: FLEET INVENTORY */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              {/* Quick Filter Chips Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Quick Filter:
                  </span>

                  {[
                    { id: "ALL", label: `All (${analyzers.length})` },
                    { id: "ONLINE", label: `Online (${onlineCount})`, tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                    { id: "ATTENTION", label: `Needs Attention (${attentionCount})`, tone: "text-rose-700 bg-rose-50 border-rose-200" },
                    { id: "HEMATOLOGY", label: "Hematology" },
                    { id: "BIOCHEMISTRY", label: "Biochemistry" },
                    { id: "IMMUNOLOGY", label: "Immunology" },
                    { id: "ASTM", label: "ASTM E1394" },
                    { id: "HL7", label: "HL7 v2.x" },
                  ].map((chip) => {
                    const isSelected = activeFilterChip === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => {
                          setActiveFilterChip(chip.id);
                          setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : chip.tone
                              ? `${chip.tone} hover:opacity-80`
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                {/* View Switcher & Counter */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500">
                    Showing <strong className="text-slate-900">{filteredAnalyzers.length}</strong> of {analyzers.length}
                  </span>

                  <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                    <button
                      onClick={() => setViewMode("cards")}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${viewMode === "cards" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                      <TableIcon className="h-3.5 w-3.5" />
                      Table
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Search & Dropdowns Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by instrument name, analyzer ID, brand, model, department..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Status: All</option>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="BUSY">Busy</option>
                    <option value="ERROR">Error</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="CALIBRATION_REQUIRED">Calibration Due</option>
                  </select>

                  <select
                    value={departmentFilter}
                    onChange={(e) => {
                      setDepartmentFilter(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Dept: All</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Coagulation">Coagulation</option>
                    <option value="Urinalysis">Urinalysis</option>
                    <option value="Clinical Pathology">Clinical Pathology</option>
                  </select>

                  <select
                    value={protocolFilter}
                    onChange={(e) => setProtocolFilter(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Protocol: All</option>
                    <option value="ASTM_1394">ASTM 1394</option>
                    <option value="HL7_V2">HL7 v2.x</option>
                    <option value="ASTM_1381">ASTM 1381</option>
                    <option value="CUSTOM_SERIAL">Custom Serial</option>
                  </select>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>{error}</span>
                  </div>
                  <button onClick={fetchAnalyzers} className="font-bold text-rose-700 hover:underline">
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredAnalyzers.length === 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-xl mx-auto my-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
                    <Server className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">No Analyzers Match Filters</h3>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                    {searchInput || statusFilter || departmentFilter || activeFilterChip !== "ALL"
                      ? "No instruments matched your active search criteria. Reset filters to see all instruments."
                      : "Connect physical laboratory machines (Sysmex, Roche, Mindray, etc.) via ASTM or HL7 protocol for automated worklists and bidirectional result capture."}
                  </p>
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setStatusFilter("");
                      setDepartmentFilter("");
                      setProtocolFilter("");
                      setActiveFilterChip("ALL");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* VIEW 1: PREMIUM CARDS GRID */}
              {!loading && filteredAnalyzers.length > 0 && viewMode === "cards" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAnalyzers.map((analyzer) => {
                    const isOnline = analyzer.status === "ONLINE";
                    const isError = analyzer.status === "ERROR";
                    const isBusy = analyzer.status === "BUSY";
                    const isMaintenance = analyzer.status === "MAINTENANCE";

                    return (
                      <div
                        key={analyzer.id}
                        className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-xl backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isOnline
                            ? "border-emerald-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 hover:border-emerald-400/60"
                            : isError
                              ? "border-rose-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/40 hover:border-rose-400/60"
                              : isMaintenance
                                ? "border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 hover:border-amber-400/60"
                                : "border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/30 hover:border-blue-500/50"
                          }`}
                      >
                        {/* Background Ambient Glow */}
                        <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40" />

                        <div>
                          {/* Top Card Bar */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`relative flex h-13 w-13 items-center justify-center rounded-2xl border-2 p-3 font-bold shadow-lg transition-transform duration-300 group-hover:scale-105 ${isOnline
                                    ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20"
                                    : isError
                                      ? "border-rose-500/40 bg-rose-500/20 text-rose-400 shadow-rose-500/20"
                                      : isMaintenance
                                        ? "border-amber-500/40 bg-amber-500/20 text-amber-400 shadow-amber-500/20"
                                        : "border-slate-700 bg-slate-800 text-slate-300"
                                  }`}
                              >
                                <Activity className="h-6 w-6" />
                                <span
                                  className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 ${isOnline
                                      ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                                      : isError
                                        ? "bg-rose-400 shadow-[0_0_10px_#f43f5e]"
                                        : isMaintenance
                                          ? "bg-amber-400 shadow-[0_0_10px_#fbbf24]"
                                          : "bg-slate-500"
                                    }`}
                                />
                              </div>

                              <div>
                                <h3 className="text-base font-extrabold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                                  {analyzer.name}
                                </h3>
                                <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                                  <span>{analyzer.analyzerId}</span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-slate-300">
                                    {analyzer.manufacturer || "Generic"} {analyzer.model || ""}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="flex items-center gap-2">
                              {isOnline && (
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                                </span>
                              )}
                              <span
                                className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${isOnline
                                    ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                                    : isError
                                      ? "border-rose-500/40 bg-rose-500/20 text-rose-300"
                                      : isMaintenance
                                        ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                                        : "border-slate-700 bg-slate-800 text-slate-400"
                                  }`}
                              >
                                {analyzer.status}
                              </span>
                            </div>
                          </div>

                          {/* Metric Pill Grid */}
                          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-sm">
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Department
                              </span>
                              <span className="mt-1 block font-bold text-white truncate">
                                {analyzer.department || "General"}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block">
                                {analyzer.location || "Bench Lab"}
                              </span>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-sm">
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Protocol & Channel
                              </span>
                              <span className="mt-1 block font-mono font-bold text-cyan-300 truncate">
                                {analyzer.protocol}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block">
                                {analyzer.connectionType === "NETWORK" ? "TCP/IP Socket" : "Serial RS-232"}
                              </span>
                            </div>
                          </div>

                          {/* Real-time Connection Quality */}
                          <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-2.5 text-xs font-mono">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Zap className="h-3.5 w-3.5 text-amber-400" />
                              <span className="text-[11px] text-slate-400">Ping Latency:</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {analyzer.connectionLatency !== null && analyzer.connectionLatency !== undefined ? (
                                <span
                                  className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${analyzer.connectionLatency < 30
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : analyzer.connectionLatency < 100
                                        ? "bg-amber-500/20 text-amber-300"
                                        : "bg-rose-500/20 text-rose-300"
                                    }`}
                                >
                                  {analyzer.connectionLatency} ms
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px]">—</span>
                              )}
                              <span className="text-[10px] text-slate-500">
                                {analyzer.lastCommunicationAt ? "Active" : "Idle"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons Rail */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-4">
                          <Link
                            href={`/analyzers/${analyzer.id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Details</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleTestConnection(analyzer)}
                              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all"
                              title="Ping Connection Handshake"
                            >
                              <Network className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleConfigureMappings(analyzer)}
                              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-300 hover:border-blue-500/50 hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                              title="Test Parameter Mappings"
                            >
                              <Settings className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleShowTelemetry(analyzer)}
                              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/20 hover:text-violet-300 transition-all"
                              title="Live Telemetry Console"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(analyzer)}
                              className={`rounded-xl border p-2 transition-all ${isOnline
                                  ? "border-slate-700 bg-slate-800/80 text-slate-400 hover:border-rose-500/50 hover:bg-rose-500/20 hover:text-rose-300"
                                  : "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                }`}
                              title={isOnline ? "Simulate Disconnect" : "Simulate Connect"}
                            >
                              {isOnline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                            </button>

                            <button
                              onClick={() => handleArchive(analyzer)}
                              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-400 hover:border-rose-500/50 hover:bg-rose-500/20 hover:text-rose-300 transition-all"
                              title="Archive instrument"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW 2: HIGH-DENSITY TABLE */}
              {!loading && filteredAnalyzers.length > 0 && viewMode === "table" && (
                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-300">
                        <tr>
                          <th className="px-5 py-4 text-left font-extrabold uppercase tracking-wider text-[10px] text-blue-300">
                            Instrument & ID
                          </th>
                          <th className="px-5 py-4 text-left font-extrabold uppercase tracking-wider text-[10px] text-slate-300">
                            Department
                          </th>
                          <th className="px-5 py-4 text-left font-extrabold uppercase tracking-wider text-[10px] text-cyan-300">
                            Protocol & Connection
                          </th>
                          <th className="px-5 py-4 text-left font-extrabold uppercase tracking-wider text-[10px] text-emerald-300">
                            Status & Latency
                          </th>
                          <th className="px-5 py-4 text-left font-extrabold uppercase tracking-wider text-[10px] text-violet-300">
                            Last Telemetry
                          </th>
                          <th className="px-5 py-4 text-right font-extrabold uppercase tracking-wider text-[10px] text-slate-300">
                            Action Rail
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 bg-slate-950/80">
                        {filteredAnalyzers.map((analyzer, idx) => {
                          const isOnline = analyzer.status === "ONLINE";
                          const isError = analyzer.status === "ERROR";

                          return (
                            <tr
                              key={analyzer.id}
                              className={`transition-colors hover:bg-slate-900/60 ${idx % 2 === 0 ? "bg-slate-950" : "bg-slate-900/30"
                                }`}
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isOnline
                                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                                        : isError
                                          ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                                          : "border-slate-700 bg-slate-800 text-slate-400"
                                      }`}
                                  >
                                    <Activity className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">{analyzer.name}</div>
                                    <div className="font-mono text-[11px] text-slate-400">
                                      {analyzer.analyzerId} · {analyzer.manufacturer} {analyzer.model}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200">
                                  {analyzer.department || "General"}
                                </span>
                                <div className="mt-1 text-[10px] text-slate-400">{analyzer.location || "Bench Lab"}</div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-cyan-300">
                                  <Network className="h-3 w-3" />
                                  {analyzer.protocol}
                                </span>
                                <div className="mt-1 text-[11px] text-slate-400">
                                  {analyzer.connectionType === "NETWORK" ? "TCP Network" : "RS-232 Serial"}
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase ${isOnline
                                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                                        : isError
                                          ? "border-rose-500/40 bg-rose-500/20 text-rose-300"
                                          : "border-slate-700 bg-slate-800 text-slate-400"
                                      }`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-400" : isError ? "bg-rose-400" : "bg-slate-400"
                                        }`}
                                    />
                                    {analyzer.status}
                                  </span>
                                  {analyzer.connectionLatency && (
                                    <span className="font-mono text-[11px] font-bold text-slate-300">
                                      {analyzer.connectionLatency}ms
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-4 font-mono text-[11px] text-slate-300">
                                {analyzer.lastCommunicationAt
                                  ? new Date(analyzer.lastCommunicationAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })
                                  : "Never"}
                                <div className="text-[10px] text-slate-500">
                                  {analyzer.lastCommunicationAt ? "Telemetry verified" : "Awaiting handshake"}
                                </div>
                              </td>

                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Link
                                    href={`/analyzers/${analyzer.id}`}
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-500"
                                  >
                                    Open
                                  </Link>
                                  <button
                                    onClick={() => handleTestConnection(analyzer)}
                                    className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:border-cyan-500 hover:text-cyan-300"
                                    title="Ping"
                                  >
                                    <Zap className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleConfigureMappings(analyzer)}
                                    className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:border-blue-500 hover:text-blue-300"
                                    title="Mappings"
                                  >
                                    <Settings className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleShowTelemetry(analyzer)}
                                    className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:border-violet-500 hover:text-violet-300"
                                    title="Telemetry"
                                  >
                                    <BarChart3 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: BIDIRECTIONAL QUERY & WORKLIST DISPATCH */}
          {activeTab === "bidirectional" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Host Query Engine
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      Bidirectional Worklist Dispatcher & Specimen Routing
                    </h2>
                    <p className="text-xs text-slate-600">
                      Track orders transmitted to instruments, query pending tubes by barcode, and verify LIS order acknowledgement.
                    </p>
                  </div>
                </div>
              </div>

              <BidirectionalQuerySystem />
            </div>
          )}

          {/* TAB: LIVE RESULT FEED */}
          {activeTab === "live_feed" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Real-time Interface
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      Live Result Stream & Packet Interceptor
                    </h2>
                    <p className="text-xs text-slate-600">
                      Incoming ASTM OBR/OBX packets and HL7 ORU_R01 frames parsed in real-time with instant critical panic value detection.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUnmatchedModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 shadow-sm"
                  >
                    <FileQuestion className="h-4 w-4 text-amber-600" />
                    Review Unmatched Orphan Queue ({unmatchedCount})
                  </button>
                </div>
              </div>

              <LiveResultFeed
                analyzers={analyzers}
                unmatchedCount={unmatchedCount}
                onOpenUnmatchedQueue={() => setShowUnmatchedModal(true)}
              />
            </div>
          )}

          {/* TAB: QC & AUTO-APPROVAL RULES */}
          {activeTab === "qc_validation" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-purple-50 p-5 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
                    Quality Assurance & Verification
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Automated Approval Engine & Westgard Multi-Rules
                  </h2>
                  <p className="text-xs text-slate-600">
                    Define range check criteria, critical panic limits, delta check thresholds against past patient results, and QC control gates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowValidationModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700"
                >
                  <Sliders className="h-4 w-4" />
                  Auto-Validation Matrix
                </button>
              </div>

              <AutoApprovalQC />
            </div>
          )}

          {/* TAB: DIAGNOSTICS & COMMUNICATION LOGS */}
          {activeTab === "diagnostics" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-pink-50 p-5 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                    Diagnostic Bench
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Communication Logs, Socket Diagnostics & Packet Tracing
                  </h2>
                  <p className="text-xs text-slate-600">
                    Analyze low-level ENQ / ACK handshakes, frame checksum errors, buffer overruns, and socket connection drops.
                  </p>
                </div>
                <button
                  onClick={() => setShowErrorLogModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-700"
                >
                  <AlertCircle className="h-4 w-4" />
                  Open Full Diagnostic Log
                </button>
              </div>

              {/* Protocol Packet Quick Test Bench */}
              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                  <Terminal className="h-5 w-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Live LIS Frame Protocol Inspector</h3>
                    <p className="text-[11px] text-slate-400">
                      Simulate bidirectional ASTM E1394 / HL7 message exchanges with connected analyzers
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-2">
                      Sample Outgoing Frame (ASTM E1394 Order Query)
                    </span>
                    <pre className="text-slate-300 bg-slate-950 p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                      {`H|\\^&|||LabCoreLIS|||||||P|1394-97|20260907232800
P|1||MRN98214||Sharma^Aarav||19880512|M
O|1|BARCODE_9901||^^^CBC_DIFF|R||||||A
L|1|N`}
                    </pre>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                      Sample Incoming Frame (ASTM E1394 Result Transmission)
                    </span>
                    <pre className="text-slate-300 bg-slate-950 p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                      {`H|\\^&|||Sysmex_XN550|||||||P|1394-97
P|1||MRN98214
O|1|BARCODE_9901
R|1|^^^WBC|8.4|10*3/uL|4.0-11.0|N||F
R|2|^^^RBC|4.82|10*6/uL|4.5-5.9|N||F
R|3|^^^HGB|14.6|g/dL|13.5-17.5|N||F
L|1|N`}
                    </pre>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
                  <span>Port status: TCP 5000 (Listening) · RS-232 COM3 (Baud 9600, 8-N-1)</span>
                  <button
                    onClick={() => setShowErrorLogModal(true)}
                    className="font-bold text-cyan-400 hover:underline"
                  >
                    View communication history →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SPECIALTY HEMATOLOGY WORKBENCH */}
          {activeTab === "hematology" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-5 py-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Specialty Workbench
                </span>
                <h1 className="mt-1 text-xl font-bold text-slate-900">
                  🧪 Hematology & CBC Analyzer Suite
                </h1>
                <p className="mt-1 text-xs text-slate-600">
                  Sysmex, Mindray, and Beckman Coulter CBC platforms, 5-part differential scattergrams, QC delta gates, and morphology verification.
                </p>
              </div>

              <HematologyWorkbench
                analyzers={analyzers}
                onOpenMappings={() => {
                  const hematologyAnalyzer = analyzers.find((analyzer) =>
                    `${analyzer.name || ""} ${analyzer.manufacturer || ""} ${analyzer.model || ""
                      } ${analyzer.analyzerType || ""}`
                      .toLowerCase()
                      .match(/sysmex|beckman|mindray|horiba|cell[- ]dyn|advia|hemat/)
                  );
                  if (hematologyAnalyzer) {
                    setSelectedAnalyzer(hematologyAnalyzer);
                    setShowMappingModal(true);
                  } else {
                    setError("Add a hematology analyzer first to configure mappings.");
                  }
                }}
              />
            </div>
          )}

          {/* GLOBAL MODALS */}
          {showAddModal && (
            <AddAnalyzerModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSuccess={fetchAnalyzers}
            />
          )}

          {showConnectionModal && selectedAnalyzer && (
            <ConnectionTestModal
              isOpen={showConnectionModal}
              analyzer={selectedAnalyzer}
              onClose={() => setShowConnectionModal(false)}
              onStatusUpdated={fetchAnalyzers}
            />
          )}

          {showUnmatchedModal && (
            <UnmatchedResultsQueue
              isOpen={showUnmatchedModal}
              onClose={() => setShowUnmatchedModal(false)}
              onResolved={() => {
                setUnmatchedCount((prev) => Math.max(0, prev - 1));
              }}
            />
          )}

          {showValidationModal && (
            <AutoValidationEngine
              isOpen={showValidationModal}
              onClose={() => setShowValidationModal(false)}
              analyzers={analyzers}
            />
          )}

          {showErrorLogModal && (
            <CommunicationErrorLog
              isOpen={showErrorLogModal}
              onClose={() => setShowErrorLogModal(false)}
              analyzers={analyzers}
            />
          )}

          {showMappingModal && selectedAnalyzer && (
            <ParameterCodeMappingTool
              analyzerId={selectedAnalyzer.id}
              onClose={() => setShowMappingModal(false)}
            />
          )}

          {showTelemetryModal && selectedAnalyzer && (
            <TelemetryConsole
              analyzerId={selectedAnalyzer.id}
              onClose={() => setShowTelemetryModal(false)}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}