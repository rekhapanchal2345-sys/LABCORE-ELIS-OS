"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TestDrawerProps {
  test: any | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (test: any) => void;
  onDuplicate: (test: any) => void;
}

export default function TestDrawer({
  test,
  isOpen,
  onClose,
  onToggleStatus,
  onDuplicate,
}: TestDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "parameters" | "tariff" | "clinical">("overview");
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !test) return null;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const code = test.testCode || test.code || "";
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getTubeVisual = (container?: string, sampleType?: string) => {
    const text = `${container || ''} ${sampleType || ''}`.toLowerCase();
    if (text.includes("edta") || text.includes("purple") || text.includes("lavender")) {
      return {
        label: "EDTA Purple (K2/K3)",
        capColor: "#8B5CF6",
        capGlow: "shadow-purple-500/40",
        badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
        inversions: "8 - 10 Inversions",
        orderOfDraw: "#5 (Whole Blood / CBC)",
        additive: "Dipotassium EDTA anticoagulant",
      };
    }
    if (text.includes("fluoride") || text.includes("oxalate") || text.includes("grey") || text.includes("gray")) {
      return {
        label: "Sodium Fluoride Grey",
        capColor: "#9CA3AF",
        capGlow: "shadow-gray-400/40",
        badgeBg: "bg-gray-100 text-gray-700 border-gray-300",
        inversions: "8 - 10 Inversions",
        orderOfDraw: "#6 (Glycolysis Inhibitor)",
        additive: "Sodium Fluoride / Potassium Oxalate",
      };
    }
    if (text.includes("sst") || text.includes("gold") || text.includes("gel") || text.includes("yellow")) {
      return {
        label: "SST Gold / Yellow (Gel Separator)",
        capColor: "#F59E0B",
        capGlow: "shadow-amber-500/40",
        badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
        inversions: "5 Inversions",
        orderOfDraw: "#3 (Serum Separator)",
        additive: "Clot activator & inert polymer gel",
      };
    }
    if (text.includes("red") || text.includes("plain") || text.includes("serum")) {
      return {
        label: "Plain Red (No Additive / Clot)",
        capColor: "#EF4444",
        capGlow: "shadow-red-500/40",
        badgeBg: "bg-red-50 text-red-700 border-red-200",
        inversions: "5 Inversions (Plastic) / 0 (Glass)",
        orderOfDraw: "#2 (Serum Clot Activator)",
        additive: "Silica clot activator / None",
      };
    }
    if (text.includes("citrate") || text.includes("blue")) {
      return {
        label: "Sodium Citrate 3.2% Blue",
        capColor: "#38BDF8",
        capGlow: "shadow-sky-400/40",
        badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
        inversions: "3 - 4 Gentle Inversions",
        orderOfDraw: "#1 (Coagulation Matrix)",
        additive: "Buffered Sodium Citrate 9:1 ratio",
      };
    }
    if (text.includes("heparin") || text.includes("green")) {
      return {
        label: "Lithium / Sodium Heparin Green",
        capColor: "#10B981",
        capGlow: "shadow-emerald-500/40",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        inversions: "8 - 10 Inversions",
        orderOfDraw: "#4 (Plasma Chemistries)",
        additive: "Lithium or Sodium Heparin",
      };
    }
    return {
      label: container || sampleType || "Standard Specimen Container",
      capColor: "#64748B",
      capGlow: "shadow-slate-400/40",
      badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
      inversions: "Standard Handling",
      orderOfDraw: "Standard Phlebotomy",
      additive: "Specimen Matrix",
    };
  };

  const tube = getTubeVisual(test.sampleContainer, test.sampleType);
  const basePrice = Number(test.price) || 0;
  const offerPrice = test.offerPrice ? Number(test.offerPrice) : null;
  const b2bRate = test.b2bRate ? Number(test.b2bRate) : null;
  const hasDiscount = offerPrice !== null && offerPrice < basePrice;
  const discountPercent = hasDiscount ? Math.round(((basePrice - offerPrice!) / basePrice) * 100) : 0;
  const savings = hasDiscount ? basePrice - offerPrice! : 0;

  const parameters = test.parameters || [];
  const activeStatus = test.isActive !== false;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-3xl bg-slate-50 shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
          
          {/* ========================================================================= */}
          {/* LIGHT WHITE CLINICAL HEADER */}
          {/* ========================================================================= */}
          <div className="relative bg-white text-slate-900 px-6 pt-6 pb-2 shadow-xs border-b border-slate-200">
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                {/* Meta badges row */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Test Code with 1-Click Copy */}
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-mono font-black text-blue-700 hover:bg-blue-100 transition shadow-xs"
                    title="Click to copy test code"
                  >
                    <span>{test.testCode || test.code}</span>
                    {copiedCode ? (
                      <span className="text-[10px] text-emerald-600 font-sans font-bold">✓ Copied!</span>
                    ) : (
                      <svg className="h-3.5 w-3.5 text-blue-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>

                  {/* Category Pill */}
                  {test.category?.name && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                      {test.category.color && (
                        <span className="h-2 w-2 rounded-full shadow-xs" style={{ backgroundColor: test.category.color }} />
                      )}
                      <span>{test.category.name}</span>
                    </span>
                  )}

                  {/* Live Status Pill with Pulse */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      activeStatus
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${activeStatus ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    <span>{activeStatus ? "Active Operational" : "Paused / Inactive"}</span>
                  </span>
                </div>

                {/* Main Title */}
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {test.testName || test.name}
                </h2>

                {/* Subtitle / Short Name */}
                {test.shortName && (
                  <p className="text-xs text-slate-500 font-medium">
                    Clinical Abbreviation: <span className="text-slate-800 font-bold">{test.shortName}</span>
                  </p>
                )}
              </div>

              {/* Top Right Action Suite */}
              <div className="flex items-center gap-2">
                {/* 1-Click Operational Toggle */}
                <button
                  onClick={() => onToggleStatus(test)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition shadow-xs cursor-pointer ${
                    activeStatus
                      ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                  title={activeStatus ? "Pause test operations" : "Activate test operations"}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${activeStatus ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <span>{activeStatus ? "Pause Test" : "Resume Test"}</span>
                </button>

                {/* Close Drawer Button */}
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                  aria-label="Close drawer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Diagnostic Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
              {/* Tariff / Rate */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Patient Tariff</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-black text-slate-900">
                    ₹{(hasDiscount ? offerPrice : basePrice)?.toLocaleString("en-IN")}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{basePrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                {hasDiscount ? (
                  <span className="text-[10px] font-bold text-emerald-600">
                    Save ₹{savings} ({discountPercent}% OFF)
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Standard MRP</span>
                )}
              </div>

              {/* Turnaround Time */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Turnaround Time</span>
                <p className="text-base font-black text-blue-700 mt-0.5">
                  {test.tatDisplay || (test.tatHours ? `${test.tatHours} Hours` : "Same Day")}
                </p>
                <span className="text-[10px] text-slate-500">
                  {Number(test.tatHours) <= 4 ? "⚡ STAT Available" : "Standard Routine"}
                </span>
              </div>

              {/* Phlebotomy Specimen Container */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Specimen Tube</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-3 w-3 rounded-full flex-shrink-0 shadow-xs" style={{ backgroundColor: tube.capColor }} />
                  <span className="text-xs font-bold text-slate-900 truncate" title={tube.label}>
                    {tube.label.split("(")[0].trim()}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">
                  {test.sampleType || "BLOOD"}
                </span>
              </div>

              {/* Analytes Configured */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Analytes</span>
                <p className="text-base font-black text-indigo-700 mt-0.5">
                  {parameters.length > 0 ? `${parameters.length} Parameters` : "Single Analyte"}
                </p>
                <span className="text-[10px] text-slate-500">
                  {parameters.length > 0 ? "Multi-analyte panel" : "Standard test"}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 mt-5 -mb-2 border-b border-slate-200">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>🧪</span> Overview &amp; Phlebotomy
              </button>

              <button
                onClick={() => setActiveTab("parameters")}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  activeTab === "parameters"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>🔬</span> Parameters &amp; Ranges
                {parameters.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] text-blue-800 font-bold">
                    {parameters.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("tariff")}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  activeTab === "tariff"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>💳</span> Tariff &amp; Commercials
              </button>

              <button
                onClick={() => setActiveTab("clinical")}
                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  activeTab === "clinical"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>📋</span> Clinical Notes
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB CONTENT BODY */}
          {/* ========================================================================= */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* TAB 1: OVERVIEW & PHLEBOTOMY */}
            {activeTab === "overview" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Visual Vacutainer Phlebotomy Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-xs">
                        💉
                      </span>
                      Phlebotomy Collection Protocol &amp; Specimen Handling
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Order: {tube.orderOfDraw}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* Realistic 3D Vacutainer Cap Graphic */}
                    <div className="rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-slate-100/70 p-4 flex flex-col items-center justify-center text-center">
                      {/* Tube graphical representation */}
                      <div className="relative mb-3 flex flex-col items-center">
                        {/* Colored Cap with rubber stopper */}
                        <div
                          className="h-8 w-14 rounded-t-lg shadow-md flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: tube.capColor }}
                        >
                          <div className="h-2 w-6 rounded-full bg-white/40 mb-1" />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
                        </div>
                        {/* Glass tube body with fluid level */}
                        <div className="h-16 w-11 border-x-2 border-b-2 border-slate-300 rounded-b-xl bg-gradient-to-b from-white/40 via-red-100/60 to-red-400/70 flex flex-col justify-end p-1 shadow-inner">
                          <div className="h-7 w-full rounded-b-lg bg-red-600/80 backdrop-blur-xs" />
                        </div>
                      </div>

                      <span className="text-xs font-black text-slate-800">{tube.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{tube.additive}</span>
                      
                      <div className="mt-2.5 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                        🔄 {tube.inversions}
                      </div>
                    </div>

                    {/* Specimen Properties */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Sample Matrix</span>
                        <span className="text-slate-900 font-extrabold text-sm mt-0.5 block">
                          {test.sampleType || "WHOLE BLOOD"}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Primary biological matrix</span>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Minimum Required Volume</span>
                        <span className="text-slate-900 font-extrabold text-sm mt-0.5 block">
                          {test.sampleVolume || "2.0 mL"}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Dead volume allowance included</span>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Container Type</span>
                        <span className="text-slate-900 font-extrabold text-sm mt-0.5 block truncate">
                          {test.sampleContainer || tube.label.split("(")[0]}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Vacuum-sealed phlebotomy tube</span>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Processing Laboratory</span>
                        <span className="text-slate-900 font-extrabold text-sm mt-0.5 block truncate">
                          {test.processingDepartment || test.category?.department || "Central Pathology"}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Internal bench section</span>
                      </div>
                    </div>
                  </div>

                  {/* Patient Preparation & Fasting Guidance Banner */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {test.patientPreparation ? (
                      <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3.5 flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">⚠️</span>
                        <div>
                          <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                            Mandatory Patient Preparation Protocol:
                          </span>
                          <p className="text-xs text-amber-800 font-medium mt-0.5 leading-relaxed">
                            {test.patientPreparation}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-3 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                        <span className="text-sm">✓</span>
                        <span>No mandatory patient fasting or pre-collection dietary restrictions required.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analytical Method & Turnaround Benchmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Turnaround Benchmark */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Turnaround Benchmark (TAT)
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        {test.tatDisplay || (test.tatHours ? `${test.tatHours} Hours` : "24 Hours")}
                      </span>
                      {Number(test.tatHours) <= 4 && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 border border-amber-200">
                          ⚡ STAT Fast-Track
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Standard bench processing time from phlebotomy accessioning to verified digital report dispatch.
                    </p>
                  </div>

                  {/* Analytical Methodology */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Analytical Method
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-2">
                      {test.method || "Automated Laboratory Analyzer (CLIA / Photometric)"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Standardized analyzer principle calibrated against international biological standards.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PARAMETERS & ANALYTES */}
            {activeTab === "parameters" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-xs">
                          📊
                        </span>
                        Diagnostic Analytes &amp; Safe Reference Ranges ({parameters.length})
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Clinical normal ranges, units, and panic alert boundaries
                      </p>
                    </div>

                    <Link
                      href={`/tests/parameters?testId=${test.id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-blue-50 border border-blue-200/80 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs"
                    >
                      <span>Manage Parameters</span>
                      <span>→</span>
                    </Link>
                  </div>

                  {parameters.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {parameters.map((param: any, idx: number) => {
                        const rr = param.referenceRanges?.[0];
                        const hasNumericRange = rr && rr.normalLow !== undefined && rr.normalHigh !== undefined;
                        const normalLow = hasNumericRange ? Number(rr.normalLow) : null;
                        const normalHigh = hasNumericRange ? Number(rr.normalHigh) : null;
                        const panicLow = rr?.panicLow !== undefined ? Number(rr.panicLow) : null;
                        const panicHigh = rr?.panicHigh !== undefined ? Number(rr.panicHigh) : null;

                        return (
                          <div
                            key={param.id || idx}
                            className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 hover:border-blue-300 hover:bg-white transition-all shadow-xs"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black">
                                    {idx + 1}
                                  </span>
                                  <h4 className="text-sm font-extrabold text-slate-900">
                                    {param.parameterName || param.name}
                                  </h4>
                                  {param.shortName && (
                                    <span className="text-xs font-semibold text-slate-400 font-mono">
                                      ({param.shortName})
                                    </span>
                                  )}
                                  <span className="rounded-md bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 font-mono">
                                    {param.unit || "N/A"}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 block pl-7">
                                  Type: {param.dataType || "NUMERIC"} • Method: {param.method || test.method || "Standard"}
                                </span>
                              </div>

                              {/* Normal Range Badge */}
                              <div>
                                {hasNumericRange ? (
                                  <div className="text-right">
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800 font-mono">
                                      {normalLow} - {normalHigh} {param.unit}
                                    </span>
                                    <span className="block text-[10px] text-slate-400 mt-0.5">
                                      Standard Safe Interval
                                    </span>
                                  </div>
                                ) : rr?.normalValueText ? (
                                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                    {rr.normalValueText}
                                  </span>
                                ) : (
                                  <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                                    Reference Range Pending
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Visual Safe Zone Gauge Bar */}
                            {hasNumericRange && (
                              <div className="mt-3.5 pt-3 border-t border-slate-200/70 pl-7">
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                                  <span>{panicLow !== null ? `Critical Low: <${panicLow}` : `Low: ${normalLow}`}</span>
                                  <span className="font-bold text-emerald-700 uppercase tracking-wider">
                                    Normal Physiological Zone ({normalLow} – {normalHigh})
                                  </span>
                                  <span>{panicHigh !== null ? `Critical High: >${panicHigh}` : `High: ${normalHigh}`}</span>
                                </div>

                                {/* Visual Gauge bar */}
                                <div className="h-2 w-full rounded-full bg-slate-200 relative overflow-hidden flex">
                                  {/* Left Danger / Low Zone */}
                                  <div className="h-full bg-amber-200 w-1/4" title="Low boundary" />
                                  {/* Safe Green Zone */}
                                  <div className="h-full bg-emerald-500 w-2/4 shadow-inner" title="Normal safe interval" />
                                  {/* Right Danger / High Zone */}
                                  <div className="h-full bg-red-200 w-1/4" title="High boundary" />
                                </div>

                                {(panicLow !== null || panicHigh !== null) && (
                                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-red-600 font-bold">
                                    <span>🚨 Panic Alert Levels:</span>
                                    {panicLow !== null && <span>Low: &lt; {panicLow} {param.unit}</span>}
                                    {panicHigh !== null && <span>High: &gt; {panicHigh} {param.unit}</span>}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                      <span className="text-3xl">🧪</span>
                      <h4 className="font-bold text-slate-700 text-sm mt-2">Single-Result Investigation</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                        This test operates without sub-parameters. Results are recorded as a single quantitative or qualitative outcome value.
                      </p>
                      <Link
                        href={`/tests/parameters?testId=${test.id}`}
                        className="inline-block mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
                      >
                        + Add Analytes &amp; Ranges
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: TARIFF & COMMERCIALS */}
            {activeTab === "tariff" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 text-xs">
                      💰
                    </span>
                    Commercial Tariff &amp; Healthcare Billing Architecture
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    {/* Retail Patient MRP */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Standard MRP (Walk-in Patient)
                      </span>
                      <span className="text-2xl font-black text-slate-900 mt-1 block">
                        ₹{basePrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 block">Printed on laboratory invoice</span>
                    </div>

                    {/* Special Discounted Rate */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Promotional / Offer Price
                      </span>
                      <span className="text-2xl font-black text-emerald-700 mt-1 block">
                        {offerPrice ? `₹${offerPrice.toLocaleString("en-IN")}` : "No Active Promotion"}
                      </span>
                      {hasDiscount ? (
                        <span className="text-[10px] font-bold text-emerald-700 mt-1 block">
                          Patient saves ₹{savings} ({discountPercent}% OFF)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 mt-1 block">Billed at standard MRP</span>
                      )}
                    </div>

                    {/* B2B Referral Rate */}
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
                        B2B / Franchise Partner Rate
                      </span>
                      <span className="text-2xl font-black text-indigo-700 mt-1 block">
                        {b2bRate ? `₹${b2bRate.toLocaleString("en-IN")}` : `₹${Math.round(basePrice * 0.6)} (Est. 60%)`}
                      </span>
                      <span className="text-[10px] text-indigo-600 mt-1 block font-medium">
                        Contracted rate for partner collection centers
                      </span>
                    </div>
                  </div>

                  {/* GST & Financial Compliance Card */}
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">GST Diagnostic Exemption Status:</span>
                      <span className="text-slate-500 text-[11px]">
                        {test.gstPercentage > 0 ? `GST Rate: ${test.gstPercentage}% Applied` : "0% GST (Exempt as per Healthcare Services Notification)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                        HSN / SAC: 999312
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CLINICAL NOTES & METHODOLOGY */}
            {activeTab === "clinical" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-purple-50 text-purple-600 text-xs">
                      📖
                    </span>
                    Clinical Monograph &amp; Diagnostic Indications
                  </h3>

                  {test.clinicalSignificance ? (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Clinical Significance &amp; Pathological Utility:
                      </h4>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        {test.clinicalSignificance}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No clinical monograph notes recorded for this test.
                    </p>
                  )}

                  {test.description && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Test Description &amp; Summary:
                      </h4>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        {test.description}
                      </p>
                    </div>
                  )}

                  {/* Specimen Rejection Guidelines */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Standard Specimen Rejection Criteria:
                    </h4>
                    <ul className="mt-1 space-y-1 text-xs text-slate-600 list-disc list-inside bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <li>Grossly hemolyzed or lipemic specimen</li>
                      <li>Clotted sample in EDTA or Citrate vacutainer</li>
                      <li>Under-filled tube failing the minimum 9:1 blood-to-anticoagulant ratio</li>
                      <li>Improperly labelled or mismatched phlebotomy accession barcode</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ULTRA-PREMIUM FOOTER ACTIONS */}
          {/* ========================================================================= */}
          <div className="border-t border-slate-200 bg-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2">
              {/* Duplicate Clone */}
              <button
                onClick={() => onDuplicate(test)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs"
                title="Clone this test to create a new one"
              >
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Duplicate</span>
              </button>

              {/* Print Test Spec Sheet */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs"
                title="Print this test specification sheet"
              >
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Spec Sheet</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Full Details Page Link */}
              <Link
                href={`/tests/${test.id}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition shadow-xs"
              >
                Full Monograph Page →
              </Link>

              {/* Edit Test Primary Button */}
              <Link
                href={`/tests/${test.id}?edit=true`}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-md shadow-blue-500/20"
              >
                Edit Test Configuration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

