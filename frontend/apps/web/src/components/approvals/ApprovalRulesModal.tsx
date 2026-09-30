"use client";

import React from "react";

interface ApprovalRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApprovalRulesModal({ isOpen, onClose }: ApprovalRulesModalProps) {
  if (!isOpen) return null;

  const criticalLimits = [
    { department: "Biochemistry", test: "Potassium (K+)", panicLow: "< 2.8 mmol/L", panicHigh: "> 6.2 mmol/L", action: "Immediate verbal call to physician; risk of fatal arrhythmia." },
    { department: "Biochemistry", test: "Sodium (Na+)", panicLow: "< 120 mmol/L", panicHigh: "> 160 mmol/L", action: "Notify for acute neurological / osmotic demyelination risk." },
    { department: "Biochemistry", test: "Glucose (Fasting/Random)", panicLow: "< 45 mg/dL", panicHigh: "> 450 mg/dL", action: "Immediate hypoglycemia or hyperosmolar / DKA notification." },
    { department: "Biochemistry", test: "Serum Calcium", panicLow: "< 6.0 mg/dL", panicHigh: "> 13.0 mg/dL", action: "Tetany or hypercalcemic crisis risk." },
    { department: "Hematology", test: "Hemoglobin (Hb)", panicLow: "< 6.0 g/dL", panicHigh: "> 20.0 g/dL", action: "Severe acute anemia requiring urgent transfusion." },
    { department: "Hematology", test: "Platelet Count", panicLow: "< 20,000 /µL", panicHigh: "> 1,000,000 /µL", action: "High spontaneous hemorrhage or thrombotic risk." },
    { department: "Hematology", test: "Total Leukocyte Count (WBC)", panicLow: "< 1,500 /µL", panicHigh: "> 35,000 /µL", action: "Agranulocytosis or hyperleukocytosis / leukostasis alert." },
    { department: "Cardiology", test: "Troponin I / T", panicLow: "—", panicHigh: "> 0.04 ng/mL", action: "Stat notification for acute coronary syndrome / myocardial infarction." },
    { department: "Coagulation", test: "Prothrombin Time / INR", panicLow: "—", panicHigh: "INR > 4.5", action: "Critical bleeding risk in anti-coagulated patients." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl backdrop-blur-sm">
              🛡️
            </div>
            <div>
              <h3 className="text-lg font-bold">Pathologist Sign-Off Policies & Critical Action Limits</h3>
              <p className="text-xs text-blue-200">
                Governing Standards: ISO 15189 / NABL / CAP Autovalidation Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
              <div className="text-xl mb-1">⚡ Clean Fast-Track</div>
              <h4 className="text-sm font-bold text-green-900">Auto-Approval Criteria</h4>
              <p className="text-xs text-green-800 mt-1">
                Results with 100% parameters within normal biological reference intervals, no analyzer flags, and delta check shift &lt; 15% qualify for streamlined release.
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
              <div className="text-xl mb-1">🚨 Panic Limits</div>
              <h4 className="text-sm font-bold text-red-900">Verbal Call Mandate</h4>
              <p className="text-xs text-red-800 mt-1">
                Any parameter breaching life-threatening thresholds MUST have a documented telephone read-back before digital report authorization.
              </p>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
              <div className="text-xl mb-1">🔬 Smear Review</div>
              <h4 className="text-sm font-bold text-indigo-900">Manual Microscopy</h4>
              <p className="text-xs text-indigo-800 mt-1">
                Mandatory for blast flag presence, severe thrombocytopenia (&lt;50k), or acute WBC spikes to rule out pseudothrombocytopenia.
              </p>
            </div>
          </div>

          {/* Critical Value Thresholds Table */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Standard Panic Value Action Thresholds
            </h4>
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4 text-left">Department</th>
                    <th className="py-2.5 px-4 text-left">Test / Parameter</th>
                    <th className="py-2.5 px-4 text-left">Panic Low</th>
                    <th className="py-2.5 px-4 text-left">Panic High</th>
                    <th className="py-2.5 px-4 text-left">Clinical Mandate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {criticalLimits.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-gray-500">
                        {c.department}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-gray-900">
                        {c.test}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-blue-700">
                        {c.panicLow}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-red-700">
                        {c.panicHigh}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">
                        {c.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
          >
            Close Policy Guide
          </button>
        </div>
      </div>
    </div>
  );
}
