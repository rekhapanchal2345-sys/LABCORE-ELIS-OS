"use client";

import React, { useRef } from "react";
import {
  X,
  Printer,
  Download,
  FileText,
  ShieldCheck,
  Building,
  Phone,
  QrCode,
  CheckCircle,
  Sparkles,
  Stethoscope,
  Share2,
} from "lucide-react";
import type { DoctorProfileData } from "./DoctorQuickViewModal";

interface DoctorRequisitionSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfileData | null;
}

export default function DoctorRequisitionSlipModal({
  isOpen,
  onClose,
  doctor,
}: DoctorRequisitionSlipModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !doctor) return null;

  const docName =
    doctor.fullName ||
    doctor.name ||
    [doctor.firstName, doctor.middleName, doctor.lastName].filter(Boolean).join(" ") ||
    "Doctor";

  const doctorCode = doctor.doctorCode || `DOC-${doctor.id}`;
  const regNumber = doctor.registrationNumber || doctor.licenseNumber || "NMC-VERIFIED";
  const clinic = doctor.clinicName || "Private Medical Practice";
  const clinicAddress =
    doctor.clinicAddress ||
    [doctor.address, doctor.city, doctor.state].filter(Boolean).join(", ") ||
    "Diagnostic Referral Network";

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Dedicated Print Stylesheet for High-Definition Diagnostic Requisition Slips */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #requisition-slip-print-area, #requisition-slip-print-area * {
                visibility: visible !important;
              }
              #requisition-slip-print-area {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 24px !important;
                background: white !important;
                z-index: 999999 !important;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `,
        }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Light White Professional Header */}
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Official Lab Investigation Requisition Pad
                </h3>
                <p className="text-xs text-slate-500">
                  Customized Clinical Referral Slip for {docName} ({doctorCode})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Print / Save Slip PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          <div className="p-6 sm:p-8 max-h-[calc(85vh-110px)] overflow-y-auto bg-slate-50/50">
            <div
              id="requisition-slip-print-area"
              ref={printRef}
              className="bg-white rounded-xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl mx-auto text-slate-900"
            >
              
              {/* Header: Diagnostic Lab & Accreditation */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b-2 border-slate-800 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                    LC
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">
                      LABCORE ENTERPRISE DIAGNOSTICS
                    </h1>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      NABL ACCREDITED & ISO 15189 CERTIFIED REFERENCE CLINICAL LABORATORY
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Central Lab: Ground Floor, Diagnostic Wing, Opp. Civil Hospital | 24x7 Helpline: +91 98765 43210
                    </p>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-800 uppercase">
                    TEST REQUISITION SLIP
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    SLIP #{doctorCode}-{new Date().getFullYear()}
                  </p>
                </div>
              </div>

              {/* Referring Physician Information Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    REFERRING CLINICIAN / PRACTITIONER
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{docName}</p>
                  <p className="text-slate-600 font-medium">
                    {doctor.specialization || "Consultant Physician"}{" "}
                    {doctor.qualification ? `• ${doctor.qualification}` : ""}
                  </p>
                  <p className="text-[11px] font-mono text-indigo-700 font-semibold mt-0.5">
                    Reg / MCI: {regNumber} | Code: {doctorCode}
                  </p>
                </div>

                <div className="sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    CLINIC / CONSULTING CHAMBER
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{clinic}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{clinicAddress}</p>
                  {doctor.phone && (
                    <p className="text-[11px] text-slate-600 mt-0.5">Ph: {doctor.phone}</p>
                  )}
                </div>
              </div>

              {/* Patient Demographics Fill-in Area */}
              <div className="border border-slate-300 rounded-xl p-4 text-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2 border-b border-dotted border-slate-400 pb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Patient Full Name:</span>
                    <div className="h-4"></div>
                  </div>
                  <div className="border-b border-dotted border-slate-400 pb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Age / Gender:</span>
                    <div className="h-4"></div>
                  </div>
                  <div className="border-b border-dotted border-slate-400 pb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Contact Mobile:</span>
                    <div className="h-4"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="border-b border-dotted border-slate-400 pb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Requisition Date:</span>
                    <div className="h-4 font-mono text-[11px] text-slate-600 pt-0.5">
                      {new Date().toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="border-b border-dotted border-slate-400 pb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Sample Type / Status:</span>
                    <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                      <span>[ ] Fasting</span>
                      <span>[ ] PP</span>
                      <span>[ ] Random</span>
                    </div>
                  </div>
                  <div className="border-b border-dotted border-slate-400 pb-1 sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Clinical Diagnosis / Symptoms:</span>
                    <div className="h-4"></div>
                  </div>
                </div>
              </div>

              {/* Rapid Diagnostic Investigation Check-off List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                    Recommended Diagnostic Investigations (Tick Desired Panels)
                  </h3>
                  <span className="text-[10px] text-slate-500 italic">Pre-printed fast prescription pad</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Category 1: Hematology */}
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-[11px] block text-indigo-900 border-b border-slate-200 pb-1">
                      1. HEMATOLOGY & COAGULATION
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Complete Blood Count (CBC) + ESR</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Peripheral Blood Smear Examination</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Blood Group (ABO & Rh typing)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Prothrombin Time (PT / INR)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Serum Ferritin & Iron Studies</span>
                    </label>
                  </div>

                  {/* Category 2: Biochemistry & Organ Function */}
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-[11px] block text-indigo-900 border-b border-slate-200 pb-1">
                      2. BIOCHEMISTRY & ORGAN FUNCTION
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Liver Function Test (LFT with Enzymes)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Kidney Function Test (KFT / RFT with Urea/Creat)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Serum Electrolytes (Na+, K+, Cl-)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Serum Uric Acid / Calcium / Phosphorus</span>
                    </label>
                  </div>

                  {/* Category 3: Diabetes & Metabolic */}
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-[11px] block text-indigo-900 border-b border-slate-200 pb-1">
                      3. DIABETES & METABOLIC
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Fasting Blood Glucose (FBS)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Post Prandial Blood Glucose (PPBS)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>HbA1c (Glycated Hemoglobin)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Urine Microalbumin / Creatinine Ratio</span>
                    </label>
                  </div>

                  {/* Category 4: Hormones, Vitamins & Serology */}
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 text-[11px] block text-indigo-900 border-b border-slate-200 pb-1">
                      4. HORMONES, VITAMINS & SEROLOGY
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Thyroid Profile (Total T3, Total T4, TSH)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Vitamin D3 (25-Hydroxy)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Vitamin B12 (Cyanocobalamin)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>Widal / Dengue NS1 & IgM / Malaria Antigen</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-indigo-600" />
                      <span>C-Reactive Protein (CRP Quantitative)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Special Clinical Instructions & Doctor Notes */}
              <div className="border border-slate-300 rounded-xl p-3.5 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  ADDITIONAL TESTS / SPECIAL CLINICAL INSTRUCTIONS:
                </span>
                <div className="h-10 border-b border-dotted border-slate-300"></div>
              </div>

              {/* Footer: Priority & Signature */}
              <div className="flex flex-col sm:flex-row items-end justify-between pt-4 border-t border-slate-200 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 font-bold text-red-600">
                      <input type="checkbox" className="rounded text-red-600" />
                      <span>STAT / URGENT REPORT (1-2 Hours)</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-medium text-slate-700">
                      <input type="checkbox" className="rounded text-slate-600" />
                      <span>Home Blood Collection Requested</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Reports will be dispatched via WhatsApp, Email & secure clinician portal automatically.
                  </p>
                </div>

                <div className="text-right sm:min-w-[200px]">
                  <div className="h-12 border-b border-slate-400 flex items-center justify-center">
                    {doctor.signatureUrl ? (
                      <img src={doctor.signatureUrl} alt="Signature" className="h-10 object-contain max-w-[140px]" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Doctor Signature & Clinic Stamp</span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 mt-1">{docName}</p>
                  <p className="text-[10px] font-mono text-slate-500">MCI/NMC: {regNumber}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Modal Bottom Bar */}
          <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between no-print">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Accredited Clinical Requisition format ready for high-resolution print or PDF export.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Print Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
