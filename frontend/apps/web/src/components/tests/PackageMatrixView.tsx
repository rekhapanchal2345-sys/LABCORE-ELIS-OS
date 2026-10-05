"use client";

import React, { useState } from "react";
import { 
  Package, Sparkles, CheckCircle2, FlaskConical, 
  ArrowRight, ShieldCheck, Tag, DollarSign, Layers, 
  Clock3, ChevronRight, Plus, ExternalLink
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
    popular: true,
    tests: [
      { name: "Lipid Profile Extended (Cholesterol, Triglycerides, HDL, LDL, VLDL)", code: "LIPID-EXT", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "High Sensitivity C-Reactive Protein (hs-CRP)", code: "HS-CRP", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Apolipoprotein A1 & B Ratio", code: "APO-AB", container: "Serum Separator Tube", sampleType: "SERUM" },
      { name: "Homocysteine Quantitative", code: "HOMO-Q", container: "EDTA Tube", sampleType: "BLOOD" },
      { name: "Troponin I Quantitative (STAT)", code: "TROP-I", container: "Lithium Heparin", sampleType: "PLASMA" },
    ],
  },
  {
    id: "PKG-03",
    name: "Diabetes & Metabolic Comprehensive Health Panel",
    code: "PKG-DIAB-COMP",
    category: "Endocrinology",
    price: 899,
    originalPrice: 1950,
    testsCount: 16,
    fasting: true,
    tatHours: 6,
    tests: [
      { name: "Fasting Blood Glucose (FBS)", code: "FBS-01", container: "Fluoride Tube", sampleType: "BLOOD" },
      { name: "Post-Prandial Glucose (PPBS)", code: "PPBS-01", container: "Fluoride Tube", sampleType: "BLOOD" },
      { name: "HbA1c (Glycated Hemoglobin) by HPLC", code: "HBA1C", container: "EDTA Tube", sampleType: "BLOOD" },
      { name: "Estimated Average Glucose (eAG)", code: "EAG-01", container: "Calculated", sampleType: "CALCULATED" },
      { name: "Microalbuminuria / Creatinine Ratio (Urine ACR)", code: "U-ACR", container: "Sterile Container", sampleType: "URINE" },
      { name: "Serum Creatinine with eGFR", code: "CREAT-EGFR", container: "Serum Separator Tube", sampleType: "SERUM" },
    ],
  },
  {
    id: "PKG-04",
    name: "Acute Fever & Monsoon Vector Panel (Dengue, Malaria, Typhoid)",
    code: "PKG-FEV-VEC",
    category: "Infectious Disease",
    price: 1199,
    originalPrice: 2600,
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
  "EDTA Tube": { bg: "bg-purple-500/20", text: "text-purple-300", capColor: "#8B5CF6" },
  "Serum Separator Tube": { bg: "bg-amber-500/20", text: "text-amber-300", capColor: "#F59E0B" },
  "Fluoride Tube": { bg: "bg-slate-500/20", text: "text-slate-300", capColor: "#64748B" },
  "Lithium Heparin": { bg: "bg-emerald-500/20", text: "text-emerald-300", capColor: "#10B981" },
  "Sterile Container": { bg: "bg-yellow-500/20", text: "text-yellow-300", capColor: "#EAB308" },
};

export default function PackageMatrixView() {
  const [packages] = useState<HealthPackage[]>(DEFAULT_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState<HealthPackage | null>(DEFAULT_PACKAGES[0]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-400/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-300 backdrop-blur-md">
              <Package className="h-3.5 w-3.5" /> Bundled Health Checkups &amp; Pathology Profiles
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              Multi-Test Health Packages Master
            </h2>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              Integrated multi-parameter clinical panels with bundled vacutainer tube optimization, package tariffs, and automatic discount calculation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-black text-slate-950 shadow-xl shadow-cyan-950/50 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <Plus className="h-4 w-4" /> Book Package Order
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Packages List + Package Detail Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Package Cards (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {packages.map((pkg) => {
            const savings = pkg.originalPrice - pkg.price;
            const discountPercent = Math.round((savings / pkg.originalPrice) * 100);
            const isSelected = selectedPkg?.id === pkg.id;

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-cyan-400 bg-slate-900/90 ring-2 ring-cyan-400/30 shadow-2xl"
                    : "border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute right-0 top-0 bg-gradient-to-l from-amber-500 to-orange-500 px-4 py-1 text-[9px] font-black uppercase tracking-widest text-slate-950 rounded-bl-xl shadow-md">
                    ⭐ POPULAR CLINICAL PACKAGE
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-0.5 rounded-lg">
                        {pkg.code}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{pkg.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-3">
                      <span>🧪 {pkg.testsCount} Total Parameters</span>
                      <span>⏱️ TAT: {pkg.tatHours} Hours</span>
                      <span>{pkg.fasting ? "⚠️ 10-12h Fasting Required" : "✓ Non-Fasting"}</span>
                    </p>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 min-w-[140px]">
                    <div className="flex items-baseline justify-end gap-2">
                      <span className="text-2xl font-black text-cyan-300 font-mono">₹{pkg.price}</span>
                      <span className="text-xs text-slate-500 line-through font-mono">₹{pkg.originalPrice}</span>
                    </div>
                    <span className="inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300 mt-1">
                      Save {discountPercent}% (₹{savings})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Package Test Composition Inspector */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5">
          {selectedPkg ? (
            <>
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Package Composition &amp; Tubes</span>
                <h3 className="text-lg font-black text-white mt-1">{selectedPkg.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Code: {selectedPkg.code}</p>
              </div>

              {/* Required Vacutainer Tubes */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Required Phlebotomy Tubes for this Package
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set(selectedPkg.tests.map(t => t.container))).map((container, i) => {
                    const style = TUBE_CONTAINER_COLORS[container] || { bg: "bg-slate-800", text: "text-slate-300", capColor: "#06B6D4" };
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.capColor }} />
                        <span>{container}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Included Diagnostic Profiles */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Included Test Profiles ({selectedPkg.tests.length})
                </p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {selectedPkg.tests.map((test, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 flex items-start justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-200">{test.name}</p>
                        <span className="font-mono text-[10px] text-cyan-400 font-bold">{test.code}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{test.container}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/orders/new`}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 p-3.5 text-xs font-black text-slate-950 shadow-xl shadow-cyan-950/50 hover:from-cyan-400 hover:to-blue-500 transition-all"
                >
                  <span>Book Requisition for this Package (₹{selectedPkg.price})</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">Select a package to view test composition</div>
          )}
        </div>
      </div>
    </div>
  );
}
