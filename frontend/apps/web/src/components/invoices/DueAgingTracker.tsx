"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  AlertCircle,
  AlertTriangle,
  Send,
  CreditCard,
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import type { Invoice } from "./InvoiceTable";

interface DueAgingProps {
  invoices: Invoice[];
  onCollectPayment?: (invoice: Invoice) => void;
  onSendBill?: (invoice: Invoice, method: "whatsapp" | "email") => void;
}

type AgingBucket = "all" | "0-30" | "31-60" | "61-90" | "90+";

interface AgingInvoice extends Invoice {
  daysOverdue: number;
  bucket: "0-30" | "31-60" | "61-90" | "90+";
}

export default function DueAgingTracker({
  invoices,
  onCollectPayment,
  onSendBill,
}: DueAgingProps) {
  const [selectedBucket, setSelectedBucket] = useState<AgingBucket>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter only invoices with pending amounts
  const overdueInvoices = useMemo<AgingInvoice[]>(() => {
    const today = new Date().getTime();

    return invoices
      .filter((inv) => {
        const pending = Number(inv.pendingAmount ?? (Number(inv.netPayable || 0) - Number(inv.paidAmount || 0)));
        return pending > 0 && inv.status !== "REFUNDED";
      })
      .map((inv) => {
        const createdDate = inv.createdAt ? new Date(inv.createdAt).getTime() : today;
        const diffDays = Math.max(0, Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)));

        let bucket: "0-30" | "31-60" | "61-90" | "90+";
        if (diffDays <= 30) bucket = "0-30";
        else if (diffDays <= 60) bucket = "31-60";
        else if (diffDays <= 90) bucket = "61-90";
        else bucket = "90+";

        return {
          ...inv,
          daysOverdue: diffDays,
          bucket,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [invoices]);

  // Bucket statistics
  const stats = useMemo(() => {
    const b0_30 = overdueInvoices.filter((i) => i.bucket === "0-30");
    const b31_60 = overdueInvoices.filter((i) => i.bucket === "31-60");
    const b61_90 = overdueInvoices.filter((i) => i.bucket === "61-90");
    const b90_plus = overdueInvoices.filter((i) => i.bucket === "90+");

    const sumPending = (list: AgingInvoice[]) =>
      list.reduce((acc, i) => acc + Number(i.pendingAmount || 0), 0);

    const totalOverdue = sumPending(overdueInvoices);

    return {
      totalOverdue,
      totalCount: overdueInvoices.length,
      b0_30: { count: b0_30.length, amount: sumPending(b0_30) },
      b31_60: { count: b31_60.length, amount: sumPending(b31_60) },
      b61_90: { count: b61_90.length, amount: sumPending(b61_90) },
      b90_plus: { count: b90_plus.length, amount: sumPending(b90_plus) },
    };
  }, [overdueInvoices]);

  // Filter by selected bucket and search query
  const filteredList = useMemo(() => {
    return overdueInvoices.filter((item) => {
      if (selectedBucket !== "all" && item.bucket !== selectedBucket) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = (item.patientName || "").toLowerCase().includes(query);
        const matchUhid = (item.patientUhid || "").toLowerCase().includes(query);
        const matchInv = (item.invoiceNumber || "").toLowerCase().includes(query);
        const matchPhone = (item.patientPhone || "").toLowerCase().includes(query);
        return matchName || matchUhid || matchInv || matchPhone;
      }
      return true;
    });
  }, [overdueInvoices, selectedBucket, searchQuery]);

  const formatINR = (amt: number) => {
    return `₹${Number(amt || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleSendWhatsAppReminder = (inv: AgingInvoice) => {
    const patientName = inv.patientName || "Valued Patient";
    const amount = Number(inv.pendingAmount || 0).toFixed(2);
    const invNo = inv.invoiceNumber || "";
    const phone = (inv.patientPhone || "").replace(/[^0-9]/g, "");

    const message = encodeURIComponent(
      `Dear ${patientName},\nThis is a friendly reminder from LabCore Diagnostics regarding your outstanding balance of ₹${amount} for Invoice #${invNo}.\n\nPlease settle your payment at the diagnostic counter or via UPI. For assistance, contact +91 98765 43210.\nThank you!`
    );

    if (phone) {
      window.open(`https://wa.me/${phone.startsWith("91") ? phone : "91" + phone}?text=${message}`, "_blank");
    } else {
      alert(`Patient phone number is missing for invoice ${invNo}`);
    }
  };

  const handleCopyPaymentLink = (inv: AgingInvoice) => {
    const text = `LabCore Payment Link for Invoice ${inv.invoiceNumber}: upi://pay?pa=labcore@upi&pn=LabCore&am=${inv.pendingAmount}`;
    navigator.clipboard.writeText(text);
    setCopiedId(String(inv.id));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      "Invoice Number",
      "Patient Name",
      "UHID",
      "Phone",
      "Referring Doctor",
      "Issue Date",
      "Days Overdue",
      "Aging Bucket",
      "Total Amount",
      "Paid Amount",
      "Due Balance",
    ];

    const rows = filteredList.map((i) => [
      i.invoiceNumber || "",
      `"${i.patientName || ""}"`,
      i.patientUhid || "",
      i.patientPhone || "",
      `"${i.doctorName || ""}"`,
      i.createdAt ? new Date(i.createdAt).toLocaleDateString("en-IN") : "",
      i.daysOverdue,
      i.bucket,
      i.totalAmount || 0,
      i.paidAmount || 0,
      i.pendingAmount || 0,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Due_Aging_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-300 ring-1 ring-rose-400/30">
                Accounts Receivable (A/R)
              </span>
              <span className="text-xs text-slate-400">
                Total Overdue Accounts: {stats.totalCount}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Outstanding Dues & Aging Tracker
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Track overdue patient balances across 0-30, 31-60, 61-90, and 90+ days aging buckets with 1-click WhatsApp reminders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20 hover:bg-white/20 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              Export Aging CSV
            </button>
          </div>
        </div>
      </div>

      {/* Aging Bucket Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 0-30 Days */}
        <div
          onClick={() => setSelectedBucket(selectedBucket === "0-30" ? "all" : "0-30")}
          className={`cursor-pointer rounded-xl border p-5 transition-all shadow-sm ${
            selectedBucket === "0-30"
              ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/40"
              : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              0 - 30 DAYS
            </span>
            <span className="text-xs font-bold text-slate-500">{stats.b0_30.count} Invoices</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{formatINR(stats.b0_30.amount)}</p>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            Recent / Normal Credit Period
          </div>
        </div>

        {/* 31-60 Days */}
        <div
          onClick={() => setSelectedBucket(selectedBucket === "31-60" ? "all" : "31-60")}
          className={`cursor-pointer rounded-xl border p-5 transition-all shadow-sm ${
            selectedBucket === "31-60"
              ? "border-amber-500 bg-amber-50 ring-2 ring-amber-400/40"
              : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              31 - 60 DAYS
            </span>
            <span className="text-xs font-bold text-slate-500">{stats.b31_60.count} Invoices</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{formatINR(stats.b31_60.amount)}</p>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">Follow-up Reminder Required</div>
        </div>

        {/* 61-90 Days */}
        <div
          onClick={() => setSelectedBucket(selectedBucket === "61-90" ? "all" : "61-90")}
          className={`cursor-pointer rounded-xl border p-5 transition-all shadow-sm ${
            selectedBucket === "61-90"
              ? "border-orange-500 bg-orange-50 ring-2 ring-orange-400/40"
              : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
              61 - 90 DAYS
            </span>
            <span className="text-xs font-bold text-slate-500">{stats.b61_90.count} Invoices</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{formatINR(stats.b61_90.amount)}</p>
          <div className="mt-2 text-[11px] text-orange-700 font-medium">Urgent Collection Escalation</div>
        </div>

        {/* 90+ Days */}
        <div
          onClick={() => setSelectedBucket(selectedBucket === "90+" ? "all" : "90+")}
          className={`cursor-pointer rounded-xl border p-5 transition-all shadow-sm ${
            selectedBucket === "90+"
              ? "border-rose-500 bg-rose-50 ring-2 ring-rose-400/40"
              : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
              90+ DAYS
            </span>
            <span className="text-xs font-bold text-slate-500">{stats.b90_plus.count} Invoices</span>
          </div>
          <p className="text-2xl font-black text-rose-700 mt-3">{formatINR(stats.b90_plus.amount)}</p>
          <div className="mt-2 text-[11px] text-rose-700 font-medium">Critical Delinquent / Bad Debt</div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Bucket Filter:
          </span>
          <div className="flex gap-1">
            {(["all", "0-30", "31-60", "61-90", "90+"] as AgingBucket[]).map((bucket) => (
              <button
                key={bucket}
                onClick={() => setSelectedBucket(bucket)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  selectedBucket === bucket
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {bucket === "all" ? "All Buckets" : `${bucket} d`}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, UHID, phone..."
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Overdue Accounts Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Patient & UHID</th>
                <th className="px-4 py-3">Invoice & Date</th>
                <th className="px-4 py-3">Aging Risk</th>
                <th className="px-4 py-3 text-right">Total (₹)</th>
                <th className="px-4 py-3 text-right">Paid (₹)</th>
                <th className="px-4 py-3 text-right">Due Balance (₹)</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No overdue accounts found</p>
                    <p className="text-xs text-slate-400">All collections in this bucket are settled!</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{inv.patientName || "Patient"}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        {inv.patientUhid && (
                          <span className="font-mono text-indigo-600 font-medium">
                            UHID: {inv.patientUhid}
                          </span>
                        )}
                        {inv.patientPhone && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {inv.patientPhone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-slate-800">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-IN") : "—"}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          inv.bucket === "0-30"
                            ? "bg-emerald-100 text-emerald-800"
                            : inv.bucket === "31-60"
                            ? "bg-amber-100 text-amber-800"
                            : inv.bucket === "61-90"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {inv.daysOverdue} Days Due ({inv.bucket})
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-slate-700">
                      {formatINR(inv.netPayable || inv.totalAmount || 0)}
                    </td>

                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                      {formatINR(inv.paidAmount || 0)}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 text-sm">
                      {formatINR(inv.pendingAmount || 0)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onCollectPayment && (
                          <button
                            onClick={() => onCollectPayment(inv)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                          >
                            Collect
                          </button>
                        )}
                        <button
                          onClick={() => handleSendWhatsAppReminder(inv)}
                          title="Send WhatsApp Payment Demand"
                          className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyPaymentLink(inv)}
                          title="Copy UPI Payment Link"
                          className="rounded-lg bg-slate-100 px-2 py-1 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          {copiedId === String(inv.id) ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
