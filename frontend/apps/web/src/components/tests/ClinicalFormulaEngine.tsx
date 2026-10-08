"use client";

import React, { useState } from "react";
import {
  Calculator,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity,
  RotateCcw,
  BookOpen,
} from "lucide-react";

interface FormulaDef {
  id: string;
  name: string;
  code: string;
  department: string;
  formulaStr: string;
  clinicalPurpose: string;
  nablStandard: string;
  inputs: Array<{ key: string; label: string; unit: string; defaultValue: number; placeholder: string; step?: number }>;
  calculate: (inputs: Record<string, number>, extra?: { gender?: string; age?: number }) => {
    value: number;
    unit: string;
    interpretation: string;
    status: "NORMAL" | "WARNING" | "CRITICAL";
  };
}

const CLINICAL_FORMULAS: FormulaDef[] = [
  {
    id: "egfr",
    name: "eGFR (CKD-EPI 2021 Creatinine Equation)",
    code: "EGFR_CKDEPI",
    department: "Clinical Biochemistry & Nephrology",
    formulaStr: "eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(-1.200) × 0.9938^Age (× 1.012 if female)",
    clinicalPurpose: "Evaluates renal function, estimates glomerular filtration rate, and stages Chronic Kidney Disease (CKD) without racial adjustment.",
    nablStandard: "KDIGO 2024 / NABL ISO 15189 Validated",
    inputs: [
      { key: "creatinine", label: "Serum Creatinine", unit: "mg/dL", defaultValue: 1.1, placeholder: "e.g. 1.0", step: 0.05 },
      { key: "age", label: "Patient Age", unit: "Years", defaultValue: 52, placeholder: "e.g. 50", step: 1 },
    ],
    calculate: (inputs, extra) => {
      const scr = inputs.creatinine || 1.0;
      const age = inputs.age || 50;
      const isFemale = extra?.gender === "FEMALE";

      const kappa = isFemale ? 0.7 : 0.9;
      const alpha = isFemale ? -0.241 : -0.302;
      const genderFactor = isFemale ? 1.012 : 1.0;

      const scrRatio = scr / kappa;
      const minPart = Math.pow(Math.min(scrRatio, 1), alpha);
      const maxPart = Math.pow(Math.max(scrRatio, 1), -1.2);
      const agePart = Math.pow(0.9938, age);

      const egfr = Math.round(142 * minPart * maxPart * agePart * genderFactor * 10) / 10;

      let interpretation = "Stage 1: Normal or High renal filtration (≥ 90 mL/min/1.73m²)";
      let status: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";

      if (egfr >= 90) {
        interpretation = "Stage G1: Normal kidney function (≥ 90 mL/min/1.73m²)";
        status = "NORMAL";
      } else if (egfr >= 60) {
        interpretation = "Stage G2: Mildly decreased filtration (60-89 mL/min/1.73m²)";
        status = "NORMAL";
      } else if (egfr >= 45) {
        interpretation = "Stage G3a: Mild-to-moderate renal impairment (45-59 mL/min/1.73m²)";
        status = "WARNING";
      } else if (egfr >= 30) {
        interpretation = "Stage G3b: Moderate-to-severe renal impairment (30-44 mL/min/1.73m²)";
        status = "WARNING";
      } else if (egfr >= 15) {
        interpretation = "Stage G4: Severely decreased renal filtration (15-29 mL/min/1.73m²)";
        status = "CRITICAL";
      } else {
        interpretation = "Stage G5: Kidney Failure / End Stage Renal Disease (< 15 mL/min/1.73m²)";
        status = "CRITICAL";
      }

      return { value: egfr, unit: "mL/min/1.73m²", interpretation, status };
    },
  },
  {
    id: "ldl_friedewald",
    name: "Calculated LDL Cholesterol (Friedewald Equation)",
    code: "CHOL_LDL_CALC",
    department: "Clinical Biochemistry & Lipid Profile",
    formulaStr: "LDL-C = Total Cholesterol - HDL-C - (Triglycerides / 5)",
    clinicalPurpose: "Calculates low-density lipoprotein atherogenic particles. Valid only when Triglycerides < 400 mg/dL.",
    nablStandard: "NCEP ATP III / AHA Guidelines",
    inputs: [
      { key: "totalChol", label: "Total Cholesterol", unit: "mg/dL", defaultValue: 210, placeholder: "e.g. 200" },
      { key: "hdl", label: "HDL Cholesterol", unit: "mg/dL", defaultValue: 45, placeholder: "e.g. 50" },
      { key: "triglycerides", label: "Triglycerides", unit: "mg/dL", defaultValue: 160, placeholder: "e.g. 150" },
    ],
    calculate: (inputs) => {
      const tc = inputs.totalChol || 200;
      const hdl = inputs.hdl || 50;
      const tg = inputs.triglycerides || 150;

      if (tg >= 400) {
        const ldl = Math.round(tc - hdl - tg / 5);
        return {
          value: ldl,
          unit: "mg/dL",
          interpretation: "CAUTION: TG ≥ 400 mg/dL. Friedewald calculation is invalid due to chylomicronemia. Direct LDL Enzymatic Assay recommended.",
          status: "CRITICAL",
        };
      }

      const ldl = Math.round(tc - hdl - tg / 5);
      let interpretation = "Optimal (< 100 mg/dL)";
      let status: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";

      if (ldl < 100) {
        interpretation = "Optimal LDL Cholesterol (< 100 mg/dL)";
        status = "NORMAL";
      } else if (ldl <= 129) {
        interpretation = "Near or Above Optimal (100 - 129 mg/dL)";
        status = "NORMAL";
      } else if (ldl <= 159) {
        interpretation = "Borderline High Risk (130 - 159 mg/dL)";
        status = "WARNING";
      } else if (ldl <= 189) {
        interpretation = "High Risk of Atherosclerosis (160 - 189 mg/dL)";
        status = "WARNING";
      } else {
        interpretation = "Very High Risk (≥ 190 mg/dL) - Statin therapy indicated";
        status = "CRITICAL";
      }

      return { value: ldl, unit: "mg/dL", interpretation, status };
    },
  },
  {
    id: "indirect_bilirubin",
    name: "Indirect (Unconjugated) Bilirubin",
    code: "BILI_INDIRECT",
    department: "Liver Function Profile (LFT)",
    formulaStr: "Indirect Bilirubin = Total Bilirubin - Direct Bilirubin",
    clinicalPurpose: "Differentiates hemolytic jaundice (pre-hepatic) from hepatocellular and obstructive cholestatic jaundice.",
    nablStandard: "NABL LFT Standard SOP",
    inputs: [
      { key: "totalBili", label: "Total Bilirubin", unit: "mg/dL", defaultValue: 1.4, placeholder: "e.g. 1.0", step: 0.1 },
      { key: "directBili", label: "Direct Bilirubin", unit: "mg/dL", defaultValue: 0.3, placeholder: "e.g. 0.2", step: 0.05 },
    ],
    calculate: (inputs) => {
      const tb = inputs.totalBili || 1.0;
      const db = inputs.directBili || 0.2;
      const indirect = Math.max(0, Math.round((tb - db) * 100) / 100);

      let interpretation = "Normal unconjugated bilirubin level (0.2 - 0.8 mg/dL)";
      let status: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";

      if (indirect <= 0.8) {
        interpretation = "Normal unconjugated bilirubin (0.2 - 0.8 mg/dL)";
        status = "NORMAL";
      } else if (indirect <= 2.5) {
        interpretation = "Elevated Unconjugated Bilirubin (Hemolysis / Gilbert's Syndrome workup)";
        status = "WARNING";
      } else {
        interpretation = "Severe Hyperbilirubinemia (Hemolytic crisis or severe hepatic dysfunction)";
        status = "CRITICAL";
      }

      return { value: indirect, unit: "mg/dL", interpretation, status };
    },
  },
  {
    id: "ag_ratio",
    name: "Albumin-to-Globulin (A/G) Ratio",
    code: "AG_RATIO",
    department: "Serum Proteins & Hepatic Function",
    formulaStr: "A/G Ratio = Albumin / (Total Protein - Albumin)",
    clinicalPurpose: "Assesses nutritional status, liver cirrhosis, nephrotic syndrome, and multiple myeloma / plasma cell dyscrasias.",
    nablStandard: "CLSI / CAP Diagnostic Standard",
    inputs: [
      { key: "totalProtein", label: "Total Serum Protein", unit: "g/dL", defaultValue: 7.2, placeholder: "e.g. 7.0", step: 0.1 },
      { key: "albumin", label: "Serum Albumin", unit: "g/dL", defaultValue: 4.2, placeholder: "e.g. 4.0", step: 0.1 },
    ],
    calculate: (inputs) => {
      const tp = inputs.totalProtein || 7.0;
      const alb = inputs.albumin || 4.0;
      const globulin = Math.max(0.1, tp - alb);
      const ratio = Math.round((alb / globulin) * 100) / 100;

      let interpretation = "Normal balanced A/G Ratio (1.20 - 2.20)";
      let status: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";

      if (ratio >= 1.2 && ratio <= 2.2) {
        interpretation = "Normal physiological protein ratio (1.20 - 2.20)";
        status = "NORMAL";
      } else if (ratio < 1.0) {
        interpretation = "Reversed A/G Ratio (< 1.0) - High suspicion of Chronic Liver Disease, Nephrotic Syndrome or Monoclonal Gammopathy";
        status = "CRITICAL";
      } else if (ratio < 1.2) {
        interpretation = "Low A/G Ratio (1.0 - 1.19) - Mild hypoalbuminemia or hypergammaglobulinemia";
        status = "WARNING";
      } else {
        interpretation = "High A/G Ratio (> 2.20) - Hypogammaglobulinemia or dehydration";
        status = "WARNING";
      }

      return { value: ratio, unit: "Ratio", interpretation, status };
    },
  },
  {
    id: "eag",
    name: "Estimated Average Glucose (eAG from HbA1c)",
    code: "EAG_HBA1C",
    department: "Endocrinology & Diabetic Management",
    formulaStr: "eAG (mg/dL) = 28.7 × HbA1c (%) - 46.7",
    clinicalPurpose: "Translates long-term 90-day glycosylated hemoglobin into standard daily blood glucose self-monitoring equivalents for patients.",
    nablStandard: "ADA / IFCC Consensus Guidelines",
    inputs: [
      { key: "hba1c", label: "HbA1c Level", unit: "%", defaultValue: 7.4, placeholder: "e.g. 6.5", step: 0.1 },
    ],
    calculate: (inputs) => {
      const hba1c = inputs.hba1c || 6.0;
      const eag = Math.round(28.7 * hba1c - 46.7);

      let interpretation = "Normal Non-Diabetic range (< 5.7%, eAG < 117 mg/dL)";
      let status: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";

      if (hba1c < 5.7) {
        interpretation = "Normal Non-Diabetic profile (< 5.7%, eAG < 117 mg/dL)";
        status = "NORMAL";
      } else if (hba1c <= 6.4) {
        interpretation = "Prediabetes / Impaired Glucose Tolerance (5.7 - 6.4%, eAG 117 - 137 mg/dL)";
        status = "WARNING";
      } else if (hba1c <= 8.0) {
        interpretation = "Controlled Diabetes (6.5 - 8.0%, eAG 140 - 183 mg/dL)";
        status = "WARNING";
      } else {
        interpretation = "Uncontrolled Diabetes / Hyperglycemia (> 8.0%, eAG > 183 mg/dL) - High microvascular complication risk";
        status = "CRITICAL";
      }

      return { value: eag, unit: "mg/dL", interpretation, status };
    },
  },
  {
    id: "anc",
    name: "Absolute Neutrophil Count (ANC)",
    code: "ANC_HEMA",
    department: "Hematology & Oncology",
    formulaStr: "ANC = Total WBC × (% Neutrophils + % Bands) / 100",
    clinicalPurpose: "Measures infection defense capacity, monitors chemotherapy-induced neutropenia and sepsis susceptibility.",
    nablStandard: "WHO / NCCN Clinical Practice Guidelines",
    inputs: [
      { key: "wbc", label: "Total WBC Count", unit: "cells/µL", defaultValue: 6500, placeholder: "e.g. 7000", step: 100 },
      { key: "neutrophils", label: "Neutrophils Percentage", unit: "%", defaultValue: 62, placeholder: "e.g. 60", step: 1 },
      { key: "bands", label: "Band Forms (Immature)", unit: "%", defaultValue: 2, placeholder: "e.g. 0", step: 1 },
    ],
    calculate: (inputs) => {
      const wbc = inputs.wbc || 5000;
      const neut = inputs.neutrophils || 55;
      const bands = inputs.bands || 0;
      const anc = Math.round((wbc * (neut + bands)) / 100);

      let interpretation = "Normal Neutrophil Defense (1,500 - 8,000 /µL)";
      let status: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";

      if (anc >= 1500) {
        interpretation = "Normal infection defense (ANC ≥ 1,500 /µL)";
        status = "NORMAL";
      } else if (anc >= 1000) {
        interpretation = "Mild Neutropenia (1,000 - 1,499 /µL) - Low infectious risk";
        status = "WARNING";
      } else if (anc >= 500) {
        interpretation = "Moderate Neutropenia (500 - 999 /µL) - Clinically significant risk";
        status = "WARNING";
      } else {
        interpretation = "CRITICAL / Severe Neutropenia (< 500 /µL) - High risk of life-threatening bacteremia!";
        status = "CRITICAL";
      }

      return { value: anc, unit: "cells/µL", interpretation, status };
    },
  },
  {
    id: "non_hdl",
    name: "Non-HDL Cholesterol",
    code: "NON_HDL_CHOL",
    department: "Clinical Biochemistry & Preventive Cardiology",
    formulaStr: "Non-HDL-C = Total Cholesterol - HDL Cholesterol",
    clinicalPurpose: "Measures all circulating atherogenic lipoproteins (LDL, VLDL, IDL, Lp(a)). Preferred secondary target in hypertriglyceridemia.",
    nablStandard: "NLA / ESC Clinical Guidelines",
    inputs: [
      { key: "totalChol", label: "Total Cholesterol", unit: "mg/dL", defaultValue: 220, placeholder: "e.g. 200" },
      { key: "hdl", label: "HDL Cholesterol", unit: "mg/dL", defaultValue: 42, placeholder: "e.g. 50" },
    ],
    calculate: (inputs) => {
      const tc = inputs.totalChol || 200;
      const hdl = inputs.hdl || 50;
      const nonHdl = Math.round(tc - hdl);

      let interpretation = "Optimal Non-HDL (< 130 mg/dL)";
      let status: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";

      if (nonHdl < 130) {
        interpretation = "Desirable / Optimal atherogenic burden (< 130 mg/dL)";
        status = "NORMAL";
      } else if (nonHdl <= 159) {
        interpretation = "Borderline High Risk (130 - 159 mg/dL)";
        status = "WARNING";
      } else if (nonHdl <= 189) {
        interpretation = "High Atherogenic Risk (160 - 189 mg/dL)";
        status = "WARNING";
      } else {
        interpretation = "Very High Risk (≥ 190 mg/dL) - Lipid-lowering escalation indicated";
        status = "CRITICAL";
      }

      return { value: nonHdl, unit: "mg/dL", interpretation, status };
    },
  },
];

export default function ClinicalFormulaEngine() {
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>("egfr");
  const [patientGender, setPatientGender] = useState<"MALE" | "FEMALE">("MALE");
  const [patientAge, setPatientAge] = useState<number>(52);
  const [inputValues, setInputValues] = useState<Record<string, number>>({
    creatinine: 1.1,
    age: 52,
    totalChol: 210,
    hdl: 45,
    triglycerides: 160,
    totalBili: 1.4,
    directBili: 0.3,
    totalProtein: 7.2,
    albumin: 4.2,
    hba1c: 7.4,
    wbc: 6500,
    neutrophils: 62,
    bands: 2,
  });

  const activeFormula = CLINICAL_FORMULAS.find((f) => f.id === selectedFormulaId) || CLINICAL_FORMULAS[0];

  const handleInputChange = (key: string, value: string) => {
    const num = parseFloat(value) || 0;
    setInputValues((prev) => ({ ...prev, [key]: num }));
  };

  const result = activeFormula.calculate(inputValues, {
    gender: patientGender,
    age: patientAge,
  });

  return (
    <div className="space-y-6">
      {/* Light White Professional Clinical Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100/70 px-3.5 py-1 text-xs font-bold text-blue-800">
              <Calculator className="h-3.5 w-3.5 text-blue-600" />
              <span>NABL &amp; ISO 15189 Clinical Derivations Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Clinical Formula &amp; Derived Analytes Studio
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Standardized hospital-grade automated formulas for derived parameters. Eliminates manual math errors in diagnostic reports with automated validation rules and clinical alert triggers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xs">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">7 Verified Formulas</span>
                <span className="text-[10px] text-slate-500 font-medium block">KDIGO · Friedewald · ADA · IFCC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Formula Catalog List (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>Standard Derived Investigation Analytes</span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {CLINICAL_FORMULAS.length} Active
              </span>
            </h3>

            <div className="space-y-2">
              {CLINICAL_FORMULAS.map((formula) => {
                const isSelected = formula.id === selectedFormulaId;
                return (
                  <button
                    key={formula.id}
                    onClick={() => setSelectedFormulaId(formula.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-400 text-blue-950 shadow-xs ring-2 ring-blue-500/10"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {formula.code}
                        </span>
                        <h4 className="text-sm font-bold leading-snug text-slate-900 mt-1">
                          {formula.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {formula.department}
                        </p>
                      </div>
                      <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${
                        isSelected ? "text-blue-600 translate-x-1" : "text-slate-400"
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Formula Workbench & Interactive Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
            {/* Active Formula Header */}
            <div className="border-b border-slate-100 pb-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                  {activeFormula.department}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {activeFormula.nablStandard}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {activeFormula.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeFormula.clinicalPurpose}
              </p>

              {/* Mathematical Formula Display Box */}
              <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Validated Clinical Formula:
                </span>
                <code className="text-xs font-mono font-bold text-indigo-700 break-all">
                  {activeFormula.formulaStr}
                </code>
              </div>
            </div>

            {/* Patient Context Parameters (If applicable) */}
            {activeFormula.id === "egfr" && (
              <div className="rounded-2xl bg-indigo-50/40 border border-indigo-200/60 p-4 space-y-3">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-indigo-600" /> Patient Demographics Modifier
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Biological Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPatientGender("MALE")}
                        className={`py-2 text-xs font-bold rounded-xl border text-center transition ${
                          patientGender === "MALE"
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        Male (κ = 0.9)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPatientGender("FEMALE")}
                        className={`py-2 text-xs font-bold rounded-xl border text-center transition ${
                          patientGender === "FEMALE"
                            ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        Female (κ = 0.7)
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Age (Years)</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 50;
                        setPatientAge(val);
                        setInputValues((p) => ({ ...p, age: val }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Input Variables Form */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-blue-600" />
                <span>Analyte Input Parameters</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activeFormula.inputs.map((input) => (
                  <div key={input.key} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>{input.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({input.unit})</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={input.step || 1}
                        value={inputValues[input.key] !== undefined ? inputValues[input.key] : input.defaultValue}
                        onChange={(e) => handleInputChange(input.key, e.target.value)}
                        placeholder={input.placeholder}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 px-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                        {input.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-Time Live Result Assessment Card */}
            <div className={`rounded-2xl border p-5 transition-all duration-300 ${
              result.status === "CRITICAL"
                ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/10"
                : result.status === "WARNING"
                ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/10"
                : "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/10"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Derived Diagnostic Output:
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      {result.value}
                    </span>
                    <span className="text-sm font-bold text-slate-600">
                      {result.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                    result.status === "CRITICAL"
                      ? "bg-rose-600 text-white shadow-xs"
                      : result.status === "WARNING"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-emerald-600 text-white shadow-xs"
                  }`}>
                    {result.status === "CRITICAL" && <AlertTriangle className="h-3.5 w-3.5" />}
                    {result.status === "WARNING" && <AlertTriangle className="h-3.5 w-3.5" />}
                    {result.status === "NORMAL" && <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span>{result.status === "CRITICAL" ? "Panic / Critical Value" : result.status === "WARNING" ? "Elevated / Borderline" : "Normal Interval"}</span>
                  </span>
                </div>
              </div>

              {/* Interpretation Text */}
              <div className="mt-3 pt-3 border-t border-slate-200/60">
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  <strong className="text-slate-900 font-bold">Clinical Interpretation:</strong> {result.interpretation}
                </p>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-blue-500" /> Auto-computed in Patient Result Entry
              </span>
              <button
                type="button"
                onClick={() => {
                  setInputValues({
                    creatinine: 1.1,
                    age: 52,
                    totalChol: 210,
                    hdl: 45,
                    triglycerides: 160,
                    totalBili: 1.4,
                    directBili: 0.3,
                    totalProtein: 7.2,
                    albumin: 4.2,
                    hba1c: 7.4,
                    wbc: 6500,
                    neutrophils: 62,
                    bands: 2,
                  });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Standard Defaults</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
