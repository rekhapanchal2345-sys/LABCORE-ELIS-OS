"use client";

import React, { useState, useEffect } from "react";
import { X, Printer, Copy, Check, Barcode, Download, ExternalLink, ShieldCheck, Tag, Info } from "lucide-react";
import { showSuccess } from "@/lib/notifications";

export interface BarcodeLabelItem {
  id: string;
  barcode: string;
  orderNumber?: string;
  sampleNumber?: string;
  testName: string;
  specimenType?: string;
  tubeType?: string;
  tubeColor?: string;
  tubeColorHex?: string;
  patientName: string;
  uhid: string;
  gender?: string;
  age?: number | string;
  date?: string;
  collectorName?: string;
  priority?: string;
}

interface BarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: BarcodeLabelItem[];
  orderId?: string;
  initialSelectedBarcode?: string;
}

// Helper function to map test to tube type and color
export const getTubeDetailsForTest = (testName: string, sampleType?: string) => {
  const name = (testName || "").toUpperCase();
  const sample = (sampleType || "").toUpperCase();

  // EDTA K2/K3 Lavender Tube
  if (
    name.includes("CBC") ||
    name.includes("BLOOD COUNT") ||
    name.includes("HEMOGLOBIN") ||
    name.includes("HBA1C") ||
    name.includes("GLYCATED") ||
    name.includes("ESR") ||
    name.includes("BLOOD GROUP") ||
    name.includes("EDTA") ||
    sample.includes("WHOLE_BLOOD") ||
    sample.includes("EDTA")
  ) {
    return {
      specimen: "EDTA Whole Blood",
      tubeType: "Lavender Top (EDTA K2/K3)",
      tubeColor: "Lavender",
      tubeColorHex: "#9333EA", // Purple
      tubeBg: "bg-purple-100 text-purple-800 border-purple-300",
    };
  }

  // Sodium Fluoride Grey Tube (Glycolysis Inhibitor)
  if (
    name.includes("SUGAR") ||
    name.includes("GLUCOSE") ||
    name.includes("FBS") ||
    name.includes("PPBS") ||
    name.includes("RBS") ||
    name.includes("OGTT") ||
    name.includes("GTT") ||
    name.includes("LACTATE") ||
    name.includes("FLUORIDE") ||
    sample.includes("FLUORIDE")
  ) {
    return {
      specimen: "Fluoride Plasma",
      tubeType: "Grey Top (Sodium Fluoride / Potassium Oxalate)",
      tubeColor: "Grey",
      tubeColorHex: "#64748B", // Slate Grey
      tubeBg: "bg-slate-100 text-slate-800 border-slate-300",
    };
  }

  // Sodium Citrate 3.2% Light Blue Tube (Coagulation)
  if (
    name.includes("PT") ||
    name.includes("INR") ||
    name.includes("APTT") ||
    name.includes("PTT") ||
    name.includes("D-DIMER") ||
    name.includes("DIMER") ||
    name.includes("FIBRINOGEN") ||
    name.includes("COAGULATION") ||
    name.includes("CITRATE") ||
    sample.includes("CITRATE")
  ) {
    return {
      specimen: "Citrated Plasma",
      tubeType: "Light Blue Top (Sodium Citrate 3.2%)",
      tubeColor: "Light Blue",
      tubeColorHex: "#0284C7", // Sky Blue
      tubeBg: "bg-sky-100 text-sky-800 border-sky-300",
    };
  }

  // Sodium / Lithium Heparin Green Tube
  if (name.includes("HEPARIN") || name.includes("BLOOD GAS") || name.includes("ABG") || sample.includes("HEPARIN")) {
    return {
      specimen: "Heparinized Plasma",
      tubeType: "Green Top (Lithium Heparin)",
      tubeColor: "Green",
      tubeColorHex: "#16A34A", // Emerald Green
      tubeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    };
  }

  // Sterile Container / Urine / Fluids
  if (
    name.includes("URINE") ||
    name.includes("STOOL") ||
    name.includes("SPUTUM") ||
    name.includes("CULTURE") ||
    sample.includes("URINE") ||
    sample.includes("STOOL") ||
    sample.includes("SPUTUM")
  ) {
    return {
      specimen: "Sterile Specimen",
      tubeType: "Sterile Container / Yellow Top",
      tubeColor: "Yellow",
      tubeColorHex: "#CA8A04", // Amber
      tubeBg: "bg-amber-100 text-amber-800 border-amber-300",
    };
  }

  // Default Biochemistry / Serology / Immunology SST Gel Tube
  return {
    specimen: "Serum (Clotted)",
    tubeType: "Gold / Red Top (SST Gel Clot Activator)",
    tubeColor: "Gold / Red",
    tubeColorHex: "#DC2626", // Red / Gold
    tubeBg: "bg-red-100 text-red-800 border-red-300",
  };
};

export default function BarcodeLabelModal({
  isOpen,
  onClose,
  labels,
  orderId,
  initialSelectedBarcode,
}: BarcodeLabelModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [labelFormat, setLabelFormat] = useState<"standard" | "compact" | "multi">("standard");
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    if (initialSelectedBarcode && labels.length > 0) {
      const idx = labels.findIndex((l) => l.barcode === initialSelectedBarcode);
      if (idx !== -1) setSelectedIdx(idx);
    }
  }, [initialSelectedBarcode, labels]);

  if (!isOpen || labels.length === 0) return null;

  const current = labels[selectedIdx] || labels[0];
  const tubeInfo = getTubeDetailsForTest(current.testName, current.specimenType);

  // Generate deterministic SVG barcode pattern
  const renderBarcodeSvg = (code: string) => {
    const cleanCode = (code || "BC-000000").replace(/[^a-zA-Z0-9_-]/g, "");
    const bars: { width: number; isBlack: boolean }[] = [];

    // Quiet zone start
    bars.push({ width: 3, isBlack: false });

    // Guard bar
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 1, isBlack: false });

    // Encode chars
    for (let i = 0; i < cleanCode.length; i++) {
      const codeVal = cleanCode.charCodeAt(i);
      const b1 = (codeVal % 3) + 1;
      const b2 = ((codeVal >> 1) % 2) + 1;
      const b3 = ((codeVal >> 2) % 3) + 1;
      bars.push({ width: b1, isBlack: true });
      bars.push({ width: 1, isBlack: false });
      bars.push({ width: b2, isBlack: true });
      bars.push({ width: 2, isBlack: false });
      bars.push({ width: b3, isBlack: true });
      bars.push({ width: 1, isBlack: false });
    }

    // Guard bar stop
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 3, isBlack: false });

    let currentX = 0;
    const height = 46;

    return (
      <svg
        viewBox={`0 0 ${bars.reduce((acc, b) => acc + b.width * 1.5, 0)} ${height}`}
        className="w-full h-12 max-h-12 overflow-visible"
        preserveAspectRatio="none"
      >
        {bars.map((bar, i) => {
          const w = bar.width * 1.5;
          const rect = bar.isBlack ? (
            <rect key={i} x={currentX} y={0} width={w} height={height} fill="#0f172a" />
          ) : null;
          currentX += w;
          return rect;
        })}
      </svg>
    );
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(current.barcode);
    setCopied(true);
    showSuccess(`Barcode ${current.barcode} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Isolated Print Styles: Only print the thermal labels */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #barcode-printable-area, #barcode-printable-area * {
            visibility: visible !important;
          }
          #barcode-printable-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 8px !important;
            background: white !important;
            z-index: 999999 !important;
          }
          .barcode-sticker-print {
            page-break-inside: avoid !important;
            margin-bottom: 12px !important;
            border: 1px solid #94a3b8 !important;
            display: block !important;
          }
        }
      `,
        }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
                <Barcode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Barcode Label Studio
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Vial Label (50×25mm)
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Phlebotomy Specimen Tube Barcode Generator & Thermal Printer
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Multi-Tube Selector Tabs (if more than 1 test/sample in order) */}
            {labels.length > 1 && (
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Select Specimen Tube ({labels.length} Tubes Generated):
                </label>
                <div className="flex flex-wrap gap-2">
                  {labels.map((lbl, idx) => {
                    const info = getTubeDetailsForTest(lbl.testName, lbl.specimenType);
                    const isSelected = selectedIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedIdx(idx)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-2 ring-blue-500/20"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/20 shadow-xs flex-shrink-0"
                          style={{ backgroundColor: info.tubeColorHex }}
                        />
                        <span className="truncate max-w-[140px]">{lbl.testName}</span>
                        <span className="text-[10px] text-slate-400">({info.tubeColor})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Specimen Tube Real-world Clinical Information Pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full border border-black/30 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: tubeInfo.tubeColorHex }}
                />
                <div>
                  <span className="font-bold text-slate-800">{tubeInfo.tubeType}</span>
                  <span className="text-slate-500 ml-2">| Specimen: {tubeInfo.specimen}</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tubeInfo.tubeBg}`}>
                {tubeInfo.tubeColor} Cap
              </span>
            </div>

            {/* LIVE BARCODE STICKER PREVIEW (Exact 50mm x 25mm Clinical Ratio) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Thermal Sticker Label Preview (50×25 mm)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Copies:</span>
                  <select
                    value={copies}
                    onChange={(e) => setCopies(Number(e.target.value))}
                    className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded px-2 py-0.5"
                  >
                    <option value={1}>1 Label</option>
                    <option value={2}>2 Labels (Vial + Slip)</option>
                    <option value={3}>3 Labels (Vial + Tube + Archive)</option>
                    <option value={4}>4 Labels</option>
                  </select>
                </div>
              </div>

              {/* Realistic Phlebotomy Thermal Label Container */}
              <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 flex justify-center items-center">
                <div
                  className="bg-white border-2 border-slate-400 rounded-md shadow-md p-3 relative flex flex-col justify-between overflow-hidden"
                  style={{
                    width: "380px",
                    minHeight: "190px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {/* Left Edge Color Strip matching Vacutainer Cap */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-3.5"
                    style={{ backgroundColor: tubeInfo.tubeColorHex }}
                    title={`Tube Cap Color: ${tubeInfo.tubeColor}`}
                  />

                  {/* Label Inner Padding for Color Strip */}
                  <div className="pl-3.5 flex flex-col justify-between h-full space-y-2">
                    
                    {/* Top Row: Lab Brand & UHID */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-1">
                      <div>
                        <span className="text-[11px] font-black text-slate-900 tracking-tight block">
                          LABCORE ENTERPRISE LIS
                        </span>
                        <span className="text-[13px] font-bold text-slate-900 block leading-tight truncate max-w-[200px]">
                          {current.patientName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[12px] font-mono font-black text-blue-700 px-1.5 py-0.5 bg-blue-50 rounded border border-blue-200 inline-block">
                          {current.uhid}
                        </span>
                        <span className="text-[10px] text-slate-600 block mt-0.5 font-semibold">
                          {current.age !== undefined && current.age !== null ? (current.age === 0 ? "Newborn" : `${current.age}Y`) : "N/A"} / {current.gender || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Middle: SVG Barcode Graphic */}
                    <div className="flex flex-col items-center justify-center py-1">
                      <div className="w-full px-2">
                        {renderBarcodeSvg(current.barcode)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[12px] font-black tracking-widest text-slate-900">
                          *{current.barcode}*
                        </span>
                        {current.priority && current.priority !== "ROUTINE" && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 bg-red-600 text-white rounded uppercase tracking-wider">
                            {current.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Test Name, Specimen & Timestamp */}
                    <div className="border-t border-slate-200 pt-1 flex justify-between items-end text-[10px]">
                      <div className="truncate max-w-[220px]">
                        <span className="font-bold text-slate-900 block truncate">
                          {current.testName}
                        </span>
                        <span className="text-slate-600 font-medium block truncate">
                          {tubeInfo.specimen} ({tubeInfo.tubeColor})
                        </span>
                      </div>
                      <div className="text-right text-slate-500 font-mono text-[9px] flex-shrink-0">
                        <span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}</span>
                        <span className="ml-1">{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Barcode Quick String Copy & Verification */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-mono font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Barcode Value:</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  {current.barcode}
                </span>
              </div>
              <button
                onClick={handleCopyBarcode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Barcode"}
              </button>
            </div>

          </div>

          {/* Modal Footer Controls */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {orderId && (
                <button
                  onClick={() => window.open(`/orders/${orderId}/barcode`, "_blank")}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Full Barcode Sheet Page
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-xs"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98"
              >
                <Printer className="w-4 h-4" />
                Print {copies} Thermal Label{copies > 1 ? "s" : ""}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* HIDDEN PRINTABLE CONTAINER FOR THERMAL PRINTER (Only visible during window.print()) */}
      <div id="barcode-printable-area" className="hidden">
        {Array.from({ length: copies }).map((_, copyIndex) => (
          <div
            key={copyIndex}
            className="barcode-sticker-print bg-white p-2 border border-slate-400 mb-4"
            style={{
              width: "50mm",
              height: "25mm",
              boxSizing: "border-box",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="flex justify-between items-start text-[8px] border-b border-black/40 pb-0.5">
              <span className="font-bold truncate max-w-[90px]">{current.patientName}</span>
              <span className="font-mono font-bold">{current.uhid}</span>
            </div>
            <div className="py-0.5 text-center">
              {renderBarcodeSvg(current.barcode)}
              <div className="text-[7px] font-mono font-bold leading-none">*{current.barcode}*</div>
            </div>
            <div className="flex justify-between items-end text-[7px] border-t border-black/40 pt-0.5">
              <span className="truncate max-w-[90px] font-semibold">{current.testName}</span>
              <span className="font-mono text-[6.5px]">
                {tubeInfo.tubeColor}{current.age !== undefined && current.age !== null ? ` | ${current.age}Y` : ""}{current.gender ? `/${current.gender.charAt(0)}` : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
