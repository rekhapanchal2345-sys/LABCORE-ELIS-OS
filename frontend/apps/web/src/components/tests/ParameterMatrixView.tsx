"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
  Activity,
  Layers,
  BellRing,
  ShieldAlert,
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
    panicHigh: "> 10.0 lakhs/µL (Thrombocytosis)",
    method: "Direct Electrical Impedance",
  },
  {
    id: "P-04",
    name: "Serum Creatinine",
    code: "CREAT",
    unit: "mg/dL",
    parentTest: "Kidney Function Test (KFT)",
    department: "Biochemistry",
    refRanges: { male: "0.7 - 1.3", female: "0.6 - 1.1", pediatric: "0.3 - 0.7" },
    panicLow: undefined,
    panicHigh: "> 4.0 mg/dL (Acute Renal Failure)",
    method: "Jaffe Kinetic / Enzymatic",
  },
  {
    id: "P-05",
    name: "Serum Potassium (K+)",
    code: "K_SERUM",
    unit: "mmol/L",
    parentTest: "Serum Electrolytes",
    department: "Biochemistry",
    refRanges: { male: "3.5 - 5.1", female: "3.5 - 5.1" },
    panicLow: "< 2.8 mmol/L (Cardiac Arrhythmia)",
    panicHigh: "> 6.2 mmol/L (Ventricular Fibrillation)",
    method: "Ion Selective Electrode (ISE)",
  },
  {
    id: "P-06",
    name: "Serum Sodium (Na+)",
    code: "NA_SERUM",
    unit: "mmol/L",
    parentTest: "Serum Electrolytes",
    department: "Biochemistry",
    refRanges: { male: "136 - 145", female: "136 - 145" },
    panicLow: "< 120 mmol/L (Severe Hyponatremia)",
    panicHigh: "> 160 mmol/L (Hypernatremia)",
    method: "Ion Selective Electrode (ISE)",
  },
  {
    id: "P-07",
    name: "Fasting Blood Glucose",
    code: "GLUC_FAST",
    unit: "mg/dL",
    parentTest: "Blood Glucose Fasting",
    department: "Biochemistry",
    refRanges: { male: "70 - 99", female: "70 - 99" },
    panicLow: "< 45 mg/dL (Severe Hypoglycemia)",
    panicHigh: "> 400 mg/dL (Hyperglycemic Crisis)",
    method: "Hexokinase / GOD-POD",
  },
  {
    id: "P-08",
    name: "High-Sensitivity Troponin-I",
    code: "TROP_I_HS",
    unit: "ng/L",
    parentTest: "Cardiac Biomarkers",
    department: "Immunoassay",
    refRanges: { male: "< 19.8", female: "< 11.6" },
    panicHigh: "> 50 ng/L (Acute Myocardial Infarction)",
    method: "Chemiluminescent Microparticle (CMIA)",
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
      {/* Light White Professional Clinical Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100/70 px-3.5 py-1 text-xs font-bold text-blue-800">
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
              <span>NABL ISO 15189 Biological Reference Intervals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Clinical Analyte Parameters &amp; Biological Intervals
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Age- and gender-stratified biological reference ranges, units of measurement, analytical methods, and automated critical panic callout thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search parameter name, code, parent test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {["all", "Hematology", "Biochemistry", "Immunoassay"].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedDept === dept
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {dept === "all" ? "All Departments" : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Parameters Table in Light White Aesthetic */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Analyte Parameter</th>
                <th className="p-4">Parent Investigation</th>
                <th className="p-4">Biological Reference Range</th>
                <th className="p-4">Critical / Panic Bounds</th>
                <th className="p-4">Methodology</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {item.code}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">({item.unit})</span>
                    </div>
                    <span className="font-bold text-slate-900 block text-sm">{item.name}</span>
                  </td>

                  <td className="p-4 space-y-0.5">
                    <span className="font-semibold text-slate-800 block">{item.parentTest}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{item.department}</span>
                  </td>

                  <td className="p-4 space-y-1 text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">M</span>
                      <span className="font-mono font-semibold">{item.refRanges.male} {item.unit}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-1.5 py-0.2 rounded">F</span>
                      <span className="font-mono font-semibold">{item.refRanges.female} {item.unit}</span>
                    </div>
                    {item.refRanges.pediatric && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">Ped</span>
                        <span className="font-mono text-slate-500">{item.refRanges.pediatric}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-4 space-y-1">
                    {item.panicLow && (
                      <div className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-extrabold text-rose-700">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Low: {item.panicLow}</span>
                      </div>
                    )}
                    {item.panicHigh && (
                      <div className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 block">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>High: {item.panicHigh}</span>
                      </div>
                    )}
                    {!item.panicLow && !item.panicHigh && (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>

                  <td className="p-4 text-slate-600 font-medium">
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
