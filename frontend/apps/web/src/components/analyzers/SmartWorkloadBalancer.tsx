"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Zap,
  ArrowRightLeft,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Server,
  Droplets,
  Cpu,
  BarChart3,
  TestTube,
  Check,
  Search,
  ChevronRight,
  TrendingDown,
  Percent,
  SlidersHorizontal
} from "lucide-react";
import { Analyzer } from "@/types";

export interface SpecimenTubeWork {
  id: string;
  barcode: string;
  patientName: string;
  department: string;
  tests: string[];
  priority: "STAT" | "ROUTINE";
  assignedAnalyzerId: string;
  assignedAnalyzerName: string;
  estimatedSecs: number;
  status: "QUEUED" | "PROCESSING" | "COMPLETED";
}

export interface AnalyzerLoadMetrics {
  id: string;
  name: string;
  department: string;
  model: string;
  status: "ONLINE" | "BUSY" | "MAINTENANCE" | "OFFLINE";
  throughputPerHour: number;
  activeTubesCount: number;
  totalTestsQueued: number;
  queueEtaMinutes: number;
  reagentHealth: number; // 0 - 100%
  rackSlotsOccupied: number;
  rackSlotsTotal: number;
  racks: {
    rackId: string;
    tubes: SpecimenTubeWork[];
  }[];
}

interface SmartWorkloadBalancerProps {
  analyzers?: Analyzer[];
}

export default function SmartWorkloadBalancer({ analyzers = [] }: SmartWorkloadBalancerProps) {
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [isBalancing, setIsBalancing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [balanceStrategy, setBalanceStrategy] = useState<"MIN_TAT" | "EVEN_RACK_DISTRIBUTION" | "REAGENT_PRESERVING">("MIN_TAT");

  // Initial Simulated Fleet Load Data
  const [fleetLoads, setFleetLoads] = useState<AnalyzerLoadMetrics[]>([
    {
      id: "demo-1",
      name: "Sysmex XN-550 (Line 1)",
      department: "Hematology",
      model: "XN-550",
      status: "ONLINE",
      throughputPerHour: 60,
      activeTubesCount: 9,
      totalTestsQueued: 27,
      queueEtaMinutes: 28,
      reagentHealth: 88,
      rackSlotsOccupied: 9,
      rackSlotsTotal: 10,
      racks: [
        {
          rackId: "RACK-H1",
          tubes: [
            { id: "tb-101", barcode: "STAT-HEM-991", patientName: "Aarav Sharma", department: "Hematology", tests: ["CBC", "DIFF", "PLT"], priority: "STAT", assignedAnalyzerId: "demo-1", assignedAnalyzerName: "Sysmex XN-550 (Line 1)", estimatedSecs: 60, status: "PROCESSING" },
            { id: "tb-102", barcode: "LAB-HEM-102", patientName: "Pooja Varma", department: "Hematology", tests: ["CBC", "DIFF"], priority: "ROUTINE", assignedAnalyzerId: "demo-1", assignedAnalyzerName: "Sysmex XN-550 (Line 1)", estimatedSecs: 60, status: "QUEUED" },
            { id: "tb-103", barcode: "LAB-HEM-103", patientName: "Gaurav Sen", department: "Hematology", tests: ["CBC", "RETIC"], priority: "ROUTINE", assignedAnalyzerId: "demo-1", assignedAnalyzerName: "Sysmex XN-550 (Line 1)", estimatedSecs: 90, status: "QUEUED" },
            { id: "tb-104", barcode: "LAB-HEM-104", patientName: "Sunita Devi", department: "Hematology", tests: ["CBC"], priority: "ROUTINE", assignedAnalyzerId: "demo-1", assignedAnalyzerName: "Sysmex XN-550 (Line 1)", estimatedSecs: 45, status: "QUEUED" },
            { id: "tb-105", barcode: "LAB-HEM-105", patientName: "Rakesh Jha", department: "Hematology", tests: ["CBC", "DIFF"], priority: "ROUTINE", assignedAnalyzerId: "demo-1", assignedAnalyzerName: "Sysmex XN-550 (Line 1)", estimatedSecs: 60, status: "QUEUED" },
          ],
        },
      ],
    },
    {
      id: "demo-1b",
      name: "Sysmex XN-1000 (Line 2)",
      department: "Hematology",
      model: "XN-1000",
      status: "ONLINE",
      throughputPerHour: 100,
      activeTubesCount: 2,
      totalTestsQueued: 5,
      queueEtaMinutes: 4,
      reagentHealth: 95,
      rackSlotsOccupied: 2,
      rackSlotsTotal: 10,
      racks: [
        {
          rackId: "RACK-H2",
          tubes: [
            { id: "tb-106", barcode: "LAB-HEM-106", patientName: "Deepak Chopra", department: "Hematology", tests: ["CBC", "DIFF"], priority: "ROUTINE", assignedAnalyzerId: "demo-1b", assignedAnalyzerName: "Sysmex XN-1000 (Line 2)", estimatedSecs: 40, status: "PROCESSING" },
            { id: "tb-107", barcode: "LAB-HEM-107", patientName: "Meenakshi Iyer", department: "Hematology", tests: ["CBC"], priority: "ROUTINE", assignedAnalyzerId: "demo-1b", assignedAnalyzerName: "Sysmex XN-1000 (Line 2)", estimatedSecs: 35, status: "QUEUED" },
          ],
        },
      ],
    },
    {
      id: "demo-2",
      name: "Roche Cobas c311 (Chem A)",
      department: "Biochemistry",
      model: "Cobas c311",
      status: "BUSY",
      throughputPerHour: 300,
      activeTubesCount: 18,
      totalTestsQueued: 72,
      queueEtaMinutes: 38,
      reagentHealth: 74,
      rackSlotsOccupied: 9,
      rackSlotsTotal: 10,
      racks: [
        {
          rackId: "RACK-C1",
          tubes: [
            { id: "tb-201", barcode: "STAT-BIO-881", patientName: "Kavita Rao", department: "Biochemistry", tests: ["LFT", "KFT", "ELECTROLYTES"], priority: "STAT", assignedAnalyzerId: "demo-2", assignedAnalyzerName: "Roche Cobas c311 (Chem A)", estimatedSecs: 120, status: "PROCESSING" },
            { id: "tb-202", barcode: "LAB-BIO-202", patientName: "Sanjay Nair", department: "Biochemistry", tests: ["LIPID_PROFILE"], priority: "ROUTINE", assignedAnalyzerId: "demo-2", assignedAnalyzerName: "Roche Cobas c311 (Chem A)", estimatedSecs: 90, status: "QUEUED" },
            { id: "tb-203", barcode: "LAB-BIO-203", patientName: "Fatima Khan", department: "Biochemistry", tests: ["KFT", "HbA1c"], priority: "ROUTINE", assignedAnalyzerId: "demo-2", assignedAnalyzerName: "Roche Cobas c311 (Chem A)", estimatedSecs: 110, status: "QUEUED" },
          ],
        },
      ],
    },
    {
      id: "demo-3",
      name: "Mindray BS-240 (Chem B)",
      department: "Biochemistry",
      model: "BS-240",
      status: "ONLINE",
      throughputPerHour: 200,
      activeTubesCount: 3,
      totalTestsQueued: 8,
      queueEtaMinutes: 6,
      reagentHealth: 82,
      rackSlotsOccupied: 3,
      rackSlotsTotal: 10,
      racks: [
        {
          rackId: "RACK-C2",
          tubes: [
            { id: "tb-204", barcode: "LAB-BIO-204", patientName: "Manoj Tiwari", department: "Biochemistry", tests: ["BLOOD_SUGAR_PP"], priority: "ROUTINE", assignedAnalyzerId: "demo-3", assignedAnalyzerName: "Mindray BS-240 (Chem B)", estimatedSecs: 50, status: "PROCESSING" },
          ],
        },
      ],
    },
    {
      id: "demo-5",
      name: "Abbott Architect i2000 (Immuno A)",
      department: "Immunology",
      model: "Architect i2000",
      status: "ONLINE",
      throughputPerHour: 180,
      activeTubesCount: 6,
      totalTestsQueued: 14,
      queueEtaMinutes: 16,
      reagentHealth: 91,
      rackSlotsOccupied: 6,
      rackSlotsTotal: 10,
      racks: [
        {
          rackId: "RACK-I1",
          tubes: [
            { id: "tb-301", barcode: "STAT-IMM-771", patientName: "Anil Kapoor", department: "Immunology", tests: ["TROP_I", "CK_MB"], priority: "STAT", assignedAnalyzerId: "demo-5", assignedAnalyzerName: "Abbott Architect i2000", estimatedSecs: 90, status: "PROCESSING" },
            { id: "tb-302", barcode: "LAB-IMM-302", patientName: "Simran Kaur", department: "Immunology", tests: ["TSH", "VIT_D"], priority: "ROUTINE", assignedAnalyzerId: "demo-5", assignedAnalyzerName: "Abbott Architect i2000", estimatedSecs: 120, status: "QUEUED" },
          ],
        },
      ],
    },
  ]);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Execute Dynamic Auto-Balancing Across Analyzers
  const handleAutoBalance = () => {
    setIsBalancing(true);
    setTimeout(() => {
      setFleetLoads((prev) => {
        return prev.map((analyzer) => {
          // Re-balance queues towards target optimal numbers
          if (analyzer.department === "Hematology") {
            const balancedCount = 5;
            return {
              ...analyzer,
              activeTubesCount: balancedCount,
              totalTestsQueued: balancedCount * 2,
              queueEtaMinutes: Math.round((balancedCount * 2 * 60) / analyzer.throughputPerHour),
              rackSlotsOccupied: balancedCount,
            };
          }
          if (analyzer.department === "Biochemistry") {
            const balancedCount = 7;
            return {
              ...analyzer,
              activeTubesCount: balancedCount,
              totalTestsQueued: balancedCount * 3,
              queueEtaMinutes: Math.round((balancedCount * 3 * 60) / analyzer.throughputPerHour),
              rackSlotsOccupied: balancedCount,
            };
          }
          return analyzer;
        });
      });
      setIsBalancing(false);
      showNotification("Fleet Auto-Balanced! Workloads equalized across line carousels with 42% TAT reduction.");
    }, 1200);
  };

  const filteredFleet = useMemo(() => {
    return fleetLoads.filter((a) => {
      if (selectedDept !== "ALL" && a.department !== selectedDept) return false;
      return true;
    });
  }, [fleetLoads, selectedDept]);

  const totalTubes = useMemo(() => {
    return fleetLoads.reduce((acc, a) => acc + a.activeTubesCount, 0);
  }, [fleetLoads]);

  const maxBacklogMinutes = useMemo(() => {
    return Math.max(...fleetLoads.map((a) => a.queueEtaMinutes));
  }, [fleetLoads]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-[#07192f] to-slate-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1 text-[11px] font-bold text-cyan-300">
                <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-400" />
                Multi-Instrument Smart Load Routing
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                AI Throughput Optimizer
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Fleet Workload Balancer & Specimen Carousel Dispatcher
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Dynamically route incoming sample batches to the least-congested analyzer with valid calibration and sufficient on-board reagent cartridges. Eliminate machine bottlenecks and optimize core lab sample turnaround time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAutoBalance}
              disabled={isBalancing}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-cyan-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isBalancing ? "animate-spin" : ""}`} />
              {isBalancing ? "Balancing Fleet Queues..." : "Auto-Balance Fleet Workload"}
            </button>
          </div>
        </div>

        {/* Quick Fleet Capacity Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <TestTube className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tubes in Carousel</p>
              <p className="text-sm font-black text-white">{totalTubes} Specimen Tubes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peak Queue Delay</p>
              <p className={`text-sm font-black ${maxBacklogMinutes > 30 ? "text-amber-300" : "text-emerald-300"}`}>
                {maxBacklogMinutes} Mins ETA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TAT Optimization</p>
              <p className="text-sm font-black text-blue-300">-42% vs Manual Sort</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-300">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reagent Protection</p>
              <p className="text-sm font-black text-teal-300">0 Depletion Stalls</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Strategy Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Department:</span>
          {["ALL", "Hematology", "Biochemistry", "Immunology"].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedDept === dept
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Routing Policy:</span>
          <select
            value={balanceStrategy}
            onChange={(e) => setBalanceStrategy(e.target.value as any)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="MIN_TAT">Fastest TAT (Minimum Backlog)</option>
            <option value="EVEN_RACK_DISTRIBUTION">Equal Carousel Slot Loading</option>
            <option value="REAGENT_PRESERVING">Reagent Lot Protection</option>
          </select>
        </div>
      </div>

      {/* Fleet Analyzer Load Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFleet.map((analyzer) => {
          const loadPercent = Math.min(100, Math.round((analyzer.rackSlotsOccupied / analyzer.rackSlotsTotal) * 100));
          const isOverloaded = loadPercent >= 80;
          const isOptimal = loadPercent > 0 && loadPercent < 70;

          return (
            <div
              key={analyzer.id}
              className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-xl transition-all duration-300 hover:border-cyan-500/40"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-300">
                      {analyzer.department}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-white leading-snug">{analyzer.name}</h3>
                    <span className="font-mono text-[10px] text-slate-400">{analyzer.model}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      analyzer.status === "ONLINE"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : analyzer.status === "BUSY"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        analyzer.status === "ONLINE"
                          ? "bg-emerald-400 animate-pulse"
                          : analyzer.status === "BUSY"
                          ? "bg-amber-400 animate-ping"
                          : "bg-slate-400"
                      }`}
                    />
                    {analyzer.status}
                  </span>
                </div>

                {/* Carousel Rack Status Meter */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Carousel Bay Utilization:</span>
                    <strong className={isOverloaded ? "text-amber-400" : "text-cyan-300"}>
                      {analyzer.rackSlotsOccupied} / {analyzer.rackSlotsTotal} Slots ({loadPercent}%)
                    </strong>
                  </div>

                  {/* 10-Slot Visual Rack Indicators */}
                  <div className="grid grid-cols-10 gap-1.5 py-1">
                    {Array.from({ length: analyzer.rackSlotsTotal }).map((_, idx) => {
                      const isOccupied = idx < analyzer.rackSlotsOccupied;
                      const isStat = idx === 0 && isOccupied;
                      return (
                        <div
                          key={idx}
                          title={isOccupied ? `Slot #${idx + 1}: Tube Loaded` : `Slot #${idx + 1}: Empty`}
                          className={`h-7 rounded-lg border transition-all duration-300 flex items-center justify-center text-[9px] font-black ${
                            isOccupied
                              ? isStat
                                ? "bg-rose-500/30 border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse"
                                : "bg-cyan-500/25 border-cyan-400 text-cyan-200"
                              : "bg-slate-900 border-slate-800 text-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Metric Strip */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Queue ETA</span>
                    <span className={`font-bold font-mono ${analyzer.queueEtaMinutes > 25 ? "text-amber-400" : "text-emerald-400"}`}>
                      {analyzer.queueEtaMinutes} min
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tests Queued</span>
                    <span className="font-bold font-mono text-white">{analyzer.totalTestsQueued}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Throughput</span>
                    <span className="font-bold font-mono text-cyan-300">{analyzer.throughputPerHour}/hr</span>
                  </div>
                </div>

                {/* Tube Details in Rack */}
                {analyzer.racks[0]?.tubes.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Bay Samples</span>
                    {analyzer.racks[0].tubes.slice(0, 3).map((tube) => (
                      <div
                        key={tube.id}
                        className="flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          {tube.priority === "STAT" && (
                            <span className="rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1 text-[9px] font-black">
                              STAT
                            </span>
                          )}
                          <span className="font-mono text-white">{tube.barcode}</span>
                          <span className="text-slate-400 truncate max-w-[100px]">{tube.patientName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{tube.tests.join(", ")}</span>
                      </div>
                    ))}
                    {analyzer.racks[0].tubes.length > 3 && (
                      <span className="text-[10px] text-cyan-400 block text-right font-medium">
                        + {analyzer.racks[0].tubes.length - 3} more tubes in queue
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span className="text-[10px] text-slate-400">
                  Reagent Pack: <strong className="text-teal-300">{analyzer.reagentHealth}%</strong>
                </span>

                <button
                  onClick={() => {
                    showNotification(`Specimen rerouting initiated for ${analyzer.name}`);
                  }}
                  className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all"
                >
                  Manage Racks
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
