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
  ChevronLeft,
  ExternalLink,
  Banknote,
  Smartphone,
  Layers,
  Eye,
  EyeOff,
  UserCheck,
  HelpCircle,
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
    status?: string;
    transactionId?: string;
    paidAt: string;
    receivedBy?: string;
  }>;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  loading?: boolean;
  selectedIds?: (string | number)[];
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
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

// Normalize Doctor Name: Remove redundant duplicate "Dr." prefixes
function formatDoctorName(name?: string): string {
  if (!name) return "";
  const cleaned = name.trim().replace(/^(dr\.?|dr\b)\s+/i, "").replace(/^(dr\.?|dr\b)\s+/i, "").trim();
  return cleaned ? `Dr. ${cleaned}` : "";
}

// Mask Phone Number for DPDP Act 2023 Compliance
function maskPhoneNumber(phone?: string, unmask = false): string {
  if (!phone) return "";
  if (unmask) return phone;
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length >= 10) {
    const prefix = cleaned.slice(0, Math.max(2, cleaned.length - 7));
    const end = cleaned.slice(-2);
    return `${prefix}•••••${end}`;
  }
  return phone;
}

function getPaymentStatusBadge(status?: string, pendingAmt?: number) {
  const value = status?.toUpperCase();

  if (value === "PAID" || value === "COMPLETED" || (pendingAmt !== undefined && pendingAmt <= 0)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Fully Paid
      </span>
    );
  }

  if (value === "PARTIAL" || (pendingAmt !== undefined && pendingAmt > 0 && status !== "PENDING")) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/60 px-2.5 py-0.5 text-xs font-bold text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Partially Paid
      </span>
    );
  }

  if (value === "PENDING" || value === "OVERDUE" || value === "UNPAID") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/60 px-2.5 py-0.5 text-xs font-bold text-rose-300">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        Unpaid / Due
      </span>
    );
  }

  if (value === "REFUNDED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-purple-300">
        Refunded
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-slate-400">
      {status || "Registered"}
    </span>
  );
}

function PaymentModeCell({ invoice, isPaid }: { invoice: Invoice; isPaid: boolean }) {
  const payments = (invoice.payments || []).filter(
    (p) => p.status === "PAID" || !p.status
  );

  // Multi-tender split payment
  if (payments.length > 1) {
    return (
      <div className="relative group/tender inline-block">
        <span className="inline-flex items-center gap-1 rounded-xl border border-violet-500/30 bg-violet-950/50 px-2.5 py-1 text-xs font-bold text-violet-300 cursor-pointer shadow-sm">
          <Layers className="h-3 w-3 text-violet-400" />
          Split ({payments.length})
        </span>

        {/* Multi-tender popover tooltip */}
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tender:flex flex-col z-30 w-64 rounded-2xl bg-slate-950/95 backdrop-blur-md text-white p-3 shadow-2xl text-[11px] border border-slate-800 pointer-events-none animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between font-bold text-slate-300 pb-1.5 border-b border-slate-800">
            <span>Split Tender Tenders</span>
            <span className="text-[10px] text-violet-400 font-normal">
              {payments.length} Payments
            </span>
          </div>
          <div className="space-y-1.5 py-2">
            {payments.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  <span className="font-semibold text-slate-300">{p.method || "CASH"}</span>
                  {p.paidAt && (
                    <span className="text-[9px] text-slate-400">
                      ({new Date(p.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold text-violet-200">
                  {formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-emerald-400">
            <span>Total Realized:</span>
            <span className="font-mono">
              {formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount || 0), 0))}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const resolvedMode =
    invoice.paymentMode?.toUpperCase() ||
    (payments.length === 1 ? payments[0].method?.toUpperCase() : undefined) ||
    (isPaid ? "CASH" : undefined);

  if (!resolvedMode) {
    return <span className="text-slate-500 text-xs italic">Unpaid</span>;
  }

  if (resolvedMode === "UPI" || resolvedMode === "GPAY" || resolvedMode === "PHONEPE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/50 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
        <Smartphone className="h-3 w-3 text-cyan-400" />
        UPI
      </span>
    );
  }

  if (resolvedMode === "CASH") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
        <Banknote className="h-3 w-3 text-emerald-400" />
        Cash
      </span>
    );
  }

  if (resolvedMode === "CARD") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-950/50 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
        <CreditCard className="h-3 w-3 text-sky-400" />
        Card / POS
      </span>
    );
  }

  if (resolvedMode === "NET_BANKING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/50 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
        NetBanking
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
      {resolvedMode}
    </span>
  );
}

export default function InvoiceTable({
  invoices,
  loading = false,
  selectedIds = [],
  pagination,
  onPageChange,
  onLimitChange,
  onToggleSelect,
  onSelectAll,
  onRowClick,
  onDelete,
  onCollectPayment,
  onPrint,
  onSendBill,
  onRefund,
}: InvoiceTableProps) {
  const [unmaskedRows, setUnmaskedRows] = useState<Record<string | number, boolean>>({});
  const isAllSelected = invoices.length > 0 && selectedIds.length === invoices.length;

  const toggleUnmaskPhone = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnmaskedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/80 transition-all">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800/80 text-left text-sm">
          <thead className="bg-slate-900/90 text-slate-300 backdrop-blur-md">
            <tr className="text-slate-300 text-[11px] font-bold uppercase tracking-wider">
              {onToggleSelect && (
                <th className="px-3.5 py-3.5 w-10 text-center border-r border-slate-800/80">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
                  />
                </th>
              )}

              <th className="px-4 py-3.5 text-left border-r border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Invoice #</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">
                  Series + Order Ref
                </span>
              </th>
              <th className="px-4 py-3.5 text-left border-r border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Date &amp; Time</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">
                  Creation Timestamp
                </span>
              </th>
              <th className="px-4 py-3.5 text-left border-r border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Patient &amp; Referral (DPDP)</span>
                </div>
                <span className="block text-[9px] font-normal normal-case text-slate-400">
                  UHID + Masked Contact
                </span>
              </th>
              <th className="px-4 py-3.5 text-right border-r border-slate-800/80">Gross (₹)</th>
              <th className="px-4 py-3.5 text-right border-r border-slate-800/80">Tax &amp; Disc</th>
              <th className="px-4 py-3.5 text-right border-r border-slate-800/80">Net Bill (₹)</th>
              <th className="px-4 py-3.5 text-left border-r border-slate-800/80">Status</th>
              <th className="px-4 py-3.5 text-left border-r border-slate-800/80">Payment Mode</th>
              <th className="px-4 py-3.5 text-center min-w-[220px]">Actions (Quick Print)</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/70 text-xs">
            {loading ? (
              Array.from({ length: 5 }).map((_, r) => (
                <tr key={r} className="animate-pulse bg-slate-950">
                  <td colSpan={10} className="px-4 py-4">
                    <div className="h-5 bg-slate-900 rounded-lg w-full" />
                  </td>
                </tr>
              ))
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-16 text-center bg-slate-950">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-sm mb-3">
                    <Receipt className="h-7 w-7" />
                  </div>
                  <p className="text-base font-bold text-white">
                    No Diagnostic Invoices Found
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
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
                const isUnmasked = Boolean(unmaskedRows[invoice.id]);
                const doctorDisplay = formatDoctorName(invoice.doctorName);

                return (
                  <tr
                    key={invoice.id}
                    onClick={() => onRowClick && onRowClick(invoice)}
                    className={`group transition-colors duration-150 ${
                      isSelected
                        ? "bg-slate-900/90 border-l-4 border-l-cyan-500"
                        : isPaid
                        ? "bg-slate-950 hover:bg-slate-900/60 border-l-4 border-l-emerald-500"
                        : due > 0 && paid > 0
                        ? "bg-slate-950 hover:bg-slate-900/60 border-l-4 border-l-amber-500"
                        : "bg-slate-950 hover:bg-slate-900/60 border-l-4 border-l-rose-500"
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
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Invoice Monospace Series */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-400 transition">
                          {invoice.invoiceNumber || `INV-${invoice.id}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {invoice.orderNumber ? `Ord: ${invoice.orderNumber}` : ""}
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">
                        {formatDateTime(invoice.createdAt)}
                      </div>
                    </td>

                    {/* Patient & Doctor with DPDP Phone Masking */}
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold text-xs shrink-0 shadow-sm ring-1 ring-cyan-500/30">
                          {(invoice.patientName || "P")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-cyan-400 transition">
                            {invoice.patientName || "Walk-in Patient"}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono font-semibold text-slate-300">
                              {invoice.patientUhid || "LC-000001"}
                            </span>
                            {invoice.patientPhone && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span
                                  className="font-mono text-slate-400 inline-flex items-center gap-1"
                                  title="DPDP Act 2023 Masked - Click eye to reveal"
                                >
                                  {maskPhoneNumber(invoice.patientPhone, isUnmasked)}
                                  <button
                                    type="button"
                                    onClick={(e) => toggleUnmaskPhone(invoice.id, e)}
                                    className="text-slate-500 hover:text-cyan-300 p-0.5 rounded transition"
                                    title={isUnmasked ? "Mask Phone" : "Unmask Phone (DPDP Act)"}
                                  >
                                    {isUnmasked ? (
                                      <EyeOff className="h-3 w-3" />
                                    ) : (
                                      <Eye className="h-3 w-3" />
                                    )}
                                  </button>
                                </span>
                              </>
                            )}
                          </div>
                          {doctorDisplay && (
                            <div className="text-[10px] font-medium text-cyan-400 mt-0.5">
                              {doctorDisplay}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Gross */}
                    <td className="px-4 py-4 text-right font-mono font-medium text-slate-300">
                      {formatCurrency(total)}
                    </td>

                    {/* Tax & Discount */}
                    <td className="px-4 py-4 text-right">
                      <div className="text-[11px] space-y-0.5 font-mono">
                        {discount > 0 && (
                          <div className="text-emerald-400 font-medium">
                            -{formatCurrency(discount)}
                          </div>
                        )}
                        {gst > 0 && (
                          <div className="text-cyan-400">
                            +{formatCurrency(gst)} GST
                          </div>
                        )}
                        {discount === 0 && gst === 0 && (
                          <span className="text-slate-500">—</span>
                        )}
                      </div>
                    </td>

                    {/* Net Bill & Balance Due */}
                    <td className="px-4 py-4 text-right">
                      <div className="font-mono text-sm font-black text-white">
                        {formatCurrency(netPayable)}
                      </div>
                      {due > 0 ? (
                        <div className="text-[10px] font-bold text-rose-400 font-mono">
                          Due: {formatCurrency(due)}
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-emerald-400 font-mono">
                          Paid: {formatCurrency(paid || netPayable)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(invoice.paymentStatus || invoice.status, due)}
                    </td>

                    {/* Payment Mode / Multi-tender Split */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <PaymentModeCell invoice={invoice} isPaid={isPaid} />
                    </td>

                    {/* Actions: Quick Thermal / A4 Print */}
                    <td
                      className="px-4 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Quick Thermal POS Print Button */}
                        <button
                          onClick={() => onPrint?.(invoice, "thermal")}
                          title="Print Thermal Receipt (80mm/58mm POS)"
                          className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-950/60 px-2.5 py-1.5 text-xs font-bold text-amber-300 shadow-sm hover:bg-amber-900/60 transition-all"
                        >
                          <Receipt className="h-3.5 w-3.5 text-amber-400" />
                          <span>Thermal</span>
                        </button>

                        {/* 2. Quick A4 GST Invoice Print Button */}
                        <button
                          onClick={() => onPrint?.(invoice, "a4")}
                          title="Print A4 GST Tax Invoice (Official NABL Copy)"
                          className="flex items-center gap-1 rounded-xl border border-cyan-500/30 bg-cyan-950/60 px-2.5 py-1.5 text-xs font-bold text-cyan-300 shadow-sm hover:bg-cyan-900/60 transition-all"
                        >
                          <FileText className="h-3.5 w-3.5 text-cyan-400" />
                          <span>A4 GST</span>
                        </button>

                        {/* 3. Collect Payment (if due > 0) */}
                        {due > 0 && onCollectPayment && (
                          <button
                            onClick={() => onCollectPayment(invoice)}
                            title={`Collect pending balance ${formatCurrency(due)}`}
                            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all"
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
                            className="flex items-center justify-center h-8 w-8 rounded-xl border border-slate-800 bg-slate-900/80 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-500/40 transition-all shadow-sm"
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

      {/* Enterprise Server Pagination Bar */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 bg-slate-900/90 px-5 py-3.5 text-xs text-slate-300">
          <div className="flex items-center gap-3 text-slate-400">
            <span>
              Showing{" "}
              <strong className="text-white font-bold font-mono">
                {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-white font-bold font-mono">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{" "}
              of{" "}
              <strong className="text-white font-bold font-mono">
                {pagination.total}
              </strong>{" "}
              invoices
            </span>

            {onLimitChange && (
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800">
                <span className="text-slate-400">Rows per page:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-2 py-1 text-xs font-semibold text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 font-semibold text-slate-300 shadow-sm hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-mono font-bold text-slate-200">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </span>

            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 font-semibold text-slate-300 shadow-sm hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
