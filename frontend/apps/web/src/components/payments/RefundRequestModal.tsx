"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  RotateCcw,
  Printer,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  FileText,
} from "lucide-react";
import { refundsApi, paymentApi } from "@/lib/api";

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: any[];
  initialPaymentId?: string;
  initialAmount?: string;
  onRefundSuccess: (refundData: any) => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function RefundRequestModal({
  isOpen,
  onClose,
  payments,
  initialPaymentId,
  initialAmount,
  onRefundSuccess,
  showNotification,
}: RefundRequestModalProps) {
  const [paymentId, setPaymentId] = useState(initialPaymentId || "");
  const [amount, setAmount] = useState(initialAmount || "");
  const [reasonCategory, setReasonCategory] = useState("Test Cancelled by Clinician");
  const [customReason, setCustomReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("ORIGINAL_METHOD");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialPaymentId) setPaymentId(initialPaymentId);
    if (initialAmount) setAmount(initialAmount);
  }, [initialPaymentId, initialAmount]);

  const selectedPayment = payments.find((p) => p.id === paymentId);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Print GST Credit Note / Refund Voucher Slip
  const handlePrintCreditNote = (refundData: any) => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Refund_Credit_Note_${refundData.refundNumber}</title>
          <style>
            @page { size: 80mm auto; margin: 4mm; }
            body { font-family: monospace; font-size: 11px; color: #000; padding: 4px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 13px;">LABCORE DIAGNOSTICS</div>
          <div class="center bold">GST CREDIT NOTE & REFUND VOUCHER</div>
          <div class="divider"></div>
          <div class="row"><span>Credit Note #:</span><span class="bold">${refundData.refundNumber}</span></div>
          <div class="row"><span>Original Receipt:</span><span>${refundData.receiptNumber || "—"}</span></div>
          <div class="row"><span>Date:</span><span>${new Date().toLocaleString()}</span></div>
          <div class="row"><span>Patient:</span><span class="bold">${refundData.patientName}</span></div>
          <div class="divider"></div>
          <div class="row bold" style="font-size: 13px;">
            <span>Refund Amount:</span>
            <span>₹${refundData.amount}</span>
          </div>
          <div class="row"><span>Payout Tender:</span><span>${refundData.refundMethod}</span></div>
          <div class="row"><span>Reason:</span><span>${refundData.reason}</span></div>
          <div class="divider"></div>
          <div class="center" style="font-size: 9px;">Amount refunded. Original tax invoice adjusted in accounting records.</div>
          <div style="margin-top: 25px;" class="row">
            <span>Authorizer: __________</span>
            <span>Recipient: __________</span>
          </div>
        </body>
      </html>
    `);

    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId) {
      alert("Please select a transaction to refund.");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid refund amount.");
      return;
    }

    const fullReason = customReason
      ? `${reasonCategory}: ${customReason}`
      : reasonCategory;

    try {
      setSubmitting(true);

      const refundNumber = `REF-${Date.now().toString().slice(-6)}`;

      await refundsApi
        .create({
          paymentId,
          amount: amt,
          reason: fullReason,
          refundMethod,
        })
        .catch(async () => {
          // Fallback to direct payment refund endpoint
          return await paymentApi.refund(paymentId, {
            amount: amt,
            reason: fullReason,
            method: refundMethod,
          });
        });

      const refundPayload = {
        id: refundNumber,
        refundNumber,
        paymentId,
        receiptNumber: selectedPayment?.receiptNumber || `REC-${paymentId}`,
        patientName: selectedPayment?.patientName || "Patient",
        amount: amt,
        reason: fullReason,
        refundMethod,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
      };

      showNotification(`Refund of ${formatCurrency(amt)} authorized successfully!`, "success");
      onRefundSuccess(refundPayload);
      handlePrintCreditNote(refundPayload);
      onClose();
    } catch (err: any) {
      console.error("Refund error:", err);
      alert(err.message || "Failed to process refund.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Issue Refund & Credit Note</h3>
              <p className="text-xs text-slate-500">Authorize diagnostic fee refund with audit justification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select Payment Transaction *
            </label>
            <select
              value={paymentId}
              onChange={(e) => {
                setPaymentId(e.target.value);
                const p = payments.find((x) => x.id === e.target.value);
                if (p) setAmount(String(p.amount));
              }}
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium outline-none focus:border-blue-500"
            >
              <option value="">-- Choose Transaction --</option>
              {payments.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.receiptNumber} ({p.transactionId}) - {p.patientName} - ₹{p.amount} ({p.method})
                </option>
              ))}
            </select>
          </div>

          {selectedPayment && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <strong className="text-slate-900">{selectedPayment.patientName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Original Amount Paid:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(Number(selectedPayment.amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Original Payment Mode:</span>
                <span className="font-semibold text-slate-800">{selectedPayment.method}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Refund Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 text-lg font-mono font-bold text-rose-600 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Refund Reason Category *
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-blue-500"
            >
              <option value="Test Cancelled by Clinician">Test Cancelled by Clinician</option>
              <option value="Sample Haemolysed / Recollection Refused">Sample Haemolysed / Recollection Refused</option>
              <option value="Duplicate Payment Swiped">Duplicate Payment Swiped</option>
              <option value="Patient Non-fasting / Ineligible">Patient Non-fasting / Ineligible</option>
              <option value="Service Delay / Equipment Downtime">Service Delay / Equipment Downtime</option>
              <option value="Doctor Billing Concession">Doctor Billing Concession</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Clinical / Accounting Justification Notes
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. Approved by Dr. Smith, sample discarded"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Refund Payout Mode *
            </label>
            <select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-blue-500"
            >
              <option value="ORIGINAL_METHOD">Original Tender Mode (Recommended)</option>
              <option value="CASH">💵 Cash Handover from Till</option>
              <option value="UPI">📱 Direct UPI Refund</option>
              <option value="BANK_TRANSFER">🏦 Bank NEFT / IMPS</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 active:scale-95 disabled:opacity-50 transition"
            >
              {submitting ? "Processing Refund..." : "Authorize Refund & Print Credit Note"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
