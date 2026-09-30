"use client";

import React, { useState, useEffect } from "react";
import type { Approval } from "./ApprovalTable";
import DeltaCheckViewer from "./DeltaCheckViewer";
import CriticalPanicCallModal from "./CriticalPanicCallModal";
import { approvalApi } from "@/lib/api";

interface ApprovalReviewModalProps {
  approval: Approval | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approval: Approval) => void;
  onReject: (approval: Approval) => void;
  onRerun: (approval: Approval, reason: string) => void;
}

function getFlagBadge(flag?: string) {
  switch (flag) {
    case "CRITICAL":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm animate-pulse">
          🚨 Critical
        </span>
      );
    case "HIGH":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
          ▲ High
        </span>
      );
    case "LOW":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          ▼ Low
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Normal
        </span>
      );
  }
}

export default function ApprovalReviewModal({
  approval,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onRerun,
}: ApprovalReviewModalProps) {
  const [activeTab, setActiveTab] = useState<"parameters" | "delta" | "preview">("parameters");
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rerunReason, setRerunReason] = useState("");
  const [showRerunForm, setShowRerunForm] = useState(false);
  const [clinicalRemarks, setClinicalRemarks] = useState("");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callLogged, setCallLogged] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!isOpen || !approval?.resultId) return;

    const fetchResultDetails = async () => {
      try {
        setLoading(true);
        const res = await approvalApi.getById(String(approval.resultId));
        if (isMounted && res?.success && res?.data) {
          setDetails(res.data);
          setClinicalRemarks(res.data.remarks || res.data.interpretation || "");
          const hasAck = res.data.criticalAcknowledgments && res.data.criticalAcknowledgments.length > 0;
          setCallLogged(hasAck);
        }
      } catch (err) {
        console.error("Failed to fetch approval details in review modal:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResultDetails();
    return () => {
      isMounted = false;
    };
  }, [isOpen, approval?.resultId]);

  if (!isOpen || !approval) return null;

  const hasCriticalValues = approval.criticalValues && approval.criticalValues.length > 0;

  const handleApprove = () => {
    if (hasCriticalValues && !callLogged) {
      setIsCallModalOpen(true);
      return;
    }
    onApprove({
      ...approval,
      remarks: clinicalRemarks,
    });
    onClose();
  };

  const handleRerunSubmit = () => {
    if (rerunReason.trim()) {
      onRerun(approval, rerunReason);
      setRerunReason("");
      setShowRerunForm(false);
      onClose();
    }
  };

  const criticalParamList = (details?.values || [])
    .filter((v: any) => v.flag === "CRITICAL")
    .map((v: any) => ({
      name: v.parameter?.parameterName || "Parameter",
      value: v.value,
      unit: v.parameter?.unit || "",
    }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-lg">
                🩺
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  Review & Authorize Laboratory Report
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20">
                    {approval.orderNumber}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {approval.testName} • {approval.testCode || "TEST"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Patient Banner */}
          <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-blue-50/80 px-6 py-3 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-gray-700">
              <div>
                <span className="font-bold text-sm text-gray-900">{approval.patientName}</span>
                <span className="text-gray-400 ml-2 font-mono">UHID: {approval.patientUhid || "—"}</span>
              </div>
              <span>•</span>
              <span>{approval.patientAge ? `${approval.patientAge} Years` : "—"}</span>
              <span>•</span>
              <span>{approval.patientGender || "—"}</span>
            </div>

            {hasCriticalValues && (
              <div className="flex items-center gap-2">
                {callLogged ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                    <span>✓</span> Verbal Call Logged & Certified
                  </span>
                ) : (
                  <button
                    onClick={() => setIsCallModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm hover:bg-red-700 transition-colors animate-pulse"
                  >
                    <span>📞</span> Log Doctor Panic Call
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 px-6 bg-gray-50/50 flex gap-4">
            <button
              onClick={() => setActiveTab("parameters")}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "parameters"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Laboratory Parameters ({details?.values?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("delta")}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "delta"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>Δ</span> Delta Check & Historical Comparison
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "preview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Final Patient Report Preview
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 max-h-[58vh] overflow-y-auto space-y-6">
            {activeTab === "parameters" && (
              <div className="space-y-4">
                {/* Real parameters table */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4 text-left">Test Parameter</th>
                        <th className="py-2.5 px-4 text-left">Measured Value</th>
                        <th className="py-2.5 px-4 text-left">Biological Reference Interval</th>
                        <th className="py-2.5 px-4 text-left">Unit</th>
                        <th className="py-2.5 px-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white font-medium">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-400">
                            Loading verified parameters...
                          </td>
                        </tr>
                      ) : (details?.values || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-400">
                            No parameter results entered.
                          </td>
                        </tr>
                      ) : (
                        details.values.map((v: any) => {
                          const refRange =
                            v.parameter?.referenceRanges?.[0]?.interpretation ||
                            `${v.parameter?.referenceRanges?.[0]?.normalLow ?? ""} - ${v.parameter?.referenceRanges?.[0]?.normalHigh ?? ""}`.trim() ||
                            "Not specified";

                          return (
                            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4 font-bold text-gray-900">
                                {v.parameter?.parameterName || "Parameter"}
                              </td>
                              <td className="py-3 px-4 text-sm font-bold text-gray-900">
                                {v.value}
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {refRange}
                              </td>
                              <td className="py-3 px-4 font-mono text-gray-500">
                                {v.parameter?.unit || "—"}
                              </td>
                              <td className="py-3 px-4">
                                {getFlagBadge(v.flag)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pathologist Clinical Impression */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Pathologist Clinical Impression & Comments
                  </label>
                  <textarea
                    rows={2}
                    value={clinicalRemarks}
                    onChange={(e) => setClinicalRemarks(e.target.value)}
                    placeholder="Enter clinical interpretation, specimen notes, or follow-up advice..."
                    className="w-full rounded-xl border border-gray-300 p-3 text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "delta" && (
              <DeltaCheckViewer resultId={String(approval.resultId)} />
            )}

            {activeTab === "preview" && (
              <div className="rounded-2xl border border-gray-300 bg-white p-8 shadow-sm space-y-6 font-sans">
                {/* Lab Letterhead */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">LabCore Diagnostic Laboratories</h3>
                    <p className="text-xs text-gray-600">NABL Accredited Laboratory • ISO 15189:2022 Certified</p>
                    <p className="text-[11px] text-gray-400">123 Healthcare Boulevard, Medical Enclave</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-slate-900">{approval.orderNumber}</span>
                    <p className="text-xs text-gray-500">Report Status: Final Authorized</p>
                  </div>
                </div>

                {/* Patient / Sample Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <p><span className="text-gray-500">Patient:</span> <strong>{approval.patientName}</strong></p>
                    <p><span className="text-gray-500">Age / Gender:</span> {approval.patientAge}Y / {approval.patientGender}</p>
                    <p><span className="text-gray-500">UHID:</span> <span className="font-mono">{approval.patientUhid || "—"}</span></p>
                  </div>
                  <div>
                    <p><span className="text-gray-500">Test:</span> <strong>{approval.testName}</strong></p>
                    <p><span className="text-gray-500">Sample Date:</span> {approval.submittedAt ? new Date(approval.submittedAt).toLocaleDateString("en-IN") : "—"}</p>
                    <p><span className="text-gray-500">Referring Dr:</span> {details?.order?.doctor?.fullName || "Self / Routine"}</p>
                  </div>
                </div>

                {/* Results Preview Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Investigation Findings</h4>
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead>
                      <tr className="border-b border-gray-300 font-bold text-gray-700">
                        <th className="py-2 text-left">Test Description</th>
                        <th className="py-2 text-left">Result</th>
                        <th className="py-2 text-left">Units</th>
                        <th className="py-2 text-left">Biological Reference Interval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(details?.values || []).map((v: any) => (
                        <tr key={v.id}>
                          <td className="py-2 font-medium">{v.parameter?.parameterName}</td>
                          <td className="py-2 font-bold">{v.value}</td>
                          <td className="py-2 font-mono text-gray-500">{v.parameter?.unit || "—"}</td>
                          <td className="py-2 text-gray-600">
                            {v.parameter?.referenceRanges?.[0]?.interpretation || "Normal"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pathologist Stamp Preview */}
                <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <p>*** End of Diagnostic Laboratory Report ***</p>
                    <p className="text-[10px] text-gray-400">Electronically verified with cryptographic digital token.</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block border border-gray-300 rounded-lg p-3 bg-gray-50 text-left">
                      <p className="text-xs font-bold text-gray-900">Dr. Pathologist, MD (Pathology)</p>
                      <p className="text-[10px] text-gray-500">Reg No: MCI-58291 • Chief Pathologist</p>
                      <p className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Digital Signature Valid</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showRerunForm && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 space-y-3">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Request Sample Rerun / Re-test
                </h4>
                <textarea
                  rows={2}
                  value={rerunReason}
                  onChange={(e) => setRerunReason(e.target.value)}
                  placeholder="Specify clinical or technical reason for rerun (e.g. hemolyzed sample, delta check failure, clotted specimen)..."
                  className="w-full rounded-xl border border-amber-300 p-2.5 text-xs bg-white focus:ring-2 focus:ring-amber-200 outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRerunForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRerunSubmit}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700"
                  >
                    Submit Rerun Request
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRerunForm(!showRerunForm)}
                className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 shadow-sm transition-colors"
              >
                🔄 Request Rerun
              </button>
              <button
                type="button"
                onClick={() => onReject(approval)}
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 shadow-sm transition-colors"
              >
                ✕ Reject
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className={`rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all ${
                  hasCriticalValues && !callLogged
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg"
                }`}
              >
                {hasCriticalValues && !callLogged
                  ? "📞 Log Call & Authorize"
                  : "✓ Authorize & Digitally Sign Report"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verbal Call Logger Modal */}
      {isCallModalOpen && (
        <CriticalPanicCallModal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
          resultId={String(approval.resultId)}
          orderNumber={approval.orderNumber}
          patientName={approval.patientName}
          criticalParameters={criticalParamList}
          onSuccess={() => {
            setCallLogged(true);
            setIsCallModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
