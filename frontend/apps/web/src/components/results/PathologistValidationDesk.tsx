"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  AlertTriangle,
  Stethoscope,
  Microscope,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  XCircle,
  FileText,
  BadgeAlert,
  Sliders,
  ChevronDown,
  Info,
  Clock,
  User,
  Activity
} from "lucide-react";

export interface ValidationItem {
  id: string;
  orderNumber: string;
  barcode: string;
  uhid: string;
  patientName: string;
  age: string;
  gender: string;
  wardOrOPD: string;
  clinicalIndication: string;
  testName: string;
  category: string;
  specimenType: string;
  collectionTime: string;
  serumIndices: {
    hemolysisIndex: number; // 0-4
    icterusIndex: number;    // 0-3
    lipemiaIndex: number;    // 0-3
    status: "ACCEPTABLE" | "BORDERLINE_INTERFERENCE" | "REJECT_SPECIMEN";
  };
  parameters: Array<{
    id: string;
    name: string;
    value: string;
    unit: string;
    refMin: number;
    refMax: number;
    flag: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
    previousValue?: string;
    previousDate?: string;
  }>;
  reflexOptions?: Array<{
    id: string;
    testName: string;
    reason: string;
    cost: string;
  }>;
  technicianNotes?: string;
  status: "PENDING_PATHOLOGIST" | "APPROVED" | "HELD_FOR_RERUN" | "REJECTED_SAMPLE";
  interpretationTemplate?: string;
}

const SAMPLE_VALIDATION_ITEMS: ValidationItem[] = [
  {
    id: "VAL-301",
    orderNumber: "ORD-2026-9021",
    barcode: "BC-991204",
    uhid: "UHID-88219",
    patientName: "Meenakshi Sundaram",
    age: "52y",
    gender: "F",
    wardOrOPD: "Endocrinology OPD",
    clinicalIndication: "Fatigue, unexplained weight gain, suspected primary hypothyroidism",
    testName: "Thyroid Function Profile (TFT Extended)",
    category: "Immunoassay & Hormones",
    specimenType: "Serum (SST Gel Separator)",
    collectionTime: "Today, 08:30 AM",
    serumIndices: {
      hemolysisIndex: 0,
      icterusIndex: 0,
      lipemiaIndex: 1,
      status: "ACCEPTABLE",
    },
    parameters: [
      { id: "p1", name: "TSH (Ultrasensitive)", value: "14.8", unit: "µIU/mL", refMin: 0.35, refMax: 4.94, flag: "CRITICAL", previousValue: "5.8", previousDate: "3 months ago" },
      { id: "p2", name: "Total Thyroxine (T4)", value: "4.2", unit: "µg/dL", refMin: 4.8, refMax: 11.6, flag: "LOW", previousValue: "5.1", previousDate: "3 months ago" },
      { id: "p3", name: "Total Triiodothyronine (T3)", value: "0.72", unit: "ng/mL", refMin: 0.60, refMax: 1.81, flag: "NORMAL" },
    ],
    reflexOptions: [
      { id: "ref-1", testName: "Free Thyroxine (FT4 Stat)", reason: "TSH > 10.0 with low T4 to establish overt primary hypothyroidism", cost: "Reflex Covered" },
      { id: "ref-2", testName: "Anti-TPO Antibodies", reason: "Confirm autoimmune etiology (Hashimoto Thyroiditis)", cost: "Reflex Covered" },
    ],
    technicianNotes: "Specimen ran in duplicate on Roche Cobas e411. Delta checked against previous record.",
    status: "PENDING_PATHOLOGIST",
    interpretationTemplate: "Elevated TSH with low total T4 in a symptomatic patient is consistent with overt primary hypothyroidism. Clinical correlation and anti-TPO antibody assessment advised.",
  },
  {
    id: "VAL-302",
    orderNumber: "ORD-2026-9028",
    barcode: "BC-991219",
    uhid: "UHID-77341",
    patientName: "Devendra Nath Roy",
    age: "64y",
    gender: "M",
    wardOrOPD: "General Medicine Ward - Bed 14",
    clinicalIndication: "High grade fever with chills, body ache, thrombocytopenia workup",
    testName: "Complete Blood Count & Peripheral Smear",
    category: "Hematology & Microscopy",
    specimenType: "Whole Blood (K2-EDTA)",
    collectionTime: "Today, 09:15 AM",
    serumIndices: {
      hemolysisIndex: 1,
      icterusIndex: 0,
      lipemiaIndex: 0,
      status: "ACCEPTABLE",
    },
    parameters: [
      { id: "p4", name: "Hemoglobin", value: "9.2", unit: "g/dL", refMin: 13.0, refMax: 17.0, flag: "LOW", previousValue: "13.4", previousDate: "1 month ago" },
      { id: "p5", name: "Total Leucocyte Count (TLC)", value: "2,800", unit: "/µL", refMin: 4000, refMax: 11000, flag: "LOW" },
      { id: "p6", name: "Platelet Count", value: "32,000", unit: "/µL", refMin: 150000, refMax: 450000, flag: "CRITICAL", previousValue: "185,000", previousDate: "1 month ago" },
      { id: "p7", name: "Hematocrit (PCV)", value: "28.5", unit: "%", refMin: 40.0, refMax: 50.0, flag: "LOW" },
      { id: "p8", name: "Neutrophils %", value: "62", unit: "%", refMin: 40, refMax: 75, flag: "NORMAL" },
      { id: "p9", name: "Lymphocytes %", value: "31", unit: "%", refMin: 20, refMax: 45, flag: "NORMAL" },
    ],
    reflexOptions: [
      { id: "ref-3", testName: "Dengue NS1 Antigen & IgM/IgG", reason: "Leukopenia + profound thrombocytopenia in febrile illness", cost: "Reflex Covered" },
      { id: "ref-4", testName: "Manual Peripheral Smear Microscopy for Malarial Parasite", reason: "Rule out Plasmodium trophozoites/gametocytes", cost: "Standard Protocol" },
    ],
    technicianNotes: "Flag: Analyzer reported platelet clumps? Manual chamber count verified true thrombocytopenia.",
    status: "PENDING_PATHOLOGIST",
    interpretationTemplate: "Bicytopenia (moderate normocytic anemia and severe thrombocytopenia with leucopenia). Peripheral smear examination confirms genuine thrombocytopenia without platelet clumps. Features suggestive of viral syndrome / dengue / acute febrile marrow suppression.",
  },
  {
    id: "VAL-303",
    orderNumber: "ORD-2026-9042",
    barcode: "BC-991244",
    uhid: "UHID-66102",
    patientName: "Kavita Ramesh Chawla",
    age: "36y",
    gender: "F",
    wardOrOPD: "Gastroenterology Day Care",
    clinicalIndication: "Jaundice, RUQ pain, elevated AST/ALT",
    testName: "Liver Function Test Comprehensive",
    category: "Clinical Biochemistry",
    specimenType: "Serum (SST Gel)",
    collectionTime: "Today, 10:00 AM",
    serumIndices: {
      hemolysisIndex: 2,
      icterusIndex: 3,
      lipemiaIndex: 0,
      status: "BORDERLINE_INTERFERENCE",
    },
    parameters: [
      { id: "p10", name: "Total Bilirubin", value: "6.8", unit: "mg/dL", refMin: 0.2, refMax: 1.2, flag: "CRITICAL" },
      { id: "p11", name: "Direct Bilirubin", value: "4.9", unit: "mg/dL", refMin: 0.0, refMax: 0.3, flag: "CRITICAL" },
      { id: "p12", name: "SGOT (AST)", value: "480", unit: "U/L", refMin: 5, refMax: 40, flag: "CRITICAL" },
      { id: "p13", name: "SGPT (ALT)", value: "610", unit: "U/L", refMin: 5, refMax: 45, flag: "CRITICAL" },
      { id: "p14", name: "Alkaline Phosphatase", value: "245", unit: "U/L", refMin: 35, refMax: 125, flag: "HIGH" },
    ],
    reflexOptions: [
      { id: "ref-5", testName: "Viral Hepatitis Serology (HBsAg, Anti-HCV, IgM Anti-HAV, IgM Anti-HEV)", reason: "Acute hepatocellular injury pattern with transaminases > 10x ULN", cost: "Reflex Recommended" },
    ],
    technicianNotes: "Gross icteric sample. Instrument photometric blank compensated for bilirubin absorbance.",
    status: "PENDING_PATHOLOGIST",
    interpretationTemplate: "Marked direct hyperbilirubinemia with severe transaminitis (>10-15x ULN), indicative of acute hepatocellular necrosis (viral hepatitis vs drug-induced vs ischemic hepatitis). Serological correlation advised urgently.",
  },
];

export default function PathologistValidationDesk() {
  const [items, setItems] = useState<ValidationItem[]>(SAMPLE_VALIDATION_ITEMS);
  const [selectedItem, setSelectedItem] = useState<ValidationItem>(SAMPLE_VALIDATION_ITEMS[0]);
  const [currentInterpretation, setCurrentInterpretation] = useState<string>(
    SAMPLE_VALIDATION_ITEMS[0].interpretationTemplate || ""
  );
  const [selectedReflexes, setSelectedReflexes] = useState<Set<string>>(new Set(["ref-1"]));
  const [showSignModal, setShowSignModal] = useState(false);
  const [signingDoctor, setSigningDoctor] = useState({
    name: "Dr. Ananya Ray",
    designation: "Chief Pathologist & Quality Manager",
    regNo: "MCI-WB-44218-A",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSelectItem = (item: ValidationItem) => {
    setSelectedItem(item);
    setCurrentInterpretation(item.interpretationTemplate || "");
    setSelectedReflexes(new Set(item.reflexOptions ? [item.reflexOptions[0].id] : []));
  };

  const toggleReflex = (refId: string) => {
    const next = new Set(selectedReflexes);
    if (next.has(refId)) next.delete(refId);
    else next.add(refId);
    setSelectedReflexes(next);
  };

  const handleApproveAndSign = () => {
    setItems((prev) =>
      prev.map((i) => (i.id === selectedItem.id ? { ...i, status: "APPROVED" } : i))
    );
    setShowSignModal(false);
    setToastMessage(`Digitally signed and released test report for ${selectedItem.patientName}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleHoldForRerun = () => {
    setItems((prev) =>
      prev.map((i) => (i.id === selectedItem.id ? { ...i, status: "HELD_FOR_RERUN" } : i))
    );
    setToastMessage(`Sample held for analytical rerun/dilution. Worklist notification dispatched.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRejectSpecimen = () => {
    if (confirm(`Reject specimen ${selectedItem.barcode}? A pre-analytical rejection alert will be generated and sample recollection requested.`)) {
      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? { ...i, status: "REJECTED_SAMPLE" } : i))
      );
      setToastMessage(`Specimen rejected. Preanalytical incident recorded.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 px-5 py-4 text-emerald-300 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <Microscope className="h-3.5 w-3.5 text-indigo-400" />
              Pathologist & Senior Medical Officer Workstation
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Clinical Validation & Diagnostic Sign-Off Desk
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">
              Comprehensive medical review of abnormal test panels with Serum Interference Indices (HIL), reflex cascade triggers, and digital stamp authorization.
            </p>
          </div>

          {/* Pathologist On-Duty Badge */}
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/40 px-5 py-3.5 backdrop-blur-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 font-bold">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Authorized Signatory</p>
              <p className="text-sm font-bold text-white">{signingDoctor.name}</p>
              <p className="text-[10px] text-slate-400">{signingDoctor.regNo} · {signingDoctor.designation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Master-Detail Split Screen Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Worklist Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Pending Validation ({items.filter(i => i.status === "PENDING_PATHOLOGIST").length})
            </span>
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const isSelected = selectedItem.id === item.id;
              const hasCritical = item.parameters.some((p) => p.flag === "CRITICAL");

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-950/50"
                      : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-400">{item.uhid}</span>
                        <span className="text-[10px] text-slate-400">· {item.wardOrOPD}</span>
                      </div>
                      <h4 className="mt-0.5 text-sm font-bold text-white">{item.patientName}</h4>
                      <p className="text-xs text-slate-300">{item.testName}</p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        item.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : item.status === "HELD_FOR_RERUN"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : item.status === "REJECTED_SAMPLE"
                          ? "bg-red-500/20 text-red-300 border border-red-500/40"
                          : hasCritical
                          ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                      }`}
                    >
                      {item.status === "APPROVED"
                        ? "Signed"
                        : item.status === "HELD_FOR_RERUN"
                        ? "Held"
                        : item.status === "REJECTED_SAMPLE"
                        ? "Rejected"
                        : hasCritical
                        ? "Panic Alert"
                        : "Review"}
                    </span>
                  </div>

                  {/* Flag count pill */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2.5">
                    <span>{item.parameters.length} Parameters</span>
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <AlertTriangle className="h-3 w-3" />
                      {item.parameters.filter(p => p.flag !== "NORMAL").length} Abnormal Flags
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Clinical Inspection Console (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Patient Clinical Context Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-cyan-400 font-semibold">{selectedItem.uhid}</span>
                  <span>·</span>
                  <span>Order: {selectedItem.orderNumber}</span>
                  <span>·</span>
                  <span>Sample Barcode: {selectedItem.barcode}</span>
                </div>
                <h3 className="mt-1 text-xl font-bold text-white">
                  {selectedItem.patientName} ({selectedItem.age} / {selectedItem.gender})
                </h3>
                <p className="mt-0.5 text-xs text-indigo-300 font-medium">
                  {selectedItem.testName} · {selectedItem.category}
                </p>
              </div>

              {/* Specimen Integrity (HIL Indices) */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specimen Integrity</p>
                  <p className={`text-xs font-bold ${
                    selectedItem.serumIndices.status === "ACCEPTABLE"
                      ? "text-emerald-400"
                      : selectedItem.serumIndices.status === "BORDERLINE_INTERFERENCE"
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}>
                    {selectedItem.serumIndices.status.replace("_", " ")}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3 text-[10px]">
                  <span className="rounded bg-rose-950/50 text-rose-300 px-1.5 py-0.5 border border-rose-800/40">
                    H: {selectedItem.serumIndices.hemolysisIndex}+
                  </span>
                  <span className="rounded bg-amber-950/50 text-amber-300 px-1.5 py-0.5 border border-amber-800/40">
                    I: {selectedItem.serumIndices.icterusIndex}+
                  </span>
                  <span className="rounded bg-slate-800 text-slate-300 px-1.5 py-0.5 border border-slate-700">
                    L: {selectedItem.serumIndices.lipemiaIndex}+
                  </span>
                </div>
              </div>
            </div>

            {/* Clinical Indication & Tech Notes */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Clinical Indication / Diagnosis
                </span>
                <p className="mt-1 text-slate-200">{selectedItem.clinicalIndication}</p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Laboratory Tech Notes
                </span>
                <p className="mt-1 text-slate-300 italic">{selectedItem.technicianNotes}</p>
              </div>
            </div>

            {/* Parameter Review Table */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
              <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs font-bold text-slate-300 uppercase tracking-wider grid grid-cols-12 gap-2">
                <div className="col-span-4">Parameter</div>
                <div className="col-span-2 text-right">Result</div>
                <div className="col-span-2 text-center">Flag</div>
                <div className="col-span-2 text-center">Reference Range</div>
                <div className="col-span-2 text-right">Delta History</div>
              </div>

              <div className="divide-y divide-slate-800/60">
                {selectedItem.parameters.map((param) => (
                  <div key={param.id} className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-xs">
                    <div className="col-span-4 font-semibold text-white">
                      {param.name}
                    </div>

                    <div className="col-span-2 text-right font-mono font-bold text-sm">
                      <span className={
                        param.flag === "CRITICAL"
                          ? "text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40"
                          : param.flag === "HIGH"
                          ? "text-rose-400"
                          : param.flag === "LOW"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }>
                        {param.value} <span className="text-[10px] font-normal text-slate-400">{param.unit}</span>
                      </span>
                    </div>

                    <div className="col-span-2 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        param.flag === "CRITICAL"
                          ? "bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse"
                          : param.flag === "HIGH"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : param.flag === "LOW"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}>
                        {param.flag}
                      </span>
                    </div>

                    <div className="col-span-2 text-center font-mono text-[11px] text-slate-400">
                      {param.refMin} - {param.refMax} {param.unit}
                    </div>

                    <div className="col-span-2 text-right text-[11px] text-slate-400">
                      {param.previousValue ? (
                        <div>
                          <span className="font-mono text-cyan-300 font-semibold">{param.previousValue}</span>
                          <span className="block text-[9px] text-slate-500">{param.previousDate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reflex Cascade Opportunities */}
            {selectedItem.reflexOptions && selectedItem.reflexOptions.length > 0 && (
              <div className="mt-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Recommended Reflex Cascade & Add-on Tests
                </div>
                <div className="mt-3 space-y-2">
                  {selectedItem.reflexOptions.map((ref) => {
                    const isChecked = selectedReflexes.has(ref.id);
                    return (
                      <label
                        key={ref.id}
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                          isChecked
                            ? "border-indigo-500 bg-indigo-950/40 text-white"
                            : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleReflex(ref.id)}
                          className="mt-1 h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-200">{ref.testName}</span>
                            <span className="text-[10px] text-indigo-400 font-normal">{ref.cost}</span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-400">{ref.reason}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clinical Interpretation & Morphological Remarks */}
            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Pathologist Medical Impression & Remarks (Will appear on patient report)
              </label>
              <textarea
                rows={3}
                value={currentInterpretation}
                onChange={(e) => setCurrentInterpretation(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 p-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Validation Desk Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRejectSpecimen}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/30 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-900/40"
                >
                  <XCircle className="h-4 w-4" /> Reject Specimen
                </button>
                <button
                  onClick={handleHoldForRerun}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-900/40"
                >
                  <RefreshCw className="h-4 w-4" /> Hold for Rerun / Dilution
                </button>
              </div>

              <button
                onClick={() => setShowSignModal(true)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-2.5 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-cyan-500"
              >
                <FileCheck2 className="h-4 w-4" />
                Sign & Authorize Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pathologist Digital Signature Authorization Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Digital Sign-Off Confirmation</h3>
                  <p className="text-xs text-slate-400">ISO 15189 Medicolegal Electronic Signature</p>
                </div>
              </div>
              <button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Verification Preview */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="flex justify-between font-bold">
                  <span>{selectedItem.patientName}</span>
                  <span className="text-cyan-400">{selectedItem.uhid}</span>
                </div>
                <p className="mt-1 text-slate-300">{selectedItem.testName}</p>
                <p className="mt-2 text-[11px] text-slate-400 italic">
                  "{currentInterpretation}"
                </p>
              </div>

              {/* Digital Stamp Certificate Preview */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold uppercase tracking-wider text-emerald-300 text-[10px]">
                      Authorized Cryptographic Signature
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{new Date().toLocaleDateString()}</span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full border-2 border-dashed border-emerald-400/60 flex items-center justify-center text-[10px] font-black text-emerald-300">
                    SEAL
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{signingDoctor.name}</p>
                    <p className="text-[10px] text-slate-300">{signingDoctor.designation}</p>
                    <p className="text-[10px] font-mono text-cyan-400">MCI Registration: {signingDoctor.regNo}</p>
                  </div>
                </div>
              </div>

              {selectedReflexes.size > 0 && (
                <div className="rounded-xl bg-indigo-950/30 border border-indigo-500/30 p-3 text-[11px] text-indigo-300">
                  ⚡ <strong>{selectedReflexes.size} Reflex Test(s)</strong> will be automatically added to the order workflow.
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowSignModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveAndSign}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500"
              >
                <CheckCircle2 className="h-4 w-4" />
                Affix Digital Stamp & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
