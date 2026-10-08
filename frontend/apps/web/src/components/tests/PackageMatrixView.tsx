"use client";

import React, { useState } from "react";
import {
  Package,
  Sparkles,
  CheckCircle2,
  FlaskConical,
  ArrowRight,
  ShieldCheck,
  Tag,
  DollarSign,
  Layers,
  Clock3,
  ChevronRight,
  Plus,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface HealthPackage {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  originalPrice: number;
  testsCount: number;
  tests: Array<{
    name: string;
    code: string;
    container: string;
    sampleType: string;
  }>;
  fasting: boolean;
  tatHours: number;
  popular?: boolean;
}

const DEFAULT_PACKAGES: HealthPackage[] = [
  {
    id: "PKG-01",
    name: "Executive Comprehensive Health Checkup (Full Body)",
    code: "PKG-EXEC-FULL",
    category: "Wellness & Prevention",
    price: 1999,
    originalPrice: 4850,
    testsCount: 78,
    fasting: true,
    tatHours: 12,
    popular: true,
    tests: [
      { name: "Complete Blood Count (CBC) with ESR", code: "CBC-ESR", container: "EDTA Tube", sampleType: "BLOOD" },
      { name: "Liver Function Test (LFT) - 11 Parameters", code: "LFT-11", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Kidney Function Test (KFT / RFT) with Electrolytes", code: "KFT-ELEC", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Lipid Profile Comprehensive", code: "LIPID-COMP", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Thyroid Profile Total (T3, T4, TSH)", code: "THY-3", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Fasting Blood Glucose (FBS)", code: "FBS-01", container: "Fluoride Tube", sampleType: "BLOOD" },
      { name: "Glycosylated Hemoglobin (HbA1c)", code: "HBA1C", container: "EDTA Tube", sampleType: "BLOOD" },
      { name: "Urine Routine & Microscopic Examination", code: "URINE-RME", container: "Sterile Container", sampleType: "URINE" },
    ],
  },
  {
    id: "PKG-02",
    name: "Advanced Cardiac Risk & Lipid Screening Profile",
    code: "PKG-CARD-ADV",
    category: "Cardiology",
    price: 1499,
    originalPrice: 3200,
    testsCount: 24,
    fasting: true,
    tatHours: 8,
    tests: [
      { name: "Lipid Profile (Total Chol, HDL, LDL, VLDL, TG, Non-HDL)", code: "LIPID-01", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "High-Sensitivity C-Reactive Protein (hs-CRP)", code: "HS-CRP", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Apolipoprotein A1 & B with Apo B/A1 Ratio", code: "APO-AB", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Lipoprotein (a) [Lp(a)]", code: "LPA", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Homocysteine Quantitative", code: "HOMO-Q", container: "EDTA Tube", sampleType: "BLOOD" },
    ],
  },
  {
    id: "PKG-03",
    name: "Comprehensive Diabetic & Metabolic Control Panel",
    code: "PKG-DIAB-MET",
    category: "Endocrinology",
    price: 999,
    originalPrice: 2400,
    testsCount: 16,
    fasting: true,
    tatHours: 6,
    tests: [
      { name: "Fasting Blood Sugar (FBS)", code: "FBS", container: "Fluoride Tube", sampleType: "BLOOD" },
      { name: "Post-Prandial Blood Sugar (PPBS)", code: "PPBS", container: "Fluoride Tube", sampleType: "BLOOD" },
      { name: "Glycated Hemoglobin (HbA1c) with eAG", code: "HBA1C", container: "EDTA Tube", sampleType: "BLOOD" },
      { name: "Serum Creatinine with eGFR Calculation", code: "CREAT-EGFR", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Urine Microalbumin / Creatinine Ratio (UACR)", code: "UACR", container: "Sterile Container", sampleType: "URINE" },
      { name: "Lipid Profile Basic", code: "LIPID-BSC", container: "Serum Separator Tube", sampleType: "SERUM" },
    ],
  },
  {
    id: "PKG-04",
    name: "Acute Fever & Tropical Infectious Disease Panel",
    code: "PKG-FEVER-ACUTE",
    category: "Infectious & Tropical",
    price: 1299,
    originalPrice: 2800,
    testsCount: 18,
    fasting: false,
    tatHours: 4,
    popular: true,
    tests: [
      { name: "Complete Blood Count (CBC) with Platelet Count", code: "CBC-PLT", container: "EDTA Tube", sampleType: "BLOOD" },
      { name: "Dengue Duo (NS1 Antigen + IgM/IgG Antibodies)", code: "DENG-DUO", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Malaria Antigen Rapid Test (Pf / Pv)", code: "MAL-AG", container: "EDTA Tube", sampleType: "BLOOD" },
      { name: "TyphiDot IgM / Widal Slide Test", code: "TYPHI-WIDAL", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Urine Routine & Microscopic", code: "URINE-RME", container: "Sterile Container", sampleType: "URINE" },
    ],
  },
];

const TUBE_CONTAINER_COLORS: Record<string, { bg: string; text: string; capColor: string }> = {
  "EDTA Tube": { bg: "bg-purple-50", text: "text-purple-700", capColor: "#8B5CF6" },
  "Serum Separator Tube": { bg: "bg-amber-50", text: "text-amber-800", capColor: "#F59E0B" },
  "Fluoride Tube": { bg: "bg-slate-100", text: "text-slate-700", capColor: "#64748B" },
  "Lithium Heparin": { bg: "bg-emerald-50", text: "text-emerald-700", capColor: "#10B981" },
  "Sterile Container": { bg: "bg-yellow-50", text: "text-yellow-800", capColor: "#EAB308" },
};

export default function PackageMatrixView() {
  const [packages] = useState<HealthPackage[]>(DEFAULT_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState<HealthPackage | null>(DEFAULT_PACKAGES[0]);

  return (
    <div className="space-y-6">
      {/* Light White Professional Clinical Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100/70 px-3.5 py-1 text-xs font-bold text-blue-800">
              <Package className="h-3.5 w-3.5 text-blue-600" />
              <span>Bundled Health Checkups &amp; Pathology Profiles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Diagnostic Health Packages &amp; Multi-Test Panels
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Integrated multi-parameter clinical panels with bundled vacutainer tube optimization, package tariffs, and automatic discount calculation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-xs font-bold shadow-xs transition"
            >
              <Plus className="h-4 w-4" /> Book Package Order
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Packages List + Package Detail Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Package Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {packages.map((pkg) => {
            const savings = pkg.originalPrice - pkg.price;
            const discountPercent = Math.round((savings / pkg.originalPrice) * 100);
            const isSelected = selectedPkg?.id === pkg.id;

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-blue-400 bg-blue-50/50 ring-2 ring-blue-500/10 shadow-sm"
                    : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute right-0 top-0 bg-amber-500 px-3 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 rounded-bl-xl shadow-xs">
                    ⭐ POPULAR PACKAGE
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        {pkg.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{pkg.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{pkg.name}</h3>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
                      <span className="font-semibold text-slate-700">🧪 {pkg.testsCount} Analytes</span>
                      <span>⏱️ TAT: {pkg.tatHours}h</span>
                      <span className={pkg.fasting ? "text-amber-700 font-semibold" : "text-emerald-700 font-semibold"}>
                        {pkg.fasting ? "⚠️ Fasting 10-12h" : "✓ Non-Fasting"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-5 min-w-[130px] shrink-0">
                    <div className="flex items-baseline justify-end gap-1.5">
                      <span className="text-2xl font-black text-slate-900 font-mono">₹{pkg.price}</span>
                      <span className="text-xs text-slate-400 line-through font-mono">₹{pkg.originalPrice}</span>
                    </div>
                    <span className="inline-block rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 mt-1">
                      Save {discountPercent}% (₹{savings})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Package Test Composition Inspector (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
          {selectedPkg ? (
            <>
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  Panel Composition &amp; Tubes
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedPkg.name}</h3>
                <p className="text-xs text-slate-500 font-mono">Code: {selectedPkg.code}</p>
              </div>

              {/* Required Vacutainer Tubes */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Required Specimen Tubes</span>
                  <span className="text-[10px] text-blue-600 font-bold">Phlebotomy SOP</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(selectedPkg.tests.map((t) => t.container))).map((containerName) => {
                    const tubeStyle = TUBE_CONTAINER_COLORS[containerName] || {
                      bg: "bg-slate-100",
                      text: "text-slate-700",
                      capColor: "#64748B",
                    };
                    return (
                      <div
                        key={containerName}
                        className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold ${tubeStyle.bg} ${tubeStyle.text}`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full shadow-xs" style={{ backgroundColor: tubeStyle.capColor }} />
                        <span>{containerName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Component Tests List */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Investigations Included ({selectedPkg.tests.length})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedPkg.tests.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{t.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{t.code} · {t.container}</span>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Booking Action */}
              <div className="pt-2">
                <Link
                  href="/orders/new"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-xs font-bold shadow-xs transition"
                >
                  <span>Book Requisition for {selectedPkg.code}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              Select a package to view composition and vacutainer requirements
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
