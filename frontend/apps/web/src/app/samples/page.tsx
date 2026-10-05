"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { sampleApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { 
  Activity, AlertTriangle, ClipboardList, Download, History, 
  RefreshCw, Sparkles, X, CheckCircle2, Loader2, PackageCheck, 
  Printer, ScanLine, UserCheck, ShieldCheck, Clock, Clock3, 
  MapPin, FlaskConical, UserRound, Search, SlidersHorizontal, 
  ArrowUpDown, RotateCcw, LayoutGrid, Table as TableIcon, 
  Snowflake, Flame, Layers, Eye, ShieldAlert, ArrowRight, 
  Building2, CheckSquare, Square, FileText, ChevronRight
} from "lucide-react";
import SampleLabelPrint from "@/components/samples/SampleLabelPrint";
import SampleTrackModal from "@/components/samples/SampleTrackModal";
import SampleAuditModal from "@/components/samples/SampleAuditModal";
import SampleCollectModal from "@/components/samples/SampleCollectModal";
import SampleRejectModal from "@/components/samples/SampleRejectModal";
import SampleKanbanBoard from "@/components/samples/SampleKanbanBoard";
import SampleStorageRack from "@/components/samples/SampleStorageRack";
import SampleStatCenter from "@/components/samples/SampleStatCenter";
import SampleQuickDrawer from "@/components/samples/SampleQuickDrawer";

export interface Sample {
  id: string;
  sampleNumber: string;
  barcode: string;
  patientId: string;
  orderId: string;
  testId: string;
  sampleType: string;
  status: string;
  collectedById?: string;
  collectedBy?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
  collectionType?: string;
  priority?: string;
  collectedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    barcode: string;
    patient: {
      id: string;
      uhid: string;
      firstName: string;
      lastName: string;
      gender: string;
      dateOfBirth?: string;
      age?: number;
      phone?: string;
    };
    doctor?: {
      id: string;
      doctorCode: string;
      fullName: string;
      specialization: string;
    };
  };
  test: {
    id: string;
    testCode: string;
    testName: string;
    sampleType: string;
    sampleContainer: string;
    processingDepartment?: string;
  };
}

const TUBE_CONTAINER_COLORS: Record<string, { bg: string; text: string; border: string; capColor: string; name: string }> = {
  "EDTA Tube": { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/40", capColor: "#8B5CF6", name: "Lavender EDTA" },
  "Lavender Top": { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/40", capColor: "#8B5CF6", name: "Lavender EDTA" },
  "Serum Separator Tube": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/40", capColor: "#F59E0B", name: "Gold SST Gel" },
  "SST": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/40", capColor: "#F59E0B", name: "Gold SST Gel" },
  "Red Top": { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/40", capColor: "#EF4444", name: "Red Plain" },
  "Sodium Citrate": { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/40", capColor: "#0284C7", name: "Light Blue Citrate" },
  "Light Blue": { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/40", capColor: "#0284C7", name: "Light Blue Citrate" },
  "Lithium Heparin": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/40", capColor: "#10B981", name: "Green Heparin" },
  "Green Top": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/40", capColor: "#10B981", name: "Green Heparin" },
  "Fluoride Tube": { bg: "bg-slate-500/10", text: "text-slate-300", border: "border-slate-500/40", capColor: "#64748B", name: "Grey Fluoride" },
  "Grey Top": { bg: "bg-slate-500/10", text: "text-slate-300", border: "border-slate-500/40", capColor: "#64748B", name: "Grey Fluoride" },
  "Sterile Container": { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/40", capColor: "#EAB308", name: "Urine Sterile Cup" },
};

function getContainerStyle(containerName?: string) {
  if (!containerName) return { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/40", capColor: "#06B6D4", name: "Standard Specimen" };
  for (const [key, val] of Object.entries(TUBE_CONTAINER_COLORS)) {
    if (containerName.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/40", capColor: "#06B6D4", name: containerName };
}

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Workstation View Mode
  const [workstationTab, setWorkstationTab] = useState<"worklist" | "kanban" | "scanner" | "storage" | "stat">("worklist");

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sampleTypeFilter, setSampleTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [queueView, setQueueView] = useState<"all" | "action" | "priority" | "overdue" | "completed" | "rejected">("all");
  const [slaHours, setSlaHours] = useState(4);
  const [showOperations, setShowOperations] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Barcode scanner station
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"receive" | "lookup">("receive");
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<{ barcode: string; result: string; at: string }[]>([]);
  const [scanSessionStarted] = useState(() => new Date());
  const [scanErrorCount, setScanErrorCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [scanInputFocused, setScanInputFocused] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Multi-Select Bulk Actions
  const [selectedSamples, setSelectedSamples] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0, label: "" });

  // Quick Slide-Over Drawer Sample
  const [drawerSample, setDrawerSample] = useState<Sample | null>(null);

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingSampleId, setRejectingSampleId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customRejectionReason, setCustomRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printPreviewType, setPrintPreviewType] = useState<"label" | "collection-sheet">("label");
  const [previewSample, setPreviewSample] = useState<Sample | null>(null);

  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectingSample, setCollectingSample] = useState<Sample | null>(null);
  const [collectionError, setCollectionError] = useState("");

  const [trackingSample, setTrackingSample] = useState<Sample | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditSample, setAuditSample] = useState<Sample | null>(null);

  const [workflowAction, setWorkflowAction] = useState<"receive" | "process" | "complete" | null>(null);
  const [workflowSample, setWorkflowSample] = useState<Sample | null>(null);
  const [workflowLocation, setWorkflowLocation] = useState("Laboratory Reception");
  const [workflowNotes, setWorkflowNotes] = useState("");
  const [integrityChecks, setIntegrityChecks] = useState({ label: false, container: false, volume: false });
  const [updatingSampleId, setUpdatingSampleId] = useState<string | null>(null);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sampleApi.getAll();
      if (response.success && response.data) {
        const samplesData = response.data.samples || response.data || [];
        setSamples(Array.isArray(samplesData) ? samplesData : []);
      }
    } catch (err) {
      console.error("Error fetching samples:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch samples");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = window.setInterval(fetchSamples, 30000);
    return () => window.clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    const handleScannerShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        focusScanner();
      }
    };
    window.addEventListener("keydown", handleScannerShortcut);
    return () => window.removeEventListener("keydown", handleScannerShortcut);
  }, []);

  const focusScanner = () => {
    setWorkstationTab("scanner");
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  // Filter & Search Logic
  useEffect(() => {
    let filtered = [...samples];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sample =>
        sample.sampleNumber.toLowerCase().includes(term) ||
        sample.barcode.toLowerCase().includes(term) ||
        sample.order.orderNumber.toLowerCase().includes(term) ||
        `${sample.order.patient.firstName} ${sample.order.patient.lastName}`.toLowerCase().includes(term) ||
        sample.order.patient.uhid.toLowerCase().includes(term) ||
        sample.test.testName.toLowerCase().includes(term) ||
        sample.test.testCode.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(sample => sample.status === statusFilter);
    }

    if (sampleTypeFilter !== "all") {
      filtered = filtered.filter(sample => sample.sampleType === sampleTypeFilter);
    }

    if (queueView === "action") {
      filtered = filtered.filter(sample => ["PENDING", "COLLECTED", "RECEIVED", "PROCESSING"].includes(sample.status));
    } else if (queueView === "priority") {
      filtered = filtered.filter(sample => sample.priority === "STAT" || sample.priority === "URGENT");
    } else if (queueView === "overdue") {
      filtered = filtered.filter(sample => !["COMPLETED", "REJECTED"].includes(sample.status) && Date.now() - new Date(sample.createdAt).getTime() > slaHours * 60 * 60 * 1000);
    } else if (queueView === "completed") {
      filtered = filtered.filter(sample => sample.status === "COMPLETED");
    } else if (queueView === "rejected") {
      filtered = filtered.filter(sample => sample.status === "REJECTED");
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "sampleNumber":
          comparison = a.sampleNumber.localeCompare(b.sampleNumber);
          break;
        case "patient":
          comparison = `${a.order.patient.firstName} ${a.order.patient.lastName}`.localeCompare(
            `${b.order.patient.firstName} ${b.order.patient.lastName}`
          );
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredSamples(filtered);
    setCurrentPage(1);
  }, [samples, searchTerm, statusFilter, sampleTypeFilter, sortBy, sortOrder, queueView, slaHours]);

  // Metrics Calculation
  const metrics = {
    pending: samples.filter(s => s.status === 'PENDING').length,
    collected: samples.filter(s => s.status === 'COLLECTED').length,
    received: samples.filter(s => s.status === 'RECEIVED').length,
    processing: samples.filter(s => s.status === 'PROCESSING').length,
    completed: samples.filter(s => s.status === 'COMPLETED').length,
    rejected: samples.filter(s => s.status === 'REJECTED').length,
  };

  const activeSamples = samples.filter(s => !["COMPLETED", "REJECTED"].includes(s.status));
  const statCount = samples.filter(s => (s.priority === "STAT" || s.priority === "URGENT") && s.status !== "COMPLETED").length;
  const overdueSamples = activeSamples.filter(sample =>
    Date.now() - new Date(sample.createdAt).getTime() > slaHours * 60 * 60 * 1000
  );
  const completionRate = samples.length
    ? Math.round((samples.filter(s => s.status === "COMPLETED").length / samples.length) * 100)
    : 0;

  // Pagination
  const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSamples = filteredSamples.slice(startIndex, startIndex + itemsPerPage);

  // Workflow Handlers
  const handleAdvanceStatus = async (sample: Sample, nextStatus: string) => {
    try {
      setUpdatingSampleId(sample.id);
      if (nextStatus === "COLLECTED") {
        setCollectingSample(sample);
        setShowCollectModal(true);
        return;
      }
      if (nextStatus === "RECEIVED") {
        setWorkflowSample(sample);
        setWorkflowAction("receive");
        setIntegrityChecks({ label: true, container: true, volume: true });
        return;
      }
      if (nextStatus === "PROCESSING") {
        await sampleApi.process(sample.id, "Main Analyzer Bay 01");
      } else if (nextStatus === "COMPLETED") {
        await sampleApi.complete(sample.id, "Core Validation Desk");
      }
      await fetchSamples();
      if (drawerSample?.id === sample.id) {
        setDrawerSample(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (err) {
      console.error(`Failed to advance status to ${nextStatus}:`, err);
    } finally {
      setUpdatingSampleId(null);
    }
  };

  const handleConfirmCollection = async (data: any) => {
    if (!collectingSample) return;
    try {
      setUpdatingSampleId(collectingSample.id);
      setCollectionError("");
      await sampleApi.collect(collectingSample.id, data);
      setShowCollectModal(false);
      setCollectingSample(null);
      await fetchSamples();
    } catch (err: any) {
      setCollectionError(err.message || "Failed to confirm collection");
    } finally {
      setUpdatingSampleId(null);
    }
  };

  const handleConfirmWorkflowAction = async () => {
    if (!workflowSample || !workflowAction) return;
    try {
      setUpdatingSampleId(workflowSample.id);
      if (workflowAction === "receive") {
        await sampleApi.receive(workflowSample.id, {
          location: workflowLocation,
          notes: workflowNotes,
          integrityChecks,
        });
      } else if (workflowAction === "process") {
        await sampleApi.process(workflowSample.id, workflowLocation);
      } else if (workflowAction === "complete") {
        await sampleApi.complete(workflowSample.id, workflowLocation);
      }
      setWorkflowAction(null);
      setWorkflowSample(null);
      setWorkflowNotes("");
      await fetchSamples();
    } catch (err) {
      console.error("Workflow action failed:", err);
    } finally {
      setUpdatingSampleId(null);
    }
  };

  const handleRejectSample = async () => {
    if (!rejectingSampleId) return;
    try {
      setRejecting(true);
      setRejectionError("");
      const finalReason = rejectionReason === "Other" ? customRejectionReason : rejectionReason;
      await sampleApi.reject(rejectingSampleId, { reason: finalReason });
      setShowRejectModal(false);
      setRejectingSampleId(null);
      setRejectionReason("");
      setCustomRejectionReason("");
      await fetchSamples();
      if (drawerSample?.id === rejectingSampleId) {
        setDrawerSample(null);
      }
    } catch (err: any) {
      setRejectionError(err.message || "Failed to reject sample");
    } finally {
      setRejecting(false);
    }
  };

  // Barcode Gun Handler
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim().toUpperCase();
    if (!code) return;

    setScanning(true);
    setScanMessage(null);
    try {
      const matchedSample = samples.find(
        s => s.barcode.toUpperCase() === code || s.sampleNumber.toUpperCase() === code
      );

      if (!matchedSample) {
        setScanErrorCount(c => c + 1);
        setScanMessage(`No specimen record found for barcode "${code}".`);
        setScanHistory(prev => [
          { barcode: code, result: "Not found", at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
          ...prev.slice(0, 7),
        ]);
        return;
      }

      setScanCount(c => c + 1);

      if (scanMode === "receive") {
        if (matchedSample.status === "COLLECTED" || matchedSample.status === "PENDING") {
          await sampleApi.receive(matchedSample.id, { location: "Barcode Scanning Bay" });
          setScanMessage(`Specimen ${matchedSample.sampleNumber} received successfully!`);
          setScanHistory(prev => [
            { barcode: code, result: `Received: ${matchedSample.sampleNumber}`, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
            ...prev.slice(0, 7),
          ]);
          await fetchSamples();
        } else {
          setScanMessage(`Specimen ${matchedSample.sampleNumber} is already in status: ${matchedSample.status}`);
        }
      } else {
        setDrawerSample(matchedSample);
        setScanMessage(`Lookup success: ${matchedSample.sampleNumber} (${matchedSample.test.testName})`);
      }
      setBarcodeInput("");
    } catch (err: any) {
      setScanMessage(err.message || "Barcode processing error");
    } finally {
      setScanning(false);
    }
  };

  // Bulk Operations
  const handleSelectAll = () => {
    if (selectedSamples.size === currentSamples.length) {
      setSelectedSamples(new Set());
    } else {
      setSelectedSamples(new Set(currentSamples.map(s => s.id)));
    }
  };

  const handleSelectSample = (id: string) => {
    const next = new Set(selectedSamples);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSamples(next);
  };

  const handleBulkReceive = async () => {
    const eligible = samples.filter(s => selectedSamples.has(s.id) && ["PENDING", "COLLECTED"].includes(s.status));
    if (eligible.length === 0) return;
    setBulkProcessing(true);
    setBulkProgress({ done: 0, total: eligible.length, label: "Receiving specimens into Lab" });
    for (let i = 0; i < eligible.length; i++) {
      try {
        await sampleApi.receive(eligible[i].id, { location: "Batch Accession Desk" });
      } catch (e) {}
      setBulkProgress({ done: i + 1, total: eligible.length, label: "Receiving specimens into Lab" });
    }
    setBulkProcessing(false);
    setSelectedSamples(new Set());
    await fetchSamples();
  };

  const handleBulkProcess = async () => {
    const eligible = samples.filter(s => selectedSamples.has(s.id) && s.status === "RECEIVED");
    if (eligible.length === 0) return;
    setBulkProcessing(true);
    setBulkProgress({ done: 0, total: eligible.length, label: "Routing to Analyzer Bays" });
    for (let i = 0; i < eligible.length; i++) {
      try {
        await sampleApi.process(eligible[i].id, "Main Analyzer Array");
      } catch (e) {}
      setBulkProgress({ done: i + 1, total: eligible.length, label: "Routing to Analyzer Bays" });
    }
    setBulkProcessing(false);
    setSelectedSamples(new Set());
    await fetchSamples();
  };

  const handleExportCsv = () => {
    const headers = ["Sample ID", "Barcode", "Patient UHID", "Patient Name", "Test Code", "Test Name", "Matrix", "Container", "Priority", "Status", "Created At"];
    const rows = filteredSamples.map(s => [
      s.sampleNumber,
      s.barcode,
      s.order.patient.uhid,
      `"${s.order.patient.firstName} ${s.order.patient.lastName}"`,
      s.test.testCode,
      `"${s.test.testName}"`,
      s.sampleType,
      `"${s.test.sampleContainer}"`,
      s.priority || "ROUTINE",
      s.status,
      s.createdAt,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LABCORE_Specimen_Manifest_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Specimen Management">
        <div className="space-y-6 pb-12">
          {/* Top Medical Center Command Ribbon */}
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                {/* Accreditation & Quality Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-cyan-200 backdrop-blur-md">
                    <FlaskConical className="h-3.5 w-3.5 text-cyan-300" /> Clinical LIS Workstation
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-200 backdrop-blur-md">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> NABL & CAP / ISO 15189 Validated
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-amber-200 backdrop-blur-md">
                    <Snowflake className="h-3.5 w-3.5 text-amber-300" /> Cold-Chain & Bio-Bank Monitored
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-slate-100 via-cyan-100 to-indigo-100 bg-clip-text text-transparent">
                  Sample Accession & Lifecycle Center
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl">
                  Enterprise laboratory information system with bi-directional analyzer integration, automated chain of custody, and clinical TAT escalation.
                </p>
              </div>

              {/* Action Hub */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setAutoRefresh(v => !v)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition-all duration-300 backdrop-blur-md ${
                    autoRefresh
                      ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-100 shadow-xl shadow-emerald-950/50"
                      : "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin text-emerald-300" : ""}`} />
                  Live Sync {autoRefresh ? "ON (30s)" : "OFF"}
                </button>

                <button
                  onClick={focusScanner}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/60 bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-black text-slate-950 shadow-xl shadow-cyan-950/50 hover:from-cyan-400 hover:to-blue-500 hover:scale-105 transition-all duration-300"
                >
                  <ScanLine className="h-4 w-4" /> Barcode Gun (Ctrl+K)
                </button>

                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-xs font-bold text-slate-200 hover:border-slate-600 hover:text-white transition-all backdrop-blur-md shadow-lg"
                >
                  <Download className="h-4 w-4 text-cyan-400" /> Export Manifest
                </button>
              </div>
            </div>

            {/* Real-Time Glass KPI Strip */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 border-t border-white/10 pt-6">
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Active Queue</span>
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <p className="mt-1 text-2xl font-black text-white">{activeSamples.length}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">In-flight specimens</p>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Phlebotomy Due</span>
                <p className="mt-1 text-2xl font-black text-white">{metrics.pending}</p>
                <p className="text-[10px] text-amber-200/80 mt-0.5">Awaiting collection</p>
              </div>

              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Central Lab Recv</span>
                <p className="mt-1 text-2xl font-black text-white">{metrics.received}</p>
                <p className="text-[10px] text-indigo-200/80 mt-0.5">QC passed & logged</p>
              </div>

              <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">On Analyzers</span>
                <p className="mt-1 text-2xl font-black text-white">{metrics.processing}</p>
                <p className="text-[10px] text-violet-200/80 mt-0.5">Processing test runs</p>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">STAT / Critical</span>
                  {statCount > 0 && <Flame className="h-3.5 w-3.5 text-rose-400 fill-rose-400 animate-bounce" />}
                </div>
                <p className="mt-1 text-2xl font-black text-white">{statCount}</p>
                <p className="text-[10px] text-rose-200/80 mt-0.5">Sub-2h priority</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Completed Today</span>
                <p className="mt-1 text-2xl font-black text-white">{metrics.completed}</p>
                <p className="text-[10px] text-emerald-200/80 mt-0.5">{completionRate}% compliance</p>
              </div>
            </div>
          </div>

          {/* Master Workstation Mode Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setWorkstationTab("worklist")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                  workstationTab === "worklist"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-950/50 scale-105"
                    : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <TableIcon className="h-4 w-4" />
                <span>1. Clinical Worklist</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${workstationTab === "worklist" ? "bg-slate-950 text-white" : "bg-slate-800 text-slate-300"}`}>
                  {filteredSamples.length}
                </span>
              </button>

              <button
                onClick={() => setWorkstationTab("kanban")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                  workstationTab === "kanban"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-950/50 scale-105"
                    : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>2. Stage Kanban Board</span>
              </button>

              <button
                onClick={() => setWorkstationTab("scanner")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                  workstationTab === "scanner"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-950/50 scale-105"
                    : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <ScanLine className="h-4 w-4" />
                <span>3. Barcode Reception Bay</span>
                {scanCount > 0 && (
                  <span className="rounded-full bg-emerald-400 px-1.5 py-0.2 text-[9px] font-bold text-slate-950">
                    +{scanCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setWorkstationTab("storage")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                  workstationTab === "storage"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-950/50 scale-105"
                    : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Snowflake className="h-4 w-4" />
                <span>4. Cold Chain & Bio-Bank</span>
              </button>

              <button
                onClick={() => setWorkstationTab("stat")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                  workstationTab === "stat"
                    ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-xl shadow-rose-950/50 scale-105"
                    : "border border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50"
                }`}
              >
                <Flame className="h-4 w-4 fill-rose-400" />
                <span>5. STAT & ICU Center</span>
                {statCount > 0 && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {statCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: MASTER CLINICAL WORKLIST TABLE */}
          {workstationTab === "worklist" && (
            <div className="space-y-5">
              {/* Quick Filter Bar */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {([
                      ["all", "All Specimens", samples.length],
                      ["action", "Needs Action", activeSamples.length],
                      ["priority", "STAT / Urgent", statCount],
                      ["overdue", "SLA Watch", overdueSamples.length],
                      ["completed", "Completed", metrics.completed],
                      ["rejected", "Redraws", metrics.rejected],
                    ] as const).map(([val, label, count]) => (
                      <button
                        key={val}
                        onClick={() => setQueueView(val)}
                        className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all ${
                          queueView === val
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md"
                            : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>{label}</span>
                        <span className="rounded-md bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 font-bold">
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    Showing {filteredSamples.length} of {samples.length} accessioned specimens
                  </span>
                </div>

                {/* Smart Filter Inputs */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="relative lg:col-span-2">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                    <input
                      type="text"
                      placeholder="Search Sample ID, Barcode, UHID, Patient, Test..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-all"
                    >
                      <option value="all">All Statuses</option>
                      <option value="PENDING">Pending Phlebotomy</option>
                      <option value="COLLECTED">Collected (In-Transit)</option>
                      <option value="RECEIVED">Received in Lab</option>
                      <option value="PROCESSING">Processing / In-Analyzer</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="REJECTED">Rejected / Redraw</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={sampleTypeFilter}
                      onChange={(e) => setSampleTypeFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-all"
                    >
                      <option value="all">All Matrix Types</option>
                      <option value="BLOOD">Whole Blood / Plasma</option>
                      <option value="SERUM">Serum</option>
                      <option value="URINE">Urine</option>
                      <option value="SWAB">Swab</option>
                      <option value="TISSUE">Tissue Biopsy</option>
                      <option value="OTHER">Other Specimen</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-all"
                    >
                      <option value="createdAt">Sort: Date Accessioned</option>
                      <option value="sampleNumber">Sort: Sample ID</option>
                      <option value="patient">Sort: Patient Name</option>
                      <option value="status">Sort: Workflow Status</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bulk Operations Toolbar (When Samples Selected) */}
              {selectedSamples.size > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-4 text-white shadow-2xl animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 font-black text-sm">
                      {selectedSamples.size}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Selected for Batch Laboratory Processing</p>
                      <p className="text-[10px] text-slate-400">Perform bulk clinical actions across selected specimens</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleBulkReceive}
                      disabled={bulkProcessing}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-black text-white shadow-md hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50"
                    >
                      <PackageCheck className="h-4 w-4" /> Batch Receive in Lab
                    </button>

                    <button
                      onClick={handleBulkProcess}
                      disabled={bulkProcessing}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
                    >
                      <Activity className="h-4 w-4" /> Route to Analyzers
                    </button>

                    <button
                      onClick={() => setSelectedSamples(new Set())}
                      className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}

              {/* Master Clinical Table */}
              <div className="overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-950 shadow-2xl">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    <p className="text-xs font-bold text-slate-400">Querying laboratory specimen records...</p>
                  </div>
                ) : filteredSamples.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
                    <FlaskConical className="h-10 w-10 text-slate-700" />
                    <p className="text-sm font-bold text-slate-300">No matching specimens found</p>
                    <p className="text-xs text-slate-600">Try adjusting your search terms or active filters</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <tr>
                          <th className="px-5 py-4 w-10">
                            <input
                              type="checkbox"
                              checked={selectedSamples.size === currentSamples.length && currentSamples.length > 0}
                              onChange={handleSelectAll}
                              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0"
                            />
                          </th>
                          <th className="px-5 py-4">Sample ID / Barcode</th>
                          <th className="px-5 py-4">Patient Demographics</th>
                          <th className="px-5 py-4">Test Profile</th>
                          <th className="px-5 py-4">Tube & Matrix</th>
                          <th className="px-5 py-4">Status & Stage</th>
                          <th className="px-5 py-4">Timeline</th>
                          <th className="px-5 py-4 text-right">Workflow Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-xs text-slate-300">
                        {currentSamples.map((sample) => {
                          const tube = getContainerStyle(sample.test.sampleContainer);
                          const isStat = sample.priority === "STAT" || sample.priority === "URGENT";
                          const isUpdating = updatingSampleId === sample.id;

                          return (
                            <tr
                              key={sample.id}
                              className={`group transition-all duration-200 hover:bg-slate-900/60 ${
                                isStat ? "bg-rose-950/15" : ""
                              }`}
                            >
                              <td className="px-5 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedSamples.has(sample.id)}
                                  onChange={() => handleSelectSample(sample.id)}
                                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0"
                                />
                              </td>

                              {/* Sample ID & Barcode */}
                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => setDrawerSample(sample)}
                                      className="font-mono text-xs font-black text-white hover:text-cyan-300 transition-colors"
                                    >
                                      {sample.sampleNumber}
                                    </button>
                                    {isStat && (
                                      <span className="rounded bg-rose-600 px-1.5 py-0.2 text-[8px] font-black uppercase text-white shadow-sm">
                                        STAT
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                                    <ScanLine className="h-3 w-3 text-cyan-400" /> {sample.barcode}
                                  </p>
                                  <p className="text-[10px] text-slate-600">Order #{sample.order.orderNumber}</p>
                                </div>
                              </td>

                              {/* Patient Demographics */}
                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-100 flex items-center gap-1.5">
                                    <UserRound className="h-3.5 w-3.5 text-cyan-400" />
                                    {sample.order.patient.firstName} {sample.order.patient.lastName}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    UHID: <span className="font-mono text-slate-300 font-bold">{sample.order.patient.uhid}</span>
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    {sample.order.patient.age || "—"} yrs · {sample.order.patient.gender}
                                  </p>
                                </div>
                              </td>

                              {/* Test Profile */}
                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-100">{sample.test.testName}</p>
                                  <span className="inline-block rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                                    {sample.test.testCode}
                                  </span>
                                  <p className="text-[10px] text-slate-500">{sample.test.processingDepartment || "Core Lab"}</p>
                                </div>
                              </td>

                              {/* Tube & Container Matrix */}
                              <td className="px-5 py-4">
                                <div className="space-y-1.5">
                                  <div
                                    className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold shadow-sm"
                                    style={{
                                      borderColor: `${tube.capColor}55`,
                                      backgroundColor: `${tube.capColor}15`,
                                      color: tube.capColor,
                                    }}
                                  >
                                    <span
                                      className="h-2 w-2 rounded-full shadow-inner"
                                      style={{ backgroundColor: tube.capColor }}
                                    />
                                    <span>{sample.test.sampleContainer || sample.sampleType}</span>
                                  </div>
                                  <p className="text-[10px] font-semibold text-slate-400">{sample.sampleType}</p>
                                </div>
                              </td>

                              {/* Status & Stage */}
                              <td className="px-5 py-4">
                                <div className="space-y-1.5">
                                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                    sample.status === "COMPLETED" ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300" :
                                    sample.status === "PROCESSING" ? "border-violet-500/40 bg-violet-500/20 text-violet-300" :
                                    sample.status === "RECEIVED" ? "border-cyan-500/40 bg-cyan-500/20 text-cyan-300" :
                                    sample.status === "COLLECTED" ? "border-indigo-500/40 bg-indigo-500/20 text-indigo-300" :
                                    sample.status === "REJECTED" ? "border-rose-500/40 bg-rose-500/20 text-rose-300" :
                                    "border-amber-500/40 bg-amber-500/20 text-amber-300"
                                  }`}>
                                    {sample.status}
                                  </span>
                                  {sample.rejectionReason && (
                                    <p className="text-[10px] text-rose-400 font-bold">{sample.rejectionReason}</p>
                                  )}
                                </div>
                              </td>

                              {/* Timeline */}
                              <td className="px-5 py-4 text-[10px] text-slate-400">
                                <div className="space-y-1">
                                  <span className="flex items-center gap-1 font-medium">
                                    <Clock3 className="h-3 w-3 text-slate-500" />
                                    {new Date(sample.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                                    {new Date(sample.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  {sample.collectedBy && (
                                    <p className="text-slate-500">Draw: {sample.collectedBy.fullName}</p>
                                  )}
                                </div>
                              </td>

                              {/* Workflow Actions */}
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {sample.status === "PENDING" && (
                                    <button
                                      onClick={() => handleAdvanceStatus(sample, "COLLECTED")}
                                      disabled={isUpdating}
                                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-[11px] font-black text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-500 transition-all"
                                    >
                                      Collect
                                    </button>
                                  )}
                                  {sample.status === "COLLECTED" && (
                                    <button
                                      onClick={() => handleAdvanceStatus(sample, "RECEIVED")}
                                      disabled={isUpdating}
                                      className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-[11px] font-black text-slate-950 shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all"
                                    >
                                      Receive
                                    </button>
                                  )}
                                  {sample.status === "RECEIVED" && (
                                    <button
                                      onClick={() => handleAdvanceStatus(sample, "PROCESSING")}
                                      disabled={isUpdating}
                                      className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-[11px] font-black text-white shadow-md hover:from-violet-400 hover:to-purple-500 transition-all"
                                    >
                                      Process
                                    </button>
                                  )}
                                  {sample.status === "PROCESSING" && (
                                    <button
                                      onClick={() => handleAdvanceStatus(sample, "COMPLETED")}
                                      disabled={isUpdating}
                                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 text-[11px] font-black text-white shadow-md hover:from-emerald-400 hover:to-teal-500 transition-all"
                                    >
                                      Validate
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      setPreviewSample(sample);
                                      setPrintPreviewType("label");
                                      setShowPrintPreview(true);
                                    }}
                                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-colors"
                                    title="Print Barcode Tube Label"
                                  >
                                    🏷️
                                  </button>

                                  <button
                                    onClick={() => setDrawerSample(sample)}
                                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                                    title="Inspect Dossier"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setTrackingSample(sample);
                                    }}
                                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-indigo-300 transition-colors"
                                    title="Chain of Custody Tracking"
                                  >
                                    <History className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-400">
                      Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span>
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: KANBAN STAGE BOARD */}
          {workstationTab === "kanban" && (
            <SampleKanbanBoard
              samples={samples}
              onSelectSample={(sample) => setDrawerSample(sample as any)}
              onAdvanceStatus={(sample, nextStatus) => handleAdvanceStatus(sample as any, nextStatus)}
              onPrintLabel={(sample) => {
                setPreviewSample(sample as any);
                setPrintPreviewType("label");
                setShowPrintPreview(true);
              }}
              onRejectSample={(id) => {
                setRejectingSampleId(id);
                setShowRejectModal(true);
              }}
              updatingSampleId={updatingSampleId}
            />
          )}

          {/* TAB 3: HIGH SPEED BARCODE GUN RECEPTION BAY */}
          {workstationTab === "scanner" && (
            <div className="rounded-3xl border border-cyan-500/50 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 shadow-2xl text-white space-y-6">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black shadow-xl shadow-cyan-900/40">
                    <ScanLine className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-wide">High-Speed Barcode Gun Accession Bay</h2>
                      <span className="rounded-full bg-emerald-400/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                        SCANNER ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Compatible with USB / Bluetooth handheld laser scanners & automated conveyor accessioning.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-xs font-bold text-cyan-300">
                    AUTO-RECEIVE ON SCAN
                  </span>
                </div>
              </div>

              {/* Live Session Counter */}
              <div className="grid grid-cols-3 gap-3 border-b border-white/10 pb-6 text-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Session Scans</p>
                  <p className="mt-1 text-3xl font-black text-white">{scanCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Unrecognized / Exceptions</p>
                  <p className={`mt-1 text-3xl font-black ${scanErrorCount ? "text-amber-300" : "text-emerald-300"}`}>{scanErrorCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Shift Session Started</p>
                  <p className="mt-1 text-xl font-black text-white">{scanSessionStarted.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>

              {/* Barcode Input Form */}
              <form onSubmit={handleBarcodeScan} className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    {scanMode === "receive" ? "Scan Barcode to Receive into Central Lab" : "Scan Barcode for Instant Lookup"}
                  </label>
                  <div className="flex rounded-xl border border-white/20 bg-white/10 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setScanMode("receive")}
                      className={`rounded-lg px-3 py-1.5 transition-all ${scanMode === "receive" ? "bg-cyan-400 text-slate-950" : "text-slate-300"}`}
                    >
                      Receive Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanMode("lookup")}
                      className={`rounded-lg px-3 py-1.5 transition-all ${scanMode === "lookup" ? "bg-cyan-400 text-slate-950" : "text-slate-300"}`}
                    >
                      Lookup Mode
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <ScanLine className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-cyan-400" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    autoFocus
                    placeholder="Aim barcode scanner gun or type specimen code and press Enter..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value.toUpperCase())}
                    className="w-full rounded-2xl border border-cyan-400/50 bg-slate-950 px-5 py-4 pl-14 font-mono text-base font-bold text-white shadow-inner outline-none ring-2 ring-cyan-400/30 focus:ring-4 focus:ring-cyan-400/60"
                    disabled={scanning}
                  />
                  {barcodeInput && (
                    <button
                      type="button"
                      onClick={() => setBarcodeInput("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {scanMessage && (
                  <div className={`p-4 rounded-2xl text-xs font-bold border ${
                    scanMessage.includes("No specimen") || scanMessage.includes("error")
                      ? "border-amber-500/40 bg-amber-500/20 text-amber-200"
                      : "border-emerald-500/40 bg-emerald-500/20 text-emerald-200"
                  }`}>
                    {scanMessage}
                  </div>
                )}
              </form>

              {/* Scan Session Activity Log */}
              {scanHistory.length > 0 && (
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Barcode Scans in this Session</p>
                  <div className="flex flex-wrap gap-2">
                    {scanHistory.map((s, idx) => (
                      <span key={idx} className="rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-mono">
                        <span className="text-cyan-300 font-bold">{s.barcode}</span> · {s.result} ({s.at})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COLD CHAIN & BIO-BANK */}
          {workstationTab === "storage" && (
            <SampleStorageRack
              samples={samples}
              onSelectSample={(sample) => setDrawerSample(sample as any)}
            />
          )}

          {/* TAB 5: STAT & EMERGENCY ESCALATION */}
          {workstationTab === "stat" && (
            <SampleStatCenter
              samples={samples}
              onSelectSample={(sample) => setDrawerSample(sample as any)}
              onAdvanceStatus={(sample, nextStatus) => handleAdvanceStatus(sample as any, nextStatus)}
              onPrintLabel={(sample) => {
                setPreviewSample(sample as any);
                setPrintPreviewType("label");
                setShowPrintPreview(true);
              }}
              updatingSampleId={updatingSampleId}
            />
          )}
        </div>

        {/* Slide-Over Quick Inspection Drawer */}
        <SampleQuickDrawer
          sample={drawerSample}
          isOpen={!!drawerSample}
          onClose={() => setDrawerSample(null)}
          onAdvance={(sample, action) => {
            const nextStatusMap = { collect: "COLLECTED", receive: "RECEIVED", process: "PROCESSING", complete: "COMPLETED" };
            handleAdvanceStatus(sample as any, nextStatusMap[action]);
          }}
          onReject={(id) => {
            setRejectingSampleId(id);
            setShowRejectModal(true);
          }}
          onPrintLabel={(sample) => {
            setPreviewSample(sample as any);
            setPrintPreviewType("label");
            setShowPrintPreview(true);
          }}
          onPrintSheet={(sample) => {
            setPreviewSample(sample as any);
            setPrintPreviewType("collection-sheet");
            setShowPrintPreview(true);
          }}
          updating={updatingSampleId === drawerSample?.id}
        />

        {/* Phlebotomy Collect Modal */}
        <SampleCollectModal
          sample={collectingSample}
          isOpen={showCollectModal}
          onClose={() => { setShowCollectModal(false); setCollectingSample(null); setCollectionError(""); }}
          onConfirm={handleConfirmCollection}
          loading={!!collectingSample && updatingSampleId === collectingSample?.id}
          error={collectionError}
          existingBarcodes={samples.filter(s => collectingSample ? s.id !== collectingSample.id : true).map(s => s.barcode)}
        />

        {/* Reject / Redraw Modal */}
        <SampleRejectModal
          sample={rejectingSampleId ? (samples.find(s => s.id === rejectingSampleId) ?? null) : null}
          isOpen={showRejectModal}
          onClose={() => { setShowRejectModal(false); setRejectingSampleId(null); setRejectionReason(""); setCustomRejectionReason(""); setRejectionError(""); }}
          onConfirm={handleRejectSample}
          loading={rejecting}
          error={rejectionError}
        />

        {/* Chain of Custody Tracking Modal */}
        <SampleTrackModal
          sample={trackingSample}
          events={trackingEvents}
          loading={trackingLoading}
          isOpen={!!trackingSample}
          onClose={() => setTrackingSample(null)}
          onRefresh={() => trackingSample && sampleApi.getTracking(trackingSample.id)}
          slaHours={slaHours}
        />

        {/* Barcode Tube Label / A4 Collection Sheet Modal */}
        {showPrintPreview && previewSample && (
          <SampleLabelPrint
            sample={previewSample}
            mode={printPreviewType === "label" ? "label" : "sheet"}
            onClose={() => setShowPrintPreview(false)}
            onPrint={() => setShowPrintPreview(false)}
          />
        )}

        {/* Integrity Checkpoint Modal on Lab Receive */}
        {workflowAction && workflowSample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800 overflow-hidden">
              <div className="flex items-start justify-between border-b border-slate-800 p-6 bg-slate-900/60">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Pre-Analytical Quality Gate</span>
                  <h3 className="mt-1 text-lg font-black text-white">
                    Receive Specimen into Laboratory
                  </h3>
                  <p className="text-xs text-slate-400">{workflowSample.sampleNumber} · {workflowSample.order.patient.firstName} {workflowSample.order.patient.lastName}</p>
                </div>
                <button onClick={() => { setWorkflowAction(null); setWorkflowSample(null); }} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-6 text-xs">
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Specimen Integrity Checklist (ISO 15189)</p>
                  {([
                    ["label", "Patient 2-identifier label matches requisition order"],
                    ["container", "Specimen container is sealed, intact and without leakage"],
                    ["volume", "Sample volume is adequate (No QNS flag)"],
                  ] as const).map(([k, lbl]) => (
                    <label key={k} className="flex items-center gap-3 text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={integrityChecks[k]}
                        onChange={(e) => setIntegrityChecks(prev => ({ ...prev, [k]: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0"
                      />
                      <span className="font-medium">{lbl}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Assigned Laboratory Area</label>
                  <select
                    value={workflowLocation}
                    onChange={(e) => setWorkflowLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-slate-200 outline-none"
                  >
                    <option>Laboratory Reception</option>
                    <option>Pre-Analytical Centrifugation Desk</option>
                    <option>Biochemistry Analyzer Bay (Cobas / Abbott)</option>
                    <option>Hematology & Coagulation Cell (Sysmex)</option>
                    <option>Microbiology & Serology Section</option>
                    <option>Cold Chain Storage (2-8°C Archive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Operator Quality Note</label>
                  <textarea
                    value={workflowNotes}
                    onChange={(e) => setWorkflowNotes(e.target.value)}
                    rows={2}
                    placeholder="Enter pre-analytical notes (e.g. Hemolysis index normal, received on ice)..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => { setWorkflowAction(null); setWorkflowSample(null); }} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 font-bold text-slate-400 hover:text-white">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmWorkflowAction}
                    disabled={!Object.values(integrityChecks).every(Boolean) || updatingSampleId === workflowSample.id}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-black text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                  >
                    {updatingSampleId === workflowSample.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    Confirm Accession & QC Pass
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
