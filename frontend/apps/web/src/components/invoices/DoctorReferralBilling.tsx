"use client";

import React, { useState, useMemo } from "react";
import {
  Stethoscope,
  Building,
  DollarSign,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Percent,
  Search,
  ArrowUpRight,
  Receipt,
  Users,
} from "lucide-react";
import type { Invoice } from "./InvoiceTable";

interface ReferralProps {
  invoices: Invoice[];
}

interface DoctorSummary {
  doctorName: string;
  doctorEmail?: string;
  totalInvoices: number;
  totalBilled: number;
  totalPaid: number;
  commissionRate: number; // e.g. 15%
  commissionEarned: number;
}

export default function DoctorReferralBilling({ invoices }: ReferralProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultRate, setDefaultRate] = useState<number>(15);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSummary | null>(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);

  // Group invoices by referring doctor
  const doctorSummaries = useMemo<DoctorSummary[]>(() => {
    const map = new Map<string, { totalInvoices: number; totalBilled: number; totalPaid: number; email?: string }>();

    invoices.forEach((inv) => {
      const docName = inv.doctorName?.trim() || "Direct / Self Walk-in";
      const existing = map.get(docName) || {
        totalInvoices: 0,
        totalBilled: 0,
        totalPaid: 0,
        email: inv.doctorEmail,
      };

      existing.totalInvoices += 1;
      existing.totalBilled += Number(inv.netPayable || inv.totalAmount || 0);
      existing.totalPaid += Number(inv.paidAmount || 0);
      if (!existing.email && inv.doctorEmail) existing.email = inv.doctorEmail;

      map.set(docName, existing);
    });

    return Array.from(map.entries()).map(([name, data]) => {
      // Don't calculate referral commissions for self walk-in
      const rate = name === "Direct / Self Walk-in" ? 0 : defaultRate;
      const commissionEarned = (data.totalPaid * rate) / 100;

      return {
        doctorName: name,
        doctorEmail: data.email,
        totalInvoices: data.totalInvoices,
        totalBilled: data.totalBilled,
        totalPaid: data.totalPaid,
        commissionRate: rate,
        commissionEarned,
      };
    }).sort((a, b) => b.totalBilled - a.totalBilled);
  }, [invoices, defaultRate]);

  const stats = useMemo(() => {
    const totalDoctors = doctorSummaries.filter((d) => d.doctorName !== "Direct / Self Walk-in").length;
    const totalReferralBilled = doctorSummaries
      .filter((d) => d.doctorName !== "Direct / Self Walk-in")
      .reduce((sum, d) => sum + d.totalBilled, 0);
    const totalCommissions = doctorSummaries.reduce((sum, d) => sum + d.commissionEarned, 0);

    return {
      totalDoctors,
      totalReferralBilled,
      totalCommissions,
    };
  }, [doctorSummaries]);

  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctorSummaries;
    const q = searchQuery.toLowerCase();
    return doctorSummaries.filter((d) => d.doctorName.toLowerCase().includes(q));
  }, [doctorSummaries, searchQuery]);

  const formatINR = (amt: number) => {
    return `₹${Number(amt || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleExportCSV = () => {
    const headers = [
      "Doctor Name",
      "Referral Invoices Count",
      "Total Invoiced Amount (INR)",
      "Realized Collections (INR)",
      "Commission Cut %",
      "Commission Incentive (INR)",
    ];

    const rows = filteredDoctors.map((d) => [
      `"${d.doctorName}"`,
      d.totalInvoices,
      d.totalBilled,
      d.totalPaid,
      `${d.commissionRate}%`,
      d.commissionEarned,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Doctor_Referral_Settlement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/30">
                B2B & Clinic Partner Portal
              </span>
              <span className="text-xs text-slate-400">
                Active Referring Partners: {stats.totalDoctors}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Doctor & Referral Partner Billing
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Track business generated by referring physicians, calculate diagnostic incentive commissions, and generate settlement payout vouchers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20 hover:bg-white/20 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              Export B2B Statement
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Referring Doctors
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
              <Stethoscope className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.totalDoctors} Clinicians</p>
          <div className="mt-2 text-[11px] text-slate-500">Contributing referral cases</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Referral Billing Volume
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {formatINR(stats.totalReferralBilled)}
          </p>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            Gross B2B diagnostic business
          </div>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
              Commission Incentive Pool
            </span>
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-950 mt-2">
            {formatINR(stats.totalCommissions)}
          </p>
          <div className="mt-2 text-[11px] text-indigo-700 font-medium">
            Calculated @ default {defaultRate}% rate
          </div>
        </div>
      </div>

      {/* Commission Rate Config Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">
            Default Commission Incentive Cut:
          </label>
          <div className="flex items-center gap-1">
            {[10, 15, 20, 25].map((rate) => (
              <button
                key={rate}
                onClick={() => setDefaultRate(rate)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                  defaultRate === rate
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor or clinic name..."
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Doctor Summary Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Doctor / Clinic Partner</th>
                <th className="px-4 py-3 text-center">Referrals</th>
                <th className="px-4 py-3 text-right">Gross Billed (₹)</th>
                <th className="px-4 py-3 text-right">Realized Cash (₹)</th>
                <th className="px-4 py-3 text-center">Incentive %</th>
                <th className="px-4 py-3 text-right">Commission Due (₹)</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{doc.doctorName}</div>
                    {doc.doctorEmail && (
                      <div className="text-[11px] text-slate-400">{doc.doctorEmail}</div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-bold text-indigo-700">
                      {doc.totalInvoices} cases
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {formatINR(doc.totalBilled)}
                  </td>

                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                    {formatINR(doc.totalPaid)}
                  </td>

                  <td className="px-4 py-3 text-center font-bold text-slate-700">
                    {doc.commissionRate > 0 ? `${doc.commissionRate}%` : "—"}
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700 text-sm">
                    {formatINR(doc.commissionEarned)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {doc.commissionEarned > 0 && (
                      <button
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setPayoutModalOpen(true);
                        }}
                        className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100 transition-colors"
                      >
                        Payout Voucher
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Voucher Modal */}
      {payoutModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                Referral Payout Voucher
              </h3>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-indigo-50/50 p-4 border border-indigo-100">
                <div className="text-xs text-indigo-900 font-semibold">Beneficiary:</div>
                <div className="text-base font-bold text-slate-900">{selectedDoctor.doctorName}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Cases Settled: {selectedDoctor.totalInvoices} • Total Volume: {formatINR(selectedDoctor.totalBilled)}
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Realized Collections</span>
                <span className="font-semibold text-slate-800">{formatINR(selectedDoctor.totalPaid)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Incentive Commission ({selectedDoctor.commissionRate}%)</span>
                <span className="font-bold text-indigo-700">{formatINR(selectedDoctor.commissionEarned)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">TDS Deduction (Sec 194H @ 5%)</span>
                <span className="font-semibold text-rose-600">
                  -{formatINR((selectedDoctor.commissionEarned * 5) / 100)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-sm">
                <span>Net Payable to Doctor</span>
                <span className="text-emerald-700">
                  {formatINR(selectedDoctor.commissionEarned - (selectedDoctor.commissionEarned * 5) / 100)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                  setPayoutModalOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow hover:bg-slate-800"
              >
                <Printer className="h-4 w-4" />
                Print Voucher
              </button>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
