"use client";

import { useState } from "react";

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  previewContent: React.ReactNode;
  printType: "label" | "collection-sheet";
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  previewContent,
  printType
}: PrintPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState<"fit" | "100" | "125">("fit");
  const [stock, setStock] = useState(printType === "label" ? "Thermal 2 × 1 in" : "A4");
  const [printer, setPrinter] = useState("LabCore Zebra 01");
  const [verified, setVerified] = useState(false);

  const handlePrint = () => {
    setIsLoading(true);
    // Simulate a brief loading state
    setTimeout(() => {
      onConfirm();
      setIsLoading(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-300/20 bg-white shadow-2xl shadow-slate-950/40">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-5 py-4 text-white">
          <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200 ring-1 ring-cyan-300/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 9V4h12v5M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v6H6z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-bold tracking-wide">{title}</h3>
              <p className="mt-0.5 text-[11px] text-slate-400">{printType === "label" ? "Accession label quality gate" : "Collection document quality gate"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="grid flex-1 gap-5 overflow-auto bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-slate-300 bg-[radial-gradient(circle_at_center,_#ffffff_0,_#dbeafe_46%,_#cbd5e1_100%)] p-6 shadow-inner">
            <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className={`relative rounded-xl bg-white p-4 shadow-2xl ring-1 ring-slate-300 transition-transform ${zoom === "100" ? "scale-100" : zoom === "125" ? "scale-125" : "scale-90"}`}>{previewContent}</div>
          </div>
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Production checks</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Printer online</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-[10px] font-semibold text-slate-500">Printer<select value={printer} onChange={(e) => setPrinter(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] text-slate-700"><option>LabCore Zebra 01</option><option>LabCore Zebra 02</option><option>Save as PDF</option></select></label>
              <label className="text-[10px] font-semibold text-slate-500">Stock<select value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] text-slate-700"><option>{printType === "label" ? "Thermal 2 x 1 in" : "A4"}</option><option>{printType === "label" ? "Thermal 3 x 1 in" : "A4 landscape"}</option></select></label>
            </div>
            <div className="mt-3 space-y-2">
              {[
                printType === "label" ? "Thermal label stock selected" : "A4 paper format selected",
                "Patient identity visible",
                "Barcode / accession readable",
                "Chain-of-custody ready",
              ].map((check) => (
                <div key={check} className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-800">
                  <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">✓</span>{check}
                </div>
              ))}
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-900">
              <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
              I verified patient identity, barcode, and print stock before release.
            </label>
            <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-[11px] text-cyan-900">
              <p className="font-bold">Operator guidance</p>
              <p className="mt-1 leading-relaxed">{printType === "label" ? "Apply immediately after collection and confirm the barcode scans before handoff." : "Use for phlebotomy rounds and verify patient identity at collection."}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Print profile</p>
                <p className="mt-1 text-[10px] font-black text-slate-700">{printType === "label" ? "Auto-ID / thermal" : "Clinical A4"}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Release state</p>
                <p className="mt-1 text-[10px] font-black text-emerald-800">{verified ? "Verified" : "Awaiting check"}</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Print Info */}
        <div className="border-t border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-blue-900">
            <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {printType === "label" 
                ? "Print preview for thermal/label printer. Ensure printer is ready with appropriate label stock." 
                : "Print preview for A4 collection sheet. Ensure printer is loaded with A4 paper."}
            </span>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-blue-200 bg-white/70 p-1 text-[10px]">
              <span className="px-1 text-slate-500">Preview</span>
              {(["fit", "100", "125"] as const).map((value) => <button key={value} type="button" onClick={() => setZoom(value)} className={`rounded-md px-2 py-1 font-bold ${zoom === value ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-100"}`}>{value === "fit" ? "Fit" : `${value}%`}</button>)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-4">
          <span className="hidden text-[10px] font-semibold text-slate-400 sm:block">Review completed · ready for secure print</span>
          <div className="flex gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            disabled={isLoading || !verified}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-black text-white shadow-lg shadow-blue-900/20 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Preparing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {verified ? "Secure print" : "Verify to print"}
              </>
            )}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}