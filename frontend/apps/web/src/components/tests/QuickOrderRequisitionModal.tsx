"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Barcode,
  CheckCircle2,
  X,
  FlaskConical,
  Clock,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface QuickOrderRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTests: any[];
}

export default function QuickOrderRequisitionModal({
  isOpen,
  onClose,
  selectedTests,
}: QuickOrderRequisitionModalProps) {
  const [patientName, setPatientName] = useState("Aditya Sharma");
  const [uhid, setUhid] = useState("LC-002841");
  const [patientAge, setPatientAge] = useState("42Y / M");
  const [priority, setPriority] = useState<"ROUTINE" | "STAT">("ROUTINE");

  if (!isOpen || selectedTests.length === 0) return null;

  const totalMRP = selectedTests.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  const totalOffer = selectedTests.reduce((sum, t) => sum + (Number(t.offerPrice) || Number(t.price) || 0), 0);
  const totalB2b = selectedTests.reduce((sum, t) => sum + (Number(t.b2bRate) || Number(t.price) * 0.6), 0);

  // Group tube requirements
  const tubesMap = new Map<string, { count: number; container: string; sampleType: string }>();
  selectedTests.forEach((t) => {
    const key = t.sampleContainer || t.sampleType || "Standard Vial";
    const existing = tubesMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      tubesMap.set(key, { count: 1, container: t.sampleContainer || "Standard Vial", sampleType: t.sampleType || "BLOOD" });
    }
  });

  const tubes = Array.from(tubesMap.values());

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Diagnostic Requisition &amp; Phlebotomy Order Slip
              </h3>
              <p className="text-xs text-slate-500">
                Simulated lab accession requisition for {selectedTests.length} investigations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Demographic Demo Info */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Patient Details:</span>
                <span className="font-extrabold text-slate-900 text-sm">{patientName}</span>
                <span className="text-slate-500 ml-2">({patientAge})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Accession UHID:</span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  {uhid}
                </span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Specimen Master Barcode:</span>
                <p className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                  *{uhid}-ORD01*
                </p>
              </div>
              <div className="h-8 w-36 bg-slate-100 rounded border border-slate-300 flex items-center justify-center text-[11px] font-mono font-bold text-slate-600">
                |||| | ||| || ||| |
              </div>
            </div>
          </div>

          {/* Phlebotomy Specimen Vacutainer Tube Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Required Vacutainer Collection Tubes ({tubes.length})</span>
              <span className="text-[10px] text-emerald-600 font-bold">Phlebotomy SOP</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tubes.map((tube, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    <span>{tube.container}</span>
                  </div>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-600 text-[11px]">
                    {tube.count} {tube.count === 1 ? "Test" : "Tests"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Tests Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Investigations Included ({selectedTests.length})
            </h4>
            <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Test Code</th>
                    <th className="p-3">Investigation Name</th>
                    <th className="p-3 text-right">Standard MRP</th>
                    <th className="p-3 text-right">Offer Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedTests.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono font-bold text-blue-600">{t.testCode || t.code}</td>
                      <td className="p-3 font-semibold text-slate-900">{t.testName || t.name}</td>
                      <td className="p-3 text-right text-slate-500 font-medium">₹{t.price}</td>
                      <td className="p-3 text-right font-bold text-slate-900">₹{t.offerPrice || t.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Totals Strip */}
          <div className="rounded-2xl bg-blue-50/70 border border-blue-200/80 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Total MRP Tariff:</span>
              <span className="text-slate-700 line-through font-bold">₹{totalMRP}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Patient Payable:</span>
              <span className="text-xl font-black text-blue-900">₹{totalOffer}</span>
            </div>
            <div>
              <span className="text-slate-500 block">B2B Franchise Rate:</span>
              <span className="text-slate-700 font-bold">₹{Math.round(totalB2b)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
              <span>Proceed to Live Patient Booking Wizard</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Requisition Slip</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
