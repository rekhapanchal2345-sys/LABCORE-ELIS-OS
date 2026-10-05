"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { sampleApi } from "@/lib/api";
import {
  ArrowLeft,
  FlaskConical,
  ScanLine,
  UserRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Clock,
  Building2,
  Loader2,
  Droplet,
  ChevronRight,
  Search
} from "lucide-react";

interface PendingSample {
  id: string;
  sampleNumber: string;
  barcode: string;
  sampleType: string;
  status: string;
  priority?: string;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    patient: {
      id: string;
      firstName: string;
      lastName: string;
      uhid: string;
      gender: string;
      age?: number;
      phone?: string;
    };
    doctor?: {
      fullName: string;
    };
  };
  test: {
    testName: string;
    testCode: string;
    sampleType: string;
    sampleContainer?: string;
  };
}

const TUBE_CONTAINER_COLORS: Record<string, { bg: string; text: string; border: string; capColor: string; name: string }> = {
  "EDTA Tube": { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/40", capColor: "#8B5CF6", name: "Lavender EDTA" },
  "Lavender Top": { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/40", capColor: "#8B5CF6", name: "Lavender EDTA" },
  "Serum Separator Tube": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/40", capColor: "#F59E0B", name: "Gold SST Gel" },
  "SST": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/40", capColor: "#F59E0B", name: "Gold SST Gel" },
  "Red Top": { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/40", capColor: "#EF4444", name: "Red Plain" },
  "Sodium Citrate": { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/40", capColor: "#0284C7", name: "Light Blue Citrate" },
  "Light Blue": { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/40", capColor: "#0284C7", name: "Light Blue Citrate" },
  "Lithium Heparin": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/40", capColor: "#10B981", name: "Green Heparin" },
  "Green Top": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/40", capColor: "#10B981", name: "Green Heparin" },
  "Fluoride Tube": { bg: "bg-slate-500/10", text: "text-slate-300", border: "border-slate-500/40", capColor: "#64748B", name: "Grey Fluoride" },
  "Grey Top": { bg: "bg-slate-500/10", text: "text-slate-300", border: "border-slate-500/40", capColor: "#64748B", name: "Grey Fluoride" },
  "Sterile Container": { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/40", capColor: "#EAB308", name: "Urine Sterile Cup" },
};

function getContainerStyle(containerName?: string) {
  if (!containerName) return { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/40", capColor: "#06B6D4", name: "Standard Specimen" };
  for (const [key, val] of Object.entries(TUBE_CONTAINER_COLORS)) {
    if (containerName.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/40", capColor: "#06B6D4", name: containerName };
}

export default function SampleCollectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [pendingSamples, setPendingSamples] = useState<PendingSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<PendingSample | null>(null);
  const [customBarcode, setCustomBarcode] = useState("");
  const [collectionLocation, setCollectionLocation] = useState("Phlebotomy Bay 01");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const fetchPendingSamples = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sampleApi.getAll("?status=PENDING");
      if (response.success && response.data) {
        const samplesData = response.data.samples || response.data || [];
        setPendingSamples(Array.isArray(samplesData) ? samplesData : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pending specimens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSamples();
  }, []);

  useEffect(() => {
    if (orderId && pendingSamples.length > 0 && !selectedSample) {
      const match = pendingSamples.find(
        (s) => s.order?.id === orderId || s.order?.orderNumber === orderId
      );
      if (match) {
        setSelectedSample(match);
        setCustomBarcode(match.barcode || `AUTO-${match.id.slice(0, 8)}`);
      }
    }
  }, [orderId, pendingSamples, selectedSample]);

  const displayedSamples = pendingSamples.filter((s) => {
    if (orderId && s.order?.id !== orderId && s.order?.orderNumber !== orderId) return false;
    if (searchFilter) {
      const term = searchFilter.toLowerCase();
      return (
        s.sampleNumber.toLowerCase().includes(term) ||
        s.order.patient.uhid.toLowerCase().includes(term) ||
        `${s.order.patient.firstName} ${s.order.patient.lastName}`.toLowerCase().includes(term) ||
        s.test.testName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleSelect = (sample: PendingSample) => {
    setSelectedSample(sample);
    setCustomBarcode(sample.barcode || `BAR-${Date.now().toString().slice(-6)}`);
    setNotes("");
  };

  const handleConfirmDraw = async () => {
    if (!selectedSample) return;

    try {
      setSubmitting(true);
      await sampleApi.collect(selectedSample.id, {
        barcode: customBarcode || selectedSample.barcode,
        location: collectionLocation,
        notes,
        collectionType: "WALK_IN",
        priority: selectedSample.priority || "ROUTINE",
      });

      setSelectedSample(null);
      setCustomBarcode("");
      setNotes("");
      await fetchPendingSamples();
    } catch (err: any) {
      setError(err.message || "Failed to mark specimen as collected");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Phlebotomy Collection Station">
        <div className="space-y-6 pb-12">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <Link
                href="/samples"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 shadow-md transition-all hover:bg-slate-800 hover:text-white hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white">
                    Phlebotomy &amp; Venipuncture Station
                  </h1>
                  <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-[10px] font-black text-purple-300">
                    {displayedSamples.length} Due for Draw
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standard 2-identifier patient double-check &amp; immediate tube barcode printing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="h-4 w-4" /> ISO 15189 Phlebotomy SOP
              </span>
            </div>
          </div>

          {/* Grid Layout: Left Queue, Right Draw Station */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column: Due Queue */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Droplet className="h-4 w-4" /> Patients Waiting for Draw
                </div>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {displayedSamples.length} in Lounge
                </span>
              </div>

              {/* Search filter in queue */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search patient, UHID or test..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                />
              </div>

              {/* Sample Queue Cards */}
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-8 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-cyan-400 mb-2" />
                    <p className="text-xs">Loading queue...</p>
                  </div>
                ) : displayedSamples.length === 0 ? (
                  <div className="p-8 text-center text-slate-600">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                    <p className="text-xs font-bold text-slate-400">Phlebotomy Queue Clear</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">All waiting specimens have been collected</p>
                  </div>
                ) : (
                  displayedSamples.map((sample) => {
                    const tube = getContainerStyle(sample.test.sampleContainer);
                    const isSelected = selectedSample?.id === sample.id;

                    return (
                      <button
                        key={sample.id}
                        onClick={() => handleSelect(sample)}
                        className={`w-full text-left rounded-2xl border p-3.5 transition-all ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/40 shadow-xl"
                            : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-100 text-xs flex items-center gap-1">
                              <UserRound className="h-3 w-3 text-cyan-400" />
                              {sample.order.patient.firstName} {sample.order.patient.lastName}
                            </p>
                            <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                              UHID: {sample.order.patient.uhid} · Age: {sample.order.patient.age || "—"}y
                            </p>
                          </div>

                          <div
                            className="rounded px-1.5 py-0.5 text-[9px] font-bold border"
                            style={{
                              borderColor: `${tube.capColor}55`,
                              backgroundColor: `${tube.capColor}15`,
                              color: tube.capColor,
                            }}
                          >
                            {sample.test.sampleContainer || sample.sampleType}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 mt-2 text-[10px]">
                          <span className="font-bold text-slate-300 truncate max-w-[140px]">{sample.test.testName}</span>
                          <span className="font-mono text-cyan-400 font-bold">{sample.sampleNumber}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right 2 Columns: Active Phlebotomy Draw Station */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl lg:col-span-2 space-y-6">
              {selectedSample ? (
                <>
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Active Patient in Phlebotomy Bay</span>
                      <h2 className="text-xl font-black text-white mt-0.5">
                        {selectedSample.order.patient.firstName} {selectedSample.order.patient.lastName}
                      </h2>
                      <p className="text-xs text-slate-400 font-mono">
                        UHID: {selectedSample.order.patient.uhid} · Order #{selectedSample.order.orderNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-xl">
                        {selectedSample.sampleNumber}
                      </span>
                    </div>
                  </div>

                  {/* Pre-Draw Double ID Protocol */}
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <ShieldCheck className="h-4 w-4" /> 2-Identifier Patient Verification Checklist
                    </div>
                    <p className="text-xs text-slate-300">
                      1. Ask patient for full verbal name &amp; date of birth / phone. Match with wristband or UHID card.
                    </p>
                    <p className="text-xs text-slate-300">
                      2. Confirm required fasting / preparation status before drawing specimen.
                    </p>
                  </div>

                  {/* Required Specimen Tube Specifications */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Prescribed Test Panel</p>
                      <p className="font-black text-slate-100 text-sm">{selectedSample.test.testName}</p>
                      <span className="inline-block font-mono text-[10px] text-cyan-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
                        {selectedSample.test.testCode}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Specimen Tube Requirement</p>
                      <p className="font-black text-purple-300 text-sm">
                        {selectedSample.test.sampleContainer || "Standard Tube"}
                      </p>
                      <p className="text-slate-400 text-[10px]">Invert gently 8–10 times immediately after draw</p>
                    </div>
                  </div>

                  {/* Tube Barcode & Location Assignment */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                        Specimen Barcode Tube Label
                      </label>
                      <div className="relative">
                        <ScanLine className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                        <input
                          type="text"
                          value={customBarcode}
                          onChange={(e) => setCustomBarcode(e.target.value.toUpperCase())}
                          className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-3 font-mono text-sm text-slate-100 outline-none ring-1 ring-cyan-400/30 focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                        Phlebotomy Bay Location
                      </label>
                      <select
                        value={collectionLocation}
                        onChange={(e) => setCollectionLocation(e.target.value)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-200 outline-none"
                      >
                        <option>Phlebotomy Bay 01 (Central OPD)</option>
                        <option>Phlebotomy Bay 02 (Pediatric / STAT)</option>
                        <option>IPD Bedside Phlebotomy Runner</option>
                        <option>Emergency / ICU Phlebotomy Station</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                        Phlebotomist Clinical Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="e.g. Left cubital vein, 3.5 mL drawn, inverted 8 times, patient tolerated well..."
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Draw Confirmation Footer */}
                  <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => window.open(`/samples/${selectedSample.id}/label`, "_blank")}
                      className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <Printer className="h-4 w-4 inline mr-1.5" /> Print Barcode Label
                    </button>

                    <button
                      onClick={handleConfirmDraw}
                      disabled={submitting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-purple-950/50 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 transition-all"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Droplet className="h-4 w-4" />}
                      <span>Confirm Phlebotomy Draw &amp; Dispatch to Lab</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-96 flex-col items-center justify-center text-center text-slate-500 space-y-3">
                  <FlaskConical className="h-16 w-16 stroke-[1.2] text-slate-700 animate-pulse" />
                  <div>
                    <h3 className="text-base font-bold text-slate-300">Select a Waiting Patient</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Choose any patient from the phlebotomy queue on the left to initiate specimen collection and barcode labeling.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}