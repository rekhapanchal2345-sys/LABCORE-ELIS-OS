"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { sampleApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PrintPreviewModal from "@/components/samples/PrintPreviewModal";
import { Activity, AlertTriangle, ClipboardList, Download, History, RefreshCw, Sparkles, X, CheckCircle2, Loader2, PackageCheck, Printer, ScanLine, UserCheck, ShieldCheck, Clock, Clock3, MapPin, FlaskConical, UserRound, Search, SlidersHorizontal, ArrowUpDown, RotateCcw } from "lucide-react";
import PremiumAuditCard from "@/components/audit/PremiumAuditCard";
import PremiumAuditTimeline from "@/components/audit/PremiumAuditTimeline";
import SampleAuditVerification from "@/components/audit/SampleAuditVerification";

interface Sample {
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

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sampleTypeFilter, setSampleTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [queueView, setQueueView] = useState<"all" | "action" | "priority" | "overdue" | "completed" | "rejected">("all");
  
  // Barcode scanner
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"receive" | "lookup">("receive");
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<{ barcode: string; result: string; at: string }[]>([]);
  const [scanSessionStarted, setScanSessionStarted] = useState(() => new Date());
  const [scanErrorCount, setScanErrorCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [scanInputFocused, setScanInputFocused] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Bulk actions
  const [selectedSamples, setSelectedSamples] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingSampleId, setRejectingSampleId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customRejectionReason, setCustomRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [rejecting, setRejecting] = useState(false);
  
  // Print preview modal
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printPreviewType, setPrintPreviewType] = useState<"label" | "collection-sheet">("label");
  const [previewSample, setPreviewSample] = useState<Sample | null>(null);
  
  // Action states
  const [updatingSampleId, setUpdatingSampleId] = useState<string | null>(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectingSample, setCollectingSample] = useState<Sample | null>(null);
  const [collectionBarcode, setCollectionBarcode] = useState("");
  const [collectionType, setCollectionType] = useState("WALK_IN");
  const [collectionPriority, setCollectionPriority] = useState("ROUTINE");
  const [collectionLocation, setCollectionLocation] = useState("Phlebotomy Room");
  const [collectionError, setCollectionError] = useState("");
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0, label: "" });
  const [printQueue, setPrintQueue] = useState<{ type: "label" | "collection-sheet"; total: number; done: number } | null>(null);
  const [workflowAction, setWorkflowAction] = useState<"receive" | "process" | "complete" | null>(null);
  const [workflowSample, setWorkflowSample] = useState<Sample | null>(null);
  const [workflowLocation, setWorkflowLocation] = useState("Laboratory Reception");
  const [workflowNotes, setWorkflowNotes] = useState("");
  const [integrityChecks, setIntegrityChecks] = useState({ label: false, container: false, volume: false });
  const [showOperations, setShowOperations] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [trackingSample, setTrackingSample] = useState<Sample | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [slaHours, setSlaHours] = useState(4);
  
  // Premium Audit System
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditSample, setAuditSample] = useState<Sample | null>(null);
  const [auditView, setAuditView] = useState<"timeline" | "verification" | "details">("timeline");
  const [auditExpandedCards, setAuditExpandedCards] = useState<Set<string>>(new Set());

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
      console.error('Error fetching samples:', err);
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
    const interval = window.setInterval(fetchSamples, 60000);
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

  // Apply filters and search
  useEffect(() => {
    let filtered = [...samples];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sample =>
        sample.sampleNumber.toLowerCase().includes(term) ||
        sample.barcode.toLowerCase().includes(term) ||
        sample.order.orderNumber.toLowerCase().includes(term) ||
        `${sample.order.patient.firstName} ${sample.order.patient.lastName}`.toLowerCase().includes(term) ||
        sample.order.patient.uhid.toLowerCase().includes(term) ||
        sample.test.testName.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(sample => sample.status === statusFilter);
    }

    // Sample type filter
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

    // Sorting
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

  // Calculate metrics
  const metrics = {
    pending: samples.filter(s => s.status === 'PENDING').length,
    collected: samples.filter(s => s.status === 'COLLECTED').length,
    received: samples.filter(s => s.status === 'RECEIVED').length,
    completed: samples.filter(s => s.status === 'COMPLETED').length,
    rejected: samples.filter(s => s.status === 'REJECTED').length,
  };

  const activeSamples = samples.filter(s => !["COMPLETED", "REJECTED"].includes(s.status));
  const overdueSamples = activeSamples.filter(sample =>
    Date.now() - new Date(sample.createdAt).getTime() > slaHours * 60 * 60 * 1000
  );
  const completionRate = samples.length
    ? Math.round((samples.filter(s => s.status === "COMPLETED").length / samples.length) * 100)
    : 0;
  const pendingSlaRisk = samples.filter(s => s.status === "PENDING" && Date.now() - new Date(s.createdAt).getTime() > slaHours * 60 * 60 * 1000).length;
  const collectedSlaRisk = samples.filter(s => s.status === "COLLECTED" && Date.now() - new Date(s.createdAt).getTime() > slaHours * 60 * 60 * 1000).length;
  const receivedSlaRisk = samples.filter(s => s.status === "RECEIVED" && Date.now() - new Date(s.createdAt).getTime() > slaHours * 60 * 60 * 1000).length;
  const labelEligibleCount = samples.filter(s => s.status !== "REJECTED").length;
  const selectedLabelCount = samples.filter(s => selectedSamples.has(s.id) && s.status !== "REJECTED").length;

  // Pagination calculations
  const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSamples = filteredSamples.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RECEIVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "COLLECTED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getContainerColor = (container: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      "EDTA Purple": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
      "Serum Separator Red": { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
      "Citrate Blue": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
      "Urine Container Yellow": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
      "Fluoride Grey": { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-400" },
      "Heparin Green": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    };
    return colors[container] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" };
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "STAT":
        return "bg-red-100 text-red-800 border-red-300";
      case "URGENT":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "ROUTINE":
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getVerification = (sample: Sample) => {
    const checks = [
      Boolean(sample.barcode),
      Boolean(sample.test.sampleContainer),
      sample.status !== "REJECTED" || Boolean(sample.rejectionReason),
    ];
    const verified = checks.filter(Boolean).length;
    if (sample.status === "REJECTED") return { label: "Redraw required", tone: "red", detail: sample.rejectionReason || "Review rejection reason" };
    if (verified === checks.length && ["RECEIVED", "PROCESSING", "COMPLETED"].includes(sample.status)) {
      return { label: "Verified", tone: "green", detail: "Identity and container checks passed" };
    }
    if (sample.status === "PENDING") return { label: "Awaiting collection", tone: "amber", detail: "Barcode and specimen checks pending" };
    return { label: "Review at intake", tone: "blue", detail: `${verified}/${checks.length} checks complete` };
  };

  const getWorkflowStep = (status: string) => {
    const steps = ["PENDING", "COLLECTED", "RECEIVED", "PROCESSING", "COMPLETED"];
    const index = steps.indexOf(status);
    return Math.max(index, 0);
  };

  const getSampleAge = (sample: Sample) => {
    const start = new Date(sample.collectedAt || sample.createdAt).getTime();
    const minutes = Math.max(0, Math.floor((Date.now() - start) / 60000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getNextAction = (status: string) => ({
    PENDING: "Collect specimen",
    COLLECTED: "Receive in lab",
    RECEIVED: "Start processing",
    PROCESSING: "Complete processing",
    COMPLETED: "Ready for validation",
    REJECTED: "Arrange redraw",
  }[status] || "Review sample");

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSampleTypeFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setQueueView("all");
  };

  const queueLaneStyles: Record<string, { active: string; idle: string; icon: string }> = {
    all: {
      active: "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-900/20 ring-1 ring-sky-300/50",
      idle: "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 hover:bg-sky-100",
      icon: "bg-sky-500",
    },
    action: {
      active: "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-900/20 ring-1 ring-violet-300/50",
      idle: "border-violet-200 bg-violet-50 text-violet-800 hover:border-violet-300 hover:bg-violet-100",
      icon: "bg-violet-500",
    },
    priority: {
      active: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-red-900/20 ring-1 ring-rose-300/50",
      idle: "border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300 hover:bg-rose-100",
      icon: "bg-rose-500",
    },
    overdue: {
      active: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-900/20 ring-1 ring-amber-300/50",
      idle: "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100",
      icon: "bg-amber-500",
    },
    completed: {
      active: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-300/50",
      idle: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100",
      icon: "bg-emerald-500",
    },
    rejected: {
      active: "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-purple-900/20 ring-1 ring-fuchsia-300/50",
      idle: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 hover:border-fuchsia-300 hover:bg-fuchsia-100",
      icon: "bg-fuchsia-500",
    },
  };

  // Barcode scanner handler
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setScanning(true);
    try {
      setScanMessage(null);
      const normalizedBarcode = barcodeInput.trim().toUpperCase();
      const alreadyScanned = scanHistory.some(scan => scan.barcode === normalizedBarcode);
      if (alreadyScanned && scanMode === "receive") {
        setScanMessage(`Barcode ${normalizedBarcode} was already scanned in this session`);
        setScanErrorCount(count => count + 1);
        return;
      }
      const sample = samples.find(s => s.barcode.toUpperCase() === normalizedBarcode);
      if (sample) {
        if (scanMode === "lookup") {
          setScanMessage(`${sample.sampleNumber} · ${sample.order.patient.firstName} ${sample.order.patient.lastName} · ${sample.status}`);
        } else if (sample.status === 'COLLECTED') {
          // Auto-receive the sample
          await sampleApi.receive(sample.id, { notes: 'Received via barcode scan' });
          await fetchSamples();
          setBarcodeInput("");
          setScanMessage(`Sample ${sample.sampleNumber} received successfully`);
        } else if (sample.status === 'PENDING') {
          setScanMessage(`Sample ${sample.sampleNumber} is pending collection`);
        } else if (sample.status === 'RECEIVED' || sample.status === 'PROCESSING' || sample.status === 'COMPLETED') {
          setScanMessage(`Sample ${sample.sampleNumber} is already ${sample.status.toLowerCase()}`);
        } else {
          setScanMessage(`Sample ${sample.sampleNumber} is rejected and cannot be received`);
        }
      } else {
        setScanMessage(`No sample found with barcode: ${barcodeInput}`);
      }
      const scanResult = !sample
        ? "Not found"
        : scanMode === "lookup"
          ? "Looked up"
          : sample.status === "COLLECTED"
            ? "Received"
            : sample.status;
      setScanHistory(previous => [
        { barcode: normalizedBarcode, result: scanResult, at: new Date().toLocaleTimeString() },
        ...previous,
      ].slice(0, 5));
      setScanCount(count => count + 1);
      if (!sample) setScanErrorCount(count => count + 1);
    } catch (err) {
      console.error('Error scanning barcode:', err);
      setError('Failed to process barcode scan');
    } finally {
      setScanning(false);
    }
  };

  const resetScanSession = () => {
    setScanHistory([]);
    setScanErrorCount(0);
    setScanCount(0);
    setScanMessage(null);
    setBarcodeInput("");
    setScanSessionStarted(new Date());
  };

  const focusScanner = () => {
    const input = document.getElementById("specimen-barcode-input") as HTMLInputElement | null;
    input?.focus();
  };

  // Rejection handlers
  const openRejectModal = (sampleId: string) => {
    setRejectingSampleId(sampleId);
    setRejectionReason("");
    setCustomRejectionReason("");
    setRejectionError("");
    setError(null);
    setShowRejectModal(true);
  };

  const handleRejectSample = async () => {
    const reason = rejectionReason === "Other" ? customRejectionReason.trim() : rejectionReason.trim();
    if (!rejectingSampleId || rejecting) return;
    if (!reason) {
      setRejectionError("Select a reason before rejecting the sample.");
      return;
    }

    try {
      setRejecting(true);
      setRejectionError("");
      await sampleApi.reject(rejectingSampleId, { reason });
      await fetchSamples();
      setShowRejectModal(false);
      setRejectingSampleId(null);
      setRejectionReason("");
      setCustomRejectionReason("");
    } catch (err) {
      console.error('Error rejecting sample:', err);
      setRejectionError(err instanceof Error ? err.message : 'Failed to reject sample');
    } finally {
      setRejecting(false);
    }
  };

  // Action handlers
  const handleCollectSample = async (sampleId: string) => {
    const sample = samples.find(item => item.id === sampleId);
    if (!sample) return;
    setCollectingSample(sample);
    setCollectionBarcode("");
    setCollectionType(sample.collectionType || "WALK_IN");
    setCollectionPriority(sample.priority || "ROUTINE");
    setCollectionLocation("Phlebotomy Room");
    setCollectionError("");
    setShowCollectModal(true);
  };

  const handleConfirmCollection = async () => {
    if (!collectingSample || updatingSampleId === collectingSample.id) return;
    const barcode = collectionBarcode.trim().toUpperCase();
    if (!barcode) {
      setCollectionError("Scan or enter the specimen barcode.");
      return;
    }
    if (!collectionLocation.trim()) {
      setCollectionError("Collection location is required.");
      return;
    }
    const duplicate = samples.find(sample => sample.barcode?.trim().toUpperCase() === barcode && sample.id !== collectingSample.id);
    if (duplicate) {
      setCollectionError(`Barcode already assigned to ${duplicate.sampleNumber}. Use a unique barcode.`);
      return;
    }
    try {
      setUpdatingSampleId(collectingSample.id);
      setCollectionError("");
      await sampleApi.collect(collectingSample.id, {
        barcode,
        collectionType,
        priority: collectionPriority,
        location: collectionLocation,
        notes: `Collected at ${collectionLocation}`,
      });
      await fetchSamples();
      setShowCollectModal(false);
      setCollectingSample(null);
    } catch (err) {
      console.error("Error collecting sample:", err);
      setCollectionError(err instanceof Error ? err.message : "Failed to collect sample. Verify the barcode is unique.");
    } finally {
      setUpdatingSampleId(null);
    }
  };

  const handleReceiveSample = async (sampleId: string) => {
    const sample = samples.find(item => item.id === sampleId);
    if (!sample) return;
    setWorkflowSample(sample);
    setWorkflowAction("receive");
    setWorkflowLocation("Laboratory Reception");
    setWorkflowNotes("Integrity checked at receiving desk");
    setIntegrityChecks({ label: false, container: false, volume: false });
  };

  const handleProcessSample = async (sampleId: string) => {
    const sample = samples.find(item => item.id === sampleId);
    if (!sample) return;
    setWorkflowSample(sample);
    setWorkflowAction("process");
    setWorkflowLocation("Laboratory Processing Area");
    setWorkflowNotes("");
  };

  const handleCompleteSample = async (sampleId: string) => {
    const sample = samples.find(item => item.id === sampleId);
    if (!sample) return;
    setWorkflowSample(sample);
    setWorkflowAction("complete");
    setWorkflowLocation("Laboratory Processing Area");
    setWorkflowNotes("Processing completed and ready for result validation");
  };

  const handleConfirmWorkflowAction = async () => {
    if (!workflowSample || !workflowAction || !workflowLocation.trim()) return;
    try {
      setUpdatingSampleId(workflowSample.id);
      if (workflowAction === "receive") {
        await sampleApi.receive(workflowSample.id, { notes: `${workflowNotes} | Integrity: label, container, volume verified`, location: workflowLocation });
      } else if (workflowAction === "process") {
        await sampleApi.process(workflowSample.id, workflowLocation);
      } else {
        await sampleApi.complete(workflowSample.id, workflowLocation);
      }
      await fetchSamples();
      setWorkflowAction(null);
      setWorkflowSample(null);
    } catch (err) {
      console.error("Workflow action failed:", err);
      setError(`Failed to ${workflowAction} sample`);
    } finally {
      setUpdatingSampleId(null);
    }
  };

  const handlePrintLabel = (sample: Sample) => {
    setPreviewSample(sample);
    setPrintPreviewType("label");
    setShowPrintPreview(true);
  };

  const handlePrintCollectionSheet = (sample: Sample) => {
    setPreviewSample(sample);
    setPrintPreviewType("collection-sheet");
    setShowPrintPreview(true);
  };

  const handleConfirmPrint = () => {
    if (previewSample) {
      if (printPreviewType === "label") {
        window.open(`/samples/${previewSample.id}/label`, '_blank');
      } else {
        window.open(`/samples/${previewSample.id}/collection-sheet`, '_blank');
      }
    }
  };

  const handleExportCsv = () => {
    const headers = ["Sample ID", "Barcode", "Patient", "UHID", "Test", "Type", "Status", "Priority", "Created At"];
    const rows = filteredSamples.map(sample => [
      sample.sampleNumber,
      sample.barcode,
      `${sample.order.patient.firstName} ${sample.order.patient.lastName}`,
      sample.order.patient.uhid,
      sample.test.testName,
      sample.sampleType,
      sample.status,
      sample.priority || "ROUTINE",
      new Date(sample.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map(row =>
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `labcore-samples-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewTracking = async (sample: Sample) => {
    setTrackingSample(sample);
    setTrackingLoading(true);
    try {
      const response = await sampleApi.getTracking(sample.id);
      const events = response?.data?.trackingHistory || response?.data || [];
      setTrackingEvents(Array.isArray(events) ? events : []);
    } catch (err) {
      console.error("Error fetching sample tracking:", err);
      setTrackingEvents([]);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Bulk action handlers
  const handleSelectSample = (sampleId: string) => {
    const newSelected = new Set(selectedSamples);
    if (newSelected.has(sampleId)) {
      newSelected.delete(sampleId);
    } else {
      newSelected.add(sampleId);
    }
    setSelectedSamples(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedSamples.size === currentSamples.length) {
      setSelectedSamples(new Set());
      setShowBulkActions(false);
    } else {
      const allSampleIds = new Set(currentSamples.map(sample => sample.id));
      setSelectedSamples(allSampleIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkPrintLabels = () => {
    const selectedSamplesList = samples.filter(s => selectedSamples.has(s.id));
    setPrintQueue({ type: "label", total: selectedSamplesList.length, done: 0 });
    selectedSamplesList.forEach((sample, index) => {
      window.open(`/samples/${sample.id}/label`, '_blank');
      window.setTimeout(() => setPrintQueue(queue => queue ? ({ ...queue, done: Math.min(queue.total, index + 1) }) : null), index * 250);
    });
    setSelectedSamples(new Set());
    setShowBulkActions(false);
  };

  const handleBulkPrintCollectionSheets = () => {
    const selectedSamplesList = samples.filter(s => selectedSamples.has(s.id));
    setPrintQueue({ type: "collection-sheet", total: selectedSamplesList.length, done: 0 });
    selectedSamplesList.forEach((sample, index) => {
      window.open(`/samples/${sample.id}/collection-sheet`, '_blank');
      window.setTimeout(() => setPrintQueue(queue => queue ? ({ ...queue, done: Math.min(queue.total, index + 1) }) : null), index * 250);
    });
    setSelectedSamples(new Set());
    setShowBulkActions(false);
  };

  const handleBulkReceive = async () => {
    const eligible = samples.filter(sample => selectedSamples.has(sample.id) && sample.status === "COLLECTED");
    if (!eligible.length) return;
    setBulkProcessing(true);
    setBulkProgress({ done: 0, total: eligible.length, label: "Receiving specimens" });
    try {
      for (const [index, sample] of eligible.entries()) {
        await sampleApi.receive(sample.id, { notes: "Batch received from sample queue", location: "Receiving Desk" });
        setBulkProgress({ done: index + 1, total: eligible.length, label: "Receiving specimens" });
      }
      await fetchSamples();
      setSelectedSamples(new Set());
      setShowBulkActions(false);
    } catch (err) {
      console.error("Bulk receive failed:", err);
      setError("Some samples could not be received. Review their current status.");
    } finally {
      setBulkProcessing(false);
      setBulkProgress({ done: 0, total: 0, label: "" });
    }
  };

  const handleBulkProcess = async () => {
    const eligible = samples.filter(sample => selectedSamples.has(sample.id) && sample.status === "RECEIVED");
    if (!eligible.length) return;
    setBulkProcessing(true);
    setBulkProgress({ done: 0, total: eligible.length, label: "Processing specimens" });
    try {
      for (const [index, sample] of eligible.entries()) {
        await sampleApi.process(sample.id, "Processing Lab");
        setBulkProgress({ done: index + 1, total: eligible.length, label: "Processing specimens" });
      }
      await fetchSamples();
      setSelectedSamples(new Set());
      setShowBulkActions(false);
    } catch (err) {
      console.error("Bulk process failed:", err);
      setError("Some samples could not be processed. Review their current status.");
    } finally {
      setBulkProcessing(false);
      setBulkProgress({ done: 0, total: 0, label: "" });
    }
  };

  // Premium Audit Handlers
  const handleViewAudit = (sample: Sample) => {
    setAuditSample(sample);
    setAuditView("timeline");
    setShowAuditModal(true);
  };

  const handleToggleAuditCard = (cardId: string) => {
    setAuditExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const generateMockAuditLogs = (sample: Sample) => {
    return [
      {
        id: `audit-${sample.id}-1`,
        action: "PATIENT_VERIFICATION",
        entity: "Sample",
        entityId: sample.id,
        userName: "Dr. Sarah Johnson",
        role: "PATHOLOGIST",
        ipAddress: "192.168.1.100",
        description: "Patient identity verified using UHID and biometric matching",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: "SUCCESS",
        patientVerification: {
          nameVerified: true,
          uhidVerified: true,
          dobVerified: true,
          photoVerified: true
        },
        location: "Phlebotomy Room A",
        deviceInfo: "Barcode Scanner Model X200",
        sessionId: `sess-${sample.id}`
      },
      {
        id: `audit-${sample.id}-2`,
        action: "BARCODE_SCAN",
        entity: "Sample",
        entityId: sample.id,
        userName: "Lab Tech Michael Chen",
        role: "LAB_TECH",
        ipAddress: "192.168.1.105",
        description: "Specimen barcode scanned and verified against order",
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        status: "SUCCESS",
        barcodeData: {
          scanned: sample.barcode,
          expected: sample.barcode,
          matched: true
        },
        location: "Sample Receiving",
        deviceInfo: "Handheld Scanner Zebra",
        sessionId: `sess-${sample.id}`
      },
      {
        id: `audit-${sample.id}-3`,
        action: "SAMPLE_COLLECTION",
        entity: "Sample",
        entityId: sample.id,
        userName: "Phlebotomist Emma Davis",
        role: "LAB_TECH",
        ipAddress: "192.168.1.110",
        description: "Sample collected with full chain of custody documentation",
        createdAt: new Date(Date.now() - 900000).toISOString(),
        status: "SUCCESS",
        location: "Collection Desk 2",
        deviceInfo: "Tablet iPad Pro",
        sessionId: `sess-${sample.id}`
      }
    ];
  };

  const generateMockTimelineEvents = (sample: Sample) => {
    return [
      {
        id: `timeline-${sample.id}-1`,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        event: "Order Created",
        description: "Lab order created by Dr. Smith for patient",
        status: "success" as const,
        user: "Dr. Smith",
        location: "Front Desk",
        metadata: {
          patientVerified: true,
          barcodeMatched: true
        }
      },
      {
        id: `timeline-${sample.id}-2`,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        event: "Patient Identity Verification",
        description: "4-point verification completed: Name, UHID, DOB, Photo",
        status: "success" as const,
        user: "Dr. Sarah Johnson",
        location: "Phlebotomy Room A",
        metadata: {
          patientVerified: true,
          qcPassed: true
        }
      },
      {
        id: `timeline-${sample.id}-3`,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        event: "Barcode Scan Verification",
        description: "Specimen barcode scanned and matched with order",
        status: "success" as const,
        user: "Lab Tech Michael Chen",
        location: "Sample Receiving",
        metadata: {
          barcodeMatched: true,
          sampleIntegrity: true
        }
      },
      {
        id: `timeline-${sample.id}-4`,
        timestamp: new Date(Date.now() - 900000).toISOString(),
        event: "Sample Collection",
        description: "Sample collected with proper container and labeling",
        status: "success" as const,
        user: "Phlebotomist Emma Davis",
        location: "Collection Desk 2",
        metadata: {
          sampleIntegrity: true,
          qcPassed: true
        }
      }
    ];
  };

  const generateVerificationChecks = (sample: Sample) => {
    return [
      {
        id: `verify-${sample.id}-1`,
        name: "Patient Name Verification",
        status: "verified" as const,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        verifiedBy: "Dr. Sarah Johnson",
        notes: "Name matched perfectly with patient ID card"
      },
      {
        id: `verify-${sample.id}-2`,
        name: "UHID Verification",
        status: "verified" as const,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        verifiedBy: "Dr. Sarah Johnson",
        notes: "UHID scanned and validated successfully"
      },
      {
        id: `verify-${sample.id}-3`,
        name: "Date of Birth Verification",
        status: "verified" as const,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        verifiedBy: "Dr. Sarah Johnson",
        notes: "DOB confirmed from hospital records"
      },
      {
        id: `verify-${sample.id}-4`,
        name: "Photo Verification",
        status: "verified" as const,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        verifiedBy: "Dr. Sarah Johnson",
        notes: "Photo matched with patient appearance"
      },
      {
        id: `verify-${sample.id}-5`,
        name: "Barcode Scan Verification",
        status: "verified" as const,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        verifiedBy: "Lab Tech Michael Chen",
        notes: "Barcode scanned successfully and matched"
      },
      {
        id: `verify-${sample.id}-6`,
        name: "Sample Integrity Check",
        status: "verified" as const,
        timestamp: new Date(Date.now() - 900000).toISOString(),
        verifiedBy: "Phlebotomist Emma Davis",
        notes: "Container intact, proper volume, no leakage"
      }
    ];
  };

  const REJECTION_REASONS = [
    "Hemolyzed Sample",
    "Insufficient Quantity",
    "Clotted Sample",
    "Wrong Container",
    "Mislabeled Tube",
    "Expired Sample",
    "Leaking Container",
    "Other"
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Samples">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 shadow-2xl shadow-indigo-950/50 sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-violet-400/30 to-purple-500/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="pointer-events-none absolute right-1/3 top-1/4 h-48 w-48 rounded-full bg-gradient-to-br from-pink-400/25 to-rose-500/25 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="pointer-events-none absolute left-1/2 bottom-1/3 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-100 shadow-xl shadow-cyan-900/40 backdrop-blur-md">
                  <FlaskConical className="h-4 w-4 text-cyan-300" /> Advanced specimen management
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-blue-100 via-cyan-100 to-emerald-100 bg-clip-text text-transparent animate-gradient">
                  Sample Management Center
                </h1>
                <p className="text-base text-slate-300 max-w-2xl">
                  Premium-grade specimen tracking with real-time chain of custody, automated verification, and AI-powered SLA monitoring.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 px-3 py-1.5 text-emerald-100 shadow-xl shadow-emerald-900/40 backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse" /> System operational
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-400/20 to-orange-400/20 px-3 py-1.5 text-amber-100 shadow-xl shadow-amber-900/40 backdrop-blur-md">
                    <Clock3 className="h-4 w-4 text-amber-300" /> SLA target {slaHours}h
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-violet-400/40 bg-gradient-to-r from-violet-400/20 to-purple-400/20 px-3 py-1.5 text-violet-100 shadow-xl shadow-violet-900/40 backdrop-blur-md">
                    <ShieldCheck className="h-4 w-4 text-violet-300" /> Verification-first workflow
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setAutoRefresh(value => !value)}
                  className={`inline-flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-bold transition-all duration-300 backdrop-blur-md ${
                    autoRefresh 
                      ? "border-emerald-400/50 bg-gradient-to-r from-emerald-400/25 to-teal-400/25 text-emerald-100 shadow-2xl shadow-emerald-950/50 hover:scale-105" 
                      : "border-white/25 bg-white/15 text-slate-200 hover:bg-white/20 hover:border-white/35 hover:scale-105"
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
                  Live queue {autoRefresh ? "on" : "off"}
                </button>
                <button
                  onClick={focusScanner}
                  className="inline-flex items-center gap-2.5 rounded-2xl border border-cyan-400/50 bg-gradient-to-r from-cyan-400/25 to-blue-400/25 px-4 py-3 text-xs font-bold text-cyan-100 shadow-2xl shadow-cyan-950/50 transition-all duration-300 hover:from-cyan-400/35 hover:to-blue-400/35 hover:scale-105 backdrop-blur-md"
                >
                  <ScanLine className="h-4 w-4" /> Scan specimen
                </button>
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-2.5 rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-xs font-bold text-slate-100 shadow-xl transition-all duration-300 hover:bg-white/20 hover:border-white/35 hover:scale-105 backdrop-blur-md"
                >
                  <Download className="h-4 w-4" /> Export CSV
                </button>
                <button
                  onClick={() => setShowOperations(value => !value)}
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-2xl shadow-indigo-950/60 transition-all duration-300 hover:from-violet-400 hover:via-purple-400 hover:to-indigo-500 hover:shadow-3xl hover:shadow-indigo-950/70 hover:scale-105"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" /> Premium operations
                </button>
              </div>
            </div>
            
            <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-white/15 pt-6 sm:grid-cols-4">
              <div className="group relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-blue-400/15 px-4 py-3 transition-all duration-300 hover:border-cyan-400/50 hover:from-cyan-400/30 hover:to-blue-400/25 hover:scale-105 hover:shadow-xl hover:shadow-cyan-900/40">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="relative text-[10px] uppercase tracking-wider text-cyan-100/90 font-semibold">Active queue</p>
                <p className="relative mt-1 text-2xl font-black text-white">{activeSamples.length}</p>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/25 to-orange-400/20 px-4 py-3 transition-all duration-300 hover:border-amber-400/60 hover:from-amber-400/35 hover:to-orange-400/30 hover:scale-105 hover:shadow-xl hover:shadow-amber-900/40">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="relative text-[10px] uppercase tracking-wider text-amber-100/90 font-semibold">SLA watch</p>
                <p className="relative mt-1 text-2xl font-black text-white">{overdueSamples.length}</p>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-400/25 to-teal-400/20 px-4 py-3 transition-all duration-300 hover:border-emerald-400/60 hover:from-emerald-400/35 hover:to-teal-400/30 hover:scale-105 hover:shadow-xl hover:shadow-emerald-900/40">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="relative text-[10px] uppercase tracking-wider text-emerald-100/90 font-semibold">Completed</p>
                <p className="relative mt-1 text-2xl font-black text-white">{metrics.completed}</p>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-rose-400/40 bg-gradient-to-br from-rose-400/25 to-pink-400/20 px-4 py-3 transition-all duration-300 hover:border-rose-400/60 hover:from-rose-400/35 hover:to-pink-400/30 hover:scale-105 hover:shadow-xl hover:shadow-rose-900/40">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="relative text-[10px] uppercase tracking-wider text-rose-100/90 font-semibold">Redraws</p>
                <p className="relative mt-1 text-2xl font-black text-white">{metrics.rejected}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Ultra Premium Metric Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <button type="button" onClick={() => setQueueView("action")} className={`group relative overflow-hidden rounded-3xl border border-amber-400/50 bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 p-6 text-left shadow-2xl shadow-amber-950/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-amber-950/70 ${queueView === "action" ? "ring-2 ring-amber-400/70 ring-offset-4 ring-offset-slate-950" : ""}`}>
              <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/30 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:from-amber-400/40 group-hover:to-orange-500/40 animate-pulse" />
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400 shadow-lg shadow-amber-500/60" />
              <div className="relative flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-amber-100 tracking-wide">Pending Collection</p>
                  <p className="text-5xl font-black tracking-tight text-white">{metrics.pending}</p>
                  <p className="text-[11px] font-semibold text-amber-200/90">{pendingSlaRisk ? `${pendingSlaRisk} beyond ${slaHours}h SLA` : "Ready for phlebotomy"}</p>
                </div>
                <div className="rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-400/30 to-orange-400/30 p-4 text-amber-100 shadow-xl backdrop-blur-md">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </button>

            <button type="button" onClick={() => setQueueView("action")} className={`group relative overflow-hidden rounded-3xl border border-indigo-400/50 bg-gradient-to-br from-indigo-950 via-blue-950 to-violet-950 p-6 text-left shadow-2xl shadow-indigo-950/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-indigo-950/70 ${queueView === "action" ? "ring-2 ring-indigo-400/70 ring-offset-4 ring-offset-slate-950" : ""}`}>
              <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:from-cyan-400/40 group-hover:to-indigo-500/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 shadow-lg shadow-indigo-500/60" />
              <div className="relative flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-indigo-100 tracking-wide">Collected & In-Transit</p>
                  <p className="text-5xl font-black tracking-tight text-white">{metrics.collected}</p>
                  <p className="text-[11px] font-semibold text-indigo-200/90">{collectedSlaRisk ? `${collectedSlaRisk} need receiving` : "Awaiting lab receipt"}</p>
                </div>
                <div className="rounded-2xl border border-indigo-300/50 bg-gradient-to-br from-cyan-400/30 to-indigo-400/30 p-4 text-cyan-100 shadow-xl backdrop-blur-md">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </button>

            <button type="button" onClick={() => setQueueView("action")} className={`group relative overflow-hidden rounded-3xl border border-emerald-400/50 bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 p-6 text-left shadow-2xl shadow-emerald-950/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-emerald-950/70 ${queueView === "action" ? "ring-2 ring-emerald-400/70 ring-offset-4 ring-offset-slate-950" : ""}`}>
              <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-500/30 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:from-emerald-400/40 group-hover:to-teal-500/40 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-lg shadow-emerald-500/60" />
              <div className="relative flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-emerald-100 tracking-wide">Received in Lab</p>
                  <p className="text-5xl font-black tracking-tight text-white">{metrics.received}</p>
                  <p className="text-[11px] font-semibold text-emerald-200/90">{receivedSlaRisk ? `${receivedSlaRisk} need processing` : "Ready for processing"}</p>
                </div>
                <div className="rounded-2xl border border-emerald-300/50 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 p-4 text-emerald-100 shadow-xl backdrop-blur-md">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </button>

            <button type="button" onClick={() => setQueueView("rejected")} className={`group relative overflow-hidden rounded-3xl border border-rose-400/50 bg-gradient-to-br from-rose-950 via-pink-950 to-red-950 p-6 text-left shadow-2xl shadow-rose-950/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-rose-950/70 ${queueView === "rejected" ? "ring-2 ring-rose-400/70 ring-offset-4 ring-offset-slate-950" : ""}`}>
              <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-rose-400/30 to-pink-500/30 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:from-rose-400/40 group-hover:to-pink-500/40 animate-pulse" style={{ animationDelay: '1.5s' }} />
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 shadow-lg shadow-rose-500/60" />
              <div className="relative flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-rose-100 tracking-wide">Rejected / Redraw Required</p>
                  <p className="text-5xl font-black tracking-tight text-white">{metrics.rejected}</p>
                  <p className="text-[11px] font-semibold text-rose-200/90">{metrics.rejected ? "Review and arrange redraw" : "No redraws pending"}</p>
                </div>
                <div className="rounded-2xl border border-rose-300/50 bg-gradient-to-br from-rose-400/30 to-pink-400/30 p-4 text-rose-100 shadow-xl backdrop-blur-md">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {showOperations && (
            <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-lg">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300"><Activity className="h-4 w-4" /> Lab operations command center</div>
                  <h2 className="text-lg font-semibold">Protect turnaround time before it becomes a delay</h2>
                  <p className="mt-1 text-sm text-slate-300">Priority queue, SLA risk, and chain-of-custody visibility in one view.</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300">SLA target
                  <select value={slaHours} onChange={(e) => setSlaHours(Number(e.target.value))} className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-white">
                    <option value={2}>2 hours</option><option value={4}>4 hours</option><option value={8}>8 hours</option><option value={24}>24 hours</option>
                  </select>
                </label>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/10 p-4"><p className="text-xs text-slate-300">SLA at risk</p><p className={`mt-1 text-2xl font-bold ${overdueSamples.length ? "text-amber-300" : "text-emerald-300"}`}>{overdueSamples.length}</p><p className="mt-1 text-xs text-slate-400">Active samples beyond {slaHours}h</p></div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4"><p className="text-xs text-slate-300">Active queue</p><p className="mt-1 text-2xl font-bold text-white">{activeSamples.length}</p><p className="mt-1 text-xs text-slate-400">{metrics.collected + metrics.received} awaiting lab movement</p></div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4"><p className="text-xs text-slate-300">Completion rate</p><p className="mt-1 text-2xl font-bold text-emerald-300">{completionRate}%</p><p className="mt-1 text-xs text-slate-400">Across the current sample set</p></div>
              </div>
              {overdueSamples.length > 0 && <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3"><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-200"><AlertTriangle className="h-4 w-4" /> SLA watchlist</div><div className="flex flex-wrap gap-2">{overdueSamples.slice(0, 5).map(sample => <button key={sample.id} onClick={() => handleViewTracking(sample)} className="rounded-lg border border-amber-300/30 bg-black/20 px-3 py-2 text-left text-xs text-amber-100 hover:bg-black/40"><span className="font-semibold">{sample.sampleNumber}</span><span className="ml-2 text-amber-200/70">{sample.test.testCode} · {sample.status}</span></button>)}</div></div>}
            </section>
          )}

          {/* Ultra Premium Barcode Scanner */}
          <div className="overflow-hidden rounded-3xl border border-cyan-400/50 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 shadow-2xl shadow-cyan-950/50">
            <div className="flex flex-col gap-4 border-b border-white/15 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-400/30 text-cyan-300 ring-1 ring-cyan-400/50 shadow-xl shadow-cyan-900/40 backdrop-blur-md">
                  <ScanLine className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-wide">Specimen barcode station</h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400/25 to-teal-400/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100 border border-emerald-400/40 shadow-xl shadow-emerald-900/40 backdrop-blur-md">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse" /> Scanner ready
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">Fast accessioning with traceable receiving and specimen lookup.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="rounded-xl border border-white/20 bg-white/15 px-3 py-1.5 font-mono text-slate-300 font-semibold backdrop-blur-sm">ENTER</span> to submit
                <span className="rounded-xl border border-white/20 bg-white/15 px-3 py-1.5 font-mono text-slate-300 font-semibold backdrop-blur-sm">USB</span> scanner supported
                <button type="button" onClick={resetScanSession} className="ml-2 rounded-xl border border-white/20 bg-white/15 px-3 py-1.5 text-slate-300 font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm">Reset session</button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 border-b border-white/15 bg-black/30 text-center">
              <div className="border-r border-white/15 px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Session scans</p>
                <p className="mt-1 text-xl font-black text-white">{scanCount}</p>
              </div>
              <div className="border-r border-white/15 px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Scan exceptions</p>
                <p className={`mt-1 text-xl font-black ${scanErrorCount ? "text-amber-300" : "text-emerald-300"}`}>{scanErrorCount}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Session started</p>
                <p className="mt-1 text-xl font-black text-white">{scanSessionStarted.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-b border-white/15 bg-gradient-to-r from-cyan-400/15 to-blue-400/15 px-6 py-3 text-[11px]">
              <span className="text-slate-400 font-semibold">Station health</span>
              <span className="inline-flex items-center gap-2 font-bold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse" /> Ready for next specimen</span>
              <span className="text-slate-500">Shortcut <kbd className="rounded-lg border border-white/25 bg-white/15 px-2 py-1 text-slate-300 font-mono backdrop-blur-sm">Ctrl K</kbd></span>
            </div>
            
            <form onSubmit={handleBarcodeScan} className="flex gap-4">
              <div className="flex-1 p-6">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-300">{scanMode === "receive" ? "Receive specimen into laboratory" : "Lookup specimen record"}</label>
                  <div className="flex rounded-2xl border border-white/20 bg-white/15 p-1 text-xs font-semibold backdrop-blur-sm">
                    <button type="button" onClick={() => { setScanMode("receive"); setScanMessage(null); }} className={`rounded-xl px-4 py-2 transition-all duration-300 ${scanMode === "receive" ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-950 font-bold shadow-xl" : "text-slate-300 hover:bg-white/20"}`}>Receive</button>
                    <button type="button" onClick={() => { setScanMode("lookup"); setScanMessage(null); }} className={`rounded-xl px-4 py-2 transition-all duration-300 ${scanMode === "lookup" ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-950 font-bold shadow-xl" : "text-slate-300 hover:bg-white/20"}`}>Lookup</button>
                  </div>
                </div>
                <div className="relative">
                  <ScanLine className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-cyan-400" />
                  <input id="specimen-barcode-input" type="text" autoFocus placeholder={scanMode === "receive" ? "Scan barcode to receive specimen..." : "Scan barcode to lookup specimen..."} value={barcodeInput} onFocus={() => setScanInputFocused(true)} onBlur={() => setScanInputFocused(false)} onChange={(e) => setBarcodeInput(e.target.value.toUpperCase())} className="w-full rounded-2xl border border-white/25 bg-gradient-to-r from-white to-slate-50 px-5 py-4 pl-12 pr-24 font-mono text-sm text-slate-900 shadow-inner outline-none ring-2 ring-cyan-400/40 placeholder:font-sans placeholder:text-slate-400 focus:ring-4 focus:ring-cyan-400/60 transition-all duration-300" disabled={scanning} />
                  {barcodeInput && <button type="button" onClick={() => { setBarcodeInput(""); setScanMessage(null); document.getElementById("specimen-barcode-input")?.focus(); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-200">Clear</button>}
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className={`font-semibold ${scanInputFocused ? "text-cyan-300" : "text-slate-500"}`}>{scanInputFocused ? "Scanner input active" : "Click here or press focus"}</span>
                  <span className={barcodeInput.length > 0 ? "font-mono text-cyan-300" : "text-slate-500"}>{barcodeInput.length > 0 ? `${barcodeInput.length} characters captured · ready to verify` : "Waiting for barcode..."}</span>
                </div>
                {scanMessage && <p className={`mt-3 flex items-center gap-2 text-xs font-bold ${scanMessage.startsWith("No sample") || scanMessage.includes("already scanned") ? "text-amber-300" : "text-emerald-300"}`}><CheckCircle2 className="h-4 w-4" /> {scanMessage}</p>}
                {scanHistory.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recent activity</span>
                      <button type="button" onClick={() => setScanHistory([])} className="text-[10px] font-semibold text-slate-400 hover:text-white transition-colors">Clear history</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scanHistory.map((scan, index) => (
                        <span key={`${scan.barcode}-${index}`} className={`rounded-xl border px-3 py-1.5 text-[11px] font-semibold ${scan.result === "Not found" ? "border-amber-400/40 bg-amber-400/15 text-amber-200" : "border-white/20 bg-white/15 text-slate-400 backdrop-blur-sm"}`}>
                          <span className="font-mono text-slate-200">{scan.barcode}</span> · {scan.result} · {scan.at}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-end p-6 pl-0">
                <div className="flex flex-col gap-3">
                  <button type="submit" disabled={scanning || !barcodeInput.trim()} className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 text-sm font-bold text-slate-950 shadow-2xl shadow-cyan-900/50 hover:from-cyan-300 hover:to-blue-400 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300">
                  {scanning && <Loader2 className="h-4 w-4 animate-spin" />}{scanning ? "Processing..." : scanMode === "receive" ? "Scan & Receive" : "Find Sample"}
                  </button>
                  <button type="button" onClick={focusScanner} className="text-[10px] font-bold text-cyan-300 hover:text-white transition-colors">Focus scanner input</button>
                </div>
              </div>
            </form>
          </div>

          {/* Ultra Premium Search and Filters */}
          <div className="rounded-3xl border border-indigo-300/60 bg-gradient-to-br from-white via-blue-50/60 to-violet-50/60 p-6 shadow-2xl shadow-indigo-200/50">
            <div className="mb-5 overflow-hidden rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-5 shadow-2xl shadow-indigo-950/50">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white"><Activity className="h-4 w-4 text-cyan-300" /> Queue view</span>
                  <p className="mt-1.5 text-[11px] text-slate-400">Switch between operational lanes without losing search or filters.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-100 shadow-xl shadow-cyan-900/40 backdrop-blur-md">{filteredSamples.length} visible in worklist</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
              {([
                ["all", "All samples", samples.length],
                ["action", "Needs action", activeSamples.length],
                ["priority", "STAT / Urgent", samples.filter(s => s.priority === "STAT" || s.priority === "URGENT").length],
                ["overdue", "SLA watch", overdueSamples.length],
                ["completed", "Completed", metrics.completed],
                ["rejected", "Redraw required", metrics.rejected],
              ] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  onClick={() => setQueueView(value)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all duration-300 hover:scale-105 ${
                    queueView === value ? queueLaneStyles[value].active : queueLaneStyles[value].idle
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${queueLaneStyles[value].icon} ${queueView === value ? "ring-2 ring-white/60 shadow-lg" : ""}`} />
                  {label} <span className={`rounded-lg px-2 py-0.5 font-semibold ${queueView === value ? "bg-white/25 text-white" : "bg-white/90 text-current"}`}>{count}</span>
                </button>
              ))}
              </div>
            </div>
            
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-indigo-300/80 bg-gradient-to-r from-white via-blue-50/80 to-violet-50/80 px-4 py-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-xl backdrop-blur-sm">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-700">Smart filters</span>
                {(searchTerm || statusFilter !== "all" || sampleTypeFilter !== "all") && (
                  <span className="rounded-full bg-gradient-to-r from-indigo-200 to-violet-200 px-3 py-1 text-[10px] font-bold text-indigo-700 border border-indigo-300">Filters active</span>
                )}
              </div>
              <span className="hidden text-[10px] font-medium text-slate-400 sm:block">Refine your operational worklist</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {/* Search */}
              <div className="rounded-2xl border border-indigo-200/80 bg-white/95 p-3 shadow-xl transition-all duration-300 hover:border-indigo-400 hover:shadow-2xl hover:scale-105 lg:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Search className="h-4 w-4 text-indigo-600" /> Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Sample ID, barcode, order, patient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-indigo-300 bg-gradient-to-r from-indigo-50 to-white px-4 py-3 pr-10 text-sm text-slate-800 shadow-inner outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-200"
                  />
                  {searchTerm && <button type="button" onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors" aria-label="Clear search"><X className="h-4 w-4" /></button>}
                </div>
              </div>

              {/* Status Filter */}
              <div className="rounded-2xl border border-violet-200/80 bg-white/95 p-3 shadow-xl transition-all duration-300 hover:border-violet-400 hover:shadow-2xl hover:scale-105">
                <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Activity className="h-4 w-4 text-violet-600" /> Sample Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full cursor-pointer appearance-none rounded-2xl border px-4 py-3 text-sm font-medium shadow-inner outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-violet-200 ${statusFilter === "all" ? "border-violet-300 bg-violet-50/80 text-slate-700 hover:border-violet-400" : "border-violet-500 bg-violet-100 text-violet-900 ring-2 ring-violet-300"}`}
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending Collection</option>
                  <option value="COLLECTED">Collected</option>
                  <option value="RECEIVED">Received</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Sample Type Filter */}
              <div className="rounded-2xl border border-emerald-200/80 bg-white/95 p-3 shadow-xl transition-all duration-300 hover:border-emerald-400 hover:shadow-2xl hover:scale-105">
                <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <FlaskConical className="h-4 w-4 text-emerald-600" /> Sample Type
                </label>
                <select
                  value={sampleTypeFilter}
                  onChange={(e) => setSampleTypeFilter(e.target.value)}
                  className={`w-full cursor-pointer appearance-none rounded-2xl border px-4 py-3 text-sm font-medium shadow-inner outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-emerald-200 ${sampleTypeFilter === "all" ? "border-emerald-300 bg-emerald-50/80 text-slate-700 hover:border-emerald-400" : "border-emerald-500 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300"}`}
                >
                  <option value="all">All Types</option>
                  <option value="BLOOD">Blood</option>
                  <option value="URINE">Urine</option>
                  <option value="SERUM">Serum</option>
                  <option value="PLASMA">Plasma</option>
                  <option value="SWAB">Swab</option>
                  <option value="TISSUE">Tissue</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Sort */}
              <div className="rounded-2xl border border-amber-200/80 bg-white/95 p-3 shadow-xl transition-all duration-300 hover:border-amber-400 hover:shadow-2xl hover:scale-105">
                <label className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <ArrowUpDown className="h-4 w-4 text-amber-600" /> Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className={`w-full cursor-pointer appearance-none rounded-2xl border px-4 py-3 text-sm font-medium shadow-inner outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-amber-200 ${sortBy === "createdAt" ? "border-amber-300 bg-amber-50/80 text-slate-700 hover:border-amber-400" : "border-amber-500 bg-amber-100 text-amber-900 ring-2 ring-amber-300"}`}
                >
                  <option value="createdAt">Date Created</option>
                  <option value="sampleNumber">Sample Number</option>
                  <option value="patient">Patient Name</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end rounded-2xl border border-rose-200/80 bg-white/95 p-3 shadow-xl transition-all duration-300 hover:border-rose-400 hover:shadow-2xl hover:scale-105">
                <button
                  onClick={resetFilters}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-50 to-orange-50 px-4 py-3 text-sm font-bold text-rose-700 transition-all duration-300 hover:border-rose-500 hover:from-rose-100 hover:to-orange-100 active:scale-[0.95]"
                >
                  <RotateCcw className="h-4 w-4" /> Reset filters
                </button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing {filteredSamples.length} of {samples.length} samples
            </p>
            {filteredSamples.length > 0 && (
              <p>
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <div className="relative overflow-hidden rounded-2xl border border-blue-300/40 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 text-white shadow-xl shadow-blue-950/20">
              <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-2xl" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200 ring-1 ring-cyan-300/30"><Printer className="h-5 w-5" /></div>
                  <div>
                    <span className="block text-sm font-bold">{selectedSamples.size} specimens selected</span>
                    <span className="text-[10px] text-slate-400">{selectedLabelCount} label-ready · {labelEligibleCount} total available · verify before print</span>
                  </div>
                  {bulkProcessing && bulkProgress.total > 0 && (
                    <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">{bulkProgress.label}: {bulkProgress.done}/{bulkProgress.total}</span>
                  )}
                </div>
                <div className="relative flex flex-wrap gap-2">
                  <button onClick={handleBulkReceive} disabled={bulkProcessing} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/30 bg-emerald-400/15 px-3 py-2 text-xs font-bold text-emerald-100 transition hover:bg-emerald-400/25 disabled:opacity-50"><PackageCheck className="h-4 w-4" /> Receive eligible</button>
                  <button onClick={handleBulkProcess} disabled={bulkProcessing} className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300/30 bg-indigo-400/20 px-3 py-2 text-xs font-bold text-indigo-100 transition hover:bg-indigo-400/30 disabled:opacity-50"><Activity className="h-4 w-4" /> Start processing</button>
                  <button
                    onClick={handleBulkPrintLabels}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-2 text-xs font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:from-cyan-300 hover:to-blue-400"
                  >
                    <Printer className="h-4 w-4" /> Print labels
                  </button>
                  <button
                    onClick={handleBulkPrintCollectionSheets}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-fuchsia-300/30 bg-fuchsia-400/15 px-3 py-2 text-xs font-bold text-fuchsia-100 transition hover:bg-fuchsia-400/25"
                  >
                    <ClipboardList className="h-4 w-4" /> Collection sheets
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSamples(new Set());
                      setShowBulkActions(false);
                    }}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {printQueue && (
            <div className="fixed bottom-5 right-5 z-40 w-80 overflow-hidden rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 text-white shadow-2xl shadow-blue-950/30">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-bold"><Printer className="h-4 w-4 text-cyan-300" /> Print queue</p>
                <button onClick={() => setPrintQueue(null)} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
              </div>
              <p className="mt-1 text-xs text-slate-400">{printQueue.type === "label" ? "Specimen labels" : "Collection sheets"} opened in separate tabs</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500 transition-all" style={{ width: `${printQueue.total ? (printQueue.done / printQueue.total) * 100 : 0}%` }} />
              </div>
              <p className="mt-2 text-right text-xs font-semibold text-cyan-200">{printQueue.done} / {printQueue.total} ready</p>
            </div>
          )}

          {/* Ultra Premium Samples Table */}
          <div className="overflow-hidden rounded-3xl border border-indigo-300/60 bg-white shadow-2xl shadow-indigo-200/50">
            <div className="relative overflow-hidden border-b border-indigo-500/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 px-6 py-5 text-white sm:px-6">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 blur-3xl animate-pulse" />
              <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-gradient-to-br from-violet-400/30 to-purple-500/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-400/30 text-cyan-300 ring-1 ring-cyan-400/50 shadow-xl shadow-cyan-900/40 backdrop-blur-md">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-wide text-white">Specimen worklist</p>
                      <p className="text-xs text-slate-400">Verification-first accessioning and turnaround control</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-3 py-2 font-bold text-slate-300 backdrop-blur-sm">{filteredSamples.length} visible</span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 px-3 py-2 font-bold text-cyan-100 shadow-xl shadow-cyan-900/40 backdrop-blur-md">{selectedSamples.size} selected</span>
                  <span className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-bold backdrop-blur-sm ${overdueSamples.length ? "border-amber-400/40 bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-100 shadow-xl shadow-amber-900/40" : "border-emerald-400/40 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 text-emerald-100 shadow-xl shadow-emerald-900/40"}`}>{overdueSamples.length} SLA watch</span>
                  <button type="button" onClick={focusScanner} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 px-3 py-2 font-bold text-cyan-100 transition-all duration-300 hover:from-cyan-400/30 hover:to-blue-400/30 hover:scale-105 shadow-xl shadow-cyan-900/40 backdrop-blur-md"><ScanLine className="h-3.5 w-3.5" /> Scan next</button>
                </div>
              </div>
              
              <div className="relative mt-5 flex flex-wrap items-center gap-4 border-t border-white/15 pt-4 text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Identity verified</span>
                <span className="inline-flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-300" /> SLA watch</span>
                <span className="inline-flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-blue-300" /> Chain logged</span>
                <span className="ml-auto inline-flex items-center gap-2 font-bold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse" /> {autoRefresh ? "Live sync enabled" : "Manual refresh mode"}</span>
              </div>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading samples...</div>
            ) : filteredSamples.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p className="text-lg font-semibold text-slate-700">No samples found</p>
                <p className="text-sm text-slate-400">Try adjusting your filters or check for new orders</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 shadow-2xl">
                    <tr>
                      <th className="border-b border-white/15 px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-300">
                        <input
                          type="checkbox"
                          checked={selectedSamples.size === currentSamples.length && currentSamples.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-white/40 bg-white/15 text-cyan-400 focus:ring-cyan-500 focus:ring-offset-0"
                        />
                      </th>
                      <th className="border-b border-white/15 border-l-2 border-l-cyan-400 px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-white cursor-pointer hover:bg-white/15 transition-colors"
                          onClick={() => handleSort("sampleNumber")}>
                        <span className="block">Sample ID {sortBy === "sampleNumber" && (sortOrder === "asc" ? "↑" : "↓")}</span>
                        <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-cyan-200">Accession + barcode</span>
                      </th>
                      <th className="border-b border-white/15 border-l-2 border-l-violet-400 px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-white cursor-pointer hover:bg-white/15 transition-colors"
                          onClick={() => handleSort("patient")}>
                        <span className="block">Patient Info {sortBy === "patient" && (sortOrder === "asc" ? "↑" : "↓")}</span>
                        <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-violet-200">Identity + contact</span>
                      </th>
                      <th className="border-b border-white/15 border-l-2 border-l-emerald-400 px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-white">
                        <span className="block">Specimen & Container</span>
                        <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-emerald-200">Integrity + priority</span>
                      </th>
                      <th className="border-b border-white/15 border-l-2 border-l-cyan-400 px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-white">
                        <span className="block">Test(s) Required</span>
                        <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-cyan-200">Code + department</span>
                      </th>
                      <th className="border-b border-white/15 border-l-2 border-l-amber-400 px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-white">
                        <span className="block">Collection Status</span>
                        <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-amber-200">Lifecycle + next step</span>
                      </th>
                      <th className="border-b border-white/15 border-l-2 border-l-orange-400 px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-white">
                        <span className="block">Collected At / By</span>
                        <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-orange-200">Age + operator</span>
                      </th>
                      <th className="border-b border-white/15 px-5 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-300">
                        <span className="block">Actions</span>
                        <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-slate-400">Workflow controls</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentSamples.map((sample) => {
                      const containerColors = getContainerColor(sample.test.sampleContainer);
                      const verification = getVerification(sample);
                      const workflowStep = getWorkflowStep(sample.status);
                      const isOverdue = overdueSamples.some(item => item.id === sample.id);
                      return (
                        <tr key={sample.id} className={`group border-b border-slate-200 transition-all duration-300 ${isOverdue ? "bg-gradient-to-r from-amber-100/90 to-orange-100/90 hover:from-amber-200 hover:to-orange-200" : "odd:bg-white even:bg-slate-50/60 hover:bg-gradient-to-r hover:from-blue-100/80 hover:to-indigo-100/80 hover:scale-[1.01]"}`}>
                          <td className="px-5 py-4">
                            <input
                              type="checkbox"
                              checked={selectedSamples.has(sample.id)}
                              onChange={() => handleSelectSample(sample.id)}
                              className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                            />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{sample.sampleNumber}</span>
                                {sample.priority === "STAT" && <span className="rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xl shadow-red-900/40">STAT</span>}
                              </div>
                              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-500 font-semibold"><ScanLine className="h-3.5 w-3.5 text-cyan-500" />{sample.barcode}</span>
                              <span className="text-[10px] text-slate-400 font-medium">Order {sample.order.orderNumber}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            <div className="space-y-1.5">
                              <p className="flex items-center gap-2 font-bold text-slate-900"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-200 to-purple-200 text-[11px] font-black text-violet-700 shadow-lg">{sample.order.patient.firstName.charAt(0)}{sample.order.patient.lastName.charAt(0)}</span><UserRound className="h-4 w-4 text-violet-500" />{sample.order.patient.firstName} {sample.order.patient.lastName}</p>
                              <p className="text-xs text-slate-500 font-medium">UHID <span className="font-mono text-slate-700 font-bold">{sample.order.patient.uhid}</span></p>
                              <p className="text-xs text-slate-500 font-medium">{sample.order.patient.age || 'N/A'} yrs · {sample.order.patient.gender}</p>
                              {sample.order.patient.phone && <p className="mt-1 text-[11px] text-slate-400 font-medium">{sample.order.patient.phone}</p>}
                              {sample.order.doctor && <p className="mt-1 truncate text-[11px] text-slate-400 font-medium">Ref: {sample.order.doctor.fullName}</p>}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1.5">
                              <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-lg ${containerColors.bg} ${containerColors.text} ${containerColors.border}`}>
                                <FlaskConical className="h-4 w-4" />{sample.test.sampleContainer}
                              </span>
                              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{sample.sampleType} specimen</span>
                              <span className="text-[10px] text-slate-400 font-medium">{sample.sampleType === "BLOOD" ? "Room temperature · invert gently" : "Follow container handling SOP"}</span>
                              {sample.priority && (
                                <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold border shadow-md ${getPriorityColor(sample.priority)}`}>
                                  {sample.priority}
                                </span>
                              )}
                              <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md ${verification.tone === "green" ? "bg-gradient-to-r from-emerald-200 to-teal-200 text-emerald-700 border border-emerald-300" : verification.tone === "red" ? "bg-gradient-to-r from-red-200 to-rose-200 text-red-700 border border-red-300" : verification.tone === "amber" ? "bg-gradient-to-r from-amber-200 to-orange-200 text-amber-700 border border-amber-300" : "bg-gradient-to-r from-blue-200 to-indigo-200 text-blue-700 border border-blue-300"}`}>
                                <ShieldCheck className="h-3.5 w-3.5" /> {verification.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            <div className="space-y-1.5">
                              <p className="font-bold text-slate-900">{sample.test.testName}</p>
                              <p className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600 font-semibold border border-slate-300"><FlaskConical className="h-3.5 w-3.5" />{sample.test.testCode}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{sample.test.processingDepartment || "Core laboratory"} · {verification.detail}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="min-w-[160px] space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black border shadow-lg ${getStatusColor(sample.status)}`}>{sample.status.replace('_', ' ')}</span>
                                <span className="text-[10px] font-bold text-slate-400">{workflowStep}/4</span>
                              </div>
                              <div className="flex gap-1.5">
                                {[0, 1, 2, 3].map(step => <span key={step} className={`h-2.5 flex-1 rounded-full shadow-md ${step <= workflowStep - 1 ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-emerald-300/60" : step === workflowStep ? "bg-gradient-to-r from-blue-400 to-indigo-400 shadow-blue-300/60" : "bg-slate-300"}`} />)}
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">{verification.detail}</p>
                              <p className={`text-[11px] font-bold ${sample.status === "REJECTED" ? "text-red-600" : sample.status === "COMPLETED" ? "text-emerald-600" : "text-blue-600"}`}>{getNextAction(sample.status)}</p>
                            </div>
                            {sample.rejectionReason && (
                              <p className="text-xs text-red-600 font-medium mt-2">Reason: {sample.rejectionReason}</p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {sample.collectedAt ? (
                              <div className="space-y-1.5">
                                <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><span className="rounded-lg bg-gradient-to-r from-orange-200 to-amber-200 p-1.5 text-orange-700 shadow-md"><Clock3 className="h-3.5 w-3.5" /></span>{formatDateTime(sample.collectedAt)}</p>
                                {sample.collectedBy && (
                                  <p className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><UserCheck className="h-3.5 w-3.5" />{sample.collectedBy.fullName}</p>
                                )}
                                <p className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1.5 text-[10px] font-bold text-emerald-700 border border-emerald-300 shadow-md"><MapPin className="h-3.5 w-3.5" />Collection logged</p>
                                <p className="text-[10px] text-slate-400 font-medium">Age in queue: {getSampleAge(sample)}</p>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-300 shadow-md"><Clock3 className="h-3.5 w-3.5" /> Awaiting collection</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handlePrintLabel(sample)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-gradient-to-r from-cyan-100 to-blue-100 px-3 py-2 text-xs font-bold text-blue-700 shadow-lg transition-all duration-300 hover:border-cyan-500 hover:from-cyan-200 hover:to-blue-200 hover:shadow-xl hover:scale-105"
                                title="Print Sample Label"
                              >
                                <Printer className="h-3.5 w-3.5 text-cyan-600" /> Label
                              </button>
                              <button
                                onClick={() => handlePrintCollectionSheet(sample)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-300 bg-gradient-to-r from-violet-100 to-purple-100 px-3 py-2 text-xs font-bold text-violet-700 shadow-lg transition-all duration-300 hover:border-violet-500 hover:from-violet-200 hover:to-purple-200 hover:shadow-xl hover:scale-105"
                                title="Print Collection Sheet"
                              >
                                Sheet
                              </button>
                              <button
                                onClick={() => handleViewTracking(sample)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-2 text-xs font-bold text-slate-700 shadow-lg transition-all duration-300 hover:border-slate-500 hover:from-slate-200 hover:to-slate-300 hover:shadow-xl hover:scale-105"
                                title="View chain of custody"
                              >
                                <History className="h-3.5 w-3.5 text-slate-600" /> Track
                              </button>
                              <button
                                onClick={() => handleViewAudit(sample)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-2 text-xs font-bold text-amber-700 shadow-lg transition-all duration-300 hover:border-amber-500 hover:from-amber-200 hover:to-orange-200 hover:shadow-xl hover:scale-105"
                                title="View premium audit trail"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" /> Audit
                              </button>
                              {sample.status === "PENDING" && (
                                <button
                                  onClick={() => handleCollectSample(sample.id)}
                                  disabled={updatingSampleId === sample.id}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-2 text-xs font-bold text-emerald-700 shadow-lg transition-all duration-300 hover:border-emerald-500 hover:from-emerald-200 hover:to-teal-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                  title="Collect Sample"
                                >
                                  Collect
                                </button>
                              )}
                              {sample.status === "COLLECTED" && (
                                <button
                                  onClick={() => handleReceiveSample(sample.id)}
                                  disabled={updatingSampleId === sample.id}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 text-xs font-bold text-blue-700 shadow-lg transition-all duration-300 hover:border-blue-500 hover:from-blue-200 hover:to-indigo-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                  title="Accept / Receive Sample"
                                >
                                  Receive
                                </button>
                              )}
                              {sample.status === "RECEIVED" && (
                                <button
                                  onClick={() => handleProcessSample(sample.id)}
                                  disabled={updatingSampleId === sample.id}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-violet-300 bg-gradient-to-r from-violet-100 to-purple-100 px-3 py-2 text-xs font-bold text-violet-700 shadow-lg transition-all duration-300 hover:border-violet-500 hover:from-violet-200 hover:to-purple-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                  title="Start Processing"
                                >
                                  Process
                                </button>
                              )}
                              {sample.status === "PROCESSING" && (
                                <button
                                  onClick={() => handleCompleteSample(sample.id)}
                                  disabled={updatingSampleId === sample.id}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-2 text-xs font-bold text-emerald-700 shadow-lg transition-all duration-300 hover:border-emerald-500 hover:from-emerald-200 hover:to-teal-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                  title="Complete Sample"
                                >
                                  Complete
                                </button>
                              )}
                              {sample.status !== "REJECTED" && sample.status !== "COMPLETED" && (
                                <button
                                  onClick={() => openRejectModal(sample.id)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-gradient-to-r from-rose-100 to-red-100 px-3 py-2 text-xs font-bold text-rose-700 shadow-lg transition-all duration-300 hover:border-rose-500 hover:from-rose-200 hover:to-red-200 hover:shadow-xl hover:scale-105"
                                  title="Reject Sample"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Premium Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition-all duration-300 hover:border-indigo-400 hover:from-indigo-100 hover:to-violet-100 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[40px] rounded-xl px-3 py-3 text-sm font-bold transition-all duration-300 ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-900/40"
                          : "border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 hover:border-indigo-400 hover:from-indigo-100 hover:to-violet-100 hover:shadow-lg"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition-all duration-300 hover:border-indigo-400 hover:from-indigo-100 hover:to-violet-100 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
        `}</style>

        {showCollectModal && collectingSample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl bg-gradient-to-br from-white to-slate-50 shadow-2xl shadow-slate-900/40 border border-slate-200">
              <div className="flex items-start justify-between border-b border-slate-200 p-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600"><UserCheck className="h-4 w-4" /> Guided collection</div>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{collectingSample.sampleNumber}</h3>
                  <p className="text-sm text-slate-500 font-medium">{collectingSample.order.patient.firstName} {collectingSample.order.patient.lastName} · {collectingSample.test.testName}</p>
                </div>
                <button onClick={() => setShowCollectModal(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-5 p-6">
                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-xs text-slate-600 border border-emerald-200">
                  <p className="font-semibold text-slate-800"><span className="text-emerald-600">Required:</span> {collectingSample.test.sampleType} · {collectingSample.test.sampleContainer}</p>
                  <p className="mt-2 font-semibold text-slate-800"><span className="text-emerald-600">Patient:</span> UHID {collectingSample.order.patient.uhid} · {collectingSample.order.patient.gender}</p>
                </div>
                {collectionError && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{collectionError}</div>}
                <label className="block text-sm font-bold text-slate-700">Specimen barcode <span className="text-rose-500">*</span>
                  <input autoFocus value={collectionBarcode} onChange={(e) => { setCollectionBarcode(e.target.value); setCollectionError(""); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleConfirmCollection(); } }} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm uppercase focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-300" placeholder="Scan or enter unique barcode" />
                  <span className="mt-1 block text-xs font-medium text-slate-400">Barcode is normalized and checked for duplicates before saving.</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-sm font-bold text-slate-700">Collection type
                    <select value={collectionType} onChange={(e) => setCollectionType(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-300"><option value="WALK_IN">Walk-in</option><option value="HOME_COLLECTION">Home collection</option></select>
                  </label>
                  <label className="text-sm font-bold text-slate-700">Priority
                    <select value={collectionPriority} onChange={(e) => setCollectionPriority(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-300"><option value="ROUTINE">Routine</option><option value="URGENT">Urgent</option><option value="STAT">STAT</option></select>
                  </label>
                </div>
                <label className="block text-sm font-bold text-slate-700">Collection location <span className="text-rose-500">*</span>
                  <input value={collectionLocation} onChange={(e) => { setCollectionLocation(e.target.value); setCollectionError(""); }} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-300" />
                </label>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setShowCollectModal(false)} disabled={updatingSampleId === collectingSample.id} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={handleConfirmCollection} disabled={!collectionBarcode.trim() || updatingSampleId === collectingSample.id} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-all duration-300">{updatingSampleId === collectingSample.id && <Loader2 className="h-4 w-4 animate-spin" />} Confirm collection</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {workflowAction && workflowSample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl bg-gradient-to-br from-white to-slate-50 shadow-2xl shadow-slate-900/40 border border-slate-200">
              <div className="flex items-start justify-between border-b border-slate-200 p-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Chain-of-custody checkpoint</div>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {workflowAction === "receive" ? "Receive specimen" : workflowAction === "process" ? "Start processing" : "Complete specimen"}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">{workflowSample.sampleNumber} · {workflowSample.order.patient.firstName} {workflowSample.order.patient.lastName}</p>
                </div>
                <button onClick={() => { setWorkflowAction(null); setWorkflowSample(null); }} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-5 p-6">
                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 p-4 text-xs text-slate-600 border border-slate-200">
                  <p className="font-semibold text-slate-800"><span className="text-blue-600">Current:</span> {workflowSample.status}</p>
                  <p className="font-semibold text-slate-800"><span className="text-blue-600">Priority:</span> {workflowSample.priority || "ROUTINE"}</p>
                  <p className="font-semibold text-slate-800"><span className="text-blue-600">Barcode:</span> {workflowSample.barcode}</p>
                  <p className="font-semibold text-slate-800"><span className="text-blue-600">Test:</span> {workflowSample.test.testCode}</p>
                </div>
                {workflowAction === "receive" && (
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-900">Specimen integrity checklist</p>
                    {([
                      ["label", "Patient label matches order"],
                      ["container", "Container is sealed and not leaking"],
                      ["volume", "Sample volume is sufficient"],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="mb-3 flex items-center gap-3 text-xs text-blue-900 last:mb-0">
                        <input type="checkbox" checked={integrityChecks[key]} onChange={(e) => setIntegrityChecks(previous => ({ ...previous, [key]: e.target.checked }))} className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" />
                        <span className="font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                )}
                <label className="block text-sm font-bold text-slate-700">Physical location
                  <select value={workflowLocation} onChange={(e) => setWorkflowLocation(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                    <option>Laboratory Reception</option>
                    <option>Phlebotomy Room</option>
                    <option>Cold Storage 2-8°C</option>
                    <option>Laboratory Processing Area</option>
                    <option>Analyzer Bay 01</option>
                    <option>Report Validation Desk</option>
                  </select>
                </label>
                <label className="block text-sm font-bold text-slate-700">Operator note
                  <textarea value={workflowNotes} onChange={(e) => setWorkflowNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300" placeholder="Record integrity, handoff, or processing note..." />
                </label>
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-xs text-amber-800">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span className="font-medium">This action will be added to the permanent chain-of-custody audit trail.</span>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => { setWorkflowAction(null); setWorkflowSample(null); }} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button onClick={handleConfirmWorkflowAction} disabled={updatingSampleId === workflowSample.id || !workflowLocation.trim() || (workflowAction === "receive" && !Object.values(integrityChecks).every(Boolean))} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/30 hover:from-blue-400 hover:to-indigo-500 disabled:opacity-50 transition-all duration-300">
                    {updatingSampleId === workflowSample.id && <Loader2 className="h-4 w-4 animate-spin" />} Confirm {workflowAction}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premium Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-white to-slate-50 shadow-2xl shadow-slate-900/40 border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-900/30">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Reject Sample</h3>
              </div>
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                Rejection stops the current workflow and marks the specimen for redraw. This action is added to the audit trail.
              </div>
              {rejectionError && <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{rejectionError}</div>}
              
              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Rejection Reason
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => { setRejectionReason(e.target.value); setRejectionError(""); }}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all duration-300"
                >
                  <option value="">Select a reason...</option>
                  {REJECTION_REASONS.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              {rejectionReason === "Other" && (
                <div className="mb-5">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Specify Reason
                  </label>
                  <textarea
                    value={customRejectionReason}
                    onChange={(e) => { setCustomRejectionReason(e.target.value); setRejectionError(""); }}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all duration-300"
                    rows={3}
                    placeholder="Enter the rejection reason..."
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingSampleId(null);
                    setRejectionReason("");
                    setCustomRejectionReason("");
                    setRejectionError("");
                  }}
                  disabled={rejecting}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSample}
                  disabled={rejecting || !rejectionReason.trim() || (rejectionReason === "Other" && !customRejectionReason.trim())}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-900/30 hover:from-rose-400 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {rejecting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {rejecting ? "Rejecting..." : "Reject Sample"}
                </button>
              </div>
            </div>
          </div>
        )}

        {trackingSample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 shadow-2xl shadow-slate-900/40 border border-slate-200">
              <div className="flex items-start justify-between border-b border-slate-200 p-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                    <ClipboardList className="h-4 w-4" /> Chain of custody
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{trackingSample.sampleNumber}</h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {trackingSample.order.patient.firstName} {trackingSample.order.patient.lastName} · {trackingSample.test.testName}
                  </p>
                </div>
                <button onClick={() => setTrackingSample(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors" aria-label="Close tracking history">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {trackingLoading ? (
                  <div className="py-12 text-center text-sm text-slate-500 font-medium">Loading audit history...</div>
                ) : trackingEvents.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center">
                    <History className="mx-auto h-10 w-10 text-slate-400" />
                    <p className="mt-3 text-sm font-bold text-slate-700">No tracking events available</p>
                    <p className="mt-1 text-xs text-slate-500">Events will appear here as the specimen moves through the lab.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {trackingEvents.map((event, index) => (
                      <div key={event.id || index} className="relative flex gap-4">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 shadow-md">
                          <History className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 border-b border-slate-100 pb-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-900">{event.eventType || event.status || "Sample updated"}</p>
                            <time className="text-xs text-slate-500 font-medium">{formatDateTime(event.performedAt || event.createdAt)}</time>
                          </div>
                          <p className="mt-1.5 text-xs text-slate-600 font-medium">{event.location || "Laboratory workflow"}{event.notes ? ` · ${event.notes}` : ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Print Preview Modal */}
        {showPrintPreview && previewSample && (
          <PrintPreviewModal
            isOpen={showPrintPreview}
            onClose={() => setShowPrintPreview(false)}
            onConfirm={handleConfirmPrint}
            title={printPreviewType === "label" ? "Sample Label Preview" : "Collection Sheet Preview"}
            previewContent={
              printPreviewType === "label" ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-900 bg-white p-3 text-slate-950 shadow-inner" style={{ width: '400px', minHeight: '200px' }}>
                  <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-950">LabCore Diagnostics</div>
                      <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-slate-500">Specimen identification label</div>
                    </div>
                    <span className={`rounded-md px-1.5 py-1 text-[8px] font-black uppercase ${previewSample.priority === "STAT" || previewSample.priority === "URGENT" ? "bg-rose-600 text-white" : "bg-slate-900 text-white"}`}>{previewSample.priority || "Routine"}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-[1.2fr_1fr] gap-2">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Patient</p>
                      <p className="truncate text-[12px] font-black">{previewSample.order.patient.firstName} {previewSample.order.patient.lastName}</p>
                      <p className="mt-0.5 text-[9px] font-semibold text-slate-600">UHID {previewSample.order.patient.uhid}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Accession</p>
                      <p className="font-mono text-[11px] font-black">{previewSample.sampleNumber}</p>
                      <p className="mt-0.5 text-[9px] font-semibold text-slate-600">{previewSample.sampleType} / {previewSample.test.sampleContainer}</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md bg-slate-100 px-2 py-1">
                    <p className="truncate text-[9px] font-bold text-slate-800">{previewSample.test.testName}</p>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1">
                      <p className="text-[7px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                      <p className="mt-0.5 truncate text-[8px] font-black text-emerald-700">{previewSample.status.replace("_", " ")}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1">
                      <p className="text-[7px] font-bold uppercase tracking-wider text-slate-400">Collected</p>
                      <p className="mt-0.5 truncate text-[8px] font-black text-slate-700">{previewSample.collectedAt ? formatDateTime(previewSample.collectedAt).split(",")[0] : "Pending"}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1">
                      <p className="text-[7px] font-bold uppercase tracking-wider text-slate-400">Profile</p>
                      <p className="mt-0.5 truncate text-[8px] font-black text-slate-700">AUTO-ID</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1.5">
                    <div>
                      <p className="text-[7px] font-bold uppercase tracking-wider text-cyan-700">Handling protocol</p>
                      <p className="mt-0.5 text-[8px] font-black text-cyan-950">{previewSample.sampleType === "BLOOD" ? "Invert gently - do not freeze" : "Store per test protocol"}</p>
                    </div>
                    <span className="rounded bg-cyan-600 px-1.5 py-1 text-[7px] font-black uppercase text-white">{previewSample.test.sampleContainer || "Standard"}</span>
                  </div>
                  <div className="mt-2 rounded-md border border-slate-300 bg-white p-1.5">
                    <div className="mb-1 flex items-center justify-between text-[6px] font-black uppercase tracking-[0.14em] text-slate-500"><span>Specimen identity barcode</span><span className="text-emerald-700">SCAN-READY</span></div>
                    <div className="flex items-stretch gap-px overflow-hidden rounded-sm bg-white px-1">
                      {[2,1,3,1,1,2,1,3,2,1,2,1,3,1,2,1,1,3,2,1,2,3,1,1,2,1,3,2,1,2,1,3].map((width, index) => <span key={index} className="bg-slate-950" style={{ width: `${width}px`, height: "28px" }} />)}
                    </div>
                    <div className="mt-1 flex items-center justify-between font-mono text-[8px] font-bold tracking-wider"><span>{previewSample.barcode}</span><span className="font-sans text-[6px] uppercase tracking-wider text-slate-500">Code 128 · 300 DPI</span></div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[8px] font-semibold text-slate-400"><span>Verify patient + barcode before handoff</span><span className="rounded bg-emerald-100 px-1.5 py-0.5 font-black text-emerald-700">QC PASS</span></div>
                  <div className="ml-2 mt-1 flex justify-between border-t border-dashed border-slate-200 pt-1 text-[7px] font-bold uppercase tracking-wider text-slate-400"><span>LabCore secure accession</span><span>Print ID {previewSample.id.slice(-6).toUpperCase()}</span></div>
                </div>
              ) : (
                <div className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-950 shadow-inner">
                  <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.14em]">LabCore Diagnostic Center</p>
                      <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-blue-700">Specimen collection manifest</p>
                    </div>
                    <span className="rounded-md bg-slate-900 px-2 py-1 text-[8px] font-black text-white">A4 / CLINICAL</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-[9px]">
                    <div className="rounded-lg border border-violet-100 bg-violet-50 p-2"><div className="flex items-center justify-between"><p className="font-bold uppercase tracking-wider text-violet-600">Patient identity</p><span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[7px] font-black text-emerald-700">MATCH REQUIRED</span></div><p className="mt-1 text-[11px] font-black">{previewSample.order.patient.firstName} {previewSample.order.patient.lastName}</p><p className="mt-0.5 text-slate-600">UHID {previewSample.order.patient.uhid}</p><p className="mt-1 text-[8px] font-bold text-violet-700">Verify name + UHID before collection</p></div>
                    <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-2"><p className="font-bold uppercase tracking-wider text-cyan-700">Order</p><p className="mt-1 font-mono text-[10px] font-black">{previewSample.order.orderNumber}</p><p className="mt-0.5 text-slate-600">Sample {previewSample.sampleNumber}</p></div>
                  </div>
                  <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-2">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-700">Collection assignment</p>
                    <p className="mt-1 text-[10px] font-black">{previewSample.test.testName}</p>
                    <p className="mt-0.5 text-[9px] text-slate-600">{previewSample.sampleType} · {previewSample.test.sampleContainer} · {previewSample.priority || "ROUTINE"}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-[8px]">
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 font-semibold">Collector: __________</span><span className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 font-semibold">Time: __________</span><span className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 font-semibold">QC: __________</span>
                  </div>
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900 p-2 text-white">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider"><span>Barcode identity</span><span className="text-emerald-300">SCAN-READY</span></div>
                    <div className="mt-2 flex h-7 items-stretch gap-px overflow-hidden rounded bg-white px-1">{[2,1,3,1,2,1,3,2,1,2,3,1,1,2,1,3,2,1,2,1,3].map((width, index) => <span key={index} className="bg-slate-950" style={{ width: `${width}px` }} />)}</div>
                    <div className="mt-1 flex items-center justify-between font-mono text-[8px]"><span>{previewSample.barcode}</span><span className="text-slate-300">Code 128</span></div>
                    <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[7px] font-bold uppercase tracking-wider text-slate-400"><span>Quiet zone protected</span><span className="text-emerald-300">Unique specimen ID</span></div>
                  </div>
                  <div className="mt-3 border-t border-dashed border-slate-300 pt-2 text-[8px] text-slate-500">Verify patient identity, tube/container and barcode before collection.</div>
                </div>
              )
            }
            printType={printPreviewType}
          />
        )}

        {/* Premium Audit Modal */}
        {showAuditModal && auditSample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-400 flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                      Premium Audit Trail
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        {auditSample.sampleNumber}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Advanced specimen audit with patient identity verification
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAuditModal(false)}
                  className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* View Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
                  <button
                    onClick={() => setAuditView("timeline")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                      auditView === "timeline"
                        ? "bg-violet-100 text-violet-900 border-2 border-violet-300"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Timeline
                  </button>
                  <button
                    onClick={() => setAuditView("verification")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                      auditView === "verification"
                        ? "bg-violet-100 text-violet-900 border-2 border-violet-300"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    Verification
                  </button>
                  <button
                    onClick={() => setAuditView("details")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                      auditView === "details"
                        ? "bg-violet-100 text-violet-900 border-2 border-violet-300"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    Audit Logs
                  </button>
                </div>

                {/* Content Views */}
                {auditView === "timeline" && (
                  <PremiumAuditTimeline
                    events={generateMockTimelineEvents(auditSample)}
                    title="Sample Audit Timeline"
                    showFilters={true}
                    showExport={true}
                  />
                )}

                {auditView === "verification" && (
                  <SampleAuditVerification
                    sampleId={auditSample.id}
                    sampleNumber={auditSample.sampleNumber}
                    patientName={`${auditSample.order.patient.firstName} ${auditSample.order.patient.lastName}`}
                    patientUHID={auditSample.order.patient.uhid}
                    barcode={auditSample.barcode}
                    checks={generateVerificationChecks(auditSample)}
                    onVerify={(checkId) => console.log('Verify check:', checkId)}
                    onExport={() => console.log('Export verification')}
                    onPrint={() => console.log('Print verification')}
                  />
                )}

                {auditView === "details" && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-slate-900 mb-4">Audit Log Details</h4>
                    {generateMockAuditLogs(auditSample).map((log) => (
                      <PremiumAuditCard
                        key={log.id}
                        log={log}
                        expanded={auditExpandedCards.has(log.id)}
                        onToggleExpand={handleToggleAuditCard}
                        onView={(auditLog) => console.log('View audit log:', auditLog)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    ⭐ Premium
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    Advanced Level
                  </span>
                </div>

                <button
                  onClick={() => setShowAuditModal(false)}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 rounded-xl transition-all shadow-md"
                >
                  Close Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
