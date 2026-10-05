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
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
} from "lucide-react";
import type { Invoice } from "./InvoiceTable";
import { showInvoiceToast } from "./InvoiceToast";

interface DayBookProps {
  invoices: Invoice[];
  cashierName?: string;
  onRefresh?: () => void;
}

const DENOMINATIONS = [
  { value: 500, label: "₹500 Notes" },
  { value: 200, label: "₹200 Notes" },
  { value: 100, label: "₹100 Notes" },
  { value: 50, label: "₹50 Notes" },
  { value: 20, label: "₹20 Notes" },
  { value: 10, label: "₹10 Notes" },
  { value: 5, label: "₹5 Coins / Notes" },
  { value: 2, label: "₹2 Coins" },
  { value: 1, label: "₹1 Coins" },
];

export default function DayBookReconciliation({
  invoices,
  cashierName = "Counter Cashier",
  onRefresh,
}: DayBookProps) {
  const [openingFloat, setOpeningFloat] = useState<number>(2000);
  const [counterId, setCounterId] = useState<string>("Counter #1 (Main OPD)");
  const [shiftName, setShiftName] = useState<string>("Morning Shift (08:00 - 16:00)");
  const [isBlindCount, setIsBlindCount] = useState<boolean>(true);
  const [blindCountRevealed, setBlindCountRevealed] = useState<boolean>(false);

  const [notesCount, setNotesCount] = useState<Record<number, number>>({
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    2: 0,
    1: 0,
  });
  const [notes, setHandoverNotes] = useState<string>("");
  const [shiftClosed, setShiftClosed] = useState(false);

  // Compute exact collections from all invoices by parsing individual payments array
  const metrics = useMemo(() => {
    let cash = 0;
    let upi = 0;
    let card = 0;
    let cheque = 0;
    let netBanking = 0;
    let refunds = 0;
    let totalBilled = 0;
    let totalTransactions = 0;

    invoices.forEach((inv) => {
      totalBilled += Number(inv.netPayable || inv.totalAmount || 0);

      const payments = inv.payments || [];
      if (payments.length > 0) {
        payments.forEach((p) => {
          const amt = Number(p.amount || 0);
          const method = (p.method || "").toUpperCase();
          const status = (p.status || "").toUpperCase();

          if (status === "REFUNDED" || amt < 0) {
            refunds += Math.abs(amt);
          } else if (status === "PAID" || !status) {
            totalTransactions++;
            if (method === "CASH") cash += amt;
            else if (method === "UPI" || method === "GPAY" || method === "PHONEPE") upi += amt;
            else if (method === "CARD" || method === "POS") card += amt;
            else if (method === "CHEQUE") cheque += amt;
            else if (method === "NET_BANKING") netBanking += amt;
            else cash += amt;
          }
        });
      } else {
        const paid = Number(inv.paidAmount || 0);
        const mode = (inv.paymentMode || "").toUpperCase();

        if (inv.status === "REFUNDED") {
          refunds += paid;
        } else if (paid > 0) {
          totalTransactions++;
          if (mode === "CASH") cash += paid;
          else if (mode === "UPI") upi += paid;
          else if (mode === "CARD") card += paid;
          else if (mode === "CHEQUE") cheque += paid;
          else if (mode === "NET_BANKING") netBanking += paid;
          else cash += paid;
        }
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
      totalTransactions,
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

  const handlePrintShiftSlip = (format: "thermal" | "a4") => {
    if (format === "thermal") {
      showInvoiceToast("info", "Printing 80mm POS Till Handover Slip...");
    }
    window.print();
  };

  const handleExportCsv = () => {
    const rows = [
      ["Labcore ELIS - Daily Cash Drawer & Shift Handover Report"],
      [`Counter: ${counterId}`, `Shift: ${shiftName}`, `Date: ${new Date().toISOString().slice(0, 10)}`],
      [`Cashier: ${cashierName}`],
      [""],
      ["Metric", "Amount (INR)"],
      ["Opening Till Float", openingFloat],
      ["Cash Collections", metrics.cash],
      ["UPI / BharatQR", metrics.upi],
      ["Cards / POS Terminal", metrics.card],
      ["NetBanking & Cheques", metrics.netBanking + metrics.cheque],
      ["Refunds Deducted", metrics.refunds],
      ["Expected Cash in Drawer", metrics.expectedDrawerCash],
      ["Physical Cash Counted", physicalCashCounted],
      ["Discrepancy / Variance", variance],
      [""],
      ["Denomination Breakdown:"],
      ...DENOMINATIONS.map((d) => [d.label, notesCount[d.value] || 0, d.value * (notesCount[d.value] || 0)]),
      [""],
      [`Handover Remarks: "${notes || "None"}"`],
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DayBook_Shift_Close_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showInvoiceToast("success", "Exported Day Book to CSV");
  };

  const formatINR = (amt: number) => {
    return `₹${Number(amt || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Shift Status & Counter Selection */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                Live Till Register
              </span>
              <span className="text-xs text-slate-400">
                Date: {new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Multi-Counter Day Book & Shift Close
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict blind cash counting, tender reconciliation, and supervisor sign-off under ISO 15189 audit guidelines.
            </p>
          </div>

          {/* Counter and Shift Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={counterId}
              onChange={(e) => setCounterId(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="Counter #1 (Main OPD)" className="text-slate-900">
                Counter #1 (Main OPD)
              </option>
              <option value="Counter #2 (Emergency 24x7)" className="text-slate-900">
                Counter #2 (Emergency 24x7)
              </option>
              <option value="Counter #3 (IPD Fast-Track)" className="text-slate-900">
                Counter #3 (IPD Fast-Track)
              </option>
            </select>

            <select
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="Morning Shift (08:00 - 16:00)" className="text-slate-900">
                Morning Shift (08:00 - 16:00)
              </option>
              <option value="Evening Shift (16:00 - 00:00)" className="text-slate-900">
                Evening Shift (16:00 - 00:00)
              </option>
              <option value="Night Shift (00:00 - 08:00)" className="text-slate-900">
                Night Shift (00:00 - 08:00)
              </option>
            </select>

            <button
              onClick={handleExportCsv}
              title="Export Day Book to CSV"
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20 hover:bg-white/20 transition-all"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Collection by Tender Modes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Drawer Cash */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Cash In Till Drawer
            </span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-950 mt-2 font-mono">
            {formatINR(metrics.expectedDrawerCash)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-800">
            <span>Opening: {formatINR(openingFloat)}</span>
            <span>Collected: {formatINR(metrics.cash)}</span>
          </div>
        </div>

        {/* UPI & QR Payments */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
              UPI & BharatQR
            </span>
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
              <QrCode className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-950 mt-2 font-mono">{formatINR(metrics.upi)}</p>
          <div className="mt-2 text-[11px] text-indigo-700">Direct Bank Settlement</div>
        </div>

        {/* Card Swipes / POS */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">
              EDC Card Terminal
            </span>
            <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-950 mt-2 font-mono">
            {formatINR(metrics.card + metrics.netBanking)}
          </p>
          <div className="mt-2 text-[11px] text-sky-700">POS Batch Reconciliation</div>
        </div>

        {/* Gross Shift Realized */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total Shift Realized
            </span>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {formatINR(metrics.totalCollected)}
          </p>
          <div className="mt-2 text-[11px] text-slate-500">
            {metrics.totalTransactions} Settled Payments
          </div>
        </div>
      </div>

      {/* Main Grid: Denomination Counter & Shift Closing Slip */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Denomination Counter with Blind Count Mode (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="h-5 w-5 text-indigo-600" />
                  Physical Cash Count & Denominations
                </h3>
                {isBlindCount && (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Blind Count Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Count notes in your physical till and enter count below.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Float:</label>
                <input
                  type="number"
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(Number(e.target.value) || 0)}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-right text-xs font-mono font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isBlindCount && !blindCountRevealed) {
                    setBlindCountRevealed(true);
                  } else {
                    setIsBlindCount(!isBlindCount);
                    setBlindCountRevealed(false);
                  }
                }}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title={isBlindCount ? "Toggle blind count comparison" : "Enable blind count security"}
              >
                {isBlindCount && !blindCountRevealed ? (
                  <>
                    <Eye className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Reveal Check</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                    <span>Blind Mode</span>
                  </>
                )}
              </button>
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
                          className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-center font-mono font-bold text-slate-800 focus:border-indigo-500 focus:bg-indigo-50/30 focus:outline-none"
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
              <span className="text-lg font-black text-slate-900 font-mono">
                {formatINR(physicalCashCounted)}
              </span>
            </div>

            {(!isBlindCount || blindCountRevealed) && (
              <>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                  <span className="text-slate-500">Expected in Cash Drawer:</span>
                  <span className="font-semibold text-slate-800 font-mono">
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
                        <span>Surplus / Excess Cash Detected in Drawer</span>
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
              </>
            )}
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
                Official closing slip for audit & finance handover.
              </p>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Counter / Terminal</span>
                <span className="font-semibold text-slate-900">{counterId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cashier on Duty</span>
                <span className="font-semibold text-slate-900">{cashierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Opening Till Balance</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(openingFloat)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cash Collected Today</span>
                <span className="font-mono font-semibold text-emerald-600">+{formatINR(metrics.cash)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">UPI / BharatQR Digital</span>
                <span className="font-mono font-semibold text-indigo-600">{formatINR(metrics.upi)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Card & Bank Transfers</span>
                <span className="font-mono font-semibold text-sky-600">
                  {formatINR(metrics.card + metrics.netBanking)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Refunds Processed</span>
                <span className="font-mono font-semibold text-rose-600">-{formatINR(metrics.refunds)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-200 font-bold text-sm">
                <span>Net Shift Revenue</span>
                <span className="font-mono text-slate-900">{formatINR(metrics.totalCollected)}</span>
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
                placeholder="E.g. Handed over physical cash envelope to supervisor. EDC batch settled."
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
                <div className="mt-4 text-slate-700 font-semibold italic">
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

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePrintShiftSlip("thermal")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors shadow-sm"
              >
                <Receipt className="h-3.5 w-3.5 text-amber-600" />
                Thermal Slip (80mm)
              </button>

              <button
                onClick={() => handlePrintShiftSlip("a4")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                Print A4 Audit Slip
              </button>
            </div>

            <button
              onClick={() => {
                setShiftClosed(true);
                showInvoiceToast("success", `Shift closed and verified for ${counterId}`);
              }}
              disabled={shiftClosed}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold shadow transition-all ${
                shiftClosed
                  ? "bg-emerald-100 text-emerald-800 cursor-not-allowed border border-emerald-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-500"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {shiftClosed ? "✓ Shift Handover Completed & Locked" : "Complete Shift Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
