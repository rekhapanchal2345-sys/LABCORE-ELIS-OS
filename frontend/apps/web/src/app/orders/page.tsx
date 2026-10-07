"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { orderApi, doctorApi, paymentsApi } from "@/lib/api";
import {
  StatusBadge,
  PriorityBadge,
  PaymentProgressBar,
  TATIndicator,
  SampleStatusStepper,
  TestListPopover,
  DoctorCell,
  OrderRowQuickActions,
  QuickAssignDoctorModal,
  QuickCollectSampleModal,
  AddPaymentModal,
  CancelOrderModal,
  PhlebotomyCollectionSheetModal,
  WhatsAppNotificationModal,
  OrderCommunicationHubModal,
  BulkOrderCommunicationModal,
  ColumnCustomizationPopover,
  OrdersTableSkeleton,
  OrdersEmptyState,
  useToast,
  ToastContainer,
  OrderStatusType,
} from "@/components/orders/orders-ui";
import NotificationDispatchModal, { NotificationPayload } from "@/components/common/NotificationDispatchModal";
import {
  OrderAnalyticsDashboard,
  OrderPipelineView,
  TATMonitorPanel,
  AdvancedFilterBar,
  type OrderAnalytics,
  type TATData,
  type PipelineData,
} from "@/components/orders/OrdersAdvancedUI";
import OrderQuickDrawer, { DrawerOrder } from "@/components/orders/OrderQuickDrawer";
import OrderPipelineKanban from "@/components/orders/OrderPipelineKanban";
import {
  Search,
  Plus,
  Filter,
  RefreshCw,
  Download,
  Printer,
  Calendar,
  Layers,
  ArrowUpDown,
  Clock,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Copy,
  ExternalLink,
  Timer,
  BarChart3,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  Flame,
  CreditCard,
  MessageCircle,
  Eye,
  ScanLine,
  UserRound,
  ShieldCheck,
  Building2,
  Activity,
  Stethoscope,
  X,
  ChevronRight,
  PackageCheck,
  Receipt,
  Phone
} from "lucide-react";

export interface Order {
  id: string;
  orderNumber: string;
  barcode: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    uhid: string;
    phone: string;
    gender: string;
    dateOfBirth?: string;
    age?: number;
    email?: string;
    address?: string;
  };
  doctor?: {
    id: string;
    doctorCode: string;
    fullName: string;
    specialization: string;
    clinicName?: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    test: {
      id: string;
      testCode: string;
      testName: string;
      sampleType: string;
      sampleContainer?: string;
      tatHours?: number;
      processingDepartment?: string;
    };
    price: number;
    finalPrice: number;
  }>;
  samples?: Array<{
    id: string;
    sampleNumber: string;
    barcode: string;
    sampleType: string;
    status: string;
    collectedAt?: string;
  }>;
  orderStatus: string;
  paymentStatus: string;
  priority?: string;
  collectionType?: string;
  createdAt: string;
  sampleCollected: boolean;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
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

export default function OrdersPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toasts, showToast, removeToast } = useToast();
  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; }, [showToast]);

  // Master Workstation Tab
  const [workstationTab, setWorkstationTab] = useState<"worklist" | "kanban" | "tat" | "analytics" | "comms">("worklist");

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [collectionTypeFilter, setCollectionTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Analytics data states
  const [analyticsData, setAnalyticsData] = useState<OrderAnalytics | null>(null);
  const [tatData, setTatData] = useState<TATData | null>(null);
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showTATMonitor, setShowTATMonitor] = useState(false);
  const [bulkOpLoading, setBulkOpLoading] = useState(false);

  // Auto-refresh states
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk action states
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  // Slide-over Drawer
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);

  // Modals
  const [activeModalOrder, setActiveModalOrder] = useState<Order | null>(null);
  const [modalType, setModalType] = useState<
    | "assignDoctor"
    | "collectSample"
    | "addPayment"
    | "cancelOrder"
    | "whatsApp"
    | null
  >(null);
  const [showRunSheetModal, setShowRunSheetModal] = useState(false);
  const [showBulkNotifyModal, setShowBulkNotifyModal] = useState(false);

  // Notification Dispatch Modal
  const [orderNotifyModalOpen, setOrderNotifyModalOpen] = useState(false);
  const [orderNotifyPayload, setOrderNotifyPayload] = useState<NotificationPayload | null>(null);

  const handleNotifyOrder = (order: Order) => {
    setOrderNotifyPayload({
      patientId: order.patient.id,
      patientName: `${order.patient.firstName} ${order.patient.lastName}`,
      phone: order.patient.phone,
      email: order.patient.email,
      uhid: order.patient.uhid,
      context: "ORDER",
      orderNumber: order.orderNumber,
      date: order.createdAt,
    });
    setOrderNotifyModalOpen(true);
  };

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const [analyticsRes, tatRes] = await Promise.all([
        orderApi.getAnalytics().catch(() => null),
        orderApi.getTATAnalytics().catch(() => null),
      ]);
      if (analyticsRes?.data) setAnalyticsData(analyticsRes.data);
      if (tatRes?.data) setTatData(tatRes.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setIsRefreshing(true);

      const [ordersRes, doctorsRes] = await Promise.all([
        orderApi.getAll(),
        doctorApi.getAll().catch(() => ({ data: [] })),
      ]);

      if (ordersRes && (ordersRes.success || ordersRes.data)) {
        const list = ordersRes.data?.orders || ordersRes.data || [];
        setOrders(Array.isArray(list) ? list : []);
      }

      if (doctorsRes && doctorsRes.data) {
        const docList = doctorsRes.data?.doctors || doctorsRes.data || [];
        setDoctors(Array.isArray(docList) ? docList : []);
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      showToastRef.current(err.message || "Failed to fetch orders", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchAnalytics();
  }, [fetchOrders, fetchAnalytics]);

  // Auto-refresh timer (30s)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchOrders(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, fetchOrders]);

  // Keyboard shortcut: "/" to search, "N" for new order
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/orders/new");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Filter and sort logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((order) => {
        const fullName = `${order.patient?.firstName || ""} ${order.patient?.lastName || ""}`.toLowerCase();
        const uhid = (order.patient?.uhid || "").toLowerCase();
        const orderNum = (order.orderNumber || "").toLowerCase();
        const barcode = (order.barcode || "").toLowerCase();
        const doctorName = (order.doctor?.fullName || "").toLowerCase();
        const phone = (order.patient?.phone || "").toLowerCase();
        const tests = (order.items || []).map((i) => `${i.test?.testName} ${i.test?.testCode}`).join(" ").toLowerCase();

        return (
          fullName.includes(term) ||
          uhid.includes(term) ||
          orderNum.includes(term) ||
          barcode.includes(term) ||
          doctorName.includes(term) ||
          phone.includes(term) ||
          tests.includes(term)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((o) => o.orderStatus === statusFilter);
    }

    if (paymentFilter !== "all") {
      result = result.filter((o) => o.paymentStatus === paymentFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((o) => (o.priority || "ROUTINE") === priorityFilter);
    }

    if (collectionTypeFilter) {
      result = result.filter((o) => o.collectionType === collectionTypeFilter);
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortBy as keyof Order] ?? "";
      let valB: any = b[sortBy as keyof Order] ?? "";

      if (sortBy === "createdAt") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortBy === "patient") {
        valA = `${a.patient?.firstName} ${a.patient?.lastName}`.toLowerCase();
        valB = `${b.patient?.firstName} ${b.patient?.lastName}`.toLowerCase();
      } else if (sortBy === "grandTotal") {
        valA = a.grandTotal || 0;
        valB = b.grandTotal || 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, searchTerm, statusFilter, paymentFilter, priorityFilter, collectionTypeFilter, sortBy, sortOrder]);

  // Metrics
  const computedMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingDraw = orders.filter((o) => !o.sampleCollected && o.orderStatus !== "CANCELLED").length;
    const statCount = orders.filter((o) => (o.priority === "STAT" || o.priority === "URGENT") && o.orderStatus !== "COMPLETED").length;
    const inAnalyzer = orders.filter((o) => o.orderStatus === "PROCESSING").length;
    const completedCount = orders.filter((o) => o.orderStatus === "COMPLETED").length;
    const totalBilled = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalCollected = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
    const totalDue = orders.reduce((sum, o) => sum + (o.dueAmount || 0), 0);

    return {
      totalOrders,
      pendingDraw,
      statCount,
      inAnalyzer,
      completedCount,
      totalBilled,
      totalCollected,
      totalDue,
    };
  }, [orders]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Workflow status progression
  const handleAdvanceStatus = async (order: Order, nextStatus: string) => {
    try {
      setUpdatingOrderId(order.id);
      if (nextStatus === "SAMPLE_COLLECTED") {
        setActiveModalOrder(order);
        setModalType("collectSample");
        return;
      }
      await orderApi.update(order.id, { orderStatus: nextStatus });
      showToast(`Order #${order.orderNumber} updated to ${nextStatus}`, "success");
      await fetchOrders(true);
      if (drawerOrder?.id === order.id) {
        setDrawerOrder((prev) => (prev ? { ...prev, orderStatus: nextStatus } : null));
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update order status", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleSelectAllCurrentPage = () => {
    if (selectedOrders.size === currentOrders.length && currentOrders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(currentOrders.map((o) => o.id)));
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    const ids = Array.from(selectedOrders);
    if (ids.length === 0) return;
    setBulkOpLoading(true);
    try {
      await orderApi.bulkUpdateStatus(ids, newStatus);
      showToast(`${ids.length} orders updated to ${newStatus}`, "success");
      setSelectedOrders(new Set());
      await fetchOrders(true);
      await fetchAnalytics();
    } catch (err: any) {
      showToast(err.message || "Bulk update failed", "error");
    } finally {
      setBulkOpLoading(false);
    }
  };

  const handleBulkPrintLabels = () => {
    const ids = Array.from(selectedOrders);
    if (ids.length === 0) return;
    const batchIds = ids.slice(0, 5);
    batchIds.forEach((id, idx) => {
      setTimeout(() => window.open(`/orders/${id}/barcode`, "_blank"), idx * 150);
    });
    showToast(`Opening barcode label sheets for ${batchIds.length} orders`, "info");
  };

  const handleExportCSV = () => {
    const headers = ["Order Number", "Barcode", "Patient UHID", "Patient Name", "Phone", "Doctor", "Tests", "Priority", "Status", "Payment", "Total", "Paid", "Due", "Created At"];
    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber || ""}"`,
      `"${o.barcode || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      `"${o.patient?.firstName || ""} ${o.patient?.lastName || ""}"`,
      `"${o.patient?.phone || ""}"`,
      `"${o.doctor?.fullName || "Self"}"`,
      `"${(o.items || []).map((i) => i.test?.testName).join("; ")}"`,
      `"${o.priority || "ROUTINE"}"`,
      `"${o.orderStatus || ""}"`,
      `"${o.paymentStatus || ""}"`,
      o.grandTotal || 0,
      o.paidAmount || 0,
      o.dueAmount || 0,
      `"${new Date(o.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LABCORE_Orders_Manifest_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Clinical Orders">
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <div className="space-y-6 pb-12">
          {/* Top Medical Center Requisitions Command Header */}
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                {/* Accreditation & Quality Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-cyan-200 backdrop-blur-md">
                    <Building2 className="h-3.5 w-3.5 text-cyan-300" /> Hospital CPOE &amp; Requisitions Workstation
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-200 backdrop-blur-md">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> NABL &amp; CAP / ISO 15189 Quality Validated
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/40 bg-indigo-400/10 px-3 py-1 text-indigo-200 backdrop-blur-md">
                    <Clock className="h-3.5 w-3.5 text-indigo-300" /> Live TAT SLA Telemetry
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-slate-100 via-cyan-100 to-indigo-100 bg-clip-text text-transparent">
                  Orders &amp; Requisitions Center
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl">
                  Centralized patient test requisition hub with automated phlebotomy dispatch, diagnostic analyzer routing, real-time SLA breach alarms, and billing ledger.
                </p>
              </div>

              {/* Action Hub */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setAutoRefreshEnabled((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition-all duration-300 backdrop-blur-md ${
                    autoRefreshEnabled
                      ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-100 shadow-xl shadow-emerald-950/50"
                      : "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${autoRefreshEnabled ? "animate-spin text-emerald-300" : ""}`} />
                  Live Sync {autoRefreshEnabled ? `(${countdown}s)` : "OFF"}
                </button>

                <button
                  onClick={() => setShowRunSheetModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-950/40 px-4 py-3 text-xs font-bold text-violet-300 hover:bg-violet-900/50 transition-all backdrop-blur-md"
                >
                  <FlaskConical className="h-4 w-4 text-violet-400" /> Phlebotomy Run-Sheet
                </button>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-xs font-bold text-slate-200 hover:border-slate-600 hover:text-white transition-all backdrop-blur-md"
                >
                  <Download className="h-4 w-4 text-cyan-400" /> Export CSV
                </button>

                <Link
                  href="/orders/new"
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/60 bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-black text-slate-950 shadow-xl shadow-cyan-950/50 hover:from-cyan-400 hover:to-blue-500 hover:scale-105 transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Clinical Requisition</span>
                  <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-cyan-300 rounded font-bold">N</kbd>
                </Link>
              </div>
            </div>

            {/* Real-Time Glass KPI Strip */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 border-t border-white/10 pt-6">
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Total Booked</span>
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <p className="mt-1 text-2xl font-black text-white">{computedMetrics.totalOrders}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Active requisitions</p>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Phlebotomy Due</span>
                <p className="mt-1 text-2xl font-black text-white">{computedMetrics.pendingDraw}</p>
                <p className="text-[10px] text-amber-200/80 mt-0.5">Awaiting sample draw</p>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">STAT / Critical</span>
                  {computedMetrics.statCount > 0 && <Flame className="h-3.5 w-3.5 text-rose-400 fill-rose-400 animate-bounce" />}
                </div>
                <p className="mt-1 text-2xl font-black text-white">{computedMetrics.statCount}</p>
                <p className="text-[10px] text-rose-200/80 mt-0.5">Emergency priorities</p>
              </div>

              <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">In-Analyzer Run</span>
                <p className="mt-1 text-2xl font-black text-white">{computedMetrics.inAnalyzer}</p>
                <p className="text-[10px] text-blue-200/80 mt-0.5">On diagnostic bays</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Revenue Billed</span>
                <p className="mt-1 text-2xl font-black text-white">₹{computedMetrics.totalBilled.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-300/80 mt-0.5">₹{computedMetrics.totalCollected.toLocaleString()} Collected</p>
              </div>

              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Balance Due</span>
                <p className={`mt-1 text-2xl font-black ${computedMetrics.totalDue > 0 ? "text-amber-300" : "text-white"}`}>
                  ₹{computedMetrics.totalDue.toLocaleString()}
                </p>
                <p className="text-[10px] text-purple-200/80 mt-0.5">Outstanding ledger</p>
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
                <span>1. Requisitions Worklist</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${workstationTab === "worklist" ? "bg-slate-950 text-white" : "bg-slate-800 text-slate-300"}`}>
                  {filteredOrders.length}
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
                <span>2. Clinical Pipeline Kanban</span>
              </button>

              <button
                onClick={() => setWorkstationTab("tat")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                  workstationTab === "tat"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-950/50 scale-105"
                    : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Timer className="h-4 w-4" />
                <span>3. TAT &amp; SLA Breach Watch</span>
                {tatData && tatData.breached > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[9px] font-bold text-white animate-pulse">
                    {tatData.breached} Breached
                  </span>
                )}
              </button>

              <button
                onClick={() => setWorkstationTab("analytics")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                  workstationTab === "analytics"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-950/50 scale-105"
                    : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>4. Financial &amp; Operational Analytics</span>
              </button>

              <button
                onClick={() => setWorkstationTab("comms")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                  workstationTab === "comms"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-950/50 scale-105"
                    : "border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50"
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span>5. Patient WhatsApp &amp; SMS Hub</span>
              </button>
            </div>
          </div>

          {/* TAB 1: MASTER REQUISITIONS WORKLIST */}
          {workstationTab === "worklist" && (
            <div className="space-y-5">
              {/* Filter Toolbar */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {([
                      ["all", "All Requisitions", orders.length],
                      ["REGISTERED", "Registered / Phlebotomy Due", computedMetrics.pendingDraw],
                      ["SAMPLE_COLLECTED", "Sample Drawn", orders.filter((o) => o.orderStatus === "SAMPLE_COLLECTED").length],
                      ["PROCESSING", "On Analyzers", computedMetrics.inAnalyzer],
                      ["COMPLETED", "Completed & Signed", computedMetrics.completedCount],
                      ["CANCELLED", "Cancelled", orders.filter((o) => o.orderStatus === "CANCELLED").length],
                    ] as const).map(([val, label, count]) => (
                      <button
                        key={val}
                        onClick={() => setStatusFilter(val)}
                        className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all ${
                          statusFilter === val
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
                    Showing {filteredOrders.length} of {orders.length} orders
                  </span>
                </div>

                {/* Filter Inputs Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="relative lg:col-span-2">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search Order #, Barcode, UHID, Patient, Phone, Doctor, Test..."
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
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-all"
                    >
                      <option value="all">All Payment Statuses</option>
                      <option value="PAID">Fully Paid</option>
                      <option value="PARTIAL">Partially Paid</option>
                      <option value="PENDING">Payment Pending</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-all"
                    >
                      <option value="all">All Priorities</option>
                      <option value="ROUTINE">Routine Requisition</option>
                      <option value="URGENT">Urgent Priority</option>
                      <option value="STAT">STAT / Emergency</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-all"
                    >
                      <option value="createdAt">Sort: Requisition Date</option>
                      <option value="patient">Sort: Patient Name</option>
                      <option value="grandTotal">Sort: Total Amount</option>
                      <option value="orderStatus">Sort: Lifecycle Stage</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bulk Operations Toolbar */}
              {selectedOrders.size > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-4 text-white shadow-2xl animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 font-black text-sm">
                      {selectedOrders.size}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Selected Orders for Batch Operations</p>
                      <p className="text-[10px] text-slate-400">Perform mass status progression, label printing, or patient dispatch</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleBulkStatusUpdate("SAMPLE_COLLECTED")}
                      disabled={bulkOpLoading}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-3.5 py-2 text-xs font-black text-white shadow-md hover:from-purple-400 hover:to-indigo-500 transition-all disabled:opacity-50"
                    >
                      <FlaskConical className="h-4 w-4" /> Batch Mark Drawn
                    </button>

                    <button
                      onClick={() => handleBulkStatusUpdate("PROCESSING")}
                      disabled={bulkOpLoading}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
                    >
                      <Activity className="h-4 w-4" /> Route to Analyzers
                    </button>

                    <button
                      onClick={handleBulkPrintLabels}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white transition-all"
                    >
                      <Printer className="h-4 w-4 text-cyan-400" /> Print Tube Barcodes
                    </button>

                    <button
                      onClick={() => setShowBulkNotifyModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition-all"
                    >
                      <MessageCircle className="h-4 w-4" /> Batch WhatsApp
                    </button>

                    <button
                      onClick={() => setSelectedOrders(new Set())}
                      className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Master Clinical Table */}
              <div className="overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-950 shadow-2xl">
                {loading ? (
                  <OrdersTableSkeleton />
                ) : filteredOrders.length === 0 ? (
                  <OrdersEmptyState hasFilters={Boolean(searchTerm || statusFilter !== "all" || paymentFilter !== "all" || priorityFilter !== "all")} onResetFilters={() => { setSearchTerm(""); setStatusFilter("all"); setPaymentFilter("all"); setPriorityFilter("all"); }} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <tr>
                          <th className="px-5 py-4 w-10">
                            <input
                              type="checkbox"
                              checked={selectedOrders.size === currentOrders.length && currentOrders.length > 0}
                              onChange={handleSelectAllCurrentPage}
                              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0"
                            />
                          </th>
                          <th className="px-5 py-4">Requisition ID</th>
                          <th className="px-5 py-4">Patient Demographics</th>
                          <th className="px-5 py-4">Referring Doctor</th>
                          <th className="px-5 py-4">Test Panels &amp; Containers</th>
                          <th className="px-5 py-4">Stage &amp; Phlebotomy</th>
                          <th className="px-5 py-4">Billing &amp; Ledger</th>
                          <th className="px-5 py-4 text-right">Workflow Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-xs text-slate-300">
                        {currentOrders.map((order) => {
                          const isStat = order.priority === "STAT" || order.priority === "URGENT";
                          const isUpdating = updatingOrderId === order.id;

                          return (
                            <tr
                              key={order.id}
                              className={`group transition-all duration-200 hover:bg-slate-900/60 ${
                                isStat ? "bg-rose-950/15" : ""
                              }`}
                            >
                              <td className="px-5 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedOrders.has(order.id)}
                                  onChange={() => handleToggleSelectOrder(order.id)}
                                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0"
                                />
                              </td>

                              {/* Requisition ID & Barcode */}
                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => setDrawerOrder(order)}
                                      className="font-mono text-xs font-black text-white hover:text-cyan-300 transition-colors"
                                    >
                                      {order.orderNumber}
                                    </button>
                                    {isStat && (
                                      <span className="rounded bg-rose-600 px-1.5 py-0.2 text-[8px] font-black uppercase text-white shadow-sm flex items-center gap-0.5">
                                        <Flame className="h-2.5 w-2.5 fill-white" /> STAT
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                                    <ScanLine className="h-3 w-3 text-cyan-400" /> {order.barcode}
                                  </p>
                                  <span className="text-[10px] text-slate-600">
                                    {new Date(order.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                  </span>
                                </div>
                              </td>

                              {/* Patient Demographics */}
                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-100 flex items-center gap-1.5">
                                    <UserRound className="h-3.5 w-3.5 text-cyan-400" />
                                    {order.patient.firstName} {order.patient.lastName}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    UHID: <span className="font-mono text-slate-300 font-bold">{order.patient.uhid}</span>
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    {order.patient.age || "—"} yrs · {order.patient.gender} · {order.patient.phone || "No phone"}
                                  </p>
                                </div>
                              </td>

                              {/* Referring Doctor */}
                              <td className="px-5 py-4">
                                <DoctorCell
                                  doctor={order.doctor}
                                  onAssignDoctorClick={() => {
                                    setActiveModalOrder(order);
                                    setModalType("assignDoctor");
                                  }}
                                />
                              </td>

                              {/* Tests & Tube Containers */}
                              <td className="px-5 py-4">
                                <div className="space-y-1.5">
                                  <TestListPopover items={order.items} />
                                  <div className="flex flex-wrap gap-1">
                                    {order.items.slice(0, 2).map((item, i) => {
                                      const tube = getContainerStyle(item.test.sampleContainer);
                                      return (
                                        <span
                                          key={i}
                                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold border"
                                          style={{
                                            borderColor: `${tube.capColor}55`,
                                            backgroundColor: `${tube.capColor}15`,
                                            color: tube.capColor,
                                          }}
                                        >
                                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tube.capColor }} />
                                          <span className="truncate max-w-[90px]">{item.test.testCode}</span>
                                        </span>
                                      );
                                    })}
                                    {order.items.length > 2 && (
                                      <span className="rounded bg-slate-800 px-1 py-0.5 text-[9px] font-mono text-slate-400 font-bold">
                                        +{order.items.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Status & Phlebotomy Stepper */}
                              <td className="px-5 py-4">
                                <div className="space-y-1.5 min-w-[130px]">
                                  <StatusBadge status={order.orderStatus as any} />
                                  <SampleStatusStepper
                                    orderStatus={order.orderStatus as any}
                                    sampleCollected={order.sampleCollected}
                                  />
                                </div>
                              </td>

                              {/* Billing & Ledger */}
                              <td className="px-5 py-4">
                                <div className="space-y-1 min-w-[110px]">
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                                    <span>₹{order.grandTotal}</span>
                                    <span className={`text-[10px] font-bold ${
                                      order.paymentStatus === "PAID" ? "text-emerald-400" :
                                      order.paymentStatus === "PARTIAL" ? "text-amber-400" : "text-rose-400"
                                    }`}>
                                      {order.paymentStatus}
                                    </span>
                                  </div>
                                  <PaymentProgressBar
                                    grandTotal={order.grandTotal}
                                    paidAmount={order.paidAmount}
                                    paymentStatus={order.paymentStatus}
                                    onAddPaymentClick={() => {
                                      setActiveModalOrder(order);
                                      setModalType("addPayment");
                                    }}
                                  />
                                </div>
                              </td>

                              {/* Workflow Actions */}
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {!order.sampleCollected && order.orderStatus !== "CANCELLED" && (
                                    <button
                                      onClick={() => {
                                        setActiveModalOrder(order);
                                        setModalType("collectSample");
                                      }}
                                      className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-2.5 py-1.5 text-[11px] font-black text-white shadow-md hover:from-purple-400 hover:to-indigo-500 transition-all flex items-center gap-1"
                                      title="Draw Sample / Phlebotomy"
                                    >
                                      <FlaskConical className="h-3 w-3" /> Draw
                                    </button>
                                  )}

                                  {order.orderStatus === "SAMPLE_COLLECTED" && (
                                    <button
                                      onClick={() => handleAdvanceStatus(order, "PROCESSING")}
                                      disabled={isUpdating}
                                      className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-2.5 py-1.5 text-[11px] font-black text-slate-950 shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all"
                                      title="Load on Analyzer"
                                    >
                                      Run Lab
                                    </button>
                                  )}

                                  {order.orderStatus === "PROCESSING" && (
                                    <button
                                      onClick={() => handleAdvanceStatus(order, "COMPLETED")}
                                      disabled={isUpdating}
                                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-2.5 py-1.5 text-[11px] font-black text-white shadow-md hover:from-emerald-400 hover:to-teal-500 transition-all"
                                      title="Sign-off & Validate"
                                    >
                                      Validate
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setDrawerOrder(order)}
                                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-slate-300 hover:text-white transition-colors"
                                    title="Inspect Order Dossier"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveModalOrder(order);
                                      setModalType("whatsApp");
                                    }}
                                    className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-2 py-1.5 text-emerald-300 hover:bg-emerald-900/50 transition-colors"
                                    title="WhatsApp Requisition Receipt"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                  </button>

                                  <OrderRowQuickActions
                                    order={order as any}
                                    onAssignDoctor={() => {
                                      setActiveModalOrder(order);
                                      setModalType("assignDoctor");
                                    }}
                                    onCollectSample={() => {
                                      setActiveModalOrder(order);
                                      setModalType("collectSample");
                                    }}
                                    onAddPayment={() => {
                                      setActiveModalOrder(order);
                                      setModalType("addPayment");
                                    }}
                                    onCancel={() => {
                                      setActiveModalOrder(order);
                                      setModalType("cancelOrder");
                                    }}
                                    onWhatsApp={() => {
                                      setActiveModalOrder(order);
                                      setModalType("whatsApp");
                                    }}
                                  />
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
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-400">
                      Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span>
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

          {/* TAB 2: CLINICAL PIPELINE KANBAN */}
          {workstationTab === "kanban" && (
            <OrderPipelineKanban
              orders={orders as any}
              onSelectOrder={(order) => setDrawerOrder(order as any)}
              onAdvanceStatus={(order, nextStatus) => handleAdvanceStatus(order as any, nextStatus)}
              onPrintBarcode={(order) => window.open(`/orders/${order.id}/barcode`, "_blank")}
              onWhatsApp={(order) => {
                setActiveModalOrder(order as any);
                setModalType("whatsApp");
              }}
              updatingOrderId={updatingOrderId}
            />
          )}

          {/* TAB 3: TAT & SLA BREACH WATCH */}
          {workstationTab === "tat" && (
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Timer className="h-5 w-5 text-cyan-400" /> Real-time Turnaround Time (TAT) Telemetry
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Continuous monitoring of requisition test delivery against NABL / CAP SLA targets.
                  </p>
                </div>
                <button
                  onClick={() => setShowTATMonitor(true)}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg"
                >
                  Open Dedicated TAT Modal
                </button>
              </div>

              {tatData ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">On-Time Requisitions</p>
                    <p className="mt-2 text-3xl font-black text-white">{tatData.active - tatData.breached}</p>
                    <p className="text-xs text-slate-400 mt-1">Within standard protocol</p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Critical TAT Alert (&gt;80%)</p>
                    <p className="mt-2 text-3xl font-black text-white">{tatData.critical}</p>
                    <p className="text-xs text-slate-400 mt-1">Approaching breach threshold</p>
                  </div>
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-400">TAT Breached Orders</p>
                    <p className="mt-2 text-3xl font-black text-white">{tatData.breached}</p>
                    <p className="text-xs text-rose-300 mt-1">Immediate escalation required</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">Loading TAT telemetry...</div>
              )}
            </div>
          )}

          {/* TAB 4: FINANCIAL & OPERATIONAL ANALYTICS */}
          {workstationTab === "analytics" && (
            <div className="space-y-6">
              <OrderAnalyticsDashboard
                analytics={analyticsData ?? {
                  overview: {
                    totalOrders: computedMetrics.totalOrders,
                    todayOrders: computedMetrics.totalOrders,
                    pendingSamples: computedMetrics.pendingDraw,
                    statOrders: computedMetrics.statCount,
                    urgentOrders: 0,
                    completedToday: computedMetrics.completedCount,
                    cancelledToday: 0,
                    tatBreachCount: tatData?.breached || 0,
                  },
                  revenue: {
                    totalBilled: computedMetrics.totalBilled,
                    totalCollected: computedMetrics.totalCollected,
                    totalPending: computedMetrics.totalDue,
                    collectionRate: computedMetrics.totalBilled ? Math.round((computedMetrics.totalCollected / computedMetrics.totalBilled) * 100) : 100,
                  },
                  statusBreakdown: [],
                  paymentBreakdown: [],
                  topTests: [],
                  topDoctors: [],
                }}
                tatData={tatData}
                loading={analyticsLoading}
                onStatClick={(filter) => {
                  if (filter === "STAT") { setPriorityFilter("STAT"); setWorkstationTab("worklist"); }
                  else if (filter === "REGISTERED") { setStatusFilter("REGISTERED"); setWorkstationTab("worklist"); }
                  else if (filter === "COMPLETED") { setStatusFilter("COMPLETED"); setWorkstationTab("worklist"); }
                }}
              />
            </div>
          )}

          {/* TAB 5: PATIENT WHATSAPP & COMMUNICATIONS */}
          {workstationTab === "comms" && (
            <div className="rounded-3xl border border-emerald-500/40 bg-slate-950 p-6 space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-emerald-400" /> Patient Multi-Channel Communication Gateway
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct automated WhatsApp &amp; SMS delivery of requisition booking confirmations, payment links, and test reports.
                  </p>
                </div>
                <button
                  onClick={() => setShowBulkNotifyModal(true)}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
                >
                  Send Bulk Broadcast Notification
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {orders.slice(0, 6).map((order) => (
                  <div key={order.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-100 text-sm">{order.patient.firstName} {order.patient.lastName}</p>
                        <p className="font-mono text-xs text-slate-400">{order.patient.phone || "No phone"}</p>
                      </div>
                      <span className="font-mono text-[10px] text-cyan-300 bg-slate-800 px-2 py-0.5 rounded">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                      <span className="text-slate-400">{order.items.length} Test Panel(s)</span>
                      <button
                        onClick={() => {
                          setActiveModalOrder(order);
                          setModalType("whatsApp");
                        }}
                        className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                      >
                        Send WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Slide-Over Quick Inspection Drawer */}
        <OrderQuickDrawer
          order={drawerOrder as any}
          isOpen={!!drawerOrder}
          onClose={() => setDrawerOrder(null)}
          onCollectSample={(o) => {
            setActiveModalOrder(o as any);
            setModalType("collectSample");
          }}
          onAddPayment={(o) => {
            setActiveModalOrder(o as any);
            setModalType("addPayment");
          }}
          onAssignDoctor={(o) => {
            setActiveModalOrder(o as any);
            setModalType("assignDoctor");
          }}
          onCancelOrder={(o) => {
            setActiveModalOrder(o as any);
            setModalType("cancelOrder");
          }}
          onWhatsApp={(o) => {
            setActiveModalOrder(o as any);
            setModalType("whatsApp");
          }}
          onPrintBarcode={(o) => window.open(`/orders/${o.id}/barcode`, "_blank")}
          onPrintInvoice={(o) => window.open(`/orders/${o.id}/invoice`, "_blank")}
        />

        {/* TAT Monitor Modal */}
        <TATMonitorPanel
          tatData={tatData}
          isOpen={showTATMonitor}
          onClose={() => setShowTATMonitor(false)}
          onOrderClick={(id) => {
            setShowTATMonitor(false);
            const found = orders.find((o) => o.id === id);
            if (found) setDrawerOrder(found);
            else router.push(`/orders/${id}`);
          }}
        />

        {/* Phlebotomy Collection Run-Sheet Modal */}
        <PhlebotomyCollectionSheetModal
          orders={filteredOrders as any}
          isOpen={showRunSheetModal}
          onClose={() => setShowRunSheetModal(false)}
        />

        {/* Bulk WhatsApp Notification Modal */}
        <BulkOrderCommunicationModal
          orders={filteredOrders.filter((o) => selectedOrders.has(o.id)) as any}
          isOpen={showBulkNotifyModal}
          onClose={() => setShowBulkNotifyModal(false)}
          onSuccess={() => {
            showToast("Bulk WhatsApp notifications dispatched", "success");
            setSelectedOrders(new Set());
          }}
        />

        {/* Assign Doctor Modal */}
        {modalType === "assignDoctor" && activeModalOrder && (
          <QuickAssignDoctorModal
            order={activeModalOrder as any}
            doctors={doctors}
            isOpen={true}
            onClose={() => { setModalType(null); setActiveModalOrder(null); }}
            onAssigned={async (doctorId: string) => {
              await orderApi.update(activeModalOrder.id, { doctorId });
              showToast("Referring doctor updated", "success");
              setModalType(null);
              setActiveModalOrder(null);
              await fetchOrders(true);
            }}
          />
        )}

        {/* Collect Sample Modal */}
        {modalType === "collectSample" && activeModalOrder && (
          <QuickCollectSampleModal
            order={activeModalOrder as any}
            isOpen={true}
            onClose={() => { setModalType(null); setActiveModalOrder(null); }}
            onCollected={async (data) => {
              await orderApi.collectSample(activeModalOrder.id, {
                barcode: data.barcode,
                notes: data.notes,
              });
              showToast("Specimen collected and tube barcode assigned", "success");
              setModalType(null);
              setActiveModalOrder(null);
              await fetchOrders(true);
            }}
          />
        )}

        {/* Add Payment Modal */}
        {modalType === "addPayment" && activeModalOrder && (
          <AddPaymentModal
            order={activeModalOrder as any}
            isOpen={true}
            onClose={() => { setModalType(null); setActiveModalOrder(null); }}
            onPaymentAdded={async (data) => {
              await paymentsApi.create({
                orderId: activeModalOrder.id,
                amount: data.amount,
                method: data.method,
                remarks: data.remarks,
              });
              showToast(`Payment of ₹${data.amount} recorded`, "success");
              setModalType(null);
              setActiveModalOrder(null);
              await fetchOrders(true);
            }}
          />
        )}

        {/* Cancel Order Modal */}
        {modalType === "cancelOrder" && activeModalOrder && (
          <CancelOrderModal
            order={activeModalOrder as any}
            isOpen={true}
            onClose={() => { setModalType(null); setActiveModalOrder(null); }}
            onCancelled={async (reason: string) => {
              await orderApi.cancel(activeModalOrder.id, { reason });
              showToast(`Order #${activeModalOrder.orderNumber} cancelled`, "warning");
              setModalType(null);
              setActiveModalOrder(null);
              await fetchOrders(true);
            }}
          />
        )}

        {/* WhatsApp Notification Modal */}
        {modalType === "whatsApp" && activeModalOrder && (
          <WhatsAppNotificationModal
            order={activeModalOrder as any}
            isOpen={true}
            onClose={() => { setModalType(null); setActiveModalOrder(null); }}
          />
        )}
        {/* Universal Notification Dispatch Modal */}
        {orderNotifyModalOpen && orderNotifyPayload && (
          <NotificationDispatchModal
            isOpen={orderNotifyModalOpen}
            onClose={() => setOrderNotifyModalOpen(false)}
            payload={orderNotifyPayload}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

