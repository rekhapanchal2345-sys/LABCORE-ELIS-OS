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
  User,
  DollarSign
} from "lucide-react";
import { advancesApi } from "@/lib/api";
import { formatIndianRupees } from "@/lib/money";
import { formatPatientFullName } from "@/lib/patient-utils";

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
    return formatIndianRupees(val || 0);
  };

  // Print Advance Receipt Voucher
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
          <div class="center bold" style="font-size: 13px;">LABCORE DIAGNOSTICS & HOSPITAL OS</div>
          <div class="center bold">PATIENT ADVANCE DEPOSIT VOUCHER</div>
          <div class="center" style="font-size: 9px;">PRE-PAID LAB CREDIT</div>
          <div class="divider"></div>
          <div class="row"><span>Voucher No:</span><span class="bold">${depositData.receiptNo}</span></div>
          <div class="row"><span>Date:</span><span>${new Date().toLocaleString()}</span></div>
          <div class="row"><span>Patient:</span><span class="bold">${depositData.patientName}</span></div>
          <div class="row"><span>UHID:</span><span>${depositData.uhid || "—"}</span></div>
          <div class="divider"></div>
          <div class="row bold" style="font-size: 13px;">
            <span>Advance Deposited:</span>
            <span>₹${depositData.amount.toLocaleString("en-IN")}</span>
          </div>
          <div class="row"><span>Mode of Payment:</span><span>${depositData.method}</span></div>
          ${depositData.reason ? `<div class="row"><span>Purpose:</span><span>${depositData.reason}</span></div>` : ""}
          <div class="divider"></div>
          <div class="center" style="font-size: 9px; margin-top: 8px;">
            This advance balance is automatically redeemable against upcoming diagnostic requisitions.
          </div>
          <div style="margin-top: 25px;" class="row">
            <span>Depositor: __________</span>
            <span>Cashier: __________</span>
          </div>
          <div class="center" style="margin-top: 10px; font-size: 8px;">THANK YOU • LABCORE FINANCE</div>
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
      alert("Please select a patient to credit advance deposit.");
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
        ? formatPatientFullName(selectedPatient)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Add Patient Advance</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Deposit prepaid credit into patient laboratory wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
              Select Patient <span className="text-rose-400">*</span>
            </label>

            {selectedPatient ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-8 w-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    <User className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {formatPatientFullName(selectedPatient)}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedPatient.uhid} • {selectedPatient.phone || "No phone"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatientId("");
                    setIsDropdownOpen(true);
                  }}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient by name, UHID, or phone number..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500"
                />

                {isDropdownOpen && (
                  <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl">
                    {filteredPatients.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-500">
                        No matching patients found
                      </div>
                    ) : (
                      filteredPatients.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setIsDropdownOpen(false);
                            setPatientSearch("");
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">
                              {formatPatientFullName(p)}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {p.uhid} • {p.phone || "No phone"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-blue-400">Select</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Deposit Amount (₹) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 2500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-black text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Payment Mode
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500"
              >
                <option value="CASH" className="bg-slate-900">Cash Till</option>
                <option value="UPI" className="bg-slate-900">UPI / QR Code</option>
                <option value="CARD" className="bg-slate-900">Credit / Debit Card</option>
                <option value="NET_BANKING" className="bg-slate-900">Net Banking</option>
                <option value="CHEQUE" className="bg-slate-900">Bank Cheque</option>
              </select>
            </div>
          </div>

          {/* Purpose / Reason */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
              Deposit Purpose / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Advance deposit for comprehensive cardiac profile"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Credit Patient Advance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
