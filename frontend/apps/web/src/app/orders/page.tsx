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
  FloatingBulkActionBar,
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
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Copy,
  ExternalLink,
} from "lucide-react";

interface Order {
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
  };
  doctor?: {
    id: string;
    doctorCode: string;
    fullName: string;
    specialization: string;
    clinicName?: string;
  };
  items: Array<{
    id: string;
    test: {
      id: string;
      testCode: string;
      testName: string;
      sampleType: string;
      tatHours?: number;
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

export default function OrdersPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toasts, showToast, removeToast } = useToast();
  // Stable ref for showToast to avoid stale closure in useCallback
  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; }, [showToast]);

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
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Auto-refresh states
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk action states
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

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

  // Column customization
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    orderId: true,
    patient: true,
    doctor: true,
    tests: true,
    priority: true,
    status: true,
    samples: true,
    tat: true,
    payment: true,
    date: true,
  });

  // Fetch orders from API
  // useCallback has empty deps — we use showToastRef to avoid stale closure
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
  }, [fetchOrders]);

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

  // Keyboard shortcuts: "/" to search, "N" to new order
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside input/textarea/select
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
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

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((order) => {
        const fullName = `${order.patient?.firstName || ""} ${
          order.patient?.lastName || ""
        }`.toLowerCase();
        const uhid = (order.patient?.uhid || "").toLowerCase();
        const orderNum = (order.orderNumber || "").toLowerCase();
        const barcode = (order.barcode || "").toLowerCase();
        const doctorName = (order.doctor?.fullName || "").toLowerCase();
        const phone = (order.patient?.phone || "").toLowerCase();
        const tests = (order.items || [])
          .map((i) => `${i.test?.testName} ${i.test?.testCode}`)
          .join(" ")
          .toLowerCase();

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

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((o) => o.orderStatus === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      result = result.filter((o) => o.paymentStatus === paymentFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter(
        (o) => (o.priority || "ROUTINE").toUpperCase() === priorityFilter
      );
    }

    // Date range filter
    if (dateFilter !== "all") {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === "today") {
        result = result.filter((o) => new Date(o.createdAt) >= startOfDay);
      } else if (dateFilter === "week") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter((o) => new Date(o.createdAt) >= sevenDaysAgo);
      } else if (dateFilter === "month") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        result = result.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);
      }
    }

    // Sorting
    result.sort((a, b) => {
      let comp = 0;
      switch (sortBy) {
        case "orderNumber":
          comp = (a.orderNumber || "").localeCompare(b.orderNumber || "");
          break;
        case "patient":
          comp = `${a.patient?.firstName || ""} ${a.patient?.lastName || ""}`.localeCompare(
            `${b.patient?.firstName || ""} ${b.patient?.lastName || ""}`
          );
          break;
        case "createdAt":
          comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "orderStatus":
          comp = (a.orderStatus || "").localeCompare(b.orderStatus || "");
          break;
        case "priority":
          const rank: Record<string, number> = { STAT: 3, URGENT: 2, ROUTINE: 1 };
          comp =
            (rank[(a.priority || "ROUTINE").toUpperCase()] || 0) -
            (rank[(b.priority || "ROUTINE").toUpperCase()] || 0);
          break;
        case "grandTotal":
          comp = (Number(a.grandTotal) || 0) - (Number(b.grandTotal) || 0);
          break;
        default:
          comp = 0;
      }
      return sortOrder === "asc" ? comp : -comp;
    });

    return result;
  }, [
    orders,
    searchTerm,
    statusFilter,
    paymentFilter,
    priorityFilter,
    dateFilter,
    sortBy,
    sortOrder,
  ]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    paymentFilter,
    priorityFilter,
    dateFilter,
    sortBy,
    sortOrder,
  ]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Metrics summary
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);
    const pendingSamples = orders.filter(
      (o) => o.orderStatus === "REGISTERED" && !o.sampleCollected
    ).length;
    const processingTests = orders.filter(
      (o) =>
        o.orderStatus === "PROCESSING" || o.orderStatus === "SAMPLE_COLLECTED"
    ).length;
    const completedReports = orders.filter((o) => o.orderStatus === "COMPLETED")
      .length;
    const statOrders = orders.filter(
      (o) =>
        (o.priority || "").toUpperCase() === "STAT" &&
        o.orderStatus !== "COMPLETED" &&
        o.orderStatus !== "CANCELLED"
    ).length;

    return {
      totalToday: todayOrders.length,
      pendingSamples,
      processingTests,
      completedReports,
      statOrders,
    };
  }, [orders]);

  // Reset all filters function
  const handleResetFilters = () => {
    setSearchTerm("");
    // Defensively clear the controlled input's DOM value (handles browser autofill edge cases)
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    setStatusFilter("all");
    setPaymentFilter("all");
    setPriorityFilter("all");
    setDateFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    showToast("Filters reset to default", "info");
  };

  // Inline Quick Status Update with Optimistic UI
  const handleInlineStatusChange = async (
    orderId: string,
    newStatus: OrderStatusType
  ) => {
    const previousOrders = [...orders];

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    setUpdatingOrderId(orderId);

    try {
      const res = await orderApi.update(orderId, { orderStatus: newStatus });
      if (res && (res.success || res.data)) {
        showToast(`Order status updated to ${newStatus}`, "success");
      } else {
        throw new Error(res?.message || "Failed to update status");
      }
    } catch (err: any) {
      console.error("Status update failed, rolling back:", err);
      // Rollback
      setOrders(previousOrders);
      showToast(err.message || "Failed to update status", "error");
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

  // Bulk status update
  const handleBulkStatusUpdate = async (newStatus: OrderStatusType) => {
    const ids = Array.from(selectedOrders);
    if (ids.length === 0) return;

    showToast(`Updating ${ids.length} orders to ${newStatus}...`, "info");
    try {
      await Promise.all(
        ids.map((id) => orderApi.update(id, { orderStatus: newStatus }))
      );
      showToast(`Successfully updated ${ids.length} orders`, "success");
      setSelectedOrders(new Set());
      fetchOrders(true);
    } catch (err: any) {
      showToast("Some orders could not be updated", "error");
    }
  };

  // Bulk Cancel
  const handleBulkCancel = async () => {
    const ids = Array.from(selectedOrders);
    if (
      !confirm(
        `Are you sure you want to cancel ${ids.length} selected orders? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        ids.map((id) =>
          orderApi.update(id, { orderStatus: "CANCELLED", notes: "Bulk cancelled by lab operator" })
        )
      );
      showToast(`${ids.length} orders cancelled`, "warning");
      setSelectedOrders(new Set());
      fetchOrders(true);
    } catch (err: any) {
      showToast("Failed to cancel some orders", "error");
    }
  };

  // Bulk Print Labels — opens a combined barcode sheet for all selected orders
  const handleBulkPrintLabels = () => {
    const ids = Array.from(selectedOrders);
    if (ids.length === 0) return;

    if (ids.length === 1) {
      window.open(`/orders/${ids[0]}/barcode`, "_blank");
    } else {
      // Open each barcode in its own tab (max 5 to avoid popup blocker)
      const batchIds = ids.slice(0, 5);
      batchIds.forEach((id, idx) => {
        setTimeout(() => window.open(`/orders/${id}/barcode`, "_blank"), idx * 150);
      });
      if (ids.length > 5) {
        showToast(
          `Opened first 5 of ${ids.length} barcode sheets. Select in smaller batches for remaining.`,
          "info"
        );
        return;
      }
    }
    showToast(`Opening barcode label sheets for ${ids.length} order(s)`, "info");
  };

  // CSV Export for filtered orders or selected orders
  const handleExportCSV = (exportSelectedOnly = false) => {
    const dataToExport = exportSelectedOnly
      ? filteredOrders.filter((o) => selectedOrders.has(o.id))
      : filteredOrders;

    if (dataToExport.length === 0) {
      showToast("No orders to export", "warning");
      return;
    }

    const headers = [
      "Order Number",
      "Barcode",
      "Patient UHID",
      "Patient Name",
      "Phone",
      "Referring Doctor",
      "Tests",
      "Priority",
      "Order Status",
      "Payment Status",
      "Grand Total (INR)",
      "Paid Amount (INR)",
      "Due Amount (INR)",
      "Created Date",
    ];

    const rows = dataToExport.map((o) => [
      `"${o.orderNumber || ""}"`,
      `"${o.barcode || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      `"${o.patient?.firstName || ""} ${o.patient?.lastName || ""}"`,
      `"${o.patient?.phone || ""}"`,
      `"${o.doctor?.fullName || "Unassigned"}"`,
      `"${(o.items || []).map((i) => i.test?.testName).join("; ")}"`,
      `"${o.priority || "ROUTINE"}"`,
      `"${o.orderStatus || ""}"`,
      `"${o.paymentStatus || ""}"`,
      o.grandTotal || 0,
      o.paidAmount || 0,
      o.dueAmount || 0,
      `"${new Date(o.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `labcore_orders_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${dataToExport.length} orders to CSV`, "success");
  };

  // Modal Action Handlers
  const handleAssignDoctorSubmit = async (doctorId: string) => {
    if (!activeModalOrder) return;
    await orderApi.update(activeModalOrder.id, { doctorId });
    showToast("Referring doctor assigned successfully", "success");
    fetchOrders(true);
  };

  const handleCollectSampleSubmit = async (data: { barcode?: string; notes?: string }) => {
    if (!activeModalOrder) return;
    await orderApi.collectSample(activeModalOrder.id, {
      barcode: data.barcode,
      notes: data.notes,
    });
    showToast("Sample collected and tube labeled", "success");
    fetchOrders(true);
  };

  const handleAddPaymentSubmit = async (data: {
    amount: number;
    method: string;
    remarks?: string;
  }) => {
    if (!activeModalOrder) return;
    await paymentsApi.create({
      orderId: activeModalOrder.id,
      amount: data.amount,
      method: data.method,
      remarks: data.remarks,
    });
    showToast(`Payment of ₹${data.amount} recorded`, "success");
    fetchOrders(true);
  };

  const handleCancelOrderSubmit = async (reason: string) => {
    if (!activeModalOrder) return;
    await orderApi.cancel(activeModalOrder.id, { reason });
    showToast(`Order #${activeModalOrder.orderNumber} cancelled`, "warning");
    fetchOrders(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`, "info");
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Orders">
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
          {/* Header Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Orders & Requisitions
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {orders.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time tracking of patient test requisitions, specimen collection, TAT, and billing
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Auto Refresh Toggle */}
              <button
                type="button"
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  autoRefreshEnabled
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
                title={
                  autoRefreshEnabled
                    ? "Auto-refreshing every 30s"
                    : "Enable auto-refresh for real-time dashboard"
                }
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    autoRefreshEnabled ? "bg-blue-500 animate-pulse" : "bg-slate-300"
                  }`}
                />
                <span>Auto-Refresh {autoRefreshEnabled ? `(${countdown}s)` : "Off"}</span>
              </button>

              {/* Manual Refresh Button */}
              <button
                type="button"
                onClick={() => fetchOrders(true)}
                disabled={isRefreshing}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
                title="Refresh orders list"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
                />
              </button>

              {/* Export Button */}
              <button
                type="button"
                onClick={() => handleExportCSV(false)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
                title="Export filtered records to CSV"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              {/* Phlebotomy Worklist Button */}
              <button
                type="button"
                onClick={() => setShowRunSheetModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 shadow-xs transition-colors"
                title="Print daily phlebotomy specimen collection worklist"
              >
                <FlaskConical className="h-3.5 w-3.5 text-purple-600" />
                <span>Phlebotomy Worklist</span>
              </button>

              {/* Create New Order Button */}
              <Link
                href="/orders/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>New Order</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-blue-700/80 rounded">
                  N
                </kbd>
              </Link>
            </div>
          </div>

          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            {/* Today Orders */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Total Orders Today
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {metrics.totalToday}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Pending Samples */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Pending Samples
                  </p>
                  <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                    {metrics.pendingSamples}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/60">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Processing Tests */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    In Testing / Analysis
                  </p>
                  <p className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
                    {metrics.processingTests}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60">
                  <FlaskConical className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Completed Reports */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Completed Reports
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {metrics.completedReports}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* STAT / Emergency */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Active STAT Orders
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                      {metrics.statOrders}
                    </p>
                    {metrics.statOrders > 0 && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded uppercase animate-pulse">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/60">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-end">
              {/* Search Bar */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Search Orders
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by ID, UHID, Patient, Doctor... (Press '/')"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="REGISTERED">Registered</option>
                  <option value="SAMPLE_COLLECTED">Sample Collected</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Payment
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Payments</option>
                  <option value="PAID">Paid in Full</option>
                  <option value="PARTIAL">Partially Paid</option>
                  <option value="PENDING">Payment Pending</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="STAT">STAT / Emergency</option>
                  <option value="URGENT">Urgent</option>
                  <option value="ROUTINE">Routine</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today Only</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past 30 Days</option>
                </select>
              </div>
            </div>

            {/* Filter Footer: Sort, Reset & Column Customization */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (sortBy === "createdAt") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("createdAt");
                      setSortOrder("desc");
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                    sortBy === "createdAt"
                      ? "bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Date {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (sortBy === "priority") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("priority");
                      setSortOrder("desc");
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                    sortBy === "priority"
                      ? "bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Priority {sortBy === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (sortBy === "patient") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("patient");
                      setSortOrder("asc");
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                    sortBy === "patient"
                      ? "bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Patient {sortBy === "patient" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="ml-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Reset All Filters
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium">
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>

                <ColumnCustomizationPopover
                  visibleColumns={visibleColumns}
                  onToggleColumn={(key) =>
                    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  onResetColumns={() =>
                    setVisibleColumns({
                      orderId: true,
                      patient: true,
                      doctor: true,
                      tests: true,
                      priority: true,
                      status: true,
                      samples: true,
                      tat: true,
                      payment: true,
                      date: true,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Orders Table Container */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            {loading ? (
              <OrdersTableSkeleton />
            ) : filteredOrders.length === 0 ? (
              <OrdersEmptyState
                hasFilters={
                  searchTerm !== "" ||
                  statusFilter !== "all" ||
                  paymentFilter !== "all" ||
                  priorityFilter !== "all" ||
                  dateFilter !== "all"
                }
                onResetFilters={handleResetFilters}
              />
            ) : (
              <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs sticky top-0 z-10 border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="w-10 px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedOrders.size === currentOrders.length &&
                            currentOrders.length > 0
                          }
                          onChange={handleSelectAllCurrentPage}
                          className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>

                      {visibleColumns.orderId !== false && (
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Order & Barcode
                        </th>
                      )}

                      {visibleColumns.patient !== false && (
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Patient Info
                        </th>
                      )}

                      {visibleColumns.doctor !== false && (
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Doctor
                        </th>
                      )}

                      {visibleColumns.tests !== false && (
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Tests
                        </th>
                      )}

                      {visibleColumns.priority !== false && (
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Priority
                        </th>
                      )}

                      {visibleColumns.status !== false && (
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Status
                        </th>
                      )}

                      {visibleColumns.samples !== false && (
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Specimen Milestone
                        </th>
                      )}

                      {visibleColumns.tat !== false && (
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Turnaround (TAT)
                        </th>
                      )}

                      {visibleColumns.payment !== false && (
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Payment
                        </th>
                      )}

                      {visibleColumns.date !== false && (
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Date
                        </th>
                      )}

                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {currentOrders.map((order) => {
                      const isSelected = selectedOrders.has(order.id);
                      const isStat = (order.priority || "").toUpperCase() === "STAT";

                      return (
                        <tr
                          key={order.id}
                          className={`group transition-colors ${
                            isSelected
                              ? "bg-blue-50/60 dark:bg-blue-950/20"
                              : isStat
                              ? "bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/40"
                              : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                          }`}
                          style={isStat && !isSelected ? { borderLeft: "3px solid #f43f5e" } : undefined}
                        >
                          {/* Selection Checkbox */}
                          <td className="w-10 px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOrder(order.id)}
                              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>

                          {/* Order ID & Barcode */}
                          {visibleColumns.orderId !== false && (
                            <td className="px-4 py-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <Link
                                    href={`/orders/${order.id}`}
                                    className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  >
                                    {order.orderNumber}
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyToClipboard(order.orderNumber, "Order ID")
                                    }
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 p-0.5"
                                    title="Copy Order ID"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                                <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                  <span>{order.barcode}</span>
                                </p>
                              </div>
                            </td>
                          )}

                          {/* Patient Info */}
                          {visibleColumns.patient !== false && (
                            <td className="px-4 py-3">
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {order.patient?.firstName} {order.patient?.lastName}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                  <span className="font-mono">{order.patient?.uhid}</span>
                                  <span>•</span>
                                  <span>{order.patient?.gender?.charAt(0) || "—"}</span>
                                  <span>•</span>
                                  <span>{order.patient?.phone || "No Phone"}</span>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* Referring Doctor */}
                          {visibleColumns.doctor !== false && (
                            <td className="px-4 py-3">
                              <DoctorCell
                                doctor={order.doctor}
                                onAssignDoctorClick={() => {
                                  setActiveModalOrder(order);
                                  setModalType("assignDoctor");
                                }}
                              />
                            </td>
                          )}

                          {/* Prescribed Tests */}
                          {visibleColumns.tests !== false && (
                            <td className="px-4 py-3">
                              <TestListPopover items={order.items} />
                            </td>
                          )}

                          {/* Priority */}
                          {visibleColumns.priority !== false && (
                            <td className="px-4 py-3">
                              <PriorityBadge priority={order.priority} />
                              {order.collectionType === "HOME_COLLECTION" && (
                                <span className="block mt-1 text-[10px] font-medium text-purple-600 dark:text-purple-400">
                                  Home Visit
                                </span>
                              )}
                            </td>
                          )}

                          {/* Inline Status Dropdown */}
                          {visibleColumns.status !== false && (
                            <td className="px-4 py-3">
                              <StatusBadge
                                status={order.orderStatus}
                                isUpdating={updatingOrderId === order.id}
                                interactive={true}
                                onChange={(newStatus) =>
                                  handleInlineStatusChange(order.id, newStatus)
                                }
                              />
                            </td>
                          )}

                          {/* Specimen Milestone Stepper */}
                          {visibleColumns.samples !== false && (
                            <td className="px-4 py-3">
                              <SampleStatusStepper
                                orderStatus={order.orderStatus}
                                samples={order.samples}
                                sampleCollected={order.sampleCollected}
                                onQuickCollect={() => {
                                  setActiveModalOrder(order);
                                  setModalType("collectSample");
                                }}
                              />
                            </td>
                          )}

                          {/* TAT Indicator */}
                          {visibleColumns.tat !== false && (
                            <td className="px-4 py-3">
                              <TATIndicator
                                createdAt={order.createdAt}
                                tests={order.items}
                                orderStatus={order.orderStatus}
                              />
                            </td>
                          )}

                          {/* Payment Progress Bar */}
                          {visibleColumns.payment !== false && (
                            <td className="px-4 py-3">
                              <PaymentProgressBar
                                paidAmount={order.paidAmount}
                                grandTotal={order.grandTotal}
                                paymentStatus={order.paymentStatus}
                                onAddPaymentClick={() => {
                                  setActiveModalOrder(order);
                                  setModalType("addPayment");
                                }}
                              />
                            </td>
                          )}

                          {/* Date */}
                          {visibleColumns.date !== false && (
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              <p className="font-medium text-slate-700 dark:text-slate-300">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </td>
                          )}

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Receipt Button */}
                              <a
                                href={`/orders/${order.id}/receipt`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                                title="Print Receipt / Invoice"
                              >
                                <FileText className="h-4 w-4" />
                              </a>

                              {/* Quick Barcode Button */}
                              <a
                                href={`/orders/${order.id}/barcode`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                                title="Print Tube Barcodes"
                              >
                                <Printer className="h-4 w-4" />
                              </a>

                              {/* 3-Dot Dropdown */}
                              <OrderRowQuickActions
                                order={order}
                                onView={() => router.push(`/orders/${order.id}`)}
                                onEdit={() => router.push(`/orders/${order.id}`)}
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

            {/* Pagination Controls */}
            {filteredOrders.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  <span>
                    Showing {filteredOrders.length === 0 ? 0 : startIndex + 1}–
                    {Math.min(endIndex, filteredOrders.length)} of{" "}
                    {filteredOrders.length} orders
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 focus:outline-none"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Fixed pagination windowing: prevent negative page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let startPage = 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        startPage = 1;
                      } else if (currentPage >= totalPages - 1) {
                        startPage = totalPages - 4;
                      } else {
                        startPage = currentPage - 2;
                      }
                    }
                    const pageNum = startPage + i;
                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-lg font-semibold text-xs transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-xs"
                            : "border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <span className="ml-2 text-slate-400 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        <FloatingBulkActionBar
          selectedCount={selectedOrders.size}
          onClear={() => setSelectedOrders(new Set())}
          onBulkStatus={handleBulkStatusUpdate}
          onBulkExport={() => handleExportCSV(true)}
          onBulkCancel={handleBulkCancel}
          onPrintLabels={handleBulkPrintLabels}
          onPrintRunSheet={() => setShowRunSheetModal(true)}
          onBulkNotify={() => setShowBulkNotifyModal(true)}
        />

        {/* Quick Modals */}
        <QuickAssignDoctorModal
          isOpen={modalType === "assignDoctor"}
          onClose={() => {
            setModalType(null);
            setActiveModalOrder(null);
          }}
          order={activeModalOrder}
          doctors={doctors}
          onAssigned={handleAssignDoctorSubmit}
        />

        <QuickCollectSampleModal
          isOpen={modalType === "collectSample"}
          onClose={() => {
            setModalType(null);
            setActiveModalOrder(null);
          }}
          order={activeModalOrder}
          onCollected={handleCollectSampleSubmit}
        />

        <AddPaymentModal
          isOpen={modalType === "addPayment"}
          onClose={() => {
            setModalType(null);
            setActiveModalOrder(null);
          }}
          order={activeModalOrder}
          onPaymentAdded={handleAddPaymentSubmit}
        />

        <CancelOrderModal
          isOpen={modalType === "cancelOrder"}
          onClose={() => {
            setModalType(null);
            setActiveModalOrder(null);
          }}
          order={activeModalOrder}
          onCancelled={handleCancelOrderSubmit}
        />

        <OrderCommunicationHubModal
          isOpen={modalType === "whatsApp"}
          onClose={() => {
            setModalType(null);
            setActiveModalOrder(null);
          }}
          order={activeModalOrder}
          onSuccess={({ channel, recipient }) => {
            showToast(`Notification dispatched via ${channel} to ${recipient}!`, "success");
          }}
        />

        <BulkOrderCommunicationModal
          isOpen={showBulkNotifyModal}
          onClose={() => setShowBulkNotifyModal(false)}
          orders={filteredOrders.filter((o) => selectedOrders.has(o.id))}
          onSuccess={() => {
            showToast("Bulk WhatsApp/Email dispatches queued successfully!", "success");
            setSelectedOrders(new Set());
          }}
        />

        <PhlebotomyCollectionSheetModal
          isOpen={showRunSheetModal}
          onClose={() => setShowRunSheetModal(false)}
          orders={
            selectedOrders.size > 0
              ? filteredOrders.filter((o) => selectedOrders.has(o.id))
              : filteredOrders
          }
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
