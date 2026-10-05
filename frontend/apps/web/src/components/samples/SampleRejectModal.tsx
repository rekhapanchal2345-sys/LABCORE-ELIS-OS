"use client";

import React, { useState } from "react";
import {
  X,
  XCircle,
  AlertTriangle,
  FlaskConical,
  User2,
  Loader2,
  ShieldAlert,
  RefreshCw,
  Clock,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

interface Sample {
  id: string;
  sampleNumber: string;
  barcode: string;
  sampleType: string;
  priority?: string;
  order: {
    orderNumber: string;
    patient: { uhid: string; firstName: string; lastName: string };
    doctor?: { fullName: string };
  };
  test: { testCode: string; testName: string; sampleContainer: string };
}

// ─── Rejection reasons by category (CLSI GP44 / ISO 15189 aligned) ───────────
const REJECTION_CATEGORIES = [
  {
    category: "Specimen Quality",
    icon: FlaskConical,
    color: "text-red-400",
    reasons: [
      { value: "Hemolyzed Sample", desc: "Visible hemolysis — compromises test accuracy" },
      { value: "Lipemic Sample", desc: "High lipid content interfering with analysis" },
      { value: "Icterus", desc: "High bilirubin levels causing optical interference" },
      { value: "Clotted Sample", desc: "Blood clot present in anticoagulated tube" },
      { value: "Fibrin Strands", desc: "Fibrin clots affecting automated analysis" },
    ],
  },
  {
    category: "Collection Error",
    icon: AlertTriangle,
    color: "text-amber-400",
    reasons: [
      { value: "Insufficient Quantity", desc: "QNS — quantity not sufficient for testing" },
      { value: "Wrong Container", desc: "Incorrect tube type for test ordered" },
      { value: "Expired Sample", desc: "Sample collected too long ago; TAT exceeded" },
      { value: "Incorrect Ratio", desc: "Wrong blood:anticoagulant ratio in tube" },
    ],
  },
  {
    category: "Labeling & Identification",
    icon: ShieldAlert,
    color: "text-orange-400",
    reasons: [
      { value: "Mislabeled Tube", desc: "Patient ID on label does not match order" },
      { value: "Missing Label", desc: "No barcode or patient ID label on tube" },
      { value: "Illegible Label", desc: "Label damaged or unreadable" },
      { value: "Patient ID Mismatch", desc: "Two identifiers do not match records" },
    ],
  },
  {
    category: "Container & Transport",
    icon: RefreshCw,
    color: "text-blue-400",
    reasons: [
      { value: "Leaking Container", desc: "Tube is leaking — biohazard and loss risk" },
      { value: "Broken Tube", desc: "Tube physically damaged or cracked" },
      { value: "Temperature Breach", desc: "Cold chain or temperature requirement violated" },
      { value: "Delay in Transport", desc: "Specimen received beyond acceptable transit time" },
    ],
  },
];

const ALL_REASONS = REJECTION_CATEGORIES.flatMap((c) => c.reasons.map((r) => r.value));

interface Props {
  sample: Sample | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, redrawRequired: boolean, urgency: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export default function SampleRejectModal({
  sample,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  error = "",
}: Props) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [redrawRequired, setRedrawRequired] = useState(true);
  const [urgency, setUrgency] = useState("ROUTINE");
  const [localError, setLocalError] = useState("");
  const [step, setStep] = useState<"select" | "confirm">("select");

  React.useEffect(() => {
    if (isOpen) {
      setReason("");
      setCustomReason("");
      setRedrawRequired(true);
      setUrgency("ROUTINE");
      setLocalError("");
      setStep("select");
    }
  }, [isOpen]);

  if (!isOpen || !sample) return null;

  const finalReason = reason === "Other" ? customReason.trim() : reason;
  const canProceed = Boolean(finalReason);

  const selectedReasonDesc = REJECTION_CATEGORIES
    .flatMap((c) => c.reasons)
    .find((r) => r.value === reason)?.desc;

  const handleProceed = () => {
    if (!finalReason) {
      setLocalError("Please select or enter a rejection reason.");
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!finalReason) return;
    try {
      await onConfirm(finalReason, redrawRequired, urgency);
    } catch {
      // parent handles
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] bg-slate-950 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-red-950/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Reject Specimen</h2>
              <p className="text-xs text-slate-400">
                {sample.sampleNumber} · {sample.order.patient.firstName} {sample.order.patient.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-0 border-b border-slate-800 bg-slate-950 px-6 shrink-0">
          {[
            { key: "select", label: "1. Select Reason" },
            { key: "confirm", label: "2. Review & Confirm" },
          ].map((s, i) => (
            <div
              key={s.key}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 ${
                step === s.key
                  ? "text-red-300 border-red-500"
                  : step === "confirm" && s.key === "select"
                  ? "text-slate-400 border-emerald-500"
                  : "text-slate-600 border-transparent"
              }`}
            >
              {step === "confirm" && s.key === "select" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <span className="h-4 w-4 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[9px] font-black">
                  {i + 1}
                </span>
              )}
              {s.label}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === "select" ? (
            <>
              {/* Sample info */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Sample", value: sample.sampleNumber },
                  { label: "Test", value: sample.test.testCode },
                  { label: "Container", value: sample.test.sampleContainer },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">{label}</p>
                    <p className="text-xs font-bold text-white mt-0.5 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Reason categories */}
              {REJECTION_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.category} className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
                      <Icon className={`h-3.5 w-3.5 ${cat.color}`} />
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${cat.color}`}>
                        {cat.category}
                      </span>
                    </div>
                    <div className="p-2 space-y-1.5">
                      {cat.reasons.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => { setReason(r.value); setLocalError(""); }}
                          className={`w-full flex items-start gap-3 rounded-xl p-2.5 text-left transition-all ${
                            reason === r.value
                              ? "border border-red-500/50 bg-red-950/30"
                              : "border border-transparent hover:border-slate-700 hover:bg-slate-800/60"
                          }`}
                        >
                          <div className={`h-4 w-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                            reason === r.value ? "border-red-500 bg-red-500" : "border-slate-600"
                          }`}>
                            {reason === r.value && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${reason === r.value ? "text-red-200" : "text-slate-300"}`}>
                              {r.value}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Other / custom */}
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <button
                  type="button"
                  onClick={() => { setReason("Other"); setLocalError(""); }}
                  className={`w-full flex items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                    reason === "Other"
                      ? "border border-red-500/50 bg-red-950/30"
                      : "border border-transparent hover:border-slate-700"
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    reason === "Other" ? "border-red-500 bg-red-500" : "border-slate-600"
                  }`}>
                    {reason === "Other" && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Other (specify below)</span>
                </button>
                {reason === "Other" && (
                  <textarea
                    autoFocus
                    value={customReason}
                    onChange={(e) => { setCustomReason(e.target.value); setLocalError(""); }}
                    placeholder="Describe the rejection reason..."
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 text-white text-xs px-3 py-2 outline-none focus:border-red-500/50 placeholder:text-slate-600 resize-none"
                  />
                )}
              </div>

              {localError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/20 px-3 py-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-300">{localError}</p>
                </div>
              )}
            </>
          ) : (
            /* Confirmation step */
            <div className="space-y-4">
              {/* Warning */}
              <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                  <p className="font-bold text-red-300">Confirm Specimen Rejection</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This action will permanently mark specimen{" "}
                  <strong className="text-white">{sample.sampleNumber}</strong> as rejected.
                  The patient and referring doctor will need to be notified for a redraw.
                  This cannot be undone.
                </p>
              </div>

              {/* Rejection summary */}
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Sample</span>
                  <span className="font-bold text-white">{sample.sampleNumber}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Patient</span>
                  <span className="font-bold text-white">
                    {sample.order.patient.firstName} {sample.order.patient.lastName} ({sample.order.patient.uhid})
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Test</span>
                  <span className="font-bold text-white">{sample.test.testName}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Rejection Reason</span>
                  <p className="mt-1 text-sm font-bold text-red-300">{finalReason}</p>
                  {selectedReasonDesc && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{selectedReasonDesc}</p>
                  )}
                </div>
              </div>

              {/* Redraw options */}
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setRedrawRequired((v) => !v)}
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      redrawRequired ? "border-violet-500 bg-violet-500" : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    {redrawRequired && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span className="text-xs font-semibold text-white">Redraw Required</span>
                  <span className="text-[10px] text-slate-500">
                    (Notify phlebotomy team and patient)
                  </span>
                </label>

                {redrawRequired && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Redraw Urgency</p>
                    <div className="flex gap-2">
                      {["ROUTINE", "URGENT", "STAT"].map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUrgency(u)}
                          className={`flex-1 rounded-lg border py-2 text-[10px] font-bold transition-all ${
                            urgency === u
                              ? u === "STAT"
                                ? "border-red-500/60 bg-red-500/20 text-red-300"
                                : u === "URGENT"
                                ? "border-orange-500/60 bg-orange-500/20 text-orange-300"
                                : "border-blue-500/60 bg-blue-500/20 text-blue-300"
                              : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(error) && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/20 px-3 py-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900 shrink-0">
          <button
            type="button"
            onClick={step === "confirm" ? () => setStep("select") : onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
          >
            {step === "confirm" ? "← Back" : "Cancel"}
          </button>

          {step === "select" ? (
            <button
              type="button"
              onClick={handleProceed}
              disabled={!canProceed}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all"
            >
              Review Rejection →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              {loading ? "Rejecting..." : "Reject & Notify"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
