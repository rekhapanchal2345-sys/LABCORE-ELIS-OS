"use client";

import React, { useMemo } from "react";
import {
  FileText,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Building,
  CheckCircle2,
  Percent,
  Download,
} from "lucide-react";
import type { Invoice } from "./InvoiceTable";

interface GSTReportProps {
  invoices: Invoice[];
}

export default function GSTTaxAuditReport({ invoices }: GSTReportProps) {
  const gstSummary = useMemo(() => {
    let totalGross = 0;
    let totalDiscount = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalTax = 0;
    let grandTotal = 0;
    let exemptCount = 0;
    let taxableCount = 0;

    invoices.forEach((inv) => {
      const gross = Number(inv.totalAmount || 0);
      const disc = Number(inv.discount || 0);
      const gst = Number(inv.gstAmount || 0);
      const net = Number(inv.netPayable || 0);

      totalGross += gross;
      totalDiscount += disc;

      if (gst > 0) {
        taxableCount += 1;
        totalTaxable += (gross - disc);
        totalCGST += gst / 2;
        totalSGST += gst / 2;
        totalTax += gst;
      } else {
        exemptCount += 1;
      }

      grandTotal += net;
    });

    return {
      totalGross,
      totalDiscount,
      totalTaxable,
      totalCGST,
      totalSGST,
      totalIGST,
      totalTax,
      grandTotal,
      exemptCount,
      taxableCount,
      totalInvoices: invoices.length,
    };
  }, [invoices]);

  const formatINR = (amt: number) => {
    return `₹${Number(amt || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleExportGSTR1 = () => {
    const headers = [
      "Invoice Number",
      "Invoice Date",
      "Customer/Patient Name",
      "Customer GSTIN",
      "HSN/SAC Code",
      "Taxable Value (INR)",
      "CGST Rate",
      "CGST Amount (INR)",
      "SGST Rate",
      "SGST Amount (INR)",
      "Total Invoice Value (INR)",
    ];

    const rows = invoices.map((inv) => {
      const taxable = (Number(inv.totalAmount || 0) - Number(inv.discount || 0));
      const gst = Number(inv.gstAmount || 0);
      const cgst = gst > 0 ? gst / 2 : 0;
      const sgst = gst > 0 ? gst / 2 : 0;

      return [
        inv.invoiceNumber || "",
        inv.createdAt ? new Date(inv.createdAt).toISOString().slice(0, 10) : "",
        `"${inv.patientName || "Walk-in Patient"}"`,
        "URP", // Unregistered Person
        "999312",
        taxable.toFixed(2),
        gst > 0 ? "9%" : "0%",
        cgst.toFixed(2),
        gst > 0 ? "9%" : "0%",
        sgst.toFixed(2),
        Number(inv.netPayable || 0).toFixed(2),
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GSTR1_Diagnostic_Report_${new Date().toISOString().slice(0, 10)}.csv`);
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
                GST Compliance • SAC 999312
              </span>
              <span className="text-xs text-slate-400">
                Turnover Invoices: {gstSummary.totalInvoices}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              GST Tax Audit & GSTR-1 Filing Summary
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Breakdown of Human Health & Clinical Laboratory Services under SAC Code 999312 with CGST & SGST reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportGSTR1}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20 hover:bg-white/20 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              Download GSTR-1 CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
            >
              <Printer className="h-4 w-4" />
              Print Audit Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Tax Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Taxable Value */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Taxable Value
          </span>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatINR(gstSummary.totalTaxable)}
          </p>
          <div className="mt-2 text-[11px] text-slate-500">
            Net of discounts ({gstSummary.taxableCount} invoices)
          </div>
        </div>

        {/* Central GST (CGST) */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
            CGST (9%)
          </span>
          <p className="text-2xl font-black text-indigo-950 mt-2">
            {formatINR(gstSummary.totalCGST)}
          </p>
          <div className="mt-2 text-[11px] text-indigo-700">Central Government Revenue</div>
        </div>

        {/* State GST (SGST) */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
            SGST (9%)
          </span>
          <p className="text-2xl font-black text-indigo-950 mt-2">
            {formatINR(gstSummary.totalSGST)}
          </p>
          <div className="mt-2 text-[11px] text-indigo-700">State / UT Revenue</div>
        </div>

        {/* Total Tax Liability */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Total GST Liability
          </span>
          <p className="text-2xl font-black text-emerald-950 mt-2">
            {formatINR(gstSummary.totalTax)}
          </p>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            Turnover: {formatINR(gstSummary.grandTotal)}
          </div>
        </div>
      </div>

      {/* Compliance Information Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Diagnostic Services Tax Classification & Entity Data
              </h3>
              <p className="text-xs text-slate-500">
                HSN / SAC Code: 999312 — Medical and pathology laboratory services
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              GST Compliant Entity
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-slate-400 font-medium">Lab Legal Name:</span>
            <div className="font-bold text-slate-900 mt-1">LabCore Diagnostics Pvt. Ltd.</div>
            <div className="text-[11px] text-slate-500 mt-0.5">GSTIN: 24AAACL1234F1Z5</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-slate-400 font-medium">Accreditation:</span>
            <div className="font-bold text-slate-900 mt-1">NABL & ISO 15189:2022</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cert No: MC-5678</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-slate-400 font-medium">Applicable SAC / HSN:</span>
            <div className="font-bold text-indigo-700 mt-1">SAC 999312</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Medical Diagnostic & Analysis Services</div>
          </div>
        </div>
      </div>
    </div>
  );
}
