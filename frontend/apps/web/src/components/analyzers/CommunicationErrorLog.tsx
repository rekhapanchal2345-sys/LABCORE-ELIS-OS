"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Radio,
  Clock,
  RefreshCw,
  ServerOff,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Terminal,
  CheckCircle2,
  BellRing
} from "lucide-react";
import { Analyzer } from "@/types";

export interface CommunicationErrorItem {
  id: string;
  timestamp: Date;
  analyzerId: string;
  analyzerName: string;
  protocol: string;
  errorType: "CONNECTION_DROP" | "MALFORMED_FRAME" | "CHECKSUM_FAILURE" | "TIMEOUT";
  severity: "CRITICAL" | "WARNING";
  details: string;
  rawPayloadSnippet?: string;
  retryAttempts: number;
  maxRetries: number;
  retryStatus: "RETRYING" | "ABORTED" | "RESOLVED";
  nextRetryInSeconds?: number;
}

interface CommunicationErrorLogProps {
  isOpen: boolean;
  onClose: () => void;
  analyzers: Analyzer[];
}

export default function CommunicationErrorLog({
  isOpen,
  onClose,
  analyzers,
}: CommunicationErrorLogProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [notified, setNotified] = useState(false);

  const [errors, setErrors] = useState<CommunicationErrorItem[]>([
    {
      id: "err-1",
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      analyzerId: "SYS-001",
      analyzerName: "Sysmex XN-1000",
      protocol: "ASTM E1394",
      errorType: "CHECKSUM_FAILURE",
      severity: "WARNING",
      details: "Frame checksum mismatch: Expected 0x4B, received 0x2A. Corrupted frame discarded.",
      rawPayloadSnippet: "\x022R|1|^^^^SMP-901|WBC|7.2\x032A\r\n",
      retryAttempts: 2,
      maxRetries: 5,
      retryStatus: "RETRYING",
      nextRetryInSeconds: 14,
    },
    {
      id: "err-2",
      timestamp: new Date(Date.now() - 18 * 60 * 1000),
      analyzerId: "ROC-001",
      analyzerName: "Roche Cobas c311",
      protocol: "HL7 v2.5",
      errorType: "TIMEOUT",
      severity: "CRITICAL",
      details: "TCP socket timeout after 5000ms. No ACK received for MSH order download query.",
      rawPayloadSnippet: "MSH|^~\\&|LABCORE|LIS|COBAS|ROCHE|20260906||ORM^O01||P|2.5\r",
      retryAttempts: 4,
      maxRetries: 5,
      retryStatus: "RETRYING",
      nextRetryInSeconds: 6,
    },
    {
      id: "err-3",
      timestamp: new Date(Date.now() - 52 * 60 * 1000),
      analyzerId: "BC-001",
      analyzerName: "Beckman DxH 900",
      protocol: "TCP/IP Direct",
      errorType: "CONNECTION_DROP",
      severity: "CRITICAL",
      details: "Host 192.168.1.135:5000 disconnected unexpectedly (ECONNRESET). Machine reported offline.",
      retryAttempts: 5,
      maxRetries: 5,
      retryStatus: "ABORTED",
    },
    {
      id: "err-4",
      timestamp: new Date(Date.now() - 95 * 60 * 1000),
      analyzerId: "SYS-001",
      analyzerName: "Sysmex XN-1000",
      protocol: "ASTM E1394",
      errorType: "MALFORMED_FRAME",
      severity: "WARNING",
      details: "Missing <ETX> delimiter on result record terminating segment.",
      rawPayloadSnippet: "R|2|^^^^SMP-882|HGB|13.5|g/dL\r",
      retryAttempts: 3,
      maxRetries: 3,
      retryStatus: "RESOLVED",
    },
  ]);

  if (!isOpen) return null;

  const handleManualRetry = (id: string) => {
    setRetryingId(id);
    setTimeout(() => {
      setErrors((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, retryAttempts: e.retryAttempts + 1, retryStatus: "RETRYING" }
            : e
        )
      );
      setRetryingId(null);
    }, 1500);
  };

  const handleNotifyStaff = () => {
    setNotified(true);
    setTimeout(() => setNotified(false), 4000);
  };

  const filtered = errors.filter((e) => {
    if (filterType !== "ALL" && e.errorType !== filterType) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">Communication Errors & Telemetry Diagnostics</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-200 text-rose-900">
                  {errors.filter((e) => e.retryStatus !== "RESOLVED").length} Unresolved
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Detailed packet-level telemetry log: socket drops, checksum failures, and protocol timeouts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Actions */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold">Filter Error Type:</span>
            {["ALL", "CHECKSUM_FAILURE", "TIMEOUT", "CONNECTION_DROP", "MALFORMED_FRAME"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === t
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {t === "ALL" ? "All" : t.replace("_", " ")}
              </button>
            ))}
          </div>

          <button
            onClick={handleNotifyStaff}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg font-semibold transition-colors shadow-sm"
          >
            <BellRing className="w-3.5 h-3.5" />
            {notified ? "Duty Alert Dispatched!" : "Alert On-Duty Engineer"}
          </button>
        </div>

        {/* List of Error Records */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3.5">
          {notified && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Notification and SMS dispatched to laboratory technical supervisor and duty pathologist.</span>
            </div>
          )}

          {filtered.map((err) => (
            <div
              key={err.id}
              className={`p-4 rounded-xl border transition-all ${
                err.severity === "CRITICAL"
                  ? "bg-rose-50/40 border-rose-200 hover:border-rose-400"
                  : "bg-amber-50/30 border-amber-200 hover:border-amber-400"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        err.severity === "CRITICAL"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {err.errorType.replace("_", " ")}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">{err.analyzerName}</span>
                    <span className="text-xs text-gray-400 font-mono">({err.analyzerId})</span>
                    <span className="text-xs text-gray-400">• {err.protocol}</span>
                  </div>

                  <p className="text-xs text-gray-700 mt-2 font-medium">{err.details}</p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-gray-400 font-mono block">
                    {err.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <div className="mt-1.5 flex items-center justify-end gap-1.5">
                    {err.retryStatus === "RETRYING" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Auto-Retrying ({err.retryAttempts}/{err.maxRetries})
                      </span>
                    )}
                    {err.retryStatus === "ABORTED" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        <ServerOff className="w-3 h-3" />
                        Retries Exhausted ({err.maxRetries}/{err.maxRetries})
                      </span>
                    )}
                    {err.retryStatus === "RESOLVED" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Reconnected
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Raw Frame snippet */}
              {err.rawPayloadSnippet && (
                <div className="mt-3 bg-slate-900 text-rose-300 font-mono text-[11px] p-2.5 rounded-lg border border-slate-800 overflow-x-auto flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 select-none mr-2">&gt; Raw Buffer:</span>
                    {err.rawPayloadSnippet}
                  </div>
                </div>
              )}

              {/* Footer action bar for card */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400">
                  {err.nextRetryInSeconds
                    ? `Next auto-reconnect probe in ${err.nextRetryInSeconds} seconds`
                    : "Requires manual line check"}
                </span>

                {err.retryStatus !== "RESOLVED" && (
                  <button
                    onClick={() => handleManualRetry(err.id)}
                    disabled={retryingId === err.id}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${retryingId === err.id ? "animate-spin" : ""}`} />
                    Force Immediate Re-handshake
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            System automatically cycles handshake probes with exponential backoff (15s, 30s, 60s).
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-semibold hover:bg-gray-900 transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
