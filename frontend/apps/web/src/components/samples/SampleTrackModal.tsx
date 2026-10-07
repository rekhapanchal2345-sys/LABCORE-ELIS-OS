"use client";

import React, { useEffect, useRef } from "react";
import {
  X,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  User2,
  FlaskConical,
  Truck,
  TestTube2,
  Microscope,
  PackageCheck,
  ShieldAlert,
  ScanLine,
  Hash,
  Building2,
  Timer,
  RefreshCw,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TrackingEvent {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  status: "success" | "pending" | "failed" | "warning";
  user?: string;
  role?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface TATStatus {
  expectedHours: number;
  elapsedMinutes: number;
  percentComplete: number;
  isBreached: boolean;
  remainingMinutes: number;
}

interface Sample {
  id: string;
  sampleNumber: string;
  barcode: string;
  sampleType: string;
  status: string;
  priority?: string;
  collectedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  createdAt: string;
  collectionType?: string;
  order: {
    orderNumber: string;
    patient: { uhid: string; firstName: string; lastName: string };
    doctor?: { fullName: string; specialization: string };
  };
  test: {
    testCode: string;
    testName: string;
    sampleContainer: string;
    processingDepartment?: string;
  };
  collectedBy?: { fullName: string; employeeCode: string };
}

// ─── Workflow steps definition ────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  {
    key: "PENDING",
    label: "Order Created",
    icon: ScanLine,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    border: "border-amber-500/40",
    description: "Sample registered in ELIS, awaiting phlebotomy",
  },
  {
    key: "COLLECTED",
    label: "Specimen Collected",
    icon: TestTube2,
    color: "text-violet-400",
    bg: "bg-violet-500/20",
    border: "border-violet-500/40",
    description: "Specimen collected from patient",
  },
  {
    key: "RECEIVED",
    label: "Lab Receipt",
    icon: PackageCheck,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/40",
    description: "Specimen received and logged at lab",
  },
  {
    key: "PROCESSING",
    label: "Processing",
    icon: Microscope,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/40",
    description: "Specimen undergoing analysis",
  },
  {
    key: "COMPLETED",
    label: "Completed",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    description: "Analysis complete, results ready",
  },
];

// ─── TAT Progress Bar ─────────────────────────────────────────────────────────
function TATProgress({ tat }: { tat: TATStatus }) {
  const pct = Math.min(100, tat.percentComplete);
  const color =
    tat.isBreached
      ? "from-red-600 to-red-400"
      : pct > 75
      ? "from-orange-600 to-amber-400"
      : "from-emerald-600 to-emerald-400";

  const hrs = Math.floor(tat.remainingMinutes / 60);
  const mins = tat.remainingMinutes % 60;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-300">Turnaround Time</span>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            tat.isBreached
              ? "bg-red-500/20 text-red-300 border border-red-500/40"
              : pct > 75
              ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
          }`}
        >
          {tat.isBreached
            ? `BREACHED by ${Math.abs(hrs)}h ${Math.abs(mins)}m`
            : hrs > 0
            ? `${hrs}h ${mins}m remaining`
            : `${mins}m remaining`}
        </span>
      </div>
      <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
        {tat.isBreached && (
          <div className="absolute inset-0 bg-red-500/20 animate-pulse rounded-full" />
        )}
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-slate-500">
        <span>{Math.floor(tat.elapsedMinutes / 60)}h {tat.elapsedMinutes % 60}m elapsed</span>
        <span>Target: {tat.expectedHours}h TAT</span>
      </div>
    </div>
  );
}

// ─── Timeline Event Item ──────────────────────────────────────────────────────
function TimelineItem({ event, isLast }: { event: TrackingEvent; isLast: boolean }) {
  const Icon =
    event.status === "success"
      ? CheckCircle2
      : event.status === "failed"
      ? XCircle
      : event.status === "warning"
      ? AlertCircle
      : Circle;

  const iconColor =
    event.status === "success"
      ? "text-emerald-400"
      : event.status === "failed"
      ? "text-red-400"
      : event.status === "warning"
      ? "text-amber-400"
      : "text-slate-500";

  const borderColor =
    event.status === "success"
      ? "border-emerald-500/40 bg-emerald-950/30"
      : event.status === "failed"
      ? "border-red-500/40 bg-red-950/20"
      : event.status === "warning"
      ? "border-amber-500/40 bg-amber-950/20"
      : "border-slate-700 bg-slate-900";

  return (
    <div className="relative flex gap-4">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-700/60" />
      )}

      {/* Icon */}
      <div className={`relative shrink-0 mt-0.5`}>
        <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${borderColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 rounded-xl border p-3 mb-3 ${borderColor}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-sm text-white">{event.event}</p>
            <p className="text-xs text-slate-400 mt-0.5">{event.description}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] text-slate-400">
              {new Date(event.timestamp).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="text-[11px] font-mono text-slate-300">
              {new Date(event.timestamp).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        {(event.user || event.location) && (
          <div className="flex flex-wrap gap-3 mt-2">
            {event.user && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <User2 className="h-3 w-3" /> {event.user}
                {event.role && <span className="ml-1 text-slate-600">({event.role})</span>}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <MapPin className="h-3 w-3" /> {event.location}
              </span>
            )}
          </div>
        )}
        {/* Metadata chips */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(event.metadata).map(([k, v]) => (
              <span
                key={k}
                className="text-[9px] bg-slate-800 border border-slate-700 text-slate-400 rounded px-1.5 py-0.5"
              >
                {k}: {String(v)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Workflow Progress Bar ─────────────────────────────────────────────────────
function WorkflowProgress({ currentStatus }: { currentStatus: string }) {
  const currentIdx = WORKFLOW_STEPS.findIndex((s) => s.key === currentStatus);
  const isRejected = currentStatus === "REJECTED";

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Specimen Journey
        </span>
        {isRejected && (
          <span className="ml-auto text-xs bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
            REJECTED
          </span>
        )}
      </div>

      <div className="flex items-center gap-0">
        {WORKFLOW_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isDone = !isRejected && i <= currentIdx;
          const isCurrent = !isRejected && i === currentIdx;
          const isNext = !isRejected && i === currentIdx + 1;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all ${
                    isRejected && i <= currentIdx
                      ? "border-red-500/60 bg-red-950/30"
                      : isDone
                      ? `${step.border} ${step.bg}`
                      : "border-slate-700 bg-slate-900"
                  } ${isCurrent ? "ring-2 ring-offset-1 ring-offset-slate-900 ring-current scale-110" : ""}`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isDone ? step.color : "text-slate-600"
                    }`}
                  />
                </div>
                <p
                  className={`text-[9px] font-semibold mt-1 text-center leading-tight px-1 ${
                    isCurrent ? "text-white" : isDone ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={`h-px flex-shrink-0 w-6 mb-5 transition-all ${
                    i < currentIdx ? "bg-slate-500" : "bg-slate-800"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  sample: Sample | null;
  events: TrackingEvent[];
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  slaHours?: number;
}

export default function SampleTrackModal({
  sample,
  events,
  loading,
  isOpen,
  onClose,
  onRefresh,
  slaHours = 4,
}: Props) {
  if (!isOpen || !sample) return null;

  // Compute TAT
  const start = new Date(sample.collectedAt || sample.createdAt).getTime();
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - start) / 60000));
  const expectedMinutes = slaHours * 60;
  const percentComplete = Math.min(110, Math.round((elapsedMinutes / expectedMinutes) * 100));
  const remainingMinutes = expectedMinutes - elapsedMinutes;
  const isBreached =
    !["COMPLETED", "REJECTED"].includes(sample.status) && elapsedMinutes > expectedMinutes;

  const tat: TATStatus = {
    expectedHours: slaHours,
    elapsedMinutes,
    percentComplete,
    isBreached,
    remainingMinutes: Math.abs(remainingMinutes),
  };

  // Build synthetic events from sample data + provided events
  const syntheticEvents: TrackingEvent[] = [
    {
      id: "sys-1",
      timestamp: sample.createdAt,
      event: "Order Created & Sample Registered",
      description: `Lab order ${sample.order.orderNumber} created. Sample ${sample.sampleNumber} registered in ELIS.`,
      status: "success" as const,
      user: "Front Desk",
      location: "Registration",
      metadata: { barcode: sample.barcode, priority: sample.priority || "ROUTINE" },
    },
    ...(sample.collectedAt
      ? [
          {
            id: "sys-2",
            timestamp: sample.collectedAt,
            event: "Specimen Collected",
            description: `${sample.sampleType} specimen collected in ${sample.test.sampleContainer}.`,
            status: "success" as const,
            user: sample.collectedBy?.fullName || "Phlebotomist",
            location: sample.collectionType === "HOME_COLLECTION" ? "Home Collection" : "Phlebotomy Room",
            metadata: { container: sample.test.sampleContainer, type: sample.sampleType },
          },
        ]
      : []),
    ...(sample.receivedAt
      ? [
          {
            id: "sys-3",
            timestamp: sample.receivedAt,
            event: "Specimen Received at Laboratory",
            description: "Sample accessioned, integrity checked (label, container, volume), and logged.",
            status: "success" as const,
            location: "Laboratory Reception",
            metadata: { labelOk: true, containerOk: true, volumeOk: true },
          },
        ]
      : []),
    ...events,
    ...(sample.completedAt
      ? [
          {
            id: "sys-99",
            timestamp: sample.completedAt,
            event: "Analysis Completed",
            description: "Sample processing complete. Results available for validation.",
            status: "success" as const,
            location: sample.test.processingDepartment || "General Lab",
          },
        ]
      : []),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Specimen Track</h2>
              <p className="text-xs text-slate-400">
                {sample.sampleNumber} · {sample.test.testName}
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ml-2 ${
                sample.status === "COMPLETED"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : sample.status === "REJECTED"
                  ? "bg-red-500/20 text-red-300 border-red-500/40"
                  : isBreached
                  ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/40"
              }`}
            >
              {isBreached && !["COMPLETED", "REJECTED"].includes(sample.status)
                ? "⚠ TAT BREACHED"
                : sample.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="h-9 w-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
              title="Refresh tracking"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <a
              href={`/samples/${sample.id}`}
              target="_blank"
              rel="noreferrer"
              className="h-9 w-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
              title="Open full sample page"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Sample summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Hash, label: "Sample ID", value: sample.sampleNumber },
              { icon: FlaskConical, label: "Container", value: sample.test.sampleContainer },
              { icon: User2, label: "Patient", value: `${sample.order.patient.firstName} ${sample.order.patient.lastName}` },
              { icon: Building2, label: "Department", value: sample.test.processingDepartment || "General Lab" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3 w-3 text-slate-500" />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">{label}</span>
                </div>
                <p className="text-xs font-bold text-white truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Workflow progress */}
          <WorkflowProgress currentStatus={sample.status} />

          {/* TAT bar */}
          {!["COMPLETED"].includes(sample.status) && <TATProgress tat={tat} />}

          {/* Timeline */}
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Chain of Custody Timeline
              </span>
              <span className="ml-auto text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                {syntheticEvents.length} events
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-800 animate-pulse shrink-0" />
                    <div className="flex-1 h-16 rounded-xl bg-slate-800 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : syntheticEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No tracking events recorded yet</p>
              </div>
            ) : (
              <div>
                {syntheticEvents.map((event, i) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    isLast={i === syntheticEvents.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-3 border-t border-slate-800 bg-slate-900 text-[11px] text-slate-500 shrink-0">
          <Clock className="h-3 w-3" />
          <span>Age: {Math.floor(elapsedMinutes / 60)}h {elapsedMinutes % 60}m</span>
          <span className="w-px h-3 bg-slate-700" />
          <span>Order: {sample.order.orderNumber}</span>
          <span className="w-px h-3 bg-slate-700" />
          <span>UHID: {sample.order.patient.uhid}</span>
          {isBreached && (
            <span className="ml-auto flex items-center gap-1.5 text-red-400 font-bold animate-pulse">
              <ShieldAlert className="h-3 w-3" /> TAT Breached
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
