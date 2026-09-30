"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Radio,
  ExternalLink,
  Trash2,
  Zap,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles
} from "lucide-react";

export interface Analyzer {
  id: string | number;
  name?: string;
  code?: string;
  analyzerId?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  type?: string;
  department?: string;
  location?: string;
  status?: string;
  connectionType?: string;
  protocol?: string;
  host?: string;
  port?: number;
  connectionLatency?: number;
  lastConnectedAt?: string;
  lastCommunicationAt?: string;
  createdAt?: string;
}

interface AnalyzerTableProps {
  analyzers: Analyzer[];
  loading?: boolean;
  onTestConnection?: (analyzer: Analyzer) => void;
  onDelete?: (analyzer: Analyzer) => void;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  ONLINE: {
    label: "ONLINE",
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    dot: "bg-emerald-400 animate-pulse",
  },
  CONNECTED: {
    label: "ONLINE",
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    dot: "bg-emerald-400 animate-pulse",
  },
  BUSY: {
    label: "PROCESSING",
    bg: "bg-violet-500/15",
    text: "text-violet-300",
    border: "border-violet-500/40",
    dot: "bg-violet-400",
  },
  IDLE: {
    label: "STANDBY",
    bg: "bg-sky-500/15",
    text: "text-sky-300",
    border: "border-sky-500/40",
    dot: "bg-sky-400",
  },
  MAINTENANCE: {
    label: "MAINTENANCE",
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/40",
    dot: "bg-amber-400",
  },
  ERROR: {
    label: "ALARM / ERROR",
    bg: "bg-rose-500/15",
    text: "text-rose-300",
    border: "border-rose-500/40",
    dot: "bg-rose-400 animate-ping",
  },
  OFFLINE: {
    label: "OFFLINE",
    bg: "bg-slate-800/60",
    text: "text-slate-400",
    border: "border-slate-700",
    dot: "bg-slate-500",
  },
};

function formatDate(date?: string) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString("en-IN", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnalyzerTable({
  analyzers,
  loading,
  onTestConnection,
  onDelete,
}: AnalyzerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"name" | "status" | "department">("name");
  const [sortAsc, setSortAsc] = useState(true);

  const filteredAnalyzers = useMemo(() => {
    return analyzers
      .filter((a) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
          a.name?.toLowerCase().includes(q) ||
          a.model?.toLowerCase().includes(q) ||
          a.manufacturer?.toLowerCase().includes(q) ||
          a.department?.toLowerCase().includes(q) ||
          a.location?.toLowerCase().includes(q) ||
          String(a.id).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const valA = String(a[sortField] || "").toLowerCase();
        const valB = String(b[sortField] || "").toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
  }, [analyzers, searchTerm, sortField, sortAsc]);

  const handleSort = (field: "name" | "status" | "department") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 shadow-md">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search analyzer fleet by name, manufacturer, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Active fleet size:</span>
          <span className="font-mono font-bold text-sky-400">{filteredAnalyzers.length} of {analyzers.length}</span>
        </div>
      </div>

      {/* High-Density Enterprise Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="px-5 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Instrument & Model</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("department")}
                  className="px-4 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Department / Bay</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Interface & Protocol</th>
                <th className="px-4 py-3.5">Socket Telemetry</th>
                <th
                  onClick={() => handleSort("status")}
                  className="px-4 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Clinical Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Last Communication</th>
                <th className="px-5 py-3.5 text-right">Command Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2 text-xs">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                      Streaming fleet status telemetry...
                    </div>
                  </td>
                </tr>
              ) : filteredAnalyzers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Cpu className="mx-auto h-10 w-10 text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-white">No Analyzers Found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Try refining your search filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredAnalyzers.map((analyzer) => {
                  const upperStatus = (analyzer.status || "OFFLINE").toUpperCase();
                  const cfg = statusConfig[upperStatus] || statusConfig.OFFLINE;
                  const latency = analyzer.connectionLatency || 18;

                  return (
                    <tr
                      key={analyzer.id}
                      className="group transition-colors hover:bg-slate-800/50"
                    >
                      {/* Name & Model */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/analyzers/${analyzer.id}`}
                          className="font-bold text-white group-hover:text-sky-400 transition-colors flex items-center gap-1.5"
                        >
                          {analyzer.name || `Analyzer #${analyzer.id}`}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky-400" />
                        </Link>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {analyzer.manufacturer || "Generic"} · {analyzer.model || "Core Engine"}
                          {analyzer.serialNumber && ` · SN: ${analyzer.serialNumber}`}
                        </p>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-200">
                          {analyzer.department || "Clinical Lab"}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {analyzer.location || "Room 101"}
                        </p>
                      </td>

                      {/* Protocol */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-sky-300 font-semibold bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-lg">
                          <Radio className="h-3 w-3 text-sky-400" />
                          {analyzer.protocol || "ASTM_E1394"}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {analyzer.connectionType || "TCP_IP"}
                        </p>
                      </td>

                      {/* Latency / Socket */}
                      <td className="px-4 py-4 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              latency < 50
                                ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                                : latency < 150
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                          />
                          <span className="font-bold text-slate-200">{latency} ms</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {analyzer.host ? `${analyzer.host}:${analyzer.port || 5000}` : "Interface Active"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Last Communication */}
                      <td className="px-4 py-4 text-slate-400 font-mono text-[11px]">
                        {formatDate(analyzer.lastCommunicationAt || analyzer.lastConnectedAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/analyzers/${analyzer.id}`}
                            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-sky-500 hover:bg-sky-600 hover:text-white transition-all shadow-sm"
                          >
                            Workstation
                          </Link>

                          {onTestConnection && (
                            <button
                              type="button"
                              onClick={() => onTestConnection(analyzer)}
                              className="rounded-xl border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:border-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all"
                              title="Ping Interface Handshake"
                            >
                              <Zap className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(analyzer)}
                              className="rounded-xl border border-slate-800 p-1.5 text-slate-500 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                              title="Decommission Analyzer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}