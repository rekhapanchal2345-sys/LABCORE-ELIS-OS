"use client";

import { 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  PlayCircle, 
  ExternalLink,
  Zap,
  Radio
} from "lucide-react";

interface AnalyzerStats {
  total?: number;
  online?: number;
  offline?: number;
  busy?: number;
  error?: number;
  maintenance?: number;
  pendingJobs?: number;
  failedJobs?: number;
  unresolvedAlerts?: number;
}

interface AnalyzerTelemetryWidgetProps {
  stats?: AnalyzerStats;
  loading?: boolean;
}

export default function AnalyzerTelemetryWidget({ stats, loading = false }: AnalyzerTelemetryWidgetProps) {
  const onlineCount = stats?.online ?? 2;
  const totalCount = stats?.total ?? 3;
  const busyCount = stats?.busy ?? 1;
  const errorCount = stats?.error ?? 0;
  const maintenanceCount = stats?.maintenance ?? 0;
  const pendingJobs = stats?.pendingJobs ?? 4;

  const mockAnalyzers = [
    {
      id: "an-1",
      name: "Sysmex XN-1000",
      type: "Hematology 5-Part Diff",
      status: "ONLINE",
      port: "ASTM / COM3",
      workload: "12 Samples Queued",
      health: 99,
    },
    {
      id: "an-2",
      name: "Roche Cobas c311",
      type: "Clinical Chemistry",
      status: "BUSY",
      port: "HL7 / TCP 5000",
      workload: "Assay In Progress (8m)",
      health: 98,
    },
    {
      id: "an-3",
      name: "Mindray CL-900i",
      type: "Chemiluminescence Immunoassay",
      status: "STANDBY",
      port: "HL7 / TCP 5001",
      workload: "Ready for Batch",
      health: 100,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ONLINE":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
        </span>;
      case "BUSY":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-spin" /> Running
        </span>;
      case "STANDBY":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Standby
        </span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Offline
        </span>;
    }
  };

  return (
    <div className="luxury-glass-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                Analyzer Equipment Telemetry
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-600" /> Live ASTM/HL7
                </span>
              </h3>
              <p className="text-xs text-slate-500">Automated diagnostic instrument connectivity & job queues</p>
            </div>
          </div>

          <a 
            href="/analyzers" 
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
          >
            Manage <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Telemetry Metric Badges */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
            <p className="text-[11px] text-emerald-800 font-medium">Online Devices</p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">{onlineCount} / {totalCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 text-center">
            <p className="text-[11px] text-sky-800 font-medium">Active Jobs</p>
            <p className="text-lg font-bold text-sky-700 mt-0.5">{pendingJobs}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-[11px] text-slate-600 font-medium">Faults / Errors</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{errorCount}</p>
          </div>
        </div>

        {/* Equipment List */}
        <div className="space-y-2.5">
          {mockAnalyzers.map((an) => (
            <div 
              key={an.id}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-700 font-semibold text-[11px]">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{an.name}</p>
                  <p className="text-[11px] text-slate-400">{an.type} • <span className="font-mono text-slate-500">{an.port}</span></p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                {getStatusBadge(an.status)}
                <span className="text-[10px] text-slate-500">{an.workload}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Auto-Sync Interval: 10s</span>
        <span className="text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Bi-directional Interface Ready
        </span>
      </div>
    </div>
  );
}
