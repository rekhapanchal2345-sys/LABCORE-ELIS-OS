"use client";

import React, { useRef, useState } from "react";
import {
  X,
  ScanLine,
  FlaskConical,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  User2,
  Building2,
  Zap,
  ShieldCheck,
  TestTube2,
  Truck,
  Home,
  Hospital,
  Stethoscope,
  QrCode,
  Hash,
  RefreshCw,
  Info,
} from "lucide-react";

interface Sample {
  id: string;
  sampleNumber: string;
  barcode: string;
  sampleType: string;
  status: string;
  priority?: string;
  collectionType?: string;
  createdAt: string;
  order: {
    orderNumber: string;
    patient: { uhid: string; firstName: string; lastName: string; gender: string; age?: number };
    doctor?: { fullName: string; specialization: string };
  };
  test: {
    testCode: string;
    testName: string;
    sampleContainer: string;
    processingDepartment?: string;
  };
}

const COLLECTION_TYPES = [
  { value: "WALK_IN", label: "Walk-in", icon: Building2, desc: "Patient visited collection center" },
  { value: "HOME_COLLECTION", label: "Home Collection", icon: Home, desc: "Phlebotomist visited patient" },
  { value: "HOSPITAL", label: "Hospital Ward", icon: Hospital, desc: "Inpatient / Hospital bed" },
  { value: "CLINIC", label: "Referring Clinic", icon: Stethoscope, desc: "Clinic referral collection" },
];

const LOCATIONS = [
  "Phlebotomy Room A",
  "Phlebotomy Room B",
  "Emergency Lab",
  "ICU Satellite Lab",
  "Outpatient Collection",
  "Home Visit",
  "Hospital Ward 1",
  "Hospital Ward 2",
  "Corporate Camp",
];

const CONTAINER_INSTRUCTIONS: Record<string, string[]> = {
  "EDTA Purple": ["Mix by gentle inversion 8–10 times", "Do NOT shake vigorously", "Store at room temp"],
  "Serum Separator Red": ["Allow to clot 30 minutes", "Centrifuge at 2000g for 10 min", "Separate serum"],
  "Citrate Blue": ["Fill to exact mark (1:9 ratio critical)", "Mix immediately 3–4 inversions", "Transport on ice"],
  "Urine Container Yellow": ["Mid-stream clean catch", "10–20 mL minimum", "Label immediately"],
  "Fluoride Grey": ["Mix immediately", "Keep cold if processing delayed", "Prevents glycolysis"],
  "Heparin Green": ["Mix 8–10 inversions", "Do NOT freeze", "Process within 30 min"],
};

interface Props {
  sample: Sample | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    barcode: string;
    collectionType: string;
    priority: string;
    location: string;
    collectorName: string;
    notes: string;
    integrityChecks: { label: boolean; container: boolean; volume: boolean; temperature: boolean };
  }) => Promise<void>;
  loading?: boolean;
  error?: string;
  existingBarcodes?: string[];
}

export default function SampleCollectModal({
  sample,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  error = "",
  existingBarcodes = [],
}: Props) {
  const [barcode, setBarcode] = useState("");
  const [collectionType, setCollectionType] = useState("WALK_IN");
  const [priority, setPriority] = useState(sample?.priority || "ROUTINE");
  const [location, setLocation] = useState("Phlebotomy Room A");
  const [collectorName, setCollectorName] = useState("");
  const [notes, setNotes] = useState("");
  const [integrityChecks, setIntegrityChecks] = useState({
    label: false,
    container: false,
    volume: false,
    temperature: false,
  });
  const [localError, setLocalError] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen && sample) {
      setBarcode("");
      setCollectionType(sample.collectionType || "WALK_IN");
      setPriority(sample.priority || "ROUTINE");
      setLocation("Phlebotomy Room A");
      setCollectorName("");
      setNotes("");
      setIntegrityChecks({ label: false, container: false, volume: false, temperature: false });
      setLocalError("");
      setTimeout(() => barcodeRef.current?.focus(), 200);
    }
  }, [isOpen, sample]);

  if (!isOpen || !sample) return null;

  const allChecks = Object.values(integrityChecks).every(Boolean);
  const isBarcodeValid = barcode.trim().length >= 6;
  const isDuplicateBarcode =
    barcode.trim() &&
    existingBarcodes.some(
      (b) => b.toUpperCase() === barcode.trim().toUpperCase() && b !== sample.barcode
    );
  const canSubmit = isBarcodeValid && !isDuplicateBarcode && allChecks && !loading;

  const containerInstructions =
    CONTAINER_INSTRUCTIONS[sample.test.sampleContainer] || [
      "Follow standard collection procedure",
      "Label immediately after collection",
      "Transport to lab within 2 hours",
    ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!isBarcodeValid) {
      setLocalError("Please scan or enter a valid barcode (minimum 6 characters).");
      return;
    }
    if (isDuplicateBarcode) {
      setLocalError("This barcode is already assigned to another sample.");
      return;
    }
    if (!allChecks) {
      setLocalError("Please complete all 4 integrity checks before collecting.");
      return;
    }
    try {
      await onConfirm({ barcode: barcode.trim().toUpperCase(), collectionType, priority, location, collectorName, notes, integrityChecks });
    } catch {
      // Parent handles error display
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col w-full max-w-2xl max-h-[94vh] bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
              <TestTube2 className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Collect Specimen</h2>
              <p className="text-xs text-slate-400">
                {sample.order.patient.firstName} {sample.order.patient.lastName} · {sample.order.patient.uhid}
              </p>
            </div>
            {sample.priority === "STAT" && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 animate-pulse">
                <Zap className="h-3 w-3" /> STAT
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Patient + Test info strip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <div className="flex items-center gap-2 mb-2">
                <User2 className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Patient</span>
              </div>
              <p className="text-sm font-bold text-white">
                {sample.order.patient.firstName} {sample.order.patient.lastName}
              </p>
              <p className="text-xs text-slate-400">
                {sample.order.patient.uhid} · {sample.order.patient.gender} · {sample.order.patient.age}Y
              </p>
              {sample.order.doctor && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Ref: Dr. {sample.order.doctor.fullName}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Specimen Required</span>
              </div>
              <p className="text-sm font-bold text-white">{sample.test.testName}</p>
              <p className="text-xs text-slate-400">{sample.test.testCode} · {sample.sampleType}</p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-full px-2 py-0.5">
                <TestTube2 className="h-3 w-3" />
                {sample.test.sampleContainer}
              </div>
            </div>
          </div>

          {/* Container instructions */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Handling Instructions — {sample.test.sampleContainer}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {containerInstructions.map((instr, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-amber-200/80">
                  <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                  {instr}
                </div>
              ))}
            </div>
          </div>

          {/* Barcode scan */}
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-white">
              <ScanLine className="h-4 w-4 text-cyan-400" />
              Specimen Barcode *
            </label>
            <div className="relative">
              <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                ref={barcodeRef}
                type="text"
                placeholder="Scan or type barcode..."
                value={barcode}
                onChange={(e) => { setBarcode(e.target.value.toUpperCase()); setLocalError(""); }}
                className={`w-full rounded-xl border bg-slate-800 pl-10 pr-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:ring-2 ${
                  isDuplicateBarcode
                    ? "border-red-500/60 focus:ring-red-500/20"
                    : isBarcodeValid
                    ? "border-emerald-500/40 focus:ring-emerald-500/20"
                    : "border-slate-600 focus:ring-cyan-500/20 focus:border-cyan-500/40"
                }`}
              />
              {barcode && (
                <button
                  type="button"
                  onClick={() => setBarcode("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {isDuplicateBarcode && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Barcode already in use — scan a new tube
              </p>
            )}
            {isBarcodeValid && !isDuplicateBarcode && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Barcode accepted
              </p>
            )}
          </div>

          {/* Collection type + location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-blue-400" /> Collection Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COLLECTION_TYPES.map((ct) => {
                  const Icon = ct.icon;
                  return (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => setCollectionType(ct.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-[10px] font-semibold transition-all ${
                        collectionType === ct.value
                          ? "border-blue-500/50 bg-blue-500/15 text-blue-300"
                          : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {ct.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-2">
                  <MapPin className="h-3 w-3" /> Collection Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white text-xs px-3 py-2 outline-none focus:border-blue-500/50"
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-2">
                  <Zap className="h-3 w-3" /> Priority
                </label>
                <div className="flex gap-2">
                  {["ROUTINE", "URGENT", "STAT"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 rounded-lg border py-1.5 text-[10px] font-bold transition-all ${
                        priority === p
                          ? p === "STAT"
                            ? "border-red-500/50 bg-red-500/20 text-red-300"
                            : p === "URGENT"
                            ? "border-orange-500/50 bg-orange-500/20 text-orange-300"
                            : "border-blue-500/50 bg-blue-500/20 text-blue-300"
                          : "border-slate-700 bg-slate-800 text-slate-400"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Collector name */}
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-2">
              <User2 className="h-3 w-3" /> Collected By (Phlebotomist)
            </label>
            <input
              type="text"
              placeholder="Enter phlebotomist name..."
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white text-sm px-3 py-2 outline-none focus:border-blue-500/50 placeholder:text-slate-600"
            />
          </div>

          {/* 4-point integrity check */}
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Pre-Collection Integrity Checklist</span>
              <span className="ml-auto text-[10px] text-slate-500">
                {Object.values(integrityChecks).filter(Boolean).length}/4 completed
              </span>
            </div>
            {[
              { key: "label", label: "Label matches patient ID & order number", icon: Hash },
              { key: "container", label: "Correct tube / container selected", icon: TestTube2 },
              { key: "volume", label: "Adequate volume collected to fill line", icon: FlaskConical },
              { key: "temperature", label: "Storage / transport conditions confirmed", icon: Clock },
            ].map(({ key, label, icon: Icon }) => {
              const checked = integrityChecks[key as keyof typeof integrityChecks];
              return (
                <label
                  key={key}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                    checked
                      ? "border-emerald-500/40 bg-emerald-950/20"
                      : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) =>
                      setIntegrityChecks((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                  />
                  <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    checked ? "border-emerald-500 bg-emerald-500" : "border-slate-600 bg-slate-800"
                  }`}>
                    {checked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <Icon className={`h-4 w-4 shrink-0 ${checked ? "text-emerald-400" : "text-slate-500"}`} />
                  <span className={`text-xs font-semibold ${checked ? "text-emerald-300" : "text-slate-400"}`}>
                    {label}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-2">
              Notes / Observations
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any collection notes, patient conditions, difficulties..."
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white text-xs px-3 py-2 outline-none focus:border-blue-500/50 placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Error */}
          {(localError || error) && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{localError || error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900 shrink-0">
          <div className="text-[11px] text-slate-500">
            {allChecks ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> All integrity checks passed
              </span>
            ) : (
              <span className="text-amber-400">Complete all 4 integrity checks to proceed</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TestTube2 className="h-3.5 w-3.5" />}
              {loading ? "Collecting..." : "Confirm Collection"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
