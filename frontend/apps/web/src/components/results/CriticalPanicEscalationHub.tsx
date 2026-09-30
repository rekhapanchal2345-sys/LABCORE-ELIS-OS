"use client";

import React, { useState } from "react";
import {
  AlertOctagon,
  PhoneCall,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Send,
  FileSpreadsheet,
  Search,
  Filter,
  Volume2,
  Calendar,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

export interface CriticalAlertItem {
  id: string;
  resultId: string;
  patientName: string;
  uhid: string;
  age: string;
  gender: string;
  wardOrDept: string;
  bedNumber?: string;
  testName: string;
  parameterName: string;
  criticalValue: string;
  normalRange: string;
  unit: string;
  urgencyLevel: "STAT_IMMEDIATE" | "URGENT" | "PRIORITY";
  detectedAt: string;
  status: "PENDING_NOTIFICATION" | "DOCTOR_NOTIFIED" | "ACKNOWLEDGED" | "ESCALATED";
  notifiedTo?: {
    doctorName: string;
    doctorPhone: string;
    notifiedAt: string;
    notifiedBy: string;
    readBackConfirmed: boolean;
    clinicalInstructions?: string;
  };
}

interface CriticalPanicEscalationHubProps {
  onSelectResult?: (resultId: string) => void;
}

const INITIAL_CRITICAL_ALERTS: CriticalAlertItem[] = [
  {
    id: "CP-101",
    resultId: "res-001",
    patientName: "Rajesh Kumar Verma",
    uhid: "UHID-98214",
    age: "58y",
    gender: "M",
    wardOrDept: "ICU - Bed 04",
    bedNumber: "ICU-04",
    testName: "Serum Electrolytes Panel",
    parameterName: "Serum Potassium (K+)",
    criticalValue: "6.9",
    normalRange: "3.5 - 5.1",
    unit: "mmol/L",
    urgencyLevel: "STAT_IMMEDIATE",
    detectedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
    status: "PENDING_NOTIFICATION",
  },
  {
    id: "CP-102",
    resultId: "res-002",
    patientName: "Sunita Devi Sharma",
    uhid: "UHID-77412",
    age: "42y",
    gender: "F",
    wardOrDept: "Emergency Ward",
    bedNumber: "EM-02",
    testName: "Complete Blood Count (CBC)",
    parameterName: "Platelet Count",
    criticalValue: "14,000",
    normalRange: "150,000 - 450,000",
    unit: "/µL",
    urgencyLevel: "STAT_IMMEDIATE",
    detectedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: "DOCTOR_NOTIFIED",
    notifiedTo: {
      doctorName: "Dr. Arvind Mehta (Duty MO)",
      doctorPhone: "+91 98112 34567",
      notifiedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      notifiedBy: "Priya Nair (Senior Biochemist)",
      readBackConfirmed: true,
      clinicalInstructions: "Stat single donor platelet transfusion arranged. Peripheral smear checked.",
    },
  },
  {
    id: "CP-103",
    resultId: "res-003",
    patientName: "Aman Preet Singh",
    uhid: "UHID-66381",
    age: "67y",
    gender: "M",
    wardOrDept: "Cardiology Ward C",
    bedNumber: "C-12",
    testName: "Cardiac Biomarkers",
    parameterName: "Troponin-I (High Sensitivity)",
    criticalValue: "1.48",
    normalRange: "< 0.04",
    unit: "ng/mL",
    urgencyLevel: "STAT_IMMEDIATE",
    detectedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    status: "ACKNOWLEDGED",
    notifiedTo: {
      doctorName: "Dr. K. S. Rao (Interventional Cardiologist)",
      doctorPhone: "+91 98450 11223",
      notifiedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      notifiedBy: "Dr. Ananya Ray (Pathologist)",
      readBackConfirmed: true,
      clinicalInstructions: "Patient moved for immediate coronary angiography. Cath lab alerted.",
    },
  },
  {
    id: "CP-104",
    resultId: "res-004",
    patientName: "Baby of Sneha (Neonate)",
    uhid: "UHID-11029",
    age: "3 days",
    gender: "F",
    wardOrDept: "NICU",
    bedNumber: "NICU-08",
    testName: "Blood Glucose Stat",
    parameterName: "Plasma Glucose (Random)",
    criticalValue: "28",
    normalRange: "60 - 100",
    unit: "mg/dL",
    urgencyLevel: "STAT_IMMEDIATE",
    detectedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "PENDING_NOTIFICATION",
  },
  {
    id: "CP-105",
    resultId: "res-005",
    patientName: "Vikram Malhotra",
    uhid: "UHID-55490",
    age: "51y",
    gender: "M",
    wardOrDept: "Nephrology OPD",
    testName: "Renal Function Test",
    parameterName: "Serum Creatinine",
    criticalValue: "7.4",
    normalRange: "0.7 - 1.3",
    unit: "mg/dL",
    urgencyLevel: "URGENT",
    detectedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    status: "DOCTOR_NOTIFIED",
    notifiedTo: {
      doctorName: "Dr. Sandeep Aggarwal",
      doctorPhone: "+91 99201 88472",
      notifiedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      notifiedBy: "Vikrant Singh (Lab Tech)",
      readBackConfirmed: true,
      clinicalInstructions: "OPD patient contacted to report to ER immediately for urgent hemodialysis review.",
    },
  },
];

export default function CriticalPanicEscalationHub({ onSelectResult }: CriticalPanicEscalationHubProps) {
  const [alerts, setAlerts] = useState<CriticalAlertItem[]>(INITIAL_CRITICAL_ALERTS);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "NOTIFIED" | "ACKNOWLEDGED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Call Modal State
  const [selectedAlertForCall, setSelectedAlertForCall] = useState<CriticalAlertItem | null>(null);
  const [callerName, setCallerName] = useState("Dr. Lab Officer (Pathology)");
  const [recipientDoctor, setRecipientDoctor] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [readBackChecked, setReadBackChecked] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === "PENDING" && alert.status !== "PENDING_NOTIFICATION") return false;
    if (activeFilter === "NOTIFIED" && alert.status !== "DOCTOR_NOTIFIED") return false;
    if (activeFilter === "ACKNOWLEDGED" && alert.status !== "ACKNOWLEDGED") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        alert.patientName.toLowerCase().includes(q) ||
        alert.uhid.toLowerCase().includes(q) ||
        alert.parameterName.toLowerCase().includes(q) ||
        alert.wardOrDept.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = alerts.filter((a) => a.status === "PENDING_NOTIFICATION").length;
  const notifiedCount = alerts.filter((a) => a.status === "DOCTOR_NOTIFIED").length;
  const acknowledgedCount = alerts.filter((a) => a.status === "ACKNOWLEDGED").length;

  const handleOpenCallLog = (alert: CriticalAlertItem) => {
    setSelectedAlertForCall(alert);
    setRecipientDoctor(alert.notifiedTo?.doctorName || "");
    setRecipientPhone(alert.notifiedTo?.doctorPhone || "");
    setReadBackChecked(alert.notifiedTo?.readBackConfirmed || false);
    setClinicalNotes(alert.notifiedTo?.clinicalInstructions || "");
  };

  const handleSaveCallLog = () => {
    if (!selectedAlertForCall) return;
    if (!recipientDoctor.trim()) {
      alert("Please enter the name of the clinician or ward nurse receiving the panic report.");
      return;
    }
    if (!readBackChecked) {
      alert("NABL ISO 15189 requires verbal read-back confirmation. Please confirm that the recipient repeated the value back.");
      return;
    }

    setAlerts((prev) =>
      prev.map((item) => {
        if (item.id === selectedAlertForCall.id) {
          return {
            ...item,
            status: "DOCTOR_NOTIFIED",
            notifiedTo: {
              doctorName: recipientDoctor,
              doctorPhone: recipientPhone || "On-Duty Ward Extension",
              notifiedAt: new Date().toISOString(),
              notifiedBy: callerName,
              readBackConfirmed: true,
              clinicalInstructions: clinicalNotes || "Read-back confirmed. Clinician acknowledged alert.",
            },
          };
        }
        return item;
      })
    );

    setSelectedAlertForCall(null);
    setToastMessage(`Critical result read-back logged for ${selectedAlertForCall.patientName} (ISO 15189 Compliant)`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleMarkAcknowledged = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === alertId ? { ...item, status: "ACKNOWLEDGED" } : item))
    );
    setToastMessage("Critical alert marked as fully acknowledged by clinical team.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getElapsedMins = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diffMs / (60 * 1000));
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
      <div className="relative overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-red-600/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-400">
              <AlertOctagon className="h-3.5 w-3.5 animate-pulse text-red-400" />
              NABL ISO 15189:2022 Critical Panic Value Sentinel
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Critical & Panic Value Escalation Desk
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">
              Mandatory telephonic read-back registry and immediate clinical escalation protocol for life-threatening laboratory parameters.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                <AlertOctagon className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-red-300">Stat Pending</p>
                <p className="text-2xl font-black text-red-200">{pendingCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-amber-300">Notified</p>
                <p className="text-2xl font-black text-amber-200">{notifiedCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-300">Completed</p>
                <p className="text-2xl font-black text-emerald-200">{acknowledgedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeFilter === "ALL"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveFilter("PENDING")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeFilter === "PENDING"
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "text-red-400 hover:bg-red-950/30"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            Stat Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter("NOTIFIED")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeFilter === "NOTIFIED"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-amber-400 hover:bg-amber-950/30"
            }`}
          >
            Doctor Notified ({notifiedCount})
          </button>
          <button
            onClick={() => setActiveFilter("ACKNOWLEDGED")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeFilter === "ACKNOWLEDGED"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-emerald-400 hover:bg-emerald-950/30"
            }`}
          >
            Fully Acknowledged ({acknowledgedCount})
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, UHID, test, ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Critical Alert Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAlerts.map((alert) => {
          const elapsed = getElapsedMins(alert.detectedAt);
          const isBreached = elapsed > 15 && alert.status === "PENDING_NOTIFICATION";

          return (
            <div
              key={alert.id}
              className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
                alert.status === "PENDING_NOTIFICATION"
                  ? isBreached
                    ? "border-red-500 bg-red-950/30 shadow-lg shadow-red-950/50"
                    : "border-red-500/40 bg-slate-900/90 shadow-md hover:border-red-500/70"
                  : alert.status === "DOCTOR_NOTIFIED"
                  ? "border-amber-500/40 bg-slate-900/80 hover:border-amber-500/60"
                  : "border-emerald-500/30 bg-slate-900/60"
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {alert.id} · {alert.wardOrDept}
                    </span>
                    <h3 className="mt-0.5 text-base font-bold text-white">
                      {alert.patientName}
                    </h3>
                    <p className="text-xs text-slate-300">
                      UHID: <span className="font-mono text-cyan-400">{alert.uhid}</span> · {alert.age} / {alert.gender}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      alert.status === "PENDING_NOTIFICATION"
                        ? "bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse"
                        : alert.status === "DOCTOR_NOTIFIED"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                    }`}
                  >
                    {alert.status === "PENDING_NOTIFICATION" ? "Immediate Call Req." : alert.status === "DOCTOR_NOTIFIED" ? "Notified & Logged" : "Actioned"}
                  </span>
                </div>

                {/* Critical Result Highlight Box */}
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5">
                  <div className="flex items-center justify-between text-xs text-red-300">
                    <span className="font-semibold">{alert.testName}</span>
                    <span className="font-mono text-[11px] text-slate-400">Ref: {alert.normalRange} {alert.unit}</span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xs text-slate-300">{alert.parameterName}:</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-red-400">{alert.criticalValue}</span>
                      <span className="text-xs font-semibold text-red-300">{alert.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Notification Status / Read-Back Proof */}
                {alert.notifiedTo ? (
                  <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Read-Back Verified · ISO 15189
                    </div>
                    <p className="mt-1 text-slate-200">
                      <strong>To:</strong> {alert.notifiedTo.doctorName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      By: {alert.notifiedTo.notifiedBy} at{" "}
                      {new Date(alert.notifiedTo.notifiedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {alert.notifiedTo.clinicalInstructions && (
                      <p className="mt-1.5 rounded bg-slate-900 p-1.5 text-[11px] text-slate-300 italic border-l-2 border-amber-400">
                        "{alert.notifiedTo.clinicalInstructions}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-950/70 p-2.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-red-400" />
                      <span>Detected: {elapsed} mins ago</span>
                    </div>
                    {isBreached ? (
                      <span className="text-[10px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded">
                        SLA Breached ({'>'}15m)
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-300">SLA: &lt;15 mins</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2 border-t border-slate-800/80 pt-3">
                {alert.status === "PENDING_NOTIFICATION" && (
                  <button
                    onClick={() => handleOpenCallLog(alert)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    Log Verbal Call (Read-Back)
                  </button>
                )}

                {alert.status === "DOCTOR_NOTIFIED" && (
                  <>
                    <button
                      onClick={() => handleOpenCallLog(alert)}
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                    >
                      Update Call Log
                    </button>
                    <button
                      onClick={() => handleMarkAcknowledged(alert.id)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Close Alert
                    </button>
                  </>
                )}

                {alert.status === "ACKNOWLEDGED" && (
                  <div className="flex w-full items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Closed & Archived
                    </span>
                    <button
                      onClick={() => handleOpenCallLog(alert)}
                      className="text-cyan-400 hover:underline text-[11px]"
                    >
                      View ISO Audit Record
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ISO 15189 Telephonic Read-Back Call Log Modal */}
      {selectedAlertForCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-red-500/30 bg-slate-950 p-6 text-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">NABL ISO 15189 Telephonic Read-Back</h3>
                  <p className="text-xs text-slate-400">
                    Mandatory documentation of verbal critical value notification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertForCall(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Alert Summary Box */}
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs">
              <div className="flex justify-between font-bold text-slate-200">
                <span>{selectedAlertForCall.patientName} ({selectedAlertForCall.uhid})</span>
                <span className="text-red-400">{selectedAlertForCall.wardOrDept}</span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-red-950/40 p-2.5 font-mono text-sm text-red-300">
                <span>{selectedAlertForCall.parameterName}:</span>
                <span className="text-base font-black text-white">
                  {selectedAlertForCall.criticalValue} {selectedAlertForCall.unit}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Recipient Doctor / Sister-in-Charge Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Arvind Mehta (ICU Incharge) or Staff Nurse Sunita"
                  value={recipientDoctor}
                  onChange={(e) => setRecipientDoctor(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Phone / Extension #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98112 00000 or Ext 402"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Notified By (Staff ID / Name)
                  </label>
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Clinical Instructions / Actions Noted
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Advised immediate potassium binders, stat repeat sample in 4 hours..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* NABL Read-back Checkbox */}
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={readBackChecked}
                    onChange={(e) => setReadBackChecked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <div className="text-[11px] leading-tight text-amber-200">
                    <span className="font-bold uppercase tracking-wider text-amber-400">
                      Mandatory Read-Back Confirmation (ISO 15189)
                    </span>
                    <p className="mt-0.5 text-slate-300">
                      I certify that the recipient verbally repeated the patient name, UHID, test, and critical panic value back to me verbatim.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedAlertForCall(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCallLog}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500"
              >
                <CheckCircle2 className="h-4 w-4" />
                Sign & Save ISO Critical Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
