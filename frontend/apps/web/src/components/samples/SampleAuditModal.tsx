"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FlaskConical,
  User2,
  ClipboardCheck,
  Eye,
  History,
  Hash,
  Clock,
  MapPin,
  Laptop2,
  ChevronDown,
  ChevronUp,
  FileText,
  Lock,
  Fingerprint,
  Scan,
  Badge,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userName: string;
  role: string;
  ipAddress?: string;
  description: string;
  createdAt: string;
  status: "SUCCESS" | "FAILED" | "WARNING";
  location?: string;
  deviceInfo?: string;
  sessionId?: string;
  patientVerification?: {
    nameVerified: boolean;
    uhidVerified: boolean;
    dobVerified: boolean;
    photoVerified: boolean;
  };
  barcodeData?: {
    scanned: string;
    expected: string;
    matched: boolean;
  };
}

interface VerificationCheck {
  id: string;
  name: string;
  status: "verified" | "failed" | "pending" | "skipped";
  timestamp?: string;
  verifiedBy?: string;
  notes?: string;
}

interface Sample {
  id: string;
  sampleNumber: string;
  barcode: string;
  sampleType: string;
  status: string;
  priority?: string;
  createdAt: string;
  collectedAt?: string;
  order: {
    orderNumber: string;
    patient: { uhid: string; firstName: string; lastName: string; dateOfBirth?: string };
    doctor?: { fullName: string };
  };
  test: { testCode: string; testName: string; sampleContainer: string };
}

// ─── Audit Log Card ───────────────────────────────────────────────────────────
function AuditCard({
  log,
  expanded,
  onToggle,
}: {
  log: AuditLog;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusConfig = {
    SUCCESS: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/40", label: "Success" },
    FAILED: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20 border-red-500/40", label: "Failed" },
    WARNING: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/40", label: "Warning" },
  }[log.status];

  const StatusIcon = statusConfig.icon;

  const actionIcon: Record<string, React.ElementType> = {
    PATIENT_VERIFICATION: Fingerprint,
    BARCODE_SCAN: Scan,
    SAMPLE_COLLECTION: FlaskConical,
    INTEGRITY_CHECK: ShieldCheck,
    LAB_RECEIPT: ClipboardCheck,
    PROCESSING_START: FlaskConical,
    RESULT_VALIDATION: FileText,
    REJECTION: XCircle,
  };

  const ActionIcon = actionIcon[log.action] || History;

  return (
    <div className={`rounded-xl border transition-all ${
      log.status === "FAILED"
        ? "border-red-500/30 bg-red-950/10"
        : log.status === "WARNING"
        ? "border-amber-500/30 bg-amber-950/10"
        : "border-slate-700/60 bg-slate-900"
    }`}>
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Action icon */}
        <div className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border ${statusConfig.bg}`}>
          <ActionIcon className={`h-4 w-4 ${statusConfig.color}`} />
        </div>

        {/* Main text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white leading-none">
              {log.action.replace(/_/g, " ")}
            </p>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{log.description}</p>
        </div>

        {/* Time + expand */}
        <div className="shrink-0 text-right flex items-center gap-3">
          <div>
            <p className="text-[11px] text-slate-500">
              {new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-[10px] text-slate-600">
              {new Date(log.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3">
          {/* Meta row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: User2, label: "Staff", value: `${log.userName} (${log.role})` },
              { icon: MapPin, label: "Location", value: log.location || "—" },
              { icon: Laptop2, label: "Device", value: log.deviceInfo || "—" },
              { icon: Lock, label: "IP Address", value: log.ipAddress || "—" },
              { icon: Hash, label: "Session ID", value: log.sessionId?.slice(-8) || "—" },
              { icon: Clock, label: "Timestamp", value: new Date(log.createdAt).toLocaleString("en-IN") },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg bg-slate-800/60 px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3 w-3 text-slate-500" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{label}</span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Patient verification grid */}
          {log.patientVerification && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Patient ID Verification — 4-Point Check
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(log.patientVerification).map(([k, v]) => (
                  <div
                    key={k}
                    className={`rounded-lg p-2.5 border text-center ${
                      v
                        ? "border-emerald-500/30 bg-emerald-950/30"
                        : "border-red-500/30 bg-red-950/20"
                    }`}
                  >
                    {v ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
                    )}
                    <p className="text-[9px] font-bold text-slate-300 capitalize">
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barcode match */}
          {log.barcodeData && (
            <div className={`rounded-xl border p-3 ${
              log.barcodeData.matched
                ? "border-emerald-500/30 bg-emerald-950/20"
                : "border-red-500/30 bg-red-950/20"
            }`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Barcode Verification
              </p>
              <div className="grid grid-cols-3 gap-3 text-[11px]">
                <div>
                  <p className="text-slate-500 mb-0.5">Scanned</p>
                  <p className="font-mono font-bold text-white">{log.barcodeData.scanned}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Expected</p>
                  <p className="font-mono font-bold text-white">{log.barcodeData.expected}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Match</p>
                  <p className={`font-bold ${log.barcodeData.matched ? "text-emerald-400" : "text-red-400"}`}>
                    {log.barcodeData.matched ? "✓ MATCHED" : "✗ MISMATCH"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Verification Summary Panel ────────────────────────────────────────────────
function VerificationPanel({ checks }: { checks: VerificationCheck[] }) {
  const verified = checks.filter((c) => c.status === "verified").length;
  const total = checks.length;
  const pct = total ? Math.round((verified / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3">
      {/* Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Verification Score
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-black ${pct === 100 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400"}`}>
            {pct}%
          </span>
          <span className="text-xs text-slate-500">{verified}/{total} passed</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            pct === 100 ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
            : pct >= 60 ? "bg-gradient-to-r from-amber-600 to-amber-400"
            : "bg-gradient-to-r from-red-600 to-red-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Check list */}
      <div className="space-y-2">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`flex items-center gap-3 rounded-lg p-2.5 border ${
              check.status === "verified"
                ? "border-emerald-500/30 bg-emerald-950/20"
                : check.status === "failed"
                ? "border-red-500/30 bg-red-950/20"
                : check.status === "pending"
                ? "border-amber-500/30 bg-amber-950/10"
                : "border-slate-700 bg-slate-900/50"
            }`}
          >
            {check.status === "verified" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : check.status === "failed" ? (
              <XCircle className="h-4 w-4 text-red-400 shrink-0" />
            ) : check.status === "pending" ? (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            ) : (
              <Eye className="h-4 w-4 text-slate-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">{check.name}</p>
              {check.notes && <p className="text-[10px] text-slate-500 truncate">{check.notes}</p>}
            </div>
            <div className="text-right shrink-0">
              {check.verifiedBy && (
                <p className="text-[10px] text-slate-500">{check.verifiedBy}</p>
              )}
              {check.timestamp && (
                <p className="text-[10px] text-slate-600 font-mono">
                  {new Date(check.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  sample: Sample | null;
  auditLogs: AuditLog[];
  verificationChecks: VerificationCheck[];
  isOpen: boolean;
  onClose: () => void;
}

type AuditView = "timeline" | "verification" | "summary";

export default function SampleAuditModal({
  sample,
  auditLogs,
  verificationChecks,
  isOpen,
  onClose,
}: Props) {
  const [activeView, setActiveView] = useState<AuditView>("timeline");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  if (!isOpen || !sample) return null;

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const successRate = auditLogs.length
    ? Math.round((auditLogs.filter((l) => l.status === "SUCCESS").length / auditLogs.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Audit Trail</h2>
              <p className="text-xs text-slate-400">
                {sample.sampleNumber} · {sample.order.orderNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Audit health badge */}
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              successRate === 100
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : successRate >= 70
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-red-500/20 text-red-300 border-red-500/40"
            }`}>
              {successRate}% pass rate
            </span>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-800 bg-slate-950 shrink-0">
          {(
            [
              { key: "timeline", label: "Audit Log", icon: History },
              { key: "verification", label: "Verifications", icon: ShieldCheck },
              { key: "summary", label: "Summary", icon: ClipboardCheck },
            ] as { key: AuditView; label: string; icon: React.ElementType }[]
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold transition-all border-b-2 ${
                activeView === key
                  ? "text-white border-indigo-500 bg-indigo-500/5"
                  : "text-slate-400 border-transparent hover:text-white hover:border-slate-600"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {key === "timeline" && (
                <span className="ml-1 text-[9px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-full">
                  {auditLogs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {activeView === "timeline" && (
            <>
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No audit logs recorded</p>
                  <p className="text-xs mt-1 opacity-70">Events will appear as actions are performed</p>
                </div>
              ) : (
                auditLogs.map((log) => (
                  <AuditCard
                    key={log.id}
                    log={log}
                    expanded={expandedCards.has(log.id)}
                    onToggle={() => toggleCard(log.id)}
                  />
                ))
              )}
            </>
          )}

          {activeView === "verification" && (
            <VerificationPanel checks={verificationChecks} />
          )}

          {activeView === "summary" && (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Events", value: auditLogs.length, color: "text-blue-300" },
                  { label: "Passed", value: auditLogs.filter((l) => l.status === "SUCCESS").length, color: "text-emerald-300" },
                  { label: "Failed / Warned", value: auditLogs.filter((l) => l.status !== "SUCCESS").length, color: "text-red-300" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-center">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold uppercase">{label}</p>
                  </div>
                ))}
              </div>

              {/* Sample info summary */}
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Sample Compliance Summary
                </p>
                {[
                  { label: "Sample Number", value: sample.sampleNumber },
                  { label: "Barcode", value: sample.barcode },
                  { label: "Patient", value: `${sample.order.patient.firstName} ${sample.order.patient.lastName}` },
                  { label: "UHID", value: sample.order.patient.uhid },
                  { label: "Test", value: sample.test.testName },
                  { label: "Status", value: sample.status },
                  { label: "Registered", value: new Date(sample.createdAt).toLocaleString("en-IN") },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>

              {/* Compliance declaration */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="h-4 w-4 text-indigo-400" />
                  <p className="text-xs font-bold text-indigo-300">Compliance Declaration</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  This audit trail provides a complete, tamper-evident record of all actions performed
                  on specimen <strong className="text-white">{sample.sampleNumber}</strong>. All
                  events are logged with user identity, timestamp, location, and device information
                  in accordance with ISO 15189:2022 and NABL accreditation requirements.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-3 border-t border-slate-800 bg-slate-900 text-[11px] text-slate-500 shrink-0">
          <Lock className="h-3 w-3" />
          <span>Audit trail is read-only and tamper-proof</span>
          <span className="ml-auto flex items-center gap-1.5 text-indigo-400">
            <ShieldCheck className="h-3 w-3" /> ISO 15189 · NABL Compliant
          </span>
        </div>
      </div>
    </div>
  );
}
