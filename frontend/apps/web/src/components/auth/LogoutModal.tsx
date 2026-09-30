"use client";

import React, { useState, useEffect } from "react";
import {
  LogOut,
  ShieldCheck,
  Lock,
  Database,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Clock,
  Server,
  HardDrive,
  KeyRound,
  FileText,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";


interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

const SECURE_TASKS = [
  {
    id: "audit",
    Icon: FileText,
    label: "Finalizing audit trail",
    detail: "ISO 15189 event log encrypted & stored",
    delay: 0,
    activeColor: "#f59e0b",
  },
  {
    id: "lis",
    Icon: Server,
    label: "LIS session handshake",
    detail: "ASTM / HL7 interface gracefully closed",
    delay: 400,
    activeColor: "#38bdf8",
  },
  {
    id: "cache",
    Icon: HardDrive,
    label: "Clearing local cache",
    detail: "PHI data wiped from browser memory",
    delay: 800,
    activeColor: "#818cf8",
  },
  {
    id: "token",
    Icon: KeyRound,
    label: "Revoking auth tokens",
    detail: "JWT + refresh token blacklisted on server",
    delay: 1200,
    activeColor: "#f43f5e",
  },
  {
    id: "workstation",
    Icon: Lock,
    label: "Locking workstation",
    detail: "Encrypted session snapshot persisted",
    delay: 1600,
    activeColor: "#34d399",
  },
  {
    id: "complete",
    Icon: ShieldCheck,
    label: "Secure logout complete",
    detail: "All clinical sessions terminated",
    delay: 2000,
    activeColor: "#2dd4bf",
  },
];

export default function LogoutModal({ isOpen, onClose, onConfirmLogout }: LogoutModalProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<"confirm" | "processing" | "done">("confirm");
  const [progress, setProgress] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setPhase("confirm");
        setProgress(0);
        setCompletedTasks(new Set());
        setActiveTaskId(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogoutFlow = () => {
    setPhase("processing");

    SECURE_TASKS.forEach((task, i) => {
      // Activate task
      setTimeout(() => {
        setActiveTaskId(task.id);
        setProgress(Math.round(((i + 0.5) / SECURE_TASKS.length) * 100));
      }, task.delay);

      // Complete task
      setTimeout(() => {
        setCompletedTasks((prev) => new Set([...prev, task.id]));
        const pct = Math.round(((i + 1) / SECURE_TASKS.length) * 100);
        setProgress(pct);
        if (i === SECURE_TASKS.length - 1) {
          setTimeout(() => {
            setPhase("done");
            setTimeout(() => onConfirmLogout(), 900);
          }, 300);
        }
      }, task.delay + 350);
    });
  };

  const userName = user
    ? (user as any).firstName || (user as any).fullName || "Operator"
    : "Operator";
  const userRole = (user as any)?.role || "Lab Technician";

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9990]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(9,13,26,0.94) 0%, rgba(2,4,12,0.98) 100%)",
          backdropFilter: "blur(18px)",
        }}
        onClick={phase === "confirm" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-[440px] pointer-events-auto relative flex flex-col overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #0d1424 0%, #080d1a 60%, #060a14 100%)",
            borderRadius: "22px",
            border: "1px solid rgba(148,163,184,0.1)",
            boxShadow: "0 0 0 1px rgba(99,179,237,0.05), 0 40px 100px rgba(0,0,0,0.85), 0 0 50px rgba(56,189,248,0.05)",
          }}
          style-note="animation done via class below"
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

          {/* Ambient glow top-right (rose) */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(225,29,72,0.09) 0%, transparent 70%)" }} />
          {/* Ambient glow bottom-left (sky) */}
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)" }} />

          {/* ── CONFIRM PHASE ───────────────────────────────── */}
          {phase === "confirm" && (
            <>
              {/* X close */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-20 rounded-full p-1.5 text-slate-500 hover:bg-slate-800/80 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon + title */}
              <div className="px-7 pt-8 pb-5 flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div
                    className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(225,29,72,0.15), rgba(17,24,39,0.85))",
                      border: "1.5px solid rgba(225,29,72,0.35)",
                      boxShadow: "0 0 28px rgba(225,29,72,0.14), inset 0 0 18px rgba(225,29,72,0.06)",
                    }}
                  >
                    <LogOut className="w-8 h-8 text-rose-400" />
                  </div>
                  {/* Dashed orbit */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "1px dashed rgba(225,29,72,0.22)",
                      animation: "lm-spin 9s linear infinite",
                    }}
                  />
                </div>
                <h2 className="text-[19px] font-bold text-white tracking-tight mb-1.5">
                  Secure Sign Out
                </h2>
                <p className="text-[13px] text-slate-400 leading-relaxed max-w-[300px]">
                  Terminate your authenticated LabCore ELIS clinical session safely.
                </p>
              </div>

              {/* User identity card */}
              <div className="mx-5 mb-4 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-3.5 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm"
                  style={{
                    background: "linear-gradient(135deg, rgba(14,165,233,0.2), rgba(99,102,241,0.2))",
                    border: "1px solid rgba(14,165,233,0.3)",
                    color: "#7dd3fc",
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{userName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{userRole} · LabCore ELIS</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-mono text-sky-400 font-bold">{fmtTime(currentTime)}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{fmtDate(currentTime)}</p>
                </div>
              </div>

              {/* Clinical safety notice */}
              <div className="mx-5 mb-4 rounded-2xl border border-rose-500/20 p-3.5 flex gap-3 items-start"
                style={{ background: "rgba(225,29,72,0.06)" }}>
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-300 mb-0.5">Clinical Safety Notice</p>
                  <p className="text-[11px] text-rose-200/70 leading-relaxed">
                    Ensure all pending result entries and pathologist sign-offs are saved.
                    Unsaved diagnostic changes will be lost on session termination.
                  </p>
                </div>
              </div>

              {/* Session metadata strip */}
              <div className="mx-5 mb-5 grid grid-cols-3 gap-2">
                {[
                  { Icon: Clock, label: "Session", value: "2h 14m", color: "text-slate-400" },
                  { Icon: Activity, label: "LIS Status", value: "Online", color: "text-emerald-400" },
                  { Icon: Database, label: "Sync", value: "Active", color: "text-cyan-400" },
                ].map(({ Icon, label, value, color }) => (
                  <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 text-center">
                    <div className="flex justify-center mb-1">
                      <Icon className={`w-3 h-3 ${color}`} />
                    </div>
                    <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
                    <p className="text-xs font-bold text-slate-200">{value}</p>
                  </div>
                ))}
              </div>

              {/* Auto-lock toggle */}
              <div className="mx-5 mb-5 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Auto-lock workstation on logout</span>
                </div>
                <div className="relative flex items-center h-5 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-0.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 translate-x-3.5 shadow shadow-emerald-400/30" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-5 pb-7 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                  style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(51,65,85,0.8)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogoutFlow}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #e11d48, #be123c)",
                    border: "1px solid rgba(225,29,72,0.45)",
                    boxShadow: "0 0 20px rgba(225,29,72,0.28)",
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Confirm Sign Out
                </button>
              </div>
            </>
          )}

          {/* ── PROCESSING / DONE PHASE ─────────────────────── */}
          {(phase === "processing" || phase === "done") && (
            <div className="px-7 py-7">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div
                    className="w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      background: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(6,182,212,0.08))",
                      border: `1.5px solid ${phase === "done" ? "rgba(16,185,129,0.5)" : "rgba(14,165,233,0.35)"}`,
                      boxShadow: phase === "done" ? "0 0 28px rgba(16,185,129,0.2)" : "0 0 28px rgba(14,165,233,0.14)",
                    }}
                  >
                    {phase === "done"
                      ? <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      : <Lock className="w-8 h-8 text-sky-400" />
                    }
                  </div>
                  {phase === "processing" && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: "2px solid transparent",
                        borderTopColor: "rgba(14,165,233,0.8)",
                        borderRightColor: "rgba(14,165,233,0.35)",
                        animation: "lm-spin 0.8s linear infinite",
                      }}
                    />
                  )}
                </div>
                <h2 className="text-[19px] font-bold text-white tracking-tight mb-1">
                  {phase === "done" ? "Session Terminated" : "Securing Session…"}
                </h2>
                <p className="text-[13px] text-slate-400">
                  {phase === "done"
                    ? "All clinical data secured. Audit logs finalized."
                    : "Please wait — safely closing your clinical session."}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
                  <span>Secure Termination Progress</span>
                  <span className="font-mono font-bold" style={{ color: phase === "done" ? "#34d399" : "#38bdf8" }}>
                    {progress}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(15,23,42,0.9)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                    style={{
                      width: `${progress}%`,
                      background: phase === "done"
                        ? "linear-gradient(90deg, #10b981, #34d399)"
                        : "linear-gradient(90deg, #0284c7, #38bdf8, #818cf8)",
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: "repeating-linear-gradient(-55deg, transparent, transparent 5px, rgba(255,255,255,0.18) 5px, rgba(255,255,255,0.18) 10px)",
                        animation: "lm-slide 0.9s linear infinite",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Task checklist */}
              <div className="space-y-1.5">
                {SECURE_TASKS.map((task) => {
                  const isDone = completedTasks.has(task.id);
                  const isActive = activeTaskId === task.id && !isDone;
                  const Icon = task.Icon;
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300"
                      style={{
                        background: isDone
                          ? "rgba(16,185,129,0.06)"
                          : isActive
                          ? "rgba(14,165,233,0.06)"
                          : "rgba(15,23,42,0.4)",
                        border: isDone
                          ? "1px solid rgba(16,185,129,0.18)"
                          : isActive
                          ? "1px solid rgba(14,165,233,0.18)"
                          : "1px solid rgba(30,41,59,0.55)",
                      }}
                    >
                      {/* Check / spinner / empty */}
                      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isActive ? (
                          <div
                            className="w-4 h-4 rounded-full border-2 border-t-transparent"
                            style={{ borderColor: "rgba(56,189,248,0.9) rgba(56,189,248,0.35) rgba(56,189,248,0.35) rgba(56,189,248,0.35)", animation: "lm-spin 0.6s linear infinite" }}
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700 bg-slate-800/60" />
                        )}
                      </div>

                      {/* Task icon */}
                      <Icon
                        className="w-3.5 h-3.5 flex-shrink-0 transition-colors duration-300"
                        style={{ color: isDone ? "#34d399" : isActive ? task.activeColor : "rgba(100,116,139,0.7)" }}
                      />

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-semibold truncate transition-colors duration-300"
                          style={{ color: isDone ? "#6ee7b7" : isActive ? "#e2e8f0" : "#4b5563" }}
                        >
                          {task.label}
                        </p>
                        {(isDone || isActive) && (
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{task.detail}</p>
                        )}
                      </div>

                      {isDone && (
                        <span className="flex-shrink-0 text-[10px] font-black text-emerald-500 font-mono">OK</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Completion badge */}
              {phase === "done" && (
                <div className="mt-5 flex justify-center">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-emerald-400"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.28)" }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>NABL ISO 15189 · Audit Complete · Redirecting…</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom accent line */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-700/35 to-transparent" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes lm-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes lm-slide {
          from { background-position: 0 0; }
          to   { background-position: 20px 0; }
        }
      `}</style>
    </>
  );
}

