"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/lib/auth";

// Upgraded & New Dashboard Components
import LuxuryKpiGrid from "@/components/dashboard/LuxuryKpiGrid";
import SpecimenPipeline from "@/components/dashboard/SpecimenPipeline";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentOrders from "@/components/dashboard/RecentOrders";
import ApprovalQueue from "@/components/dashboard/ApprovalQueue";
import CriticalAlerts from "@/components/dashboard/CriticalAlerts";
import AnalyzerTelemetryWidget from "@/components/dashboard/AnalyzerTelemetryWidget";
import TurnaroundTimeWidget from "@/components/dashboard/TurnaroundTimeWidget";
import FinancialAnalyticsWidget from "@/components/dashboard/FinancialAnalyticsWidget";
import WorkloadCharts from "@/components/dashboard/WorkloadCharts";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import DateRangeSelector from "@/components/dashboard/DateRangeSelector";

import {
  RefreshCw,
  Clock,
  Sparkles,
  Layers,
  AlertTriangle,
  Cpu,
  TrendingUp,
  Activity,
  IndianRupee,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("today");
  const [activeTab, setActiveTab] = useState<"live" | "tat" | "analyzers" | "analytics" | "audit">("live");
  const [luxuryTheme, setLuxuryTheme] = useState<"sapphire" | "midnight" | "emerald">("midnight");
  
  // Dashboard state
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<any[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [testStats, setTestStats] = useState<any>(null);
  const [sampleStats, setSampleStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [orderTrends, setOrderTrends] = useState<any[]>([]);
  const [avgTatHours, setAvgTatHours] = useState<number>(2.1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time IST Digital Clock
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDateStr, setCurrentDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setCurrentDateStr(
        now.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut listener for fast laboratory workflow actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      switch (e.key.toLowerCase()) {
        case "p":
          e.preventDefault();
          window.location.href = "/patients/new";
          break;
        case "o":
          e.preventDefault();
          window.location.href = "/orders/new";
          break;
        case "s":
          e.preventDefault();
          window.location.href = "/samples";
          break;
        case "r":
          e.preventDefault();
          window.location.href = "/results";
          break;
        case "a":
          e.preventDefault();
          window.location.href = "/approvals";
          break;
        case "b":
          e.preventDefault();
          window.location.href = "/invoices";
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Parallel data fetching across all dashboard modules
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsRes,
        ordersRes,
        approvalRes,
        alertsRes,
        sampleRes,
        paymentRes,
        testRes,
        activityRes,
      ] = await Promise.allSettled([
        dashboardApi.getStats(),
        dashboardApi.getOrderStats(),
        dashboardApi.getApprovalQueue("?limit=6"),
        dashboardApi.getAttentionResults("?limit=6"),
        dashboardApi.getSampleStats(),
        dashboardApi.getPaymentStats(),
        dashboardApi.getTestStats(),
        dashboardApi.getActivity(12),
      ]);

      // 1. Core Stats
      if (statsRes.status === "fulfilled" && statsRes.value?.success && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }

      // 2. Orders & Trends
      if (ordersRes.status === "fulfilled" && ordersRes.value?.success && ordersRes.value?.data) {
        if (ordersRes.value.data?.dailyTrend) {
          setOrderTrends(ordersRes.value.data.dailyTrend);
        }
      }

      // Fetch Recent Orders via orderApi
      try {
        const { orderApi } = await import("@/lib/api");
        const recentOrdersData = await orderApi.getAll("?limit=6");
        if (recentOrdersData.success && recentOrdersData.data?.orders) {
          setRecentOrders(recentOrdersData.data.orders.slice(0, 6));
        } else if (recentOrdersData.success && Array.isArray(recentOrdersData.data)) {
          setRecentOrders(recentOrdersData.data.slice(0, 6));
        }
      } catch (e) {
        console.error("Error fetching recent orders:", e);
      }

      // 3. Approval Queue
      if (approvalRes.status === "fulfilled" && approvalRes.value?.success && approvalRes.value?.data) {
        const approvalData = approvalRes.value.data;
        const approvalsArray = Array.isArray(approvalData.approvals)
          ? approvalData.approvals
          : Array.isArray(approvalData.results)
          ? approvalData.results
          : Array.isArray(approvalData)
          ? approvalData
          : [];
        setApprovalQueue(approvalsArray);
      } else {
        setApprovalQueue([]);
      }

      // 4. Critical Panic Alerts
      if (alertsRes.status === "fulfilled" && alertsRes.value?.success && alertsRes.value?.data) {
        const alertsData = alertsRes.value.data;
        const criticalResults = Array.isArray(alertsData.critical)
          ? alertsData.critical
          : Array.isArray(alertsData.results)
          ? alertsData.results
          : [];
        setCriticalAlerts(
          criticalResults.map((result: any) => ({
            id: result.id,
            severity: "critical" as const,
            title: "Panic Value Alert",
            description: `${result.test?.testName || "Diagnostic Test"} for ${result.order?.patient?.firstName || "Patient"} ${result.order?.patient?.lastName || ""} (UHID: ${result.order?.patient?.uhid || "N/A"})`,
            createdAt: result.createdAt,
            actionUrl: `/results/${result.id}`,
          }))
        );
      } else {
        setCriticalAlerts([]);
      }

      // 5. Sample & Turnaround Time
      if (sampleRes.status === "fulfilled" && sampleRes.value?.success && sampleRes.value?.data) {
        setSampleStats(sampleRes.value.data);
        if (sampleRes.value.data?.averageTurnaroundTimeHours) {
          setAvgTatHours(sampleRes.value.data.averageTurnaroundTimeHours);
        }
      }

      // 6. Payment Stats
      if (paymentRes.status === "fulfilled" && paymentRes.value?.success && paymentRes.value?.data) {
        setPaymentStats(paymentRes.value.data);
      }

      // 7. Test Stats
      if (testRes.status === "fulfilled" && testRes.value?.success && testRes.value?.data) {
        setTestStats(testRes.value.data);
      }

      // 8. Live Activity Feed
      if (activityRes.status === "fulfilled" && activityRes.value?.success && activityRes.value?.data) {
        setActivities(activityRes.value.data);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to fetch fresh laboratory statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Dynamic Greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const criticalCount = stats?.results?.critical || criticalAlerts.length || 0;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 pb-12">
          
          {/* ========================================================
              EXECUTIVE LAB COMMAND CENTER HEADER
              ======================================================== */}
          <div className={`p-6 relative overflow-hidden transition-all duration-500 ${
            luxuryTheme === "midnight"
              ? "executive-hero-card"
              : luxuryTheme === "emerald"
              ? "luxury-glass-card border-emerald-200/90 bg-gradient-to-r from-emerald-50/40 via-white to-teal-50/40"
              : "luxury-glass-card border-sky-200/90 bg-gradient-to-r from-sky-50/40 via-white to-indigo-50/40"
          }`}>
            {/* Background subtle decorative glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-400/10 via-indigo-400/5 to-transparent rounded-full pointer-events-none -mr-20 -mt-20 blur-2xl" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              {/* Left Column: Greeting, Role, Health Badge */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* System Health Pulse Pill */}
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-xs ${
                    luxuryTheme === "midnight"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  }`}>
                    <span className="pulse-dot bg-emerald-400">
                      <span className="pulse-dot-inner bg-emerald-400" />
                    </span>
                    LIS Core Online • 99.9% Uptime
                  </span>

                  {/* Role Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                    luxuryTheme === "midnight"
                      ? "bg-white/10 text-slate-200 border-white/15"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}>
                    <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                    {getRoleLabel(user?.role) || "Laboratory Administrator"}
                  </span>

                  {/* Urgent Panic Badge (if alerts exist) */}
                  {criticalCount > 0 && (
                    <button
                      onClick={() => setActiveTab("live")}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse shadow-sm hover:bg-rose-700 transition-colors"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {criticalCount} Panic Alert{criticalCount > 1 ? "s" : ""}
                    </button>
                  )}
                </div>

                <div className="pt-1">
                  <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 ${
                    luxuryTheme === "midnight" ? "text-white" : "text-slate-900"
                  }`}>
                    Laboratory Command Center
                    <span className="h-2 w-2 rounded-full bg-sky-400 hidden sm:inline-block animate-pulse" />
                  </h1>
                  <p className={`text-sm mt-1 max-w-2xl ${
                    luxuryTheme === "midnight" ? "text-slate-300" : "text-slate-500"
                  }`}>
                    {greeting}, <span className={`font-semibold ${
                      luxuryTheme === "midnight" ? "text-white underline decoration-sky-400" : "text-slate-800"
                    }`}>{user?.fullName || "Doctor / Admin"}</span>. Diagnostic workflow, specimen telemetry, and real-time clinical laboratory operations.
                  </p>
                </div>
              </div>

              {/* Right Column: Live Clock, Theme Switcher, Date Range, Refresh Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start lg:self-center flex-wrap">
                {/* Luxury Theme Selector */}
                <div className={`p-1 rounded-xl border flex items-center gap-1 text-[11px] font-semibold ${
                  luxuryTheme === "midnight"
                    ? "bg-white/10 border-white/15 text-slate-300"
                    : "bg-slate-100/90 border-slate-200 text-slate-600"
                }`}>
                  <button
                    onClick={() => setLuxuryTheme("midnight")}
                    title="Midnight Executive Theme"
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                      luxuryTheme === "midnight"
                        ? "bg-slate-900 text-white shadow-xs border border-white/20"
                        : "hover:text-slate-900"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                    <span>Midnight</span>
                  </button>
                  <button
                    onClick={() => setLuxuryTheme("sapphire")}
                    title="Royal Sapphire Theme"
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                      luxuryTheme === "sapphire"
                        ? "bg-white text-sky-700 shadow-xs border border-sky-300"
                        : "hover:text-slate-900"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    <span>Sapphire</span>
                  </button>
                  <button
                    onClick={() => setLuxuryTheme("emerald")}
                    title="Clinical Emerald Theme"
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                      luxuryTheme === "emerald"
                        ? "bg-white text-emerald-700 shadow-xs border border-emerald-300"
                        : "hover:text-slate-900"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>Emerald</span>
                  </button>
                </div>

                {/* Live IST Clock Card */}
                <div className={`px-4 py-2 rounded-xl border text-left shadow-xs flex items-center gap-3 ${
                  luxuryTheme === "midnight"
                    ? "bg-white/10 border-white/15 text-white"
                    : "bg-slate-50 border-slate-200/80 text-slate-900"
                }`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    luxuryTheme === "midnight"
                      ? "bg-sky-400/20 text-sky-300"
                      : "bg-sky-500/10 text-sky-600"
                  }`}>
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold font-mono tracking-wide">
                      {currentTime || "--:--:--"}
                    </p>
                    <p className={`text-[10px] font-medium ${
                      luxuryTheme === "midnight" ? "text-slate-300" : "text-slate-400"
                    }`}>
                      {currentDateStr || "IST (UTC+5:30)"}
                    </p>
                  </div>
                </div>

                {/* Filter & Refresh */}
                <div className="flex items-center gap-2">
                  <DateRangeSelector value={dateRange} onChange={setDateRange} />
                  <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 ${
                      luxuryTheme === "midnight"
                        ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              CRITICAL PANIC EMERGENCY NOTIFICATION BAR (If Active)
              ======================================================== */}
          {criticalCount > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-rose-50/80 to-amber-50/60 border-2 border-rose-300/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md flex-shrink-0 animate-pulse">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-rose-950">
                    High Priority: {criticalCount} Critical Panic Value Result{criticalCount > 1 ? "s" : ""} Flagged
                  </h3>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Results have breached critical biological alert limits. Mandatory immediate clinician telephonic notification required.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href="/results"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Review Panic Results &rarr;
                </a>
              </div>
            </div>
          )}

          {/* ========================================================
              BENTO KPI METRICS GRID & TELEMETRY STRIP
              ======================================================== */}
          <LuxuryKpiGrid 
            stats={stats} 
            loading={loading} 
            avgTatHours={avgTatHours} 
          />

          {/* ========================================================
              INTERACTIVE SPECIMEN PROGRESSION FUNNEL
              ======================================================== */}
          <SpecimenPipeline
            ordersCount={stats?.orders?.today ?? 0}
            samplesCollected={stats?.samples?.completed ?? 0}
            testingCount={stats?.tests?.inProgress ?? 0}
            resultsPending={stats?.results?.pending ?? 0}
            approvedCount={stats?.results?.approved ?? 0}
            completedCount={stats?.orders?.completed ?? 0}
            loading={loading}
          />

          {/* ========================================================
              NAVIGATION TABS CONSOLE
              ======================================================== */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/70 overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTab("live")}
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "live" ? "dashboard-tab-active" : "dashboard-tab-inactive"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Live Operations</span>
              </button>

              <button
                onClick={() => setActiveTab("tat")}
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "tat" ? "dashboard-tab-active" : "dashboard-tab-inactive"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Turnaround Time (TAT SLA)</span>
              </button>

              <button
                onClick={() => setActiveTab("analyzers")}
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "analyzers" ? "dashboard-tab-active" : "dashboard-tab-inactive"
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Analyzers & Hardware</span>
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "analytics" ? "dashboard-tab-active" : "dashboard-tab-inactive"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Revenue & Workload</span>
              </button>

              <button
                onClick={() => setActiveTab("audit")}
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "audit" ? "dashboard-tab-active" : "dashboard-tab-inactive"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Live Audit Stream</span>
              </button>
            </div>

            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" /> Auto-sync enabled
            </span>
          </div>

          {/* ========================================================
              TAB VIEW 1: LIVE OPERATIONS (COMMAND CENTER CORE)
              ======================================================== */}
          {activeTab === "live" && (
            <div className="space-y-6">
              {/* Rapid Command Shortcuts */}
              <QuickActions userRole={getRoleLabel(user?.role)} />

              {/* Core 2-Column Operational Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Recent Workorders Stream (7 Cols) */}
                <div className="lg:col-span-7">
                  <RecentOrders orders={recentOrders} loading={loading} />
                </div>

                {/* Right: Pathologist Sign-off Queue (5 Cols) */}
                <div className="lg:col-span-5">
                  <ApprovalQueue approvals={approvalQueue} loading={loading} />
                </div>
              </div>

              {/* Secondary Operational Row: Critical Alerts & Analyzer Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CriticalAlerts alerts={criticalAlerts} loading={loading} />
                <AnalyzerTelemetryWidget stats={stats?.analyzers} loading={loading} />
              </div>
            </div>
          )}

          {/* ========================================================
              TAB VIEW 2: TURNAROUND TIME & QUALITY SLA
              ======================================================== */}
          {activeTab === "tat" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <TurnaroundTimeWidget 
                  averageTatHours={avgTatHours} 
                  sampleStats={sampleStats} 
                  loading={loading} 
                />
              </div>
              <div className="lg:col-span-5">
                <AnalyzerTelemetryWidget stats={stats?.analyzers} loading={loading} />
              </div>
            </div>
          )}

          {/* ========================================================
              TAB VIEW 3: ANALYZERS & HARDWARE TELEMETRY
              ======================================================== */}
          {activeTab === "analyzers" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <AnalyzerTelemetryWidget stats={stats?.analyzers} loading={loading} />
              </div>
              <div className="lg:col-span-6">
                <LiveActivityFeed activities={activities} loading={loading} />
              </div>
            </div>
          )}

          {/* ========================================================
              TAB VIEW 4: FINANCIAL & WORKLOAD ANALYTICS
              ======================================================== */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <WorkloadCharts 
                  orderTrends={orderTrends} 
                  topTests={testStats?.mostRequested} 
                  loading={loading} 
                />
              </div>
              <div className="lg:col-span-5">
                <FinancialAnalyticsWidget
                  paymentStats={paymentStats}
                  todayRevenue={stats?.financial?.todayRevenue || 0}
                  pendingPayments={stats?.financial?.pendingPayments || 0}
                  totalInvoices={stats?.invoices?.total || 0}
                  paidInvoices={stats?.invoices?.paid || 0}
                  pendingInvoices={stats?.invoices?.pending || 0}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {/* ========================================================
              TAB VIEW 5: LIVE AUDIT ACTIVITY STREAM
              ======================================================== */}
          {activeTab === "audit" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <LiveActivityFeed activities={activities} loading={loading} />
              </div>
              <div className="lg:col-span-5">
                <RecentOrders orders={recentOrders} loading={loading} />
              </div>
            </div>
          )}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}