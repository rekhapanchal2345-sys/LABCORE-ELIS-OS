"use client";

import React, { useState } from "react";
import { 
  SlidersHorizontal, Search, ShieldAlert, CheckCircle2, 
  FlaskConical, AlertTriangle, ArrowUpDown, ChevronRight,
  Sparkles, Activity, Layers, BellRing
} from "lucide-react";

interface ParameterItem {
  id: string;
  name: string;
  code: string;
  unit: string;
  parentTest: string;
  department: string;
  refRanges: {
    male: string;
    female: string;
    pediatric?: string;
  };
  panicLow?: string;
  panicHigh?: string;
  method: string;
}

const DEFAULT_PARAMETERS: ParameterItem[] = [
  {
    id: "P-01",
    name: "Hemoglobin (Hb)",
    code: "HB",
    unit: "g/dL",
    parentTest: "Complete Blood Count (CBC)",
    department: "Hematology",
    refRanges: { male: "13.0 - 17.0", female: "12.0 - 15.0", pediatric: "11.0 - 14.0" },
    panicLow: "< 7.0 g/dL (Critical Anemia)",
    panicHigh: "> 20.0 g/dL (Polycythemia)",
    method: "SLS Hemoglobin Method",
  },
  {
    id: "P-02",
    name: "Total Leukocyte Count (TLC / WBC)",
    code: "WBC",
    unit: "cells/µL",
    parentTest: "Complete Blood Count (CBC)",
    department: "Hematology",
    refRanges: { male: "4,000 - 11,000", female: "4,000 - 11,000", pediatric: "5,000 - 15,000" },
    panicLow: "< 2,000 /µL (Leukopenia)",
    panicHigh: "> 30,000 /µL (Hyperleukocytosis)",
    method: "Flow Cytometry / Impedance",
  },
  {
    id: "P-03",
    name: "Platelet Count (PLT)",
    code: "PLT",
    unit: "lakhs/µL",
    parentTest: "Complete Blood Count (CBC)",
    department: "Hematology",
    refRanges: { male: "1.50 - 4.50", female: "1.50 - 4.50" },
    panicLow: "< 0.20 lakhs/µL (Thrombocytopenia)",
    panicHigh: "> 10.00 lakhs/µL (Thrombocytosis)",
    method: "Hydrodynamic Focusing",
  },
  {
    id: "P-04",
    name: "Fasting Blood Sugar (Glucose Fasting)",
    code: "FBS",
    unit: "mg/dL",
    parentTest: "Fasting Blood Glucose",
    department: "Biochemistry",
    refRanges: { male: "70.0 - 99.0", female: "70.0 - 99.0" },
    panicLow: "< 45.0 mg/dL (Severe Hypoglycemia)",
    panicHigh: "> 400.0 mg/dL (Hyperglycemic Crisis)",
    method: "Hexokinase / GOD-POD",
  },
  {
    id: "P-05",
    name: "Serum Creatinine",
    code: "CREAT",
    unit: "mg/dL",
    parentTest: "Kidney Function Test (KFT)",
    department: "Biochemistry",
    refRanges: { male: "0.7 - 1.3", female: "0.5 - 1.1", pediatric: "0.3 - 0.7" },
    panicHigh: "> 5.0 mg/dL (Acute Renal Failure)",
    method: "Enzymatic / Modified Jaffe",
  },
  {
    id: "P-06",
    name: "Serum Potassium (K+)",
    code: "K",
    unit: "mmol/L",
    parentTest: "Serum Electrolytes",
    department: "Biochemistry",
    refRanges: { male: "3.5 - 5.1", female: "3.5 - 5.1" },
    panicLow: "< 2.8 mmol/L (Hypokalemia Arrhythmia)",
    panicHigh: "> 6.2 mmol/L (Hyperkalemia Cardiac Arrest)",
    method: "Ion Selective Electrode (ISE)",
  },
  {
    id: "P-07",
    name: "Cardiac Troponin I (High Sensitivity)",
    code: "HS-TROP-I",
    unit: "pg/mL",
    parentTest: "Troponin I Quantitative",
    department: "Immunoassay",
    refRanges: { male: "< 14.0", female: "< 14.0" },
    panicHigh: "> 50.0 pg/mL (Acute Myocardial Infarction)",
    method: "Chemiluminescence (CLIA)",
  },
];

export default function ParameterMatrixView() {
  const [parameters] = useState<ParameterItem[]>(DEFAULT_PARAMETERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  const filtered = parameters.filter((p) => {
    if (selectedDept !== "all" && p.department !== selectedDept) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.parentTest.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-md">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Clinical Reference Intervals &amp; Panic Thresholds
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              Laboratory Parameter &amp; Reference Matrix
            </h2>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              Age/gender-stratified biological reference ranges, units of measurement, analytical methods, and automated critical panic callout thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
          <input
            type="text"
            placeholder="Search parameter name, code, parent test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "Hematology", "Biochemistry", "Immunoassay"].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                selectedDept === dept
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {dept === "all" ? "All Departments" : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Parameters Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-5 py-4">Parameter Name &amp; Code</th>
                <th className="px-5 py-4">Parent Test Panel</th>
                <th className="px-5 py-4">Unit</th>
                <th className="px-5 py-4">Male Ref Range</th>
                <th className="px-5 py-4">Female Ref Range</th>
                <th className="px-5 py-4">Critical Panic Limits</th>
                <th className="px-5 py-4">Analytical Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-bold text-slate-100">{item.name}</p>
                      <span className="font-mono text-[10px] font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-300">{item.parentTest}</p>
                    <span className="text-[10px] text-slate-500">{item.department}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-slate-200">
                    {item.unit}
                  </td>
                  <td className="px-5 py-4 font-mono text-cyan-200 font-bold">
                    {item.refRanges.male} {item.unit}
                  </td>
                  <td className="px-5 py-4 font-mono text-purple-200 font-bold">
                    {item.refRanges.female} {item.unit}
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      {item.panicLow && (
                        <span className="block font-mono text-[10px] font-bold text-amber-300">
                          Low: {item.panicLow}
                        </span>
                      )}
                      {item.panicHigh && (
                        <span className="block font-mono text-[10px] font-bold text-rose-300">
                          High: {item.panicHigh}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 font-medium">
                    {item.method}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
