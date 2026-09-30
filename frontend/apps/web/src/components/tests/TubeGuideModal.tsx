"use client";

import React, { useState } from "react";

interface TubeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TubeInfo {
  step: number;
  name: string;
  capColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  additive: string;
  inversions: string;
  department: string;
  commonTests: string[];
  notes: string;
}

const ORDER_OF_DRAW: TubeInfo[] = [
  {
    step: 1,
    name: "Blood Culture Bottles",
    capColor: "#F59E0B",
    badgeBg: "bg-amber-500",
    badgeBorder: "border-amber-600",
    badgeText: "text-amber-900",
    additive: "SPS / Culture Broth",
    inversions: "8 - 10 times",
    department: "Microbiology",
    commonTests: ["Blood Culture Aerobic", "Blood Culture Anaerobic", "Bacteremia Screening"],
    notes: "Always collect first to avoid microbial contamination from non-sterile stoppers.",
  },
  {
    step: 2,
    name: "Light Blue Top",
    capColor: "#38BDF8",
    badgeBg: "bg-sky-400",
    badgeBorder: "border-sky-500",
    badgeText: "text-sky-950",
    additive: "Sodium Citrate (3.2% or 3.8%)",
    inversions: "3 - 4 times gently",
    department: "Hematology / Coagulation",
    commonTests: ["Prothrombin Time (PT / INR)", "APTT", "D-Dimer", "Fibrinogen", "Factor Assays"],
    notes: "Must be filled exactly to the fill indicator line to maintain strict 9:1 blood to anticoagulant ratio.",
  },
  {
    step: 3,
    name: "Red / Gold (SST Gel)",
    capColor: "#EF4444",
    badgeBg: "bg-red-500",
    badgeBorder: "border-red-600",
    badgeText: "text-red-950",
    additive: "Clot Activator / Silica Gel Separator",
    inversions: "5 times",
    department: "Biochemistry & Immunology",
    commonTests: ["Lipid Profile", "Liver Function (LFT)", "Kidney Function (KFT)", "Thyroid (TSH, FT3, FT4)", "Electrolytes", "CRP", "Vitamin D3", "Vitamin B12"],
    notes: "Allow 30 minutes for clot formation before centrifugation at 3000 RPM for 10 minutes.",
  },
  {
    step: 4,
    name: "Green Top",
    capColor: "#22C55E",
    badgeBg: "bg-emerald-500",
    badgeBorder: "border-emerald-600",
    badgeText: "text-emerald-950",
    additive: "Sodium Heparin / Lithium Heparin",
    inversions: "8 - 10 times",
    department: "Biochemistry / STAT",
    commonTests: ["STAT Chemistry", "Blood Ammonia", "Chromosome Analysis", "HLA Phenotyping"],
    notes: "Lithium Heparin preferred for general chemistry; do not use Sodium Heparin for electrolyte panels.",
  },
  {
    step: 5,
    name: "Lavender / Purple Top",
    capColor: "#A855F7",
    badgeBg: "bg-purple-500",
    badgeBorder: "border-purple-600",
    badgeText: "text-purple-950",
    additive: "K2 EDTA / K3 EDTA",
    inversions: "8 - 10 times thoroughly",
    department: "Hematology & Molecular",
    commonTests: ["Complete Blood Count (CBC)", "Hemoglobin (Hb)", "HbA1c (Glycated Hb)", "Blood Grouping (ABO/Rh)", "Peripheral Blood Smear", "ESR (Westergren)"],
    notes: "Thorough gentle inversion prevents micro-clotting that damages hematology cell counters.",
  },
  {
    step: 6,
    name: "Grey Top",
    capColor: "#9CA3AF",
    badgeBg: "bg-gray-400",
    badgeBorder: "border-gray-500",
    badgeText: "text-gray-900",
    additive: "Sodium Fluoride & Potassium Oxalate",
    inversions: "8 - 10 times",
    department: "Biochemistry / Diabetes",
    commonTests: ["Fasting Blood Sugar (FBS)", "Post-Prandial Blood Sugar (PPBS)", "Random Blood Sugar (RBS)", "Oral Glucose Tolerance (OGTT)", "Blood Lactate"],
    notes: "Sodium fluoride inhibits glycolysis, stabilizing glucose levels up to 24 hours at room temp.",
  },
];

export default function TubeGuideModal({ isOpen, onClose }: TubeGuideModalProps) {
  const [filterSearch, setFilterSearch] = useState("");

  if (!isOpen) return null;

  const filteredTubes = ORDER_OF_DRAW.filter((tube) => {
    const q = filterSearch.toLowerCase();
    return (
      tube.name.toLowerCase().includes(q) ||
      tube.additive.toLowerCase().includes(q) ||
      tube.department.toLowerCase().includes(q) ||
      tube.commonTests.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Phlebotomy Tube Guide & Order of Draw</h2>
              <p className="text-xs text-blue-100">CLSI H3-A6 / WHO Standardized Specimen Collection Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by test name (e.g., HbA1c, PT/INR, Lipid, Glucose) or tube type..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTubes.map((tube) => (
              <div
                key={tube.step}
                className="relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                        {tube.step}
                      </span>
                      {/* Tube visual icon */}
                      <div className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-xs"
                        style={{ backgroundColor: `${tube.capColor}20`, borderColor: tube.capColor, color: '#111827' }}
                      >
                        <span className="h-3 w-3 rounded-full shadow-inner" style={{ backgroundColor: tube.capColor }} />
                        <span>{tube.name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      {tube.department}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div>
                      <span className="font-semibold text-gray-700">Additive: </span>
                      <span className="text-gray-600">{tube.additive}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Inversions: </span>
                      <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        🔄 {tube.inversions}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Common Tests: </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {tube.commonTests.map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-100"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-500 italic">
                  💡 {tube.notes}
                </div>
              </div>
            ))}
          </div>

          {filteredTubes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No tubes found matching &quot;{filterSearch}&quot;.
            </div>
          )}

          {/* Quick Phlebotomy Golden Rules */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-blue-800">
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Crucial Laboratory Specimen Rules:
            </h4>
            <p>1. Never shake blood collection tubes vigorously — gently invert along the 180° axis to avoid in-vitro hemolysis.</p>
            <p>2. Sodium Citrate (Light Blue) tubes must be filled 100% to line; underfilling alters PT/INR results by up to 40%.</p>
            <p>3. Do NOT transfer blood from an EDTA tube to a Chemistry tube (causes severe artifactual hyperkalemia and hypocalcemia).</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
