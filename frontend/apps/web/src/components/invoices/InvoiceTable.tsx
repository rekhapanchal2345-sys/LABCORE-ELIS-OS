"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Printer,
  FileText,
  CreditCard,
  MessageCircle,
  MoreVertical,
  Receipt,
  QrCode,
  Sparkles,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Banknote,
  Smartphone,
} from "lucide-react";
import InvoiceActionsDropdown from "./InvoiceActionsDropdown";

export interface Invoice {
  id: string | number;
  invoiceNumber?: string;
  patientId?: string | number;
  patientName?: string;
  patientUhid?: string;
  patientPhone?: string;
  patientEmail?: string;
  orderId?: string | number;
  orderNumber?: string;
  doctorName?: string;
  doctorEmail?: string;
  totalAmount?: number;
  discount?: number;
  gstAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  netPayable?: number;
  paidAmount?: number;
  pendingAmount?: number;
  status?: string;
  paymentStatus?: string;
  paymentMode?: string;
  createdAt?: string;
  dueDate?: string;
  samples?: any[];
  items?: any[];
  orderStatus?: string;
  patientInfo?: {
    age?: string;
    gender?: string;
    phone?: string;
    address?: string;
    email?: string;
  };
  doctorInfo?: {
    name?: string;
    qualification?: string;
    gstin?: string;
    address?: string;
  };
  payments?: Array<{
    amount: number;
    method: string;
    transactionId?: string;
    paidAt: string;
    receivedBy?: string;
  }>;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  loading?: boolean;
  selectedIds?: (string | number)[];
  onToggleSelect?: (id: string | number) => void;
  onSelectAll?: () => void;
  onRowClick?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  onCollectPayment?: (invoice: Invoice) => void;
  onPrint?: (invoice: Invoice, type: "thermal" | "a4") => void;
  onSendBill?: (invoice: Invoice, method: "whatsapp" | "email") => void;
  onRefund?: (invoice: Invoice) => void;
}

function formatCurrency(amount?: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(date?: string) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getPaymentStatusBadge(status?: string, pendingAmt?: number) {
  const value = status?.toUpperCase();

  if (value === "PAID" || value === "COMPLETED" || (pendingAmt !== undefined && pendingAmt <= 0)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Fully Paid
      </span>
    );
  }

  if (value === "PARTIAL" || (pendingAmt !== undefined && pendingAmt > 0 && status !== "PENDING")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-600/30">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Partially Paid
      </span>
    );
  }

  if (value === "PENDING" || value === "OVERDUE" || value === "UNPAID") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-600/25">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Unpaid / Due
      </span>
    );
  }

  if (value === "REFUNDED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 ring-1 ring-purple-600/20">
        Refunded
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      {status || "Registered"}
    </span>
  );
}

function getPaymentModeBadge(mode?: string, isFullyPaid?: boolean) {
  const resolvedMode = mode?.toUpperCase() || (isFullyPaid ? "CASH" : undefined);
  if (!resolvedMode) {
    return <span className="text-slate-400 text-xs italic">Unpaid</span>;
  }

  if (resolvedMode === "UPI" || resolvedMode === "GPAY" || resolvedMode === "PHONEPE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-500/20">
        <Smartphone className="h-3 w-3 text-blue-600" />
        UPI
      </span>
    );
  }

  if (resolvedMode === "CASH") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
        <Banknote className="h-3 w-3 text-emerald-600" />
        Cash
      </span>
    );
  }

  if (resolvedMode === "CARD") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-purple-500/20">
        <CreditCard className="h-3 w-3 text-purple-600" />
        Card / POS
      </span>
    );
  }

  if (resolvedMode === "NET_BANKING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-500/20">
        NetBanking
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
      {resolvedMode}
    </span>
  );
}

export default function InvoiceTable({
  invoices,
  loading = false,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onRowClick,
  onDelete,
  onCollectPayment,
  onPrint,
  onSendBill,
  onRefund,
}: InvoiceTableProps) {
  const isAllSelected = invoices.length > 0 && selectedIds.length === invoices.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/80">
          <thead className="bg-slate-50/80">
            <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              {onToggleSelect && (
                <th className="px-3.5 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
              )}

              <th className="px-4 py-3.5 text-left">Invoice #</th>
              <th className="px-4 py-3.5 text-left">Date & Time</th>
              <th className="px-4 py-3.5 text-left">Patient & Referral</th>
              <th className="px-4 py-3.5 text-right">Gross (₹)</th>
              <th className="px-4 py-3.5 text-right">Tax & Disc</th>
              <th className="px-4 py-3.5 text-right">Net Bill (₹)</th>
              <th className="px-4 py-3.5 text-left">Status</th>
              <th className="px-4 py-3.5 text-left">Payment Mode</th>
              <th className="px-4 py-3.5 text-center min-w-[210px]">Actions (Quick Print)</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              Array.from({ length: 5 }).map((_, r) => (
                <tr key={r} className="animate-pulse">
                  <td colSpan={10} className="px-4 py-4">
                    <div className="h-5 bg-slate-100 rounded-lg w-full" />
                  </td>
                </tr>
              ))
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm mb-3">
                    <Receipt className="h-7 w-7" />
                  </div>
                  <p className="text-base font-bold text-slate-900">
                    No Diagnostic Invoices Found
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No billing records match the current filters. Try changing your search or date selection.
                  </p>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const total = Number(invoice.totalAmount || 0);
                const discount = Number(invoice.discount || 0);
                const gst = Number(invoice.gstAmount || 0);
                const netPayable = Number(
                  invoice.netPayable || total + gst - discount
                );
                const paid = Number(invoice.paidAmount || 0);
                const due =
                  invoice.pendingAmount !== undefined
                    ? Number(invoice.pendingAmount)
                    : Math.max(0, netPayable - paid);
                const isPaid = due <= 0;
                const isSelected = selectedIds.includes(invoice.id);

                return (
                  <tr
                    key={invoice.id}
                    onClick={() => onRowClick && onRowClick(invoice)}
                    className={`transition-colors duration-150 ${
                      isSelected
                        ? "bg-indigo-50/70"
                        : "hover:bg-slate-50/90"
                    } ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {onToggleSelect && (
                      <td
                        className="px-3.5 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(invoice.id)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Invoice Monospace Pill */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                          {invoice.invoiceNumber || `INV-${invoice.id}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {invoice.orderNumber ? `Ord: ${invoice.orderNumber}` : ""}
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-4 whitespace-nowrap text-slate-700">
                      <div className="font-medium text-slate-900">
                        {formatDateTime(invoice.createdAt)}
                      </div>
                    </td>

                    {/* Patient & Doctor */}
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] shrink-0">
                          {(invoice.patientName || "P")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 hover:text-indigo-600">
                            {invoice.patientName || "Walk-in Patient"}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-mono font-semibold text-slate-600">
                              {invoice.patientUhid || "LC-000001"}
                            </span>
                            {invoice.patientPhone && (
                              <>
                                <span>•</span>
                                <span>{invoice.patientPhone}</span>
                              </>
                            )}
                          </div>
                          {invoice.doctorName && (
                            <div className="text-[10px] font-medium text-indigo-700 mt-0.5">
                              Dr. {invoice.doctorName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Gross */}
                    <td className="px-4 py-4 text-right font-mono font-medium text-slate-700">
                      {formatCurrency(total)}
                    </td>

                    {/* Tax & Discount */}
                    <td className="px-4 py-4 text-right">
                      <div className="text-[11px] space-y-0.5 font-mono">
                        {discount > 0 && (
                          <div className="text-emerald-700 font-medium">
                            -{formatCurrency(discount)}
                          </div>
                        )}
                        {gst > 0 && (
                          <div className="text-blue-700">
                            +{formatCurrency(gst)} GST
                          </div>
                        )}
                        {discount === 0 && gst === 0 && (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Net Bill & Balance Due */}
                    <td className="px-4 py-4 text-right">
                      <div className="font-mono text-sm font-black text-slate-900">
                        {formatCurrency(netPayable)}
                      </div>
                      {due > 0 ? (
                        <div className="text-[10px] font-bold text-rose-600 font-mono">
                          Due: {formatCurrency(due)}
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-emerald-600">
                          Paid: {formatCurrency(paid || netPayable)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(invoice.paymentStatus || invoice.status, due)}
                    </td>

                    {/* Payment Mode */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getPaymentModeBadge(invoice.paymentMode, isPaid)}
                    </td>

                    {/* Actions: One-Click Quick Print Bar */}
                    <td
                      className="px-4 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Quick Thermal POS Print Button */}
                        <button
                          onClick={() => onPrint?.(invoice, "thermal")}
                          title="Print Thermal Receipt (80mm/58mm POS)"
                          className="flex items-center gap-1 rounded-lg border border-amber-300/80 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 shadow-sm hover:bg-amber-100 hover:border-amber-400 transition-all"
                        >
                          <Receipt className="h-3.5 w-3.5 text-amber-600" />
                          <span>Thermal</span>
                        </button>

                        {/* 2. Quick A4 GST Invoice Print Button */}
                        <button
                          onClick={() => onPrint?.(invoice, "a4")}
                          title="Print A4 GST Tax Invoice (Official NABL Copy)"
                          className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-100 hover:border-indigo-300 transition-all"
                        >
                          <FileText className="h-3.5 w-3.5 text-indigo-600" />
                          <span>A4 GST</span>
                        </button>

                        {/* 3. Collect Payment (if due > 0) */}
                        {due > 0 && onCollectPayment && (
                          <button
                            onClick={() => onCollectPayment(invoice)}
                            title={`Collect pending balance ${formatCurrency(due)}`}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Collect</span>
                          </button>
                        )}

                        {/* 4. WhatsApp Share */}
                        {onSendBill && (
                          <button
                            onClick={() => onSendBill(invoice, "whatsapp")}
                            title="Share bill link via WhatsApp"
                            className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* 5. More Actions Dropdown */}
                        <InvoiceActionsDropdown
                          invoice={invoice}
                          onPrintThermal={() => onPrint?.(invoice, "thermal")}
                          onPrintA4={() => onPrint?.(invoice, "a4")}
                          onCollectPayment={() => onCollectPayment?.(invoice)}
                          onSendWhatsApp={() => onSendBill?.(invoice, "whatsapp")}
                          onSendEmail={() => onSendBill?.(invoice, "email")}
                          onDelete={onDelete ? () => onDelete(invoice) : undefined}
                          onRefund={onRefund && paid > 0 ? () => onRefund(invoice) : undefined}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
