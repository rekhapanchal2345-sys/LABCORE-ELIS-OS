"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { reportApi } from "@/lib/api";
import { FileText, RefreshCw, AlertCircle, TrendingUp, ShieldCheck, Send, Clock3, AlertTriangle, Timer, CalendarCheck, Gauge } from "lucide-react";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportAnalyticsCards from "@/components/reports/ReportAnalyticsCards";
import ReportsManagementTable from "@/components/reports/ReportsManagementTable";
import LabPerformanceAnalytics from "@/components/reports/LabPerformanceAnalytics";

interface PublishedResult {
  id: string;
  status: string;
  publishedAt: string;
  createdAt?: string;
  criticalFlag?: boolean;
  test: {
    id: string;
    testName: string;
    testCode: string;
    sampleType: string;
  };
  order: {
    id: string;
    orderNumber: string;
    patient: {
      id: string;
      firstName: string;
      lastName: string;
      uhid: string;
      phone?: string;
    };
    doctor?: {
      id: string;
      fullName: string;
    } | null;
  };
  approvedBy?: {
    id: string;
    fullName: string;
    employeeCode: string;
  } | null;
  deliveryStatus: string;
  deliveryMethod: string | null;
  reportReferenceId: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<PublishedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"reports" | "analytics">("reports");
  
  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "watch">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [doctor, setDoctor] = useState("");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [deliveryChannel, setDeliveryChannel] = useState("");
  const [slaBreach, setSlaBreach] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (status) queryParams.append("status", status);
      if (dateFrom) queryParams.append("fromDate", dateFrom);
      if (dateTo) queryParams.append("toDate", dateTo);
      
      const response = await reportApi.getPublishedReports(`?${queryParams.toString()}`);
      
      if (response.success && response.data) {
        setReports(response.data.results || []);
      } else {
        setError(response.message || "Failed to fetch reports");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [status, dateFrom, dateTo]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleViewReport = (orderId: string) => {
    if (!orderId) {
      setError("This report is missing its order reference, so it cannot be opened.");
      return;
    }
    router.push(`/reports/order/${encodeURIComponent(orderId)}?action=view`);
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const doctorMatches = !doctor || report.order.doctor?.id === doctor;
      const channelText = `${report.deliveryMethod || ""} ${report.deliveryStatus || ""}`.toUpperCase();
      const channelMatches = !deliveryChannel || channelText.includes(deliveryChannel) || (deliveryChannel === "PHYSICAL" && channelText.includes("HARD_COPY"));
      const criticalMatches = !criticalOnly || Boolean((report as PublishedResult & { criticalFlag?: boolean }).criticalFlag) || report.status.toUpperCase().includes("CRITICAL") || report.status.toUpperCase().includes("PANIC");
      const tatHours = report.createdAt && report.publishedAt ? (new Date(report.publishedAt).getTime() - new Date(report.createdAt).getTime()) / 3600000 : 0;
      const slaMatches = !slaBreach || tatHours > 24;
      if (!doctorMatches || !channelMatches || !criticalMatches || !slaMatches) return false;
      const verified =
        Boolean(report.approvedBy) ||
        ["APPROVED", "PUBLISHED", "VERIFIED", "COMPLETED"].includes(report.status.toUpperCase());
      if (verificationFilter === "verified" && !verified) return false;
      if (verificationFilter === "watch" && verified) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        const patientName = `${report.order.patient.firstName} ${report.order.patient.lastName}`.toLowerCase();
        const orderNumber = report.order.orderNumber.toLowerCase();
        const testName = report.test.testName.toLowerCase();
        const reportRef = report.reportReferenceId?.toLowerCase() || "";
        
        return patientName.includes(searchLower) || 
               orderNumber.includes(searchLower) || 
               testName.includes(searchLower) ||
               reportRef.includes(searchLower);
      }
      return true;
    });
  }, [reports, search, verificationFilter, doctor, criticalOnly, deliveryChannel, slaBreach]);

  const doctors = useMemo(() => {
    const unique = new Map<string, string>();
    reports.forEach((report) => {
      if (report.order.doctor?.id) unique.set(report.order.doctor.id, report.order.doctor.fullName);
    });
    return Array.from(unique, ([id, name]) => ({ id, name }));
  }, [reports]);

  const tableReports = useMemo(
    () =>
      filteredReports.map((report) => ({
        ...report,
        orderId: report.order.id,
        testId: report.test.id,
        order: {
          ...report.order,
          doctor: report.order.doctor ?? undefined,
        },
        approvedBy: report.approvedBy ?? undefined,
      })),
    [filteredReports]
  );

  const criticalResultsPending = filteredReports.filter((report) => {
    const statusText = report.status.toUpperCase();
    return Boolean(report.criticalFlag) ||
      statusText.includes("CRITICAL") ||
      statusText.includes("PANIC") ||
      (statusText === "PENDING" && report.deliveryStatus === "UNDELIVERED");
  }).length;

  const tatHours = filteredReports
    .map((report) => {
      if (!report.createdAt || !report.publishedAt) return null;
      const hours = (new Date(report.publishedAt).getTime() - new Date(report.createdAt).getTime()) / 3600000;
      return Number.isFinite(hours) && hours >= 0 ? hours : null;
    })
    .filter((hours): hours is number => hours !== null);
  const averageTat = tatHours.length ? tatHours.reduce((sum, hours) => sum + hours, 0) / tatHours.length : null;
  // Reports published today (based on each report's publishedAt date)
  const completedToday = filteredReports.filter((report) => {
    if (!report.publishedAt) return false;
    const published = new Date(report.publishedAt);
    const now = new Date();
    return (
      published.getFullYear() === now.getFullYear() &&
      published.getMonth() === now.getMonth() &&
      published.getDate() === now.getDate()
    );
  }).length;

  // Percentage of reports delivered within the 24h SLA window
  const withinTimePct = filteredReports.length
    ? Math.round(
        (filteredReports.filter((report) => {
          if (!report.createdAt || !report.publishedAt) return true; // no timing data counts as on-time
          const hours = (new Date(report.publishedAt).getTime() - new Date(report.createdAt).getTime()) / 3600000;
          return hours >= 0 && hours <= 24;
        }).length / filteredReports.length) * 100
      )
    : null;

  return (
    <DashboardLayout title="Reports">
      <div className="min-h-screen space-y-5 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-indigo-100 bg-white/80 p-5 shadow-sm">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700"><ShieldCheck className="h-3.5 w-3.5" /> Verified reporting center</div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Reports Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              View, manage, and dispatch diagnostic reports
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 rounded-xl border border-indigo-100 bg-white p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "reports"
                ? "rounded-lg bg-indigo-600 text-white shadow-md"
                  : "rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "analytics"
                ? "rounded-lg bg-indigo-600 text-white shadow-md"
                  : "rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Performance Analytics
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle className="alert-icon" />
            <div className="alert-content">
              <div className="alert-title">Error</div>
              <div className="alert-message">{error}</div>
            </div>
          </div>
        )}

        {activeTab === "reports" ? (
          <>
            {/* Diagnostic Analytics Summary Cards */}
            <ReportAnalyticsCards />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
              {[
                { label: "Completed today", value: completedToday, icon: CalendarCheck, tone: "indigo" },
                { label: "Verified reports", value: filteredReports.filter(r => Boolean(r.approvedBy) || ["APPROVED", "PUBLISHED", "VERIFIED", "COMPLETED"].includes(r.status.toUpperCase())).length, icon: ShieldCheck, tone: "emerald" },
                { label: "Digital dispatch", value: filteredReports.filter(r => r.deliveryStatus === "WHATSAPP_DELIVERED" || r.deliveryStatus === "EMAIL_DELIVERED").length, icon: Send, tone: "cyan" },
                { label: "Delivery watch", value: filteredReports.filter(r => r.deliveryStatus === "UNDELIVERED").length, icon: Clock3, tone: "rose" },
                { label: "Critical pending", value: criticalResultsPending, icon: AlertTriangle, tone: "amber" },
                { label: "Average TAT", value: averageTat === null ? "—" : `${averageTat.toFixed(1)}h`, icon: Timer, tone: "violet" },
                { label: "Within-time %", value: withinTimePct === null ? "—" : `${withinTimePct}%`, icon: Gauge, tone: "orange" },
              ].map(({ label, value, icon: Icon, tone }) => (
                <div key={label} className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  tone === "rose" ? "border-rose-200" : tone === "emerald" ? "border-emerald-200" : tone === "cyan" ? "border-cyan-200" : tone === "amber" ? "border-amber-200 bg-gradient-to-br from-white to-amber-50/70" : tone === "violet" ? "border-violet-200 bg-gradient-to-br from-white to-violet-50/70" : tone === "orange" ? "border-orange-200 bg-gradient-to-br from-white to-orange-50/70" : "border-indigo-200"
                }`}>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span><Icon className={`h-4 w-4 ${tone === "rose" ? "text-rose-500" : tone === "emerald" ? "text-emerald-500" : tone === "cyan" ? "text-cyan-500" : tone === "amber" ? "text-amber-500" : tone === "violet" ? "text-violet-500" : tone === "orange" ? "text-orange-500" : "text-indigo-500"}`} /></div>
                  <p className="mt-2 text-2xl font-extrabold text-slate-950">{value}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{label === "Completed today" ? "Reports published today" : label === "Average TAT" ? "Created to published" : label === "Critical pending" ? "Requires priority review" : label === "Within-time %" ? "On-time within 24h SLA" : "Live operational count"}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <ReportFilters
              search={search}
              reportType=""
              status={status}
              dateFrom={dateFrom}
              dateTo={dateTo}
              doctor={doctor}
              criticalOnly={criticalOnly}
              deliveryChannel={deliveryChannel}
              slaBreach={slaBreach}
              doctors={doctors}
              onSearchChange={setSearch}
              onReportTypeChange={() => {}}
              onStatusChange={setStatus}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onDoctorChange={setDoctor}
              onCriticalOnlyChange={setCriticalOnly}
              onDeliveryChannelChange={setDeliveryChannel}
              onSlaBreachChange={setSlaBreach}
              onReset={() => {
                setSearch("");
                setStatus("");
                setDateFrom("");
                setDateTo("");
                setVerificationFilter("all");
                setDoctor("");
                setCriticalOnly(false);
                setDeliveryChannel("");
                setSlaBreach(false);
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Verification view</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all" as const, label: `All reports (${reports.length})` },
                  { value: "verified" as const, label: `Verified (${reports.filter(r => Boolean(r.approvedBy) || ["APPROVED", "PUBLISHED", "VERIFIED", "COMPLETED"].includes(r.status.toUpperCase())).length})` },
                  { value: "watch" as const, label: `Verification watch (${reports.filter(r => !r.approvedBy && !["APPROVED", "PUBLISHED", "VERIFIED", "COMPLETED"].includes(r.status.toUpperCase())).length})` },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setVerificationFilter(filter.value)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                      verificationFilter === filter.value
                        ? filter.value === "verified"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : filter.value === "watch"
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-indigo-600 text-white shadow-sm"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-indigo-50"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Reports Management Table */}
            <ReportsManagementTable
              reports={tableReports}
              loading={loading}
              onViewReport={handleViewReport}
              onRefresh={fetchReports}
            />
          </>
        ) : (
          <LabPerformanceAnalytics />
        )}
      </div>
    </DashboardLayout>
  );
}
