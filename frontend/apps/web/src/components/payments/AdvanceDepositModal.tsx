"use client";

import React, { useState } from "react";
import {
  X,
  Wallet,
  Printer,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { advancesApi } from "@/lib/api";

interface AdvanceDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: any[];
  initialPatientId?: string;
  onAdvanceSuccess: (advanceData: any) => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function AdvanceDepositModal({
  isOpen,
  onClose,
  patients,
  initialPatientId,
  onAdvanceSuccess,
  showNotification,
}: AdvanceDepositModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || "");
  const [patientSearch, setPatientSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Selected Patient
  const selectedPatient = patients.find(
    (p) => p.id === selectedPatientId || p.uhid === selectedPatientId
  );

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    const q = patientSearch.toLowerCase().trim();
    if (!q) return true;
    const name = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
    const uhid = (p.uhid || "").toLowerCase();
    const phone = (p.phone || "").toLowerCase();
    return name.includes(q) || uhid.includes(q) || phone.includes(q);
  }).slice(0, 15);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Print Advance Deposit Voucher
  const handlePrintVoucher = (depositData: any) => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Advance_Receipt_${depositData.receiptNo}</title>
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
          <div class="center bold">PATIENT ADVANCE DEPOSIT VOUCHER</div>
          <div class="divider"></div>
          <div class="row"><span>Receipt #:</span><span class="bold">${depositData.receiptNo}</span></div>
          <div class="row"><span>Date:</span><span>${new Date().toLocaleString()}</span></div>
          <div class="row"><span>Patient:</span><span class="bold">${depositData.patientName}</span></div>
          <div class="row"><span>UHID:</span><span>${depositData.uhid || "—"}</span></div>
          <div class="divider"></div>
          <div class="row bold" style="font-size: 13px;">
            <span>Amount Deposited:</span>
            <span>₹${depositData.amount}</span>
          </div>
          <div class="row"><span>Payment Mode:</span><span>${depositData.method}</span></div>
          <div class="row"><span>Purpose:</span><span>${depositData.reason || "Wallet Deposit"}</span></div>
          <div class="divider"></div>
          <div class="center" style="font-size: 9px;">Amount credited to patient account wallet. Usable for laboratory diagnostic tests.</div>
          <div style="margin-top: 25px;" class="row">
            <span>Cashier Sig: __________</span>
            <span>Depositor: __________</span>
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
    if (!selectedPatientId) {
      alert("Please select a patient.");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid advance deposit amount.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await advancesApi.create({
        patientId: selectedPatientId,
        amount: amt,
        reason: reason || "Advance test balance credit",
      });

      const receiptNo = `ADV-${Date.now().toString().slice(-6)}`;
      const pName = selectedPatient
        ? `${selectedPatient.firstName} ${selectedPatient.lastName}`.trim()
        : "Patient";

      const depositData = {
        receiptNo,
        amount: amt,
        patientName: pName,
        uhid: selectedPatient?.uhid,
        method,
        reason,
        date: new Date().toISOString(),
      };

      showNotification(
        `Advance deposit of ${formatCurrency(amt)} successfully credited to patient wallet!`,
        "success"
      );

      onAdvanceSuccess(depositData);
      handlePrintVoucher(depositData);
      onClose();
    } catch (err: any) {
      console.error("Advance deposit error:", err);
      alert(err.message || "Failed to record advance deposit.");
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
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Add Patient Advance</h3>
              <p className="text-xs text-slate-500">Deposit prepaid credit into patient laboratory wallet</p>
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
          {/* Patient Search & Selector */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Patient *
            </label>
            <div className="relative">
              <input
                type="text"
                value={patientSearch}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder={
                  selectedPatient
                    ? `${selectedPatient.firstName} ${selectedPatient.lastName} (${selectedPatient.uhid || "No UHID"})`
                    : "Search patient by name, UHID, or phone..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white"
              />
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setIsDropdownOpen(false);
                        setPatientSearch("");
                      }}
                      className="cursor-pointer rounded-xl p-2.5 text-xs hover:bg-blue-50 transition"
                    >
                      <div className="font-bold text-slate-900">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        UHID: {p.uhid || "—"} • Phone: {p.phone || "No phone"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching patients found.
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </div>
                <div className="text-slate-500 text-[11px]">
                  UHID: {selectedPatient.uhid || "—"} • Phone: {selectedPatient.phone || "No phone"}
                </div>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
                Verified Patient
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Advance Deposit Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 text-lg font-mono font-bold text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Payment Deposit Mode *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold outline-none focus:border-blue-500"
            >
              <option value="CASH">💵 Cash</option>
              <option value="UPI">📱 UPI / QR Code</option>
              <option value="CARD">💳 Card (POS)</option>
              <option value="NET_BANKING">🏦 Net Banking / NEFT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Purpose / Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual Health Checkup Package Advance"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
            />
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition"
            >
              {submitting ? "Crediting Wallet..." : "Credit Advance & Print Slip"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
