"use client";

import React, { useState, useMemo } from "react";
import {
  Banknote,
  Coins,
  Receipt,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  DollarSign,
  CreditCard,
  QrCode,
  Building,
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";
import type { Invoice } from "./InvoiceTable";

interface DayBookProps {
  invoices: Invoice[];
  cashierName?: string;
  onRefresh?: () => void;
}

const DENOMINATIONS = [
  { value: 2000, label: "₹2,000" },
  { value: 500, label: "₹500" },
  { value: 200, label: "₹200" },
  { value: 100, label: "₹100" },
  { value: 50, label: "₹50" },
  { value: 20, label: "₹20" },
  { value: 10, label: "₹10" },
  { value: 1, label: "Coins / Change" },
];

export default function DayBookReconciliation({
  invoices,
  cashierName = "Counter Cashier",
  onRefresh,
}: DayBookProps) {
  const [openingFloat, setOpeningFloat] = useState<number>(2000);
  const [notesCount, setNotesCount] = useState<Record<number, number>>({
    2000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    1: 0,
  });
  const [notes, setHandoverNotes] = useState<string>("");
  const [shiftClosed, setShiftClosed] = useState(false);

  // Compute collections from invoices for today
  const metrics = useMemo(() => {
    let cash = 0;
    let upi = 0;
    let card = 0;
    let cheque = 0;
    let netBanking = 0;
    let refunds = 0;
    let totalBilled = 0;

    invoices.forEach((inv) => {
      totalBilled += Number(inv.netPayable || 0);
      const paid = Number(inv.paidAmount || 0);
      const mode = (inv.paymentMode || "").toUpperCase();

      if (inv.status === "REFUNDED") {
        refunds += paid;
      } else if (mode === "CASH") {
        cash += paid;
      } else if (mode === "UPI") {
        upi += paid;
      } else if (mode === "CARD") {
        card += paid;
      } else if (mode === "CHEQUE") {
        cheque += paid;
      } else if (mode === "NET_BANKING") {
        netBanking += paid;
      } else {
        // Fallback default distribution if not explicitly specified
        if (paid > 0) cash += paid;
      }
    });

    const digitalTotal = upi + card + netBanking + cheque;
    const totalCollected = cash + digitalTotal;
    const expectedDrawerCash = openingFloat + cash - refunds;

    return {
      cash,
      upi,
      card,
      cheque,
      netBanking,
      digitalTotal,
      refunds,
      totalBilled,
      totalCollected,
      expectedDrawerCash,
    };
  }, [invoices, openingFloat]);

  // Compute physical cash counted from denomination inputs
  const physicalCashCounted = useMemo(() => {
    return Object.entries(notesCount).reduce((acc, [denom, count]) => {
      return acc + Number(denom) * (Number(count) || 0);
    }, 0);
  }, [notesCount]);

  const variance = physicalCashCounted - metrics.expectedDrawerCash;
  const isBalanced = variance === 0;

  const handleDenomChange = (val: number, count: string) => {
    const parsed = Math.max(0, parseInt(count, 10) || 0);
    setNotesCount((prev) => ({ ...prev, [val]: parsed }));
  };

  const handlePrintShiftSlip = () => {
    window.print();
  };

  const formatINR = (amt: number) => {
    return `₹${Number(amt || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Shift Status */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                Front-Desk Counter #1
              </span>
              <span className="text-xs text-slate-400">
                Date: {new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Cash Drawer & Shift Reconciliation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify physical cash in drawer against POS collection register before shift handover.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintShiftSlip}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20 hover:bg-white/20 transition-all"
            >
              <Printer className="h-4 w-4" />
              Print Shift Slip
            </button>
            <button
              onClick={() => setShiftClosed(true)}
              disabled={shiftClosed}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition-all ${
                shiftClosed
                  ? "bg-emerald-600/30 text-emerald-200 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-500"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {shiftClosed ? "Shift Closed & Signed" : "Close Shift Handover"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Collection by Modes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Drawer Cash */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Cash In Drawer
            </span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-950 mt-2">
            {formatINR(metrics.expectedDrawerCash)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-800">
            <span>Float: {formatINR(openingFloat)}</span>
            <span>Collected: {formatINR(metrics.cash)}</span>
          </div>
        </div>

        {/* UPI & QR Payments */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
              UPI / BharatQR
            </span>
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
              <QrCode className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-950 mt-2">{formatINR(metrics.upi)}</p>
          <div className="mt-2 text-[11px] text-indigo-700">Direct Bank Settlement</div>
        </div>

        {/* Card Swipes / POS */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">
              Cards & NetBanking
            </span>
            <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-950 mt-2">
            {formatINR(metrics.card + metrics.netBanking)}
          </p>
          <div className="mt-2 text-[11px] text-sky-700">EDC Terminal Reconciliation</div>
        </div>

        {/* Gross Today Collection */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total Realized
            </span>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatINR(metrics.totalCollected)}
          </p>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {invoices.length} billed invoices
          </div>
        </div>
      </div>

      {/* Main Grid: Denomination Counter & Shift Closing Slip */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Denomination Counter (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Coins className="h-5 w-5 text-indigo-600" />
                Physical Cash Denomination Counter
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Count notes in your physical till and enter below to detect discrepancies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Opening Till Float:</label>
              <input
                type="number"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(Number(e.target.value) || 0)}
                className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-right text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5">Denomination</th>
                  <th className="py-2.5 text-center">Multiplier</th>
                  <th className="py-2.5 text-center w-28">Count (Notes)</th>
                  <th className="py-2.5 text-right">Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DENOMINATIONS.map((d) => {
                  const count = notesCount[d.value] || 0;
                  const total = d.value * count;
                  return (
                    <tr key={d.value} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold text-slate-800">{d.label}</td>
                      <td className="py-2.5 text-center text-slate-400 font-mono">×</td>
                      <td className="py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={count || ""}
                          placeholder="0"
                          onChange={(e) => handleDenomChange(d.value, e.target.value)}
                          className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-center font-bold text-slate-800 focus:border-indigo-500 focus:bg-indigo-50/30 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        {formatINR(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Denomination Total & Variance Alert */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Total Physical Cash Counted:
              </span>
              <span className="text-lg font-black text-slate-900">
                {formatINR(physicalCashCounted)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
              <span className="text-slate-500">Expected in Cash Drawer:</span>
              <span className="font-semibold text-slate-800">
                {formatINR(metrics.expectedDrawerCash)}
              </span>
            </div>

            {/* Discrepancy Status */}
            <div
              className={`flex items-center justify-between rounded-lg p-3 text-xs font-semibold ${
                isBalanced
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  : variance > 0
                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                  : "bg-rose-100 text-rose-900 border border-rose-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Drawer Perfectly Balanced! (0.00 Difference)</span>
                  </>
                ) : variance > 0 ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Surplus / Excess Cash Detected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <span>Shortage Detected in Drawer</span>
                  </>
                )}
              </div>

              <span className="font-mono text-sm font-bold">
                {variance > 0 ? `+${formatINR(variance)}` : formatINR(variance)}
              </span>
            </div>
          </div>
        </div>

        {/* Shift Closure Slip / Sign-off (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Shift Handover Slip
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official closing slip for financial auditing.
              </p>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cashier Name</span>
                <span className="font-semibold text-slate-900">{cashierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Opening Till Balance</span>
                <span className="font-semibold text-slate-900">{formatINR(openingFloat)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cash Collected Today</span>
                <span className="font-semibold text-emerald-600">+{formatINR(metrics.cash)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">UPI / BharatQR Digital</span>
                <span className="font-semibold text-indigo-600">{formatINR(metrics.upi)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Card & Bank Transfers</span>
                <span className="font-semibold text-sky-600">
                  {formatINR(metrics.card + metrics.netBanking)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Refunds Processed</span>
                <span className="font-semibold text-rose-600">-{formatINR(metrics.refunds)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-200 font-bold text-sm">
                <span>Net Shift Revenue</span>
                <span className="text-slate-900">{formatINR(metrics.totalCollected)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Cashier Handover Remarks:
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                placeholder="E.g. Handed over ₹7,000 cash to Supervisor Sharma. UPI and EDC batches settled."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center text-xs">
              <div className="rounded-lg border border-dashed border-slate-200 p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Cashier Sign
                </div>
                <div className="mt-4 font-script text-slate-700 font-semibold italic">
                  {cashierName}
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-slate-200 p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Supervisor Sign
                </div>
                <div className="mt-4 text-[11px] text-slate-400">Verified & Approved</div>
              </div>
            </div>

            <button
              onClick={handlePrintShiftSlip}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Download & Print Day Book Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
