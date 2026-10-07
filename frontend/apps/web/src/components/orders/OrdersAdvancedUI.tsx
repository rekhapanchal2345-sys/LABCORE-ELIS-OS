"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  FlaskConical,
  Heart,
  IndianRupee,
  Layers,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Users,
  Zap,
  Building2,
  Stethoscope,
  Timer,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { orderApi } from "@/lib/api";

// ==========================================
// TYPES
// ==========================================

export interface OrderAnalytics {
  overview: {
    totalOrders: number;
    todayOrders: number;
    pendingSamples: number;
    statOrders: number;
    urgentOrders: number;
    completedToday: number;
    cancelledToday: number;
    tatBreachCount: number;
  };
  revenue: {
    totalBilled: number;
    totalCollected: number;
    totalPending: number;
    collectionRate: number;
  };
  statusBreakdown: Array<{ status: string; count: number }>;
  paymentBreakdown: Array<{ status: string; count: number }>;
  topTests: Array<{ test?: { testName: string; testCode: string }; _count: { _all: number } }>;
  topDoctors: Array<{ doctor?: { fullName: string; specialization: string }; _count: { _all: number } }>;
}

export interface TATData {
  active: number;
  breached: number;
  critical: number;
  breachedOrders: TATOrder[];
  criticalOrders: TATOrder[];
  allActiveOrders: TATOrder[];
}

export interface TATOrder {
  orderId: string;
  orderNumber: string;
  priority: string;
  status: string;
  ageHours: number;
  expectedTATHours: number;
  isBreached: boolean;
  percentComplete: number;
  patient: { firstName: string; lastName: string; uhid: string };
  tests: string[];
}

export interface PipelineData {
  pipeline: Record<string, any[]>;
  totals: Record<string, number>;
}

// ==========================================
// 1. ANALYTICS STAT CARD
// ==========================================

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  urgent,
  onClick,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  urgent?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border p-4 flex flex-col gap-2 transition-all duration-200 ${
        urgent
          ? "border-red-500/60 bg-red-950/20 shadow-red-900/30 shadow-lg animate-pulse-slow"
          : "border-slate-700/60 bg-slate-800/60 hover:bg-slate-800"
      } ${onClick ? "cursor-pointer hover:scale-[1.01]" : ""}`}
    >
      <div className={`flex items-center gap-2 ${color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
      {urgent && Number(value) > 0 && (
        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-ping" />
      )}
    </div>
  );
}

// ==========================================
// 2. ANALYTICS DASHBOARD STRIP
// ==========================================

export function OrderAnalyticsDashboard({
  analytics,
  tatData,
  loading,
  onStatClick,
}: {
  analytics: OrderAnalytics | null;
  tatData: TATData | null;
  loading: boolean;
  onStatClick?: (filter: string) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (!analytics) return null;
  const ov = analytics.overview;
  const rev = analytics.revenue;

  return (
    <div className="space-y-3 mb-5">
      {/* Critical Alerts Bar */}
      {(ov.statOrders > 0 || ov.tatBreachCount > 0) && (
        <div className="flex flex-wrap gap-2 items-center rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-2.5">
          <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
          <span className="text-red-300 text-sm font-semibold">Critical Alerts:</span>
          {ov.statOrders > 0 && (
            <span
              className="text-xs bg-red-500/30 text-red-300 border border-red-500/40 rounded-full px-2 py-0.5 cursor-pointer hover:bg-red-500/50 transition"
              onClick={() => onStatClick?.("STAT")}
            >
              ⚡ {ov.statOrders} STAT orders pending
            </span>
          )}
          {ov.tatBreachCount > 0 && (
            <span
              className="text-xs bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-full px-2 py-0.5 cursor-pointer hover:bg-orange-500/50 transition"
              onClick={() => onStatClick?.("TAT_BREACH")}
            >
              ⏰ {ov.tatBreachCount} TAT breached
            </span>
          )}
          {tatData && tatData.critical > 0 && (
            <span className="text-xs bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 rounded-full px-2 py-0.5">
              ⚠️ {tatData.critical} approaching TAT limit
            </span>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard
          icon={Layers}
          label="Today"
          value={ov.todayOrders}
          sub="Total orders"
          color="text-blue-400"
          onClick={() => onStatClick?.("today")}
        />
        <StatCard
          icon={FlaskConical}
          label="Pending"
          value={ov.pendingSamples}
          sub="Samples awaiting"
          color="text-amber-400"
          urgent={ov.pendingSamples > 10}
          onClick={() => onStatClick?.("REGISTERED")}
        />
        <StatCard
          icon={Zap}
          label="STAT"
          value={ov.statOrders}
          sub="Critical priority"
          color="text-red-400"
          urgent={ov.statOrders > 0}
          onClick={() => onStatClick?.("STAT")}
        />
        <StatCard
          icon={AlertTriangle}
          label="Urgent"
          value={ov.urgentOrders}
          sub="High priority"
          color="text-orange-400"
          onClick={() => onStatClick?.("URGENT")}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={ov.completedToday}
          sub="Today"
          color="text-emerald-400"
          onClick={() => onStatClick?.("COMPLETED")}
        />
        <StatCard
          icon={Timer}
          label="TAT Breach"
          value={tatData?.breached ?? ov.tatBreachCount}
          sub="Overdue orders"
          color="text-rose-400"
          urgent={ov.tatBreachCount > 0}
        />
        <StatCard
          icon={IndianRupee}
          label="Billed"
          value={`₹${(rev.totalBilled / 1000).toFixed(1)}K`}
          sub="Today revenue"
          color="text-cyan-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Collection"
          value={`${rev.collectionRate}%`}
          sub={`₹${(rev.totalPending / 1000).toFixed(1)}K pending`}
          color="text-green-400"
        />
      </div>
    </div>
  );
}

// ==========================================
// 3. TAT MONITOR PANEL
// ==========================================

export function TATMonitorPanel({
  tatData,
  onOrderClick,
  isOpen,
  onClose,
}: {
  tatData: TATData | null;
  onOrderClick?: (orderId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !tatData) return null;

  const combined = [...tatData.breachedOrders, ...tatData.criticalOrders];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/40">
              <Timer className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">TAT Monitor</h2>
              <p className="text-xs text-slate-400">
                {tatData.breached} breached · {tatData.critical} critical · {tatData.active} total active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {combined.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
              <p className="font-semibold">All orders within TAT!</p>
              <p className="text-sm">No critical or breached orders at this time.</p>
            </div>
          ) : (
            combined.map((order) => (
              <div
                key={order.orderId}
                onClick={() => onOrderClick?.(order.orderId)}
                className={`rounded-xl border p-3 flex items-center gap-4 cursor-pointer transition hover:scale-[1.005] ${
                  order.isBreached
                    ? "border-red-500/50 bg-red-950/20 hover:bg-red-950/30"
                    : "border-yellow-500/40 bg-yellow-950/20 hover:bg-yellow-950/30"
                }`}
              >
                {/* Status Indicator */}
                <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  order.isBreached
                    ? "border-red-500 bg-red-500/20 text-red-300"
                    : "border-yellow-500 bg-yellow-500/20 text-yellow-300"
                }`}>
                  {order.percentComplete}%
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{order.orderNumber}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      order.priority === "STAT"
                        ? "bg-red-500/30 text-red-300 border border-red-500/40"
                        : order.priority === "URGENT"
                        ? "bg-orange-500/30 text-orange-300 border border-orange-500/40"
                        : "bg-slate-600/40 text-slate-400 border border-slate-600/40"
                    }`}>
                      {order.priority}
                    </span>
                    {order.isBreached && (
                      <span className="text-[10px] bg-red-600/30 text-red-300 border border-red-600/40 px-1.5 py-0.5 rounded-full font-bold">
                        BREACHED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 truncate">
                    {order.patient.firstName} {order.patient.lastName} · {order.patient.uhid}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{order.tests.join(", ")}</p>
                </div>

                {/* TAT Info */}
                <div className="shrink-0 text-right">
                  <p className={`text-sm font-bold ${order.isBreached ? "text-red-400" : "text-yellow-400"}`}>
                    {order.ageHours}h
                  </p>
                  <p className="text-[10px] text-slate-400">/ {order.expectedTATHours}h TAT</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. PIPELINE / KANBAN VIEW
// ==========================================

const PIPELINE_COLUMNS = [
  { key: "REGISTERED", label: "Registered", icon: AlertCircle, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-950/10" },
  { key: "SAMPLE_COLLECTED", label: "Sample Collected", icon: FlaskConical, color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-950/10" },
  { key: "PROCESSING", label: "Processing", icon: Activity, color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-950/10" },
  { key: "COMPLETED", label: "Completed", icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-950/10" },
];

function PipelineCard({ order, onAction }: { order: any; onAction?: (order: any) => void }) {
  const ageMs = Date.now() - new Date(order.createdAt).getTime();
  const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
  const ageMin = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div
      onClick={() => onAction?.(order)}
      className={`rounded-xl border p-3 cursor-pointer transition-all hover:scale-[1.01] ${
        order.priority === "STAT"
          ? "border-red-500/60 bg-red-950/20"
          : order.priority === "URGENT"
          ? "border-orange-500/40 bg-orange-950/10"
          : "border-slate-700/50 bg-slate-800/60"
      } hover:shadow-lg`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-mono text-xs font-bold text-white">{order.orderNumber}</span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
          order.priority === "STAT"
            ? "bg-red-500/30 text-red-300 border border-red-500/40"
            : order.priority === "URGENT"
            ? "bg-orange-500/30 text-orange-300 border border-orange-500/40"
            : "bg-slate-600/30 text-slate-400 border border-slate-600/30"
        }`}>
          {order.priority}
        </span>
      </div>
      <p className="text-xs font-semibold text-white/90 truncate">
        {order.patient?.firstName} {order.patient?.lastName}
      </p>
      <p className="text-[10px] text-slate-400 font-mono">{order.patient?.uhid}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {(order.items || []).slice(0, 2).map((item: any, i: number) => (
          <span key={i} className="text-[9px] bg-slate-700/60 text-slate-300 rounded px-1.5 py-0.5 truncate max-w-[100px]">
            {item.test?.testName}
          </span>
        ))}
        {(order.items || []).length > 2 && (
          <span className="text-[9px] bg-slate-700/40 text-slate-400 rounded px-1 py-0.5">
            +{order.items.length - 2}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {ageHours > 0 ? `${ageHours}h ${ageMin}m` : `${ageMin}m`}
        </span>
        {order.doctor && (
          <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
            {order.doctor.fullName?.split(" ")[0]}
          </span>
        )}
      </div>
    </div>
  );
}

export function OrderPipelineView({
  pipelineData,
  loading,
  onOrderClick,
}: {
  pipelineData: PipelineData | null;
  loading: boolean;
  onOrderClick?: (order: any) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4 h-[500px]">
        {PIPELINE_COLUMNS.map((col) => (
          <div key={col.key} className="rounded-xl border border-slate-700/40 bg-slate-800/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ minHeight: 420 }}>
      {PIPELINE_COLUMNS.map((col) => {
        const Icon = col.icon;
        const orders = pipelineData?.pipeline?.[col.key] ?? [];
        const count = pipelineData?.totals?.[col.key] ?? 0;

        return (
          <div key={col.key} className={`rounded-xl border ${col.border} ${col.bg} flex flex-col overflow-hidden`}>
            {/* Column Header */}
            <div className={`flex items-center gap-2 px-3 py-2.5 border-b ${col.border}`}>
              <Icon className={`h-4 w-4 ${col.color}`} />
              <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
              <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-slate-800/80 ${col.color}`}>
                {count}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-xs">No orders</p>
                </div>
              ) : (
                orders.map((order: any) => (
                  <PipelineCard key={order.id} order={order} onAction={onOrderClick} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// 5. REVENUE BY DOCTOR TABLE
// ==========================================

export function RevenueDoctorTable({ data, loading }: { data: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-slate-800/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No doctor revenue data</p>
      </div>
    );
  }

  const maxBilled = Math.max(...data.map((d) => d.totalBilled), 1);

  return (
    <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
      {data.map((row, i) => (
        <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                <Stethoscope className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">{row.doctor?.fullName || "Unknown"}</p>
                <p className="text-[10px] text-slate-400">{row.doctor?.specialization}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-400">₹{(row.totalBilled / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-slate-400">{row.orderCount} orders</p>
            </div>
          </div>
          {/* Collection bar */}
          <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(row.totalBilled / maxBilled) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-emerald-400">₹{(row.totalCollected / 1000).toFixed(1)}K collected</span>
            <span className="text-[10px] text-amber-400">₹{(row.totalPending / 1000).toFixed(1)}K pending</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 6. HOURLY THROUGHPUT CHART
// ==========================================

export function HourlyThroughputBar({ data, loading }: { data: any[]; loading: boolean }) {
  if (loading) {
    return <div className="h-28 rounded-xl bg-slate-800/40 animate-pulse" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-slate-400 text-sm">
        No data for today
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.registered), 1);
  const currentHour = new Date().getHours();

  return (
    <div className="flex items-end gap-1 h-28 px-1">
      {data.map((bucket, i) => {
        const height = Math.max(4, (bucket.registered / maxVal) * 100);
        const isNow = bucket.hourNum === currentHour;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[9px] rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
              {bucket.hour}: {bucket.registered} orders
            </div>
            <div
              className={`w-full rounded-t transition-all duration-300 ${
                isNow ? "bg-blue-500" : "bg-slate-600/80 group-hover:bg-blue-400/60"
              }`}
              style={{ height: `${height}%` }}
            />
            {i % 3 === 0 && (
              <span className="text-[8px] text-slate-500 leading-none">{bucket.hour.split(":")[0]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// 7. ADVANCED FILTER BAR
// ==========================================

export function AdvancedFilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: {
    status: string;
    payment: string;
    priority: string;
    date: string;
    collectionType: string;
    dateFrom: string;
    dateTo: string;
  };
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}) {
  const hasFilters = Object.values(filters).some((v) => v && v !== "all" && v !== "");
  const labelClass = "text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block";
  const selectClass =
    "w-full rounded-lg border border-slate-700/60 bg-slate-800/80 text-white text-xs px-2.5 py-1.5 focus:outline-none focus:border-blue-500 transition cursor-pointer";

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          Advanced Filters
        </h3>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className={labelClass}>Status</label>
          <select className={selectClass} value={filters.status} onChange={(e) => onChange("status", e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="REGISTERED">Registered</option>
            <option value="SAMPLE_COLLECTED">Sample Collected</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Priority</label>
          <select className={selectClass} value={filters.priority} onChange={(e) => onChange("priority", e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="STAT">⚡ STAT</option>
            <option value="URGENT">🔴 Urgent</option>
            <option value="ROUTINE">🟢 Routine</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Payment</label>
          <select className={selectClass} value={filters.payment} onChange={(e) => onChange("payment", e.target.value)}>
            <option value="all">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Collection</label>
          <select className={selectClass} value={filters.collectionType} onChange={(e) => onChange("collectionType", e.target.value)}>
            <option value="">All Types</option>
            <option value="WALK_IN">Walk-in</option>
            <option value="HOME_COLLECTION">Home Collection</option>
            <option value="HOSPITAL">Hospital Referral</option>
            <option value="CLINIC">Clinic Referral</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>From Date</label>
          <input
            type="date"
            className={selectClass}
            value={filters.dateFrom}
            onChange={(e) => onChange("dateFrom", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>To Date</label>
          <input
            type="date"
            className={selectClass}
            value={filters.dateTo}
            onChange={(e) => onChange("dateTo", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. BULK ACTIONS BAR (advanced)
// ==========================================

export function AdvancedBulkActionBar({
  selectedCount,
  selectedIds,
  onEscalate,
  onStatusUpdate,
  onClear,
  loading,
}: {
  selectedCount: number;
  selectedIds: string[];
  onEscalate: (priority: string) => void;
  onStatusUpdate: (status: string) => void;
  onClear: () => void;
  loading?: boolean;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl px-5 py-3 flex items-center gap-4 min-w-[600px]">
      <div className="flex items-center gap-2 shrink-0">
        <div className="h-7 w-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-400">{selectedCount}</span>
        </div>
        <span className="text-sm text-white font-semibold">selected</span>
      </div>

      <div className="h-4 w-px bg-slate-700" />

      {/* Escalate Priority */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-slate-400 shrink-0">Escalate to:</span>
        <button
          disabled={loading}
          onClick={() => onEscalate("URGENT")}
          className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 hover:bg-orange-500/30 transition disabled:opacity-50"
        >
          🔴 Urgent
        </button>
        <button
          disabled={loading}
          onClick={() => onEscalate("STAT")}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition disabled:opacity-50"
        >
          ⚡ STAT
        </button>
      </div>

      <div className="h-4 w-px bg-slate-700" />

      {/* Status Update */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-slate-400 shrink-0">Move to:</span>
        <button
          disabled={loading}
          onClick={() => onStatusUpdate("PROCESSING")}
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 transition disabled:opacity-50"
        >
          Processing
        </button>
        <button
          disabled={loading}
          onClick={() => onStatusUpdate("COMPLETED")}
          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition disabled:opacity-50"
        >
          Completed
        </button>
      </div>

      {loading && <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />}

      <div className="ml-auto">
        <button onClick={onClear} className="text-xs text-slate-400 hover:text-white transition">
          ✕ Clear
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 9. ANALYTICS SIDE PANEL
// ==========================================

export function AnalyticsSidePanel({
  analytics,
  tatData,
  revenueData,
  hourlyData,
  loading,
}: {
  analytics: OrderAnalytics | null;
  tatData: TATData | null;
  revenueData: any[];
  hourlyData: any[];
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Revenue Summary */}
      {analytics && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <IndianRupee className="h-3.5 w-3.5 text-emerald-400" /> Revenue Today
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Billed</span>
              <span className="font-bold text-white">₹{analytics.revenue.totalBilled.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Collected</span>
              <span className="font-bold text-emerald-400">₹{analytics.revenue.totalCollected.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Pending</span>
              <span className="font-bold text-amber-400">₹{analytics.revenue.totalPending.toLocaleString("en-IN")}</span>
            </div>
            {/* Collection rate bar */}
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Collection rate</span>
                <span className="text-emerald-400 font-bold">{analytics.revenue.collectionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                  style={{ width: `${analytics.revenue.collectionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hourly Chart */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-blue-400" /> Hourly Volume
        </h4>
        <HourlyThroughputBar data={hourlyData} loading={loading} />
      </div>

      {/* Top Tests */}
      {analytics && analytics.topTests.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FlaskConical className="h-3.5 w-3.5 text-purple-400" /> Top Tests
          </h4>
          <div className="space-y-1.5">
            {analytics.topTests.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate">{t.test?.testName || "Unknown"}</span>
                <span className="text-slate-400 font-mono shrink-0 ml-2">{t._count._all}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Revenue */}
      {revenueData.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5 text-indigo-400" /> Doctor Revenue
          </h4>
          <RevenueDoctorTable data={revenueData.slice(0, 5)} loading={loading} />
        </div>
      )}
    </div>
  );
}

// ==========================================
// 10. VIEW MODE SWITCHER
// ==========================================

export function ViewModeSwitcher({
  mode,
  onChange,
}: {
  mode: "table" | "pipeline" | "analytics";
  onChange: (mode: "table" | "pipeline" | "analytics") => void;
}) {
  const modes = [
    { key: "table" as const, label: "Table", icon: Layers },
    { key: "pipeline" as const, label: "Pipeline", icon: Activity },
    { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-800/60 p-1">
      {modes.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            mode === key
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
