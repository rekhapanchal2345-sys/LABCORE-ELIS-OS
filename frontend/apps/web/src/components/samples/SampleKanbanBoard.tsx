"use client";

import React from "react";
import { 
  Clock3, Droplet, MapPin, Activity, CheckCircle2, 
  AlertTriangle, FlaskConical, ScanLine, UserRound, ArrowRight,
  Flame, ChevronRight, ShieldAlert, Sparkles, Building2
} from "lucide-react";

export interface KanbanSample {
  id: string;
  sampleNumber: string;
  barcode: string;
  patientId: string;
  orderId: string;
  testId: string;
  sampleType: string;
  status: string;
  priority?: string;
  collectedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  order: {
    orderNumber: string;
    patient: {
      uhid: string;
      firstName: string;
      lastName: string;
      gender: string;
      age?: number;
    };
    doctor?: {
      fullName: string;
    };
  };
  test: {
    testCode: string;
    testName: string;
    sampleContainer: string;
    processingDepartment?: string;
  };
}

interface SampleKanbanBoardProps {
  samples: KanbanSample[];
  onSelectSample: (sample: KanbanSample) => void;
  onAdvanceStatus: (sample: KanbanSample, nextStatus: string) => void;
  onPrintLabel: (sample: KanbanSample) => void;
  onRejectSample: (sampleId: string) => void;
  updatingSampleId: string | null;
}

const TUBE_CONTAINER_STYLES: Record<string, { bg: string; text: string; border: string; capColor: string; label: string }> = {
  "EDTA Tube": { bg: "bg-purple-950/40", text: "text-purple-300", border: "border-purple-500/40", capColor: "#8B5CF6", label: "Lavender EDTA" },
  "Lavender Top": { bg: "bg-purple-950/40", text: "text-purple-300", border: "border-purple-500/40", capColor: "#8B5CF6", label: "Lavender EDTA" },
  "Serum Separator Tube": { bg: "bg-amber-950/40", text: "text-amber-300", border: "border-amber-500/40", capColor: "#F59E0B", label: "Gold SST Gel" },
  "SST": { bg: "bg-amber-950/40", text: "text-amber-300", border: "border-amber-500/40", capColor: "#F59E0B", label: "Gold SST Gel" },
  "Red Top": { bg: "bg-red-950/40", text: "text-red-300", border: "border-red-500/40", capColor: "#EF4444", label: "Red Plain Serum" },
  "Sodium Citrate": { bg: "bg-sky-950/40", text: "text-sky-300", border: "border-sky-500/40", capColor: "#0284C7", label: "Light Blue Citrate" },
  "Light Blue": { bg: "bg-sky-950/40", text: "text-sky-300", border: "border-sky-500/40", capColor: "#0284C7", label: "Light Blue Citrate" },
  "Lithium Heparin": { bg: "bg-emerald-950/40", text: "text-emerald-300", border: "border-emerald-500/40", capColor: "#10B981", label: "Green Heparin" },
  "Green Top": { bg: "bg-emerald-950/40", text: "text-emerald-300", border: "border-emerald-500/40", capColor: "#10B981", label: "Green Heparin" },
  "Fluoride Tube": { bg: "bg-slate-900/60", text: "text-slate-300", border: "border-slate-500/40", capColor: "#64748B", label: "Grey Fluoride" },
  "Grey Top": { bg: "bg-slate-900/60", text: "text-slate-300", border: "border-slate-500/40", capColor: "#64748B", label: "Grey Fluoride" },
  "Sterile Container": { bg: "bg-amber-950/30", text: "text-yellow-300", border: "border-yellow-500/40", capColor: "#EAB308", label: "Urine Sterile Cup" },
};

function getTubeStyle(containerName?: string) {
  if (!containerName) return { bg: "bg-slate-900/50", text: "text-cyan-300", border: "border-cyan-500/30", capColor: "#06B6D4", label: "Standard Tube" };
  for (const [key, val] of Object.entries(TUBE_CONTAINER_STYLES)) {
    if (containerName.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return { bg: "bg-slate-900/50", text: "text-cyan-300", border: "border-cyan-500/30", capColor: "#06B6D4", label: containerName };
}

function getAgeMinutes(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m ago`;
}

export default function SampleKanbanBoard({
  samples,
  onSelectSample,
  onAdvanceStatus,
  onPrintLabel,
  onRejectSample,
  updatingSampleId,
}: SampleKanbanBoardProps) {
  const COLUMNS = [
    {
      id: "PENDING",
      title: "1. Phlebotomy Pending",
      sub: "Awaiting sample collection",
      badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-300",
      accent: "from-amber-500/20 via-amber-500/5 to-transparent",
      icon: Clock3,
      nextAction: "Collect",
      nextStatus: "COLLECTED",
    },
    {
      id: "COLLECTED",
      title: "2. In-Transit / Dispatch",
      sub: "Drawn & en route to central lab",
      badgeClass: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
      accent: "from-indigo-500/20 via-indigo-500/5 to-transparent",
      icon: Droplet,
      nextAction: "Receive in Lab",
      nextStatus: "RECEIVED",
    },
    {
      id: "RECEIVED",
      title: "3. Lab Accession & QC",
      sub: "Integrity verified, ready for analyzer",
      badgeClass: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
      accent: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      icon: MapPin,
      nextAction: "Start Analyzer Run",
      nextStatus: "PROCESSING",
    },
    {
      id: "PROCESSING",
      title: "4. In-Analyzer Processing",
      sub: "Test running on analyzer bay",
      badgeClass: "border-violet-500/40 bg-violet-500/10 text-violet-300",
      accent: "from-violet-500/20 via-violet-500/5 to-transparent",
      icon: Activity,
      nextAction: "Complete & Validate",
      nextStatus: "COMPLETED",
    },
    {
      id: "COMPLETED",
      title: "5. Completed & Validated",
      sub: "Results generated, archived",
      badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
      accent: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      icon: CheckCircle2,
      nextAction: null,
      nextStatus: null,
    },
  ];

  const rejectedSamples = samples.filter((s) => s.status === "REJECTED");

  return (
    <div className="space-y-6">
      {/* Rejected / Redraw Alert Bar if any */}
      {rejectedSamples.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-red-950/40 to-slate-950 p-4 text-white shadow-xl shadow-rose-950/30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-200">
                {rejectedSamples.length} Specimen{rejectedSamples.length > 1 ? "s" : ""} Rejected — Redraw Requisition Needed
              </p>
              <p className="text-xs text-rose-300/80">
                Hemolysis, clotted specimen, or volume deficiency flagged by laboratory QC desk.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {rejectedSamples.slice(0, 3).map((rs) => (
              <button
                key={rs.id}
                onClick={() => onSelectSample(rs)}
                className="rounded-xl border border-rose-500/30 bg-rose-900/30 px-3 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-800/40 transition-colors"
              >
                {rs.sampleNumber} · {rs.rejectionReason || "Redraw"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Multi-Column Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {COLUMNS.map((col) => {
          const colSamples = samples.filter((s) => s.status === col.id);
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-3xl border border-slate-800/80 bg-slate-950/90 shadow-2xl backdrop-blur-xl"
            >
              {/* Column Header */}
              <div className={`rounded-t-3xl border-b border-slate-800/80 bg-gradient-to-b ${col.accent} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-300" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                      {col.title}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-black shadow-sm ${col.badgeClass}`}
                  >
                    {colSamples.length}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400 font-medium">{col.sub}</p>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 space-y-3 p-3 min-h-[500px] max-h-[75vh] overflow-y-auto custom-scrollbar">
                {colSamples.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800/70 p-4 text-center text-slate-600">
                    <FlaskConical className="h-6 w-6 stroke-[1.5] text-slate-700 mb-2" />
                    <p className="text-xs font-semibold text-slate-500">No samples in this stage</p>
                  </div>
                ) : (
                  colSamples.map((sample) => {
                    const tube = getTubeStyle(sample.test.sampleContainer);
                    const isStat = sample.priority === "STAT" || sample.priority === "URGENT";
                    const isUpdating = updatingSampleId === sample.id;

                    return (
                      <div
                        key={sample.id}
                        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                          isStat
                            ? "border-rose-500/60 bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 shadow-lg shadow-rose-950/20"
                            : "border-slate-800/90 bg-slate-900/80 hover:border-slate-700"
                        }`}
                      >
                        {/* STAT / Priority top indicator bar */}
                        {isStat && (
                          <div className="flex items-center justify-between bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3 fill-white" /> STAT / Critical Priority
                            </span>
                            <span>URGENT</span>
                          </div>
                        )}

                        <div className="p-3.5 space-y-3">
                          {/* Accession & Tube Cap Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <button
                                onClick={() => onSelectSample(sample)}
                                className="text-left font-mono text-xs font-black text-white hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                              >
                                {sample.sampleNumber}
                                <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                              <p className="font-mono text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <ScanLine className="h-3 w-3 text-cyan-400/80" /> {sample.barcode}
                              </p>
                            </div>

                            {/* Realistic Tube Cap Indicator */}
                            <div
                              className="flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[9px] font-bold shadow-sm"
                              style={{
                                borderColor: `${tube.capColor}55`,
                                backgroundColor: `${tube.capColor}15`,
                                color: tube.capColor,
                              }}
                              title={tube.label}
                            >
                              <span
                                className="h-2.5 w-2.5 rounded-full shadow-inner ring-1 ring-white/20"
                                style={{ backgroundColor: tube.capColor }}
                              />
                              <span className="truncate max-w-[80px]">{sample.test.sampleContainer || sample.sampleType}</span>
                            </div>
                          </div>

                          {/* Patient Info */}
                          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 space-y-1">
                            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                              <UserRound className="h-3.5 w-3.5 text-cyan-400" />
                              {sample.order.patient.firstName} {sample.order.patient.lastName}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>UHID: <span className="font-mono text-slate-300 font-semibold">{sample.order.patient.uhid}</span></span>
                              <span>{sample.order.patient.age || "—"} yrs · {sample.order.patient.gender}</span>
                            </div>
                          </div>

                          {/* Test Profile & Department */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-100">
                              <span className="truncate max-w-[140px]">{sample.test.testName}</span>
                              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300">
                                {sample.test.testCode}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              {sample.test.processingDepartment || "Core Lab"} · Order #{sample.order.orderNumber}
                            </p>
                          </div>

                          {/* Time in Stage & Operator Info */}
                          <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock3 className="h-3 w-3 text-slate-500" />
                              {getAgeMinutes(sample.createdAt)}
                            </span>
                            <span className="font-semibold text-slate-400">
                              {sample.sampleType}
                            </span>
                          </div>

                          {/* Action Footprint */}
                          <div className="flex items-center gap-2 pt-1">
                            {col.nextAction && col.nextStatus && (
                              <button
                                onClick={() => onAdvanceStatus(sample, col.nextStatus!)}
                                disabled={isUpdating}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-[11px] font-black text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all"
                              >
                                <span>{col.nextAction}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onPrintLabel(sample)}
                              className="rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-[11px] font-bold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200 transition-colors"
                              title="Print barcode tube label"
                            >
                              🏷️
                            </button>
                            {sample.status !== "COMPLETED" && (
                              <button
                                onClick={() => onRejectSample(sample.id)}
                                className="rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-2 text-[11px] font-bold text-rose-400 hover:border-rose-500/40 hover:bg-rose-950/40 transition-colors"
                                title="Reject specimen / Request redraw"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
