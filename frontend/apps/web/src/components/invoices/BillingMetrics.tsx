"use client";

import React, { useEffect, useState, useMemo } from "react";
import { invoiceApi } from "@/lib/api";
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  Percent,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import type { Invoice } from "./InvoiceTable";

interface BillingMetricsData {
  totalRevenue: number;
  paidInvoices: {
    count: number;
    amount: number;
  };
  pendingDueAmount: number;
  discountsAndRefunds: {
    discounts: number;
    refunds: number;
    total: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface BillingMetricsProps {
  startDate?: string;
  endDate?: string;
  invoices?: Invoice[];
}

function formatCurrency(amount: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function BillingMetrics({
  startDate,
  endDate,
  invoices = [],
}: BillingMetricsProps) {
  const [metrics, setMetrics] = useState<BillingMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"register" | "today">("register");

  // Calculate live dynamic metrics from active invoices register
  const liveRegisterMetrics = useMemo(() => {
    let totalBilled = 0;
    let totalCollected = 0;
    let totalDue = 0;
    let totalDiscount = 0;
    let totalGst = 0;
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    invoices.forEach((inv) => {
      const net = Number(inv.netPayable || inv.totalAmount || 0);
      const paid = Number(inv.paidAmount || 0);
      const due =
        inv.pendingAmount !== undefined
          ? Number(inv.pendingAmount)
          : Math.max(0, net - paid);
      const disc = Number(inv.discount || 0);
      const gst = Number(inv.gstAmount || 0);

      totalBilled += net;
      totalCollected += paid;
      totalDue += due;
      totalDiscount += disc;
      totalGst += gst;

      if (due <= 0 || inv.paymentStatus === "PAID") {
        paidCount++;
      } else if (paid > 0) {
        partialCount++;
      } else {
        pendingCount++;
      }
    });

    const recoveryRate =
      totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

    return {
      totalBilled,
      totalCollected,
      totalDue,
      totalDiscount,
      totalGst,
      paidCount,
      partialCount,
      pendingCount,
      recoveryRate,
      count: invoices.length,
    };
  }, [invoices]);

  useEffect(() => {
    fetchMetrics();
  }, [startDate, endDate]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const query = queryParams.toString();
      const response = await invoiceApi.getBillingMetrics(
        query ? `?${query}` : ""
      );

      if (response.success && response.data) {
        setMetrics(response.data);
      }
    } catch (err) {
      console.error("Error fetching billing metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Determine display values based on viewMode
  const displayTotalRevenue =
    viewMode === "register" && liveRegisterMetrics.count > 0
      ? liveRegisterMetrics.totalCollected
      : metrics?.totalRevenue || liveRegisterMetrics.totalCollected;

  const displayPaidInvoicesCount =
    viewMode === "register" && liveRegisterMetrics.count > 0
      ? liveRegisterMetrics.paidCount
      : metrics?.paidInvoices.count || liveRegisterMetrics.paidCount;

  const displayPaidAmount =
    viewMode === "register" && liveRegisterMetrics.count > 0
      ? liveRegisterMetrics.totalCollected
      : metrics?.paidInvoices.amount || liveRegisterMetrics.totalCollected;

  const displayPendingDue =
    viewMode === "register" && liveRegisterMetrics.count > 0
      ? liveRegisterMetrics.totalDue
      : metrics?.pendingDueAmount || liveRegisterMetrics.totalDue;

  const displayDiscountTotal =
    viewMode === "register" && liveRegisterMetrics.count > 0
      ? liveRegisterMetrics.totalDiscount + liveRegisterMetrics.totalGst
      : (metrics?.discountsAndRefunds.total || 0) + liveRegisterMetrics.totalGst;

  return (
    <div className="space-y-3">
      {/* Sub-bar with View Selector */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Real-time Financial Telemetry</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-700 font-bold">
            {liveRegisterMetrics.count} Total Register Invoices
          </span>
        </div>

        <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
          <button
            onClick={() => setViewMode("register")}
            className={`rounded-md px-2.5 py-1 transition-all ${
              viewMode === "register"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Register Overall
          </button>
          <button
            onClick={() => setViewMode("today")}
            className={`rounded-md px-2.5 py-1 transition-all ${
              viewMode === "today"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Today's Window
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: TOTAL REVENUE / REALIZED CASH */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/30 to-emerald-50/60 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {viewMode === "register" ? "Total Revenue Realized" : "Revenue (Today)"}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900 font-mono">
            {formatCurrency(displayTotalRevenue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Collected / Settled</span>
            <span className="font-bold text-emerald-700">
              {liveRegisterMetrics.recoveryRate}% Realized
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${liveRegisterMetrics.recoveryRate}%` }}
            />
          </div>
        </div>

        {/* CARD 2: PAID INVOICES */}
        <div className="group relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-indigo-50/60 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Paid Invoices
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900">
            {displayPaidInvoicesCount}{" "}
            <span className="text-sm font-semibold text-slate-500 font-sans">
              invoices
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Value: {formatCurrency(displayPaidAmount)}</span>
            <span className="font-bold text-indigo-700">
              {liveRegisterMetrics.count > 0
                ? Math.round(
                    (displayPaidInvoicesCount / liveRegisterMetrics.count) * 100
                  )
                : 100}
              % Completed
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{
                width: `${
                  liveRegisterMetrics.count > 0
                    ? (displayPaidInvoicesCount / liveRegisterMetrics.count) * 100
                    : 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* CARD 3: PENDING / DUE AMOUNT */}
        <div className="group relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/30 to-amber-50/60 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Pending / Due Balance
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900 font-mono">
            {formatCurrency(displayPendingDue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Uncollected Patient Dues</span>
            <span
              className={`font-bold ${
                displayPendingDue > 0 ? "text-amber-700" : "text-emerald-700"
              }`}
            >
              {displayPendingDue > 0 ? "Action Required" : "Zero Arrears"}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{
                width: `${
                  liveRegisterMetrics.totalBilled > 0
                    ? Math.min(
                        100,
                        (displayPendingDue / liveRegisterMetrics.totalBilled) * 100
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* CARD 4: DISCOUNTS & GST TAX AUDIT */}
        <div className="group relative overflow-hidden rounded-2xl border border-purple-200/80 bg-gradient-to-br from-white via-purple-50/30 to-purple-50/60 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
              Discounts & Tax (GST)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900 font-mono">
            {formatCurrency(liveRegisterMetrics.totalGst)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>
              Disc: {formatCurrency(liveRegisterMetrics.totalDiscount)}
            </span>
            <span className="font-bold text-purple-700 font-mono">
              +GST: {formatCurrency(liveRegisterMetrics.totalGst)}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
