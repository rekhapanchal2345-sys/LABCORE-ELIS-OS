"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Printer,
  CreditCard,
  Send,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { Invoice } from "./InvoiceTable";

interface InvoiceQuickDrawerProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onCollectPayment?: (invoice: Invoice) => void;
  onPrint?: (invoice: Invoice, type: "thermal" | "a4") => void;
  onSendBill?: (invoice: Invoice, method: "whatsapp" | "email") => void;
  onRefund?: (invoice: Invoice) => void;
}

export default function InvoiceQuickDrawer({
  invoice,
  isOpen,
  onClose,
  onCollectPayment,
  onPrint,
  onSendBill,
  onRefund,
}: InvoiceQuickDrawerProps) {
  const [showQrModal, setShowQrModal] = useState(false);

  if (!isOpen || !invoice) return null;

  const totalAmount = Number(invoice.totalAmount || 0);
  const discount = Number(invoice.discount || 0);
  const gstAmount = Number(invoice.gstAmount || 0);
  const netPayable = Number(invoice.netPayable || 0);
  const paidAmount = Number(invoice.paidAmount || 0);
  const pendingAmount = Number(invoice.pendingAmount ?? Math.max(0, netPayable - paidAmount));
  const isPaid = pendingAmount <= 0;

  // Generate standard Indian UPI URI for instant counter QR code
  const upiId = "labcore@upi";
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    "LabCore Diagnostics"
  )}&am=${pendingAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `Inv ${invoice.invoiceNumber || ""}`
  )}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    upiPayUri
  )}`;

  const formatINR = (amount: number) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300 ease-out sm:border-l sm:border-gray-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 ring-1 ring-white/10">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  {invoice.invoiceNumber || "Invoice Details"}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isPaid
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
                      : pendingAmount > 0 && paidAmount > 0
                      ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30"
                      : "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30"
                  }`}
                >
                  {invoice.paymentStatus || (isPaid ? "PAID" : "PENDING")}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Order #{invoice.orderNumber || "—"} • Created:{" "}
                {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString("en-IN") : "—"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Action Pills Bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200/80">
            {!isPaid && onCollectPayment && (
              <button
                onClick={() => onCollectPayment(invoice)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Collect ₹{pendingAmount.toFixed(0)}
              </button>
            )}

            {onPrint && (
              <>
                <button
                  onClick={() => onPrint(invoice, "thermal")}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 text-indigo-600" />
                  Thermal Slip
                </button>
                <button
                  onClick={() => onPrint(invoice, "a4")}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-600" />
                  A4 Tax Invoice
                </button>
              </>
            )}

            {onSendBill && (
              <button
                onClick={() => onSendBill(invoice, "whatsapp")}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
              >
                <Send className="h-3.5 w-3.5 text-emerald-600" />
                WhatsApp
              </button>
            )}

            {paidAmount > 0 && onRefund && (
              <button
                onClick={() => onRefund(invoice)}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Refund
              </button>
            )}
          </div>

          {/* Financial Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                  Total Billable
                </span>
                <p className="text-xl font-black text-slate-900">{formatINR(netPayable)}</p>
                <span className="text-[11px] text-slate-500">
                  Base: {formatINR(totalAmount)} • Tax: {formatINR(gstAmount)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                  {isPaid ? "Status" : "Outstanding Due"}
                </span>
                {isPaid ? (
                  <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold mt-1">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Settled In Full</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xl font-black text-rose-600">{formatINR(pendingAmount)}</p>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      Paid: {formatINR(paidAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tax & Discount Breakdown */}
            <div className="grid grid-cols-4 gap-2 pt-3 text-center text-xs">
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <div className="text-[10px] text-slate-400">Subtotal</div>
                <div className="font-semibold text-slate-800">{formatINR(totalAmount)}</div>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <div className="text-[10px] text-slate-400">Discount</div>
                <div className="font-semibold text-rose-600">
                  {discount > 0 ? `-${formatINR(discount)}` : "₹0"}
                </div>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <div className="text-[10px] text-slate-400">GST (18%)</div>
                <div className="font-semibold text-indigo-600">{formatINR(gstAmount)}</div>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <div className="text-[10px] text-slate-400">Mode</div>
                <div className="font-semibold text-slate-800">{invoice.paymentMode || "—"}</div>
              </div>
            </div>
          </div>

          {/* Patient & Doctor Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Patient Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2.5 text-indigo-700">
                <User className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Patient Details</h3>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {invoice.patientName || "Walk-in Patient"}
              </p>
              {invoice.patientUhid && (
                <p className="text-xs font-mono text-indigo-600 font-medium mt-0.5">
                  UHID: {invoice.patientUhid}
                </p>
              )}
              {invoice.patientPhone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span>{invoice.patientPhone}</span>
                </div>
              )}
              {invoice.patientEmail && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span className="truncate">{invoice.patientEmail}</span>
                </div>
              )}
            </div>

            {/* Doctor Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2.5 text-emerald-700">
                <Building className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Referring Doctor</h3>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {invoice.doctorName || "Direct Walk-in / Self"}
              </p>
              {invoice.doctorEmail && (
                <p className="text-xs text-slate-500 mt-1">{invoice.doctorEmail}</p>
              )}
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>NABL & ISO Verified Diagnostic</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Test Items List */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Diagnostic Services ({(invoice as any).items?.length || invoice.samples?.length || 1})
              </h3>
              <span className="text-[11px] font-mono text-slate-500">SAC Code: 999312</span>
            </div>

            <div className="divide-y divide-slate-100">
              {((invoice as any).items || []).length > 0 ? (
                ((invoice as any).items || []).map((item: any, idx: number) => (
                  <div key={item.id || idx} className="flex items-center justify-between px-4 py-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{item.testName || "Laboratory Investigation"}</p>
                      {item.testCode && (
                        <p className="text-[10px] font-mono text-slate-400">Code: {item.testCode}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatINR(item.total || item.unitPrice || 0)}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-slate-600 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">Diagnostic Investigation Services</p>
                    <p className="text-[10px] text-slate-400">Order #{invoice.orderNumber || "—"}</p>
                  </div>
                  <div className="font-bold text-slate-900">{formatINR(totalAmount)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Receipts Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Payment Transactions
              </h3>
              <span className="text-xs font-semibold text-emerald-600">
                Realized: {formatINR(paidAmount)}
              </span>
            </div>

            {((invoice as any).payments || []).length > 0 ? (
              <div className="space-y-2">
                {((invoice as any).payments || []).map((p: any, idx: number) => (
                  <div
                    key={p.id || idx}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-semibold text-slate-800">
                          {p.method || "CASH"} Payment • {formatINR(p.amount)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.paidAt ? new Date(p.paidAt).toLocaleString("en-IN") : "—"}{" "}
                          {p.transactionId && `• Ref: ${p.transactionId}`}
                        </div>
                      </div>
                    </div>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      SUCCESS
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50/60 p-3 text-center text-xs text-amber-800 border border-amber-200/60">
                No payment transactions recorded yet. Balance of {formatINR(pendingAmount)} is pending.
              </div>
            )}
          </div>

          {/* Instant QR Code Counter Pay Card */}
          {!isPaid && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-indigo-600" />
                  Instant BharatQR / UPI Pay
                </h4>
                <p className="text-[11px] text-indigo-700/80 mt-0.5">
                  Patient can scan directly with Google Pay, PhonePe, or Paytm
                </p>
                <div className="mt-2 text-xs font-mono font-bold text-indigo-900">
                  Amount: {formatINR(pendingAmount)}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <img
                  src={qrImageUrl}
                  alt="UPI QR Code"
                  className="h-20 w-20 rounded-lg border border-indigo-200 bg-white p-1 shadow-sm"
                />
                <span className="text-[9px] font-semibold text-indigo-600 mt-1 uppercase">
                  Scan to Pay
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Invoice ID: <span className="font-mono text-slate-600">{invoice.id}</span>
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </>
  );
}
