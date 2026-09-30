"use client";

import React, { useState } from "react";
import {
  FileText,
  AlertTriangle,
  History,
  CheckCircle2,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  PlusCircle,
  Clock,
  User,
  Stamp,
  BadgeAlert
} from "lucide-react";

export interface AmendedReportRecord {
  id: string;
  orderNumber: string;
  barcode: string;
  uhid: string;
  patientName: string;
  testName: string;
  version: string; // e.g. "v1.1 (Amended)"
  originalReportDate: string;
  amendmentDate: string;
  amendedBy: string;
  reasonCategory: "ANALYTICAL_RERUN" | "DILUTION_CORRECTION" | "CLERICAL_TYPO" | "CLINICAL_ADDENDUM";
  reasonDetails: string;
  doctorInformed: boolean;
  doctorInformedDetails?: string;
  changes: Array<{
    parameter: string;
    originalValue: string;
    amendedValue: string;
    unit: string;
    comment?: string;
  }>;
}

const SAMPLE_AMENDED_RECORDS: AmendedReportRecord[] = [
  {
    id: "AMD-2026-001",
    orderNumber: "ORD-2026-8802",
    barcode: "BC-981102",
    uhid: "UHID-55190",
    patientName: "Harish Chandra Joshi",
    testName: "Serum Electrolytes Panel",
    version: "v1.1 (Amended)",
    originalReportDate: "24 Sep 2026, 14:30",
    amendmentDate: "25 Sep 2026, 09:15",
    amendedBy: "Dr. Ananya Ray (Chief Pathologist)",
    reasonCategory: "ANALYTICAL_RERUN",
    reasonDetails: "Initial Serum Sodium was flagged for minor ISE electrode drift during morning calibration audit. Tube re-run on secondary backup analyzer (Beckman AU5800) and verified.",
    doctorInformed: true,
    doctorInformedDetails: "Treating physician Dr. S. K. Gupta notified telephonically at 09:20 AM. Confirmed no clinical change in management.",
    changes: [
      {
        parameter: "Serum Sodium (Na+)",
        originalValue: "131",
        amendedValue: "137",
        unit: "mmol/L",
        comment: "Corrected after secondary analyzer rerun",
      },
    ],
  },
  {
    id: "AMD-2026-002",
    orderNumber: "ORD-2026-8941",
    barcode: "BC-982410",
    uhid: "UHID-66381",
    patientName: "Aman Preet Singh",
    testName: "Cardiac Biomarkers (Extended)",
    version: "v1.2 (Amended)",
    originalReportDate: "24 Sep 2026, 18:00",
    amendmentDate: "25 Sep 2026, 08:00",
    amendedBy: "Dr. K. S. Rao / Lab Director",
    reasonCategory: "DILUTION_CORRECTION",
    reasonDetails: "Serum Troponin-I was initially above the upper analytical measurement range (>50 ng/mL). Manual 1:10 dilution performed per manufacturer guidelines to obtain exact quantitative value.",
    doctorInformed: true,
    doctorInformedDetails: "Notified ICU registrar Dr. Arvind Mehta.",
    changes: [
      {
        parameter: "Troponin-I (High Sensitivity)",
        originalValue: "> 50.0",
        amendedValue: "84.5",
        unit: "ng/mL",
        comment: "Exact value quantified post 1:10 dilution",
      },
    ],
  },
  {
    id: "AMD-2026-003",
    orderNumber: "ORD-2026-8715",
    barcode: "BC-979920",
    uhid: "UHID-44021",
    patientName: "Fatima Begum",
    testName: "Complete Blood Count & Peripheral Smear",
    version: "v1.1 (Addendum)",
    originalReportDate: "23 Sep 2026, 16:45",
    amendmentDate: "24 Sep 2026, 11:20",
    amendedBy: "Dr. Ananya Ray (Pathologist)",
    reasonCategory: "CLINICAL_ADDENDUM",
    reasonDetails: "Morphology addendum added following review of bone marrow correlation request. Special stain for iron stores (Perls Prussian Blue) documented.",
    doctorInformed: false,
    changes: [
      {
        parameter: "Peripheral Blood Smear Impression",
        originalValue: "Microcytic hypochromic anemia",
        amendedValue: "Microcytic hypochromic anemia with moderate anisopoikilocytosis and pencil cells. Features consistent with severe Iron Deficiency Anemia.",
        unit: "",
        comment: "Detailed morphology addendum affixed",
      },
    ],
  },
];

export default function AmendedResultsAuditTrail() {
  const [records, setRecords] = useState<AmendedReportRecord[]>(SAMPLE_AMENDED_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<AmendedReportRecord>(SAMPLE_AMENDED_RECORDS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewAmendmentModal, setShowNewAmendmentModal] = useState(false);
  
  // New Amendment Form State
  const [targetOrder, setTargetOrder] = useState("");
  const [targetPatient, setTargetPatient] = useState("");
  const [targetTest, setTargetTest] = useState("");
  const [paramName, setParamName] = useState("");
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [reasonCategory, setReasonCategory] = useState<AmendedReportRecord["reasonCategory"]>("ANALYTICAL_RERUN");
  const [justification, setJustification] = useState("");
  const [doctorNotifiedCheck, setDoctorNotifiedCheck] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredRecords = records.filter(
    (r) =>
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.testName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateAmendment = () => {
    if (!targetOrder || !targetPatient || !paramName || !newValue || !justification) {
      alert("Please fill all mandatory fields (Order #, Patient Name, Parameter, New Value, and Medical Justification).");
      return;
    }

    const newRec: AmendedReportRecord = {
      id: `AMD-2026-${String(records.length + 1).padStart(3, "0")}`,
      orderNumber: targetOrder,
      barcode: `BC-${Math.floor(100000 + Math.random() * 900000)}`,
      uhid: `UHID-${Math.floor(10000 + Math.random() * 90000)}`,
      patientName: targetPatient,
      testName: targetTest || "Clinical Diagnostic Panel",
      version: "v1.1 (Amended)",
      originalReportDate: "Earlier Today",
      amendmentDate: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      amendedBy: "Dr. Ananya Ray (Pathologist)",
      reasonCategory,
      reasonDetails: justification,
      doctorInformed: doctorNotifiedCheck,
      doctorInformedDetails: doctorNotifiedCheck ? "Treating doctor notified via automated priority SMS/WhatsApp." : undefined,
      changes: [
        {
          parameter: paramName,
          originalValue: oldValue || "—",
          amendedValue: newValue,
          unit: "",
          comment: "Amended under ISO 15189 protocol",
        },
      ],
    };

    setRecords([newRec, ...records]);
    setSelectedRecord(newRec);
    setShowNewAmendmentModal(false);
    setToastMessage(`Official amended report ${newRec.id} issued with digital audit stamp.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 px-5 py-4 text-emerald-300 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
              <FileCode className="h-3.5 w-3.5 text-purple-400" />
              NABL ISO 15189 Medicolegal Amendment Registry
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Amended Reports & Corrected Results Audit Trail
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">
              Strict audit preservation for amended, revised, and addendum reports. Side-by-side before/after value diffs, clinical justification, and clinician re-notification records.
            </p>
          </div>

          <button
            onClick={() => setShowNewAmendmentModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500"
          >
            <PlusCircle className="h-4 w-4" />
            File New Result Amendment / Addendum
          </button>
        </div>
      </div>

      {/* Search & Layout Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Amendment List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by UHID, patient, order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2.5">
            {filteredRecords.map((item) => {
              const isSelected = selectedRecord.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? "border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-950/50"
                      : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{item.id}</span>
                      <h4 className="text-sm font-bold text-white">{item.patientName}</h4>
                      <p className="text-xs text-slate-300 font-medium">{item.testName}</p>
                    </div>

                    <span className="rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 text-[10px] font-bold">
                      {item.version}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                    <span>{item.reasonCategory.replace(/_/g, " ")}</span>
                    <span className="text-[10px]">{item.amendmentDate.split(",")[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Diff Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            {/* Header info */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-cyan-400 font-bold">{selectedRecord.uhid}</span>
                  <span>·</span>
                  <span>Order: {selectedRecord.orderNumber}</span>
                  <span>·</span>
                  <span className="text-purple-300 font-semibold">{selectedRecord.version}</span>
                </div>
                <h3 className="mt-1 text-xl font-bold text-white">
                  {selectedRecord.patientName}
                </h3>
                <p className="text-xs text-slate-300">{selectedRecord.testName}</p>
              </div>

              {/* Stamped Watermark Badge */}
              <div className="flex items-center gap-2.5 rounded-2xl border border-purple-500/40 bg-purple-950/40 px-4 py-2.5 text-purple-300">
                <Stamp className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider">Audit Status</p>
                  <p className="text-xs font-black text-white">AMENDED REPORT</p>
                </div>
              </div>
            </div>

            {/* Visual Side-by-Side Diff Inspector */}
            <div className="mt-5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Parameter Value Comparison (Before vs After Diff)
              </span>

              <div className="mt-2.5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Analyte Parameter</th>
                      <th className="py-3 px-4 text-center">Original Value (Superseded)</th>
                      <th className="py-3 px-4 text-center"></th>
                      <th className="py-3 px-4 text-center">Amended Final Value</th>
                      <th className="py-3 px-4">Audit Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedRecord.changes.map((ch, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-semibold text-white">{ch.parameter}</td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className="line-through text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded border border-rose-800/40">
                            {ch.originalValue} {ch.unit}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-500">
                          <ArrowRight className="h-4 w-4 inline text-purple-400" />
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className="text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                            {ch.amendedValue} {ch.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] italic">{ch.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Justification & Regulatory Log */}
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Pathologist Medical Justification & Root Cause
                </span>
                <p className="mt-1.5 text-xs text-slate-200 leading-relaxed">
                  {selectedRecord.reasonDetails}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2.5">
                  <User className="h-3.5 w-3.5 text-purple-400" />
                  <span>Authorized By: <strong className="text-white">{selectedRecord.amendedBy}</strong></span>
                  <span>·</span>
                  <Clock className="h-3.5 w-3.5 text-purple-400" />
                  <span>Timestamp: {selectedRecord.amendmentDate}</span>
                </div>
              </div>

              {/* Clinician Notification Status */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedRecord.doctorInformed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    )}
                    <span className="font-semibold text-slate-200">
                      Clinician Re-Notification (NABL ISO 15189 Requirement)
                    </span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    selectedRecord.doctorInformed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                    {selectedRecord.doctorInformed ? "Doctor Informed" : "Pending Notification"}
                  </span>
                </div>
                {selectedRecord.doctorInformedDetails && (
                  <p className="mt-2 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl">
                    {selectedRecord.doctorInformedDetails}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Amendment Modal */}
      {showNewAmendmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-purple-500/30 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Official Result Amendment</h3>
                  <p className="text-xs text-slate-400">ISO 15189 Medicolegal Addendum Protocol</p>
                </div>
              </div>
              <button onClick={() => setShowNewAmendmentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Order # *</label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-2026-9110"
                    value={targetOrder}
                    onChange={(e) => setTargetOrder(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar Verma"
                    value={targetPatient}
                    onChange={(e) => setTargetPatient(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Test Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Serum Electrolytes Panel"
                  value={targetTest}
                  onChange={(e) => setTargetTest(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">Parameter *</label>
                  <input
                    type="text"
                    placeholder="e.g. Potassium"
                    value={paramName}
                    onChange={(e) => setParamName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">Old Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 6.9"
                    value={oldValue}
                    onChange={(e) => setOldValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">New Value *</label>
                  <input
                    type="text"
                    placeholder="e.g. 4.6"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Amendment Classification *</label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="ANALYTICAL_RERUN">Analytical Sample Rerun (Confirmation)</option>
                  <option value="DILUTION_CORRECTION">Dilution Correction (Above Linearity)</option>
                  <option value="CLERICAL_TYPO">Clerical / Data Entry Transcription Typo</option>
                  <option value="CLINICAL_ADDENDUM">Pathologist Clinical Morphology Addendum</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Mandatory Medical Justification Note *
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this change is occurring. This will be preserved permanently in the lab audit trail."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doctorNotifiedCheck}
                    onChange={(e) => setDoctorNotifiedCheck(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span className="text-slate-200 text-xs">
                    Notify treating clinician immediately of this amendment
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowNewAmendmentModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAmendment}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500"
              >
                <CheckCircle2 className="h-4 w-4" />
                Sign & Issue Amended Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
