"use client";

import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  UserCheck,
  Search,
  Filter,
  Check,
  X,
  Volume2,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Activity,
  FileCheck
} from "lucide-react";
import { Analyzer } from "@/types";

export interface CriticalPanicEntry {
  id: string;
  barcode: string;
  mrn: string;
  patientName: string;
  ageGender: string;
  department: string;
  wardBed: string;
  testName: string;
  resultValue: string;
  referenceRange: string;
  panicDirection: "CRITICAL_HIGH" | "CRITICAL_LOW";
  detectedAt: Date;
  tatRemainingSeconds: number; // 15 mins target
  status: "PENDING_CALL" | "COMMUNICATED_VERIFIED" | "ESCALATED_TO_CMO";
  analyzerSource: string;
  physicianName: string;
  physicianPhone: string;
  communicationLog?: {
    calledAt: string;
    recipientName: string;
    recipientRole: string;
    readBackVerified: boolean;
    technologistName: string;
    notes?: string;
  };
}

interface CriticalPanicEscalationHubProps {
  analyzers?: Analyzer[];
}

export default function CriticalPanicEscalationHub({ analyzers = [] }: CriticalPanicEscalationHubProps) {
  const [entries, setEntries] = useState<CriticalPanicEntry[]>([
    {
      id: "PANIC-991",
      barcode: "STAT-ICU-8821",
      mrn: "MRN-ICU-1049",
      patientName: "Vikram Singhania",
      ageGender: "58 / M",
      department: "Critical Care ICU",
      wardBed: "ICU Bed #04",
      testName: "Serum Potassium (K+)",
      resultValue: "6.8 mmol/L",
      referenceRange: "3.5 - 5.1 mmol/L",
      panicDirection: "CRITICAL_HIGH",
      detectedAt: new Date(Date.now() - 4 * 60 * 1000),
      tatRemainingSeconds: 11 * 60,
      status: "PENDING_CALL",
      analyzerSource: "Roche Cobas c311",
      physicianName: "Dr. A. K. Mehra (ICU Consultant)",
      physicianPhone: "+91 98210 44812 (Ext: 4401)",
    },
    {
      id: "PANIC-992",
      barcode: "STAT-EMG-7712",
      mrn: "MRN-EMG-9902",
      patientName: "Sunita Deshpande",
      ageGender: "42 / F",
      department: "Emergency Trauma",
      wardBed: "ER Bay #02",
      testName: "Platelet Count (PLT)",
      resultValue: "18 x10^3/μL",
      referenceRange: "150 - 450 x10^3/μL",
      panicDirection: "CRITICAL_LOW",
      detectedAt: new Date(Date.now() - 12 * 60 * 1000),
      tatRemainingSeconds: 3 * 60,
      status: "PENDING_CALL",
      analyzerSource: "Sysmex XN-550",
      physicianName: "Dr. Rajiv Rastogi (ER Duty)",
      physicianPhone: "+91 97110 33819 (Ext: 2201)",
    },
    {
      id: "PANIC-990",
      barcode: "LAB-IPD-4410",
      mrn: "MRN-IPD-8812",
      patientName: "Mohd. Tariq",
      ageGender: "66 / M",
      department: "Cardiology IPD",
      wardBed: "Cardio 3rd Floor / Bed 12",
      testName: "High-Sensitivity Troponin I",
      resultValue: "0.48 ng/mL",
      referenceRange: "< 0.034 ng/mL",
      panicDirection: "CRITICAL_HIGH",
      detectedAt: new Date(Date.now() - 25 * 60 * 1000),
      tatRemainingSeconds: 0,
      status: "COMMUNICATED_VERIFIED",
      analyzerSource: "Abbott Architect i2000",
      physicianName: "Dr. S. K. Roy (Cardiologist)",
      physicianPhone: "+91 98101 22910",
      communicationLog: {
        calledAt: "Today, 14:12 PM",
        recipientName: "Sister Deepa (ICU Staff Nurse)",
        recipientRole: "Staff Nurse on Duty",
        readBackVerified: true,
        technologistName: "Tech Rajesh Kumar",
        notes: "Physician immediately alerted for emergency angiography.",
      },
    },
  ]);

  const [activeCallEntry, setActiveCallEntry] = useState<CriticalPanicEntry | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientRole, setRecipientRole] = useState("Attending Physician");
  const [readBackChecked, setReadBackChecked] = useState(true);
  const [callNotes, setCallNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setEntries((prev) =>
        prev.map((e) => {
          if (e.status === "PENDING_CALL" && e.tatRemainingSeconds > 0) {
            return { ...e, tatRemainingSeconds: e.tatRemainingSeconds - 1 };
          }
          return e;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenCallModal = (entry: CriticalPanicEntry) => {
    setActiveCallEntry(entry);
    setRecipientName(entry.physicianName);
    setRecipientRole("Attending Physician");
    setReadBackChecked(true);
    setCallNotes("");
  };

  const handleCompleteCall = () => {
    if (!activeCallEntry) return;
    if (!readBackChecked) {
      showNotification("CAP / NABL mandates verbal Read-Back confirmation before closing panic alerts!");
      return;
    }

    setEntries((prev) =>
      prev.map((e) => {
        if (e.id === activeCallEntry.id) {
          return {
            ...e,
            status: "COMMUNICATED_VERIFIED",
            communicationLog: {
              calledAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              recipientName,
              recipientRole,
              readBackVerified: true,
              technologistName: "Duty Medical Technologist",
              notes: callNotes,
            },
          };
        }
        return e;
      })
    );

    showNotification(`Critical result read-back verified & communicated to ${recipientName}.`);
    setActiveCallEntry(null);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const pendingCount = entries.filter((e) => e.status === "PENDING_CALL").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-200" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-br from-slate-950 via-[#26070e] to-slate-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-rose-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/15 px-3 py-1 text-[11px] font-bold text-rose-300">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                CAP & JCI Mandated Critical Results Communication
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                15-Min Closed-Loop Policy
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Critical Panic Value Closed-Loop Escalation Hub
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              When an analyzer generates life-threatening panic values (hyperkalemia, critical thrombocytopenia, troponin surge), maintain full regulatory compliance with mandatory verbal &quot;Read-Back&quot; verification logs, automated doctor SMS/WhatsApp alerts, and 15-minute countdown locks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold shadow-lg ${
                pendingCount > 0
                  ? "bg-rose-500/20 text-rose-200 border border-rose-500/40 animate-pulse shadow-rose-900/30"
                  : "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40"
              }`}
            >
              {pendingCount > 0 ? (
                <>
                  <PhoneCall className="h-4 w-4 text-rose-400" />
                  {pendingCount} Critical Panics Awaiting Verbal Call
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  All Critical Results Communicated
                </>
              )}
            </span>
          </div>
        </div>

        {/* Quick Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target TAT</p>
              <p className="text-sm font-black text-rose-300">&lt; 15 Minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Read-Back Rate</p>
              <p className="text-sm font-black text-emerald-300">100% Documented</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WhatsApp Alert</p>
              <p className="text-sm font-black text-amber-300">Instant Push</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Status</p>
              <p className="text-sm font-black text-blue-300">JCI & CAP Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panic List Grid */}
      <div className="space-y-4">
        {entries.map((entry) => {
          const isPending = entry.status === "PENDING_CALL";
          const isNearTimeout = isPending && entry.tatRemainingSeconds < 5 * 60;

          return (
            <div
              key={entry.id}
              className={`rounded-3xl border p-5 transition-all duration-300 ${
                isPending
                  ? isNearTimeout
                    ? "border-rose-500 bg-gradient-to-r from-rose-950/70 via-slate-950 to-rose-950/50 shadow-2xl shadow-rose-900/40"
                    : "border-rose-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/30"
                  : "border-slate-800 bg-slate-950/80 opacity-80"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Patient & Value Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                      isPending
                        ? "border-rose-500/40 bg-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                        : "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    <AlertTriangle className={`h-6 w-6 ${isPending ? "animate-pulse" : ""}`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-400">{entry.barcode}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-xs text-slate-300">{entry.mrn}</span>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-300">
                        {entry.wardBed}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white mt-1">
                      {entry.patientName} <span className="text-xs font-normal text-slate-400">({entry.ageGender})</span>
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-200">
                        {entry.testName}: <span className="font-mono text-sm font-black text-rose-400">{entry.resultValue}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Reference: {entry.referenceRange}</span>
                      <span className="text-[11px] text-slate-400">Instrument: {entry.analyzerSource}</span>
                    </div>
                  </div>
                </div>

                {/* Right Call Action Bar & Countdown Timer */}
                <div className="flex flex-wrap items-center gap-4 border-t border-slate-800/80 pt-3 lg:border-t-0 lg:pt-0">
                  {isPending && (
                    <div className="text-center font-mono">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Communication TAT</span>
                      <span
                        className={`text-xl font-black ${
                          isNearTimeout ? "text-rose-400 animate-pulse" : "text-amber-400"
                        }`}
                      >
                        {formatTimer(entry.tatRemainingSeconds)}
                      </span>
                    </div>
                  )}

                  {isPending ? (
                    <button
                      onClick={() => handleOpenCallModal(entry)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-red-500 to-pink-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      <PhoneCall className="h-4 w-4" />
                      Call & Verify Read-Back
                    </button>
                  ) : (
                    <div className="text-right text-xs">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                        Communicated & Verified
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Received by: {entry.communicationLog?.recipientName} ({entry.communicationLog?.calledAt})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* READ-BACK VERIFICATION CALL MODAL */}
      {activeCallEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-rose-500/40 bg-slate-950 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-rose-400 animate-bounce" />
                <div>
                  <h3 className="text-base font-bold text-white">Document Verbal Read-Back Call</h3>
                  <p className="text-[10px] text-rose-300 font-mono">CAP / NABL ISO 15189 MANDATED LOG</p>
                </div>
              </div>
              <button onClick={() => setActiveCallEntry(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3.5 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <strong className="text-white">{activeCallEntry.patientName} ({activeCallEntry.mrn})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-200">{activeCallEntry.wardBed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Critical Finding:</span>
                <strong className="text-rose-300">{activeCallEntry.testName} = {activeCallEntry.resultValue}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Contact:</span>
                <span className="font-mono text-cyan-300">{activeCallEntry.physicianPhone}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Call Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Recipient Designation</label>
                <select
                  value={recipientRole}
                  onChange={(e) => setRecipientRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Attending Physician">Attending Physician / Consultant</option>
                  <option value="Resident Doctor">Resident Medical Officer (RMO)</option>
                  <option value="Staff Nurse on Duty">Staff Nurse on Duty (ICU/Ward)</option>
                  <option value="Chief Medical Officer">Chief Medical Officer (CMO)</option>
                </select>
              </div>

              {/* READ-BACK CHECKBOX */}
              <div
                onClick={() => setReadBackChecked(!readBackChecked)}
                className="cursor-pointer rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 flex items-start gap-3"
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-lg border transition-all ${
                    readBackChecked ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 bg-slate-800"
                  }`}
                >
                  {readBackChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <div className="text-[11px]">
                  <strong className="text-emerald-300 block">Verbal Read-Back Verification Completed</strong>
                  <span className="text-slate-400">
                    Recipient repeated the patient name, MRN, and critical value back to the lab technologist to prevent misunderstandings.
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Clinical Communication Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="e.g. Physician ordered immediate IV calcium gluconate..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveCallEntry(null)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteCall}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:opacity-95"
              >
                Save & Close Panic Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
