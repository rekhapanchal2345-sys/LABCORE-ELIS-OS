"use client";

import React, { useState } from "react";
import {
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Zap,
  RotateCcw,
  Sparkles,
  Sliders,
  TrendingUp,
  Droplets,
  Server,
  Layers,
  Thermometer,
  Gauge,
  Flame,
  Wrench,
  Search,
  Filter,
  Check,
  X,
  Radio,
  FileText
} from "lucide-react";
import { Analyzer } from "@/types";

export interface HardwareTelemetryHealth {
  analyzerId: string;
  analyzerName: string;
  department: string;
  overallHealthScore: number; // 0 - 100
  failureRisk: "LOW" | "MODERATE" | "HIGH_IMMINENT";
  lampHealth: {
    hoursUsed: number;
    maxRatedHours: number;
    voltageDrift: number; // e.g. +0.4V
    intensityDecayPercent: number; // e.g. 18%
    status: "OPTIMAL" | "DEGRADED" | "CRITICAL_REPLACE";
  };
  fluidicsHealth: {
    pressurePulseStatus: "SMOOTH" | "CLOT_SUSPECTED" | "BUBBLE_CAVITATION";
    syringeBacklashMm: number;
    vacuumTankStabilityBar: number;
    pipettingPrecisionCv: number; // e.g. 0.8%
    lastDecontaminationDate: string;
  };
  temperatureSensors: {
    reagentDiskTemp: number; // target 4-8°C
    reactionDiskTemp: number; // target 37.0°C
    opticalChamberTemp: number;
    status: "STABLE" | "THERMAL_DRIFT";
  };
  forecastedBreakdown: {
    predictedSubsystem: string;
    estimatedDaysRemaining: number;
    recommendedAction: string;
    partNumber: string;
  };
}

interface PredictiveAnomalyEngineProps {
  analyzers?: Analyzer[];
}

export default function PredictiveAnomalyEngine({ analyzers = [] }: PredictiveAnomalyEngineProps) {
  const [selectedAnalyzerId, setSelectedAnalyzerId] = useState<string>("demo-1");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");
  const [toast, setToast] = useState<string | null>(null);

  // Simulated Hardware Predictive Telemetry
  const [telemetryFleet, setTelemetryFleet] = useState<HardwareTelemetryHealth[]>([
    {
      analyzerId: "demo-1",
      analyzerName: "Sysmex XN-550 (Hematology 1)",
      department: "Hematology",
      overallHealthScore: 78,
      failureRisk: "MODERATE",
      lampHealth: {
        hoursUsed: 1720,
        maxRatedHours: 2000,
        voltageDrift: 0.35,
        intensityDecayPercent: 22,
        status: "DEGRADED",
      },
      fluidicsHealth: {
        pressurePulseStatus: "SMOOTH",
        syringeBacklashMm: 0.04,
        vacuumTankStabilityBar: -0.81,
        pipettingPrecisionCv: 0.9,
        lastDecontaminationDate: "18-Sep-2026",
      },
      temperatureSensors: {
        reagentDiskTemp: 6.2,
        reactionDiskTemp: 37.1,
        opticalChamberTemp: 24.5,
        status: "STABLE",
      },
      forecastedBreakdown: {
        predictedSubsystem: "Semiconductor Laser Diode / Optics Assembly",
        estimatedDaysRemaining: 12,
        recommendedAction: "Replace optical lamp assembly before 2,000 hour threshold to prevent CBC diff drift.",
        partNumber: "OPT-LASER-XN550-99",
      },
    },
    {
      analyzerId: "demo-2",
      analyzerName: "Roche Cobas c311 (Biochem)",
      department: "Biochemistry",
      overallHealthScore: 94,
      failureRisk: "LOW",
      lampHealth: {
        hoursUsed: 420,
        maxRatedHours: 2500,
        voltageDrift: 0.05,
        intensityDecayPercent: 4,
        status: "OPTIMAL",
      },
      fluidicsHealth: {
        pressurePulseStatus: "SMOOTH",
        syringeBacklashMm: 0.01,
        vacuumTankStabilityBar: -0.79,
        pipettingPrecisionCv: 0.4,
        lastDecontaminationDate: "Yesterday",
      },
      temperatureSensors: {
        reagentDiskTemp: 4.8,
        reactionDiskTemp: 37.0,
        opticalChamberTemp: 22.8,
        status: "STABLE",
      },
      forecastedBreakdown: {
        predictedSubsystem: "Peristaltic Waste Tubing",
        estimatedDaysRemaining: 48,
        recommendedAction: "Routine quarterly tubing lubrication & roller alignment.",
        partNumber: "TUB-SIL-ROCHE-44",
      },
    },
    {
      analyzerId: "demo-3",
      analyzerName: "Mindray BS-240 (Biochem 2)",
      department: "Biochemistry",
      overallHealthScore: 59,
      failureRisk: "HIGH_IMMINENT",
      lampHealth: {
        hoursUsed: 2380,
        maxRatedHours: 2000,
        voltageDrift: 0.82,
        intensityDecayPercent: 38,
        status: "CRITICAL_REPLACE",
      },
      fluidicsHealth: {
        pressurePulseStatus: "CLOT_SUSPECTED",
        syringeBacklashMm: 0.12,
        vacuumTankStabilityBar: -0.68,
        pipettingPrecisionCv: 2.1,
        lastDecontaminationDate: "05-Sep-2026",
      },
      temperatureSensors: {
        reagentDiskTemp: 7.9,
        reactionDiskTemp: 37.4,
        opticalChamberTemp: 26.2,
        status: "THERMAL_DRIFT",
      },
      forecastedBreakdown: {
        predictedSubsystem: "Aspiration Probe & Syringe Plunger Seal",
        estimatedDaysRemaining: 3,
        recommendedAction: "IMMEDIATE ATTENTION: High fluidic pressure spike detected. Possible partial fibrin clot inside probe needle.",
        partNumber: "NDL-ASP-BS240-CL",
      },
    },
    {
      analyzerId: "demo-5",
      analyzerName: "Abbott Architect i2000 (Immuno)",
      department: "Immunology",
      overallHealthScore: 91,
      failureRisk: "LOW",
      lampHealth: {
        hoursUsed: 890,
        maxRatedHours: 3000,
        voltageDrift: 0.12,
        intensityDecayPercent: 7,
        status: "OPTIMAL",
      },
      fluidicsHealth: {
        pressurePulseStatus: "SMOOTH",
        syringeBacklashMm: 0.02,
        vacuumTankStabilityBar: -0.80,
        pipettingPrecisionCv: 0.5,
        lastDecontaminationDate: "20-Sep-2026",
      },
      temperatureSensors: {
        reagentDiskTemp: 4.2,
        reactionDiskTemp: 37.0,
        opticalChamberTemp: 23.1,
        status: "STABLE",
      },
      forecastedBreakdown: {
        predictedSubsystem: "Wash Station Vacuum Nozzle",
        estimatedDaysRemaining: 65,
        recommendedAction: "Scheduled semi-annual PM check by field service engineer.",
        partNumber: "NOZ-WSH-ABB-88",
      },
    },
  ]);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const selectedTelemetry = telemetryFleet.find((t) => t.analyzerId === selectedAnalyzerId) || telemetryFleet[0];

  const handleOrderReplacementPart = (partNumber: string, subsystem: string) => {
    showNotification(`Service Ticket & Replacement Order created for Part #${partNumber} (${subsystem}). Dispatching to Biomedical Engineering.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-200" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-[#1f1307] to-slate-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                AI Predictive Maintenance & MTBF Telemetry
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Acoustic Fluidics Sensor Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AI Hardware Anomaly & Breakdown Forecasting
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Never let an unexpected machine breakdown halt your core laboratory. Predict optical lamp burnout, detect micro-clots during sample aspiration before pipetting volume is corrupted, and prevent incubator thermal drift.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                showNotification("Aspiration lines pressure pulse recalibration completed.");
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-amber-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Zap className="h-4 w-4" />
              Recalibrate Aspiration Sensors
            </button>
          </div>
        </div>

        {/* Quick Fleet Health Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monitored Fleet</p>
              <p className="text-sm font-black text-white">{telemetryFleet.length} Instruments</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Imminent Risks</p>
              <p className="text-sm font-black text-rose-300">1 Machine (Mindray BS-240)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Optics Integrity</p>
              <p className="text-sm font-black text-emerald-300">3/4 Optimal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <Thermometer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reaction Disk 37°C</p>
              <p className="text-sm font-black text-cyan-300">±0.1°C Regulated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analyzer Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {telemetryFleet.map((analyzer) => {
          const isSelected = selectedAnalyzerId === analyzer.analyzerId;
          const isHigh = analyzer.failureRisk === "HIGH_IMMINENT";
          const isMod = analyzer.failureRisk === "MODERATE";

          return (
            <div
              key={analyzer.analyzerId}
              onClick={() => setSelectedAnalyzerId(analyzer.analyzerId)}
              className={`cursor-pointer rounded-3xl border p-4 transition-all duration-300 ${
                isSelected
                  ? "border-amber-400 bg-amber-950/40 shadow-xl shadow-amber-500/10 scale-102"
                  : "border-slate-800 bg-slate-950 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{analyzer.department}</span>
                  <h4 className="font-bold text-white text-xs mt-0.5 truncate max-w-[160px]">{analyzer.analyzerName}</h4>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                    isHigh
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                      : isMod
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {analyzer.failureRisk.replace("_", " ")}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Health Score:</span>
                <span
                  className={`text-sm font-black font-mono ${
                    analyzer.overallHealthScore >= 85
                      ? "text-emerald-400"
                      : analyzer.overallHealthScore >= 70
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {analyzer.overallHealthScore}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Diagnostic Bench for Selected Instrument */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Subsystem Telemetry Cards */}
        <div className="lg:col-span-7 space-y-4">
          {/* Subsystem 1: Photometer & Lamp Telemetry */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Photometer & Optics Degradation Monitor</h3>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  selectedTelemetry.lampHealth.status === "OPTIMAL"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300 animate-pulse"
                }`}
              >
                {selectedTelemetry.lampHealth.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                <span className="text-[10px] text-slate-400 block font-sans">Lamp Burn Time</span>
                <strong className="text-white text-sm">
                  {selectedTelemetry.lampHealth.hoursUsed} / {selectedTelemetry.lampHealth.maxRatedHours} hrs
                </strong>
                <span className="text-[10px] text-amber-400 block mt-1">
                  {Math.round((selectedTelemetry.lampHealth.hoursUsed / selectedTelemetry.lampHealth.maxRatedHours) * 100)}% consumed
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                <span className="text-[10px] text-slate-400 block font-sans">Voltage Drift</span>
                <strong className="text-cyan-300 text-sm">+{selectedTelemetry.lampHealth.voltageDrift} V</strong>
                <span className="text-[10px] text-slate-500 block mt-1">Nominal: ±0.1V</span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                <span className="text-[10px] text-slate-400 block font-sans">Optical Intensity Decay</span>
                <strong className="text-rose-400 text-sm">{selectedTelemetry.lampHealth.intensityDecayPercent}%</strong>
                <span className="text-[10px] text-slate-500 block mt-1">Max limit: 30%</span>
              </div>
            </div>
          </div>

          {/* Subsystem 2: Fluidics & Pressure Pulse Sensor */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Fluidics & Aspiration Pulse Waveform</h3>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  selectedTelemetry.fluidicsHealth.pressurePulseStatus === "SMOOTH"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                }`}
              >
                {selectedTelemetry.fluidicsHealth.pressurePulseStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                <span className="text-[10px] text-slate-400 block font-sans">Vacuum Tank Pressure</span>
                <strong className="text-white text-sm">{selectedTelemetry.fluidicsHealth.vacuumTankStabilityBar} Bar</strong>
                <span className="text-[10px] text-slate-500 block mt-1">Stable aspiration</span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                <span className="text-[10px] text-slate-400 block font-sans">Pipetting Precision CV%</span>
                <strong className="text-emerald-400 text-sm">{selectedTelemetry.fluidicsHealth.pipettingPrecisionCv}%</strong>
                <span className="text-[10px] text-slate-500 block mt-1">Target: &lt; 1.0%</span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                <span className="text-[10px] text-slate-400 block font-sans">Syringe Backlash</span>
                <strong className="text-cyan-300 text-sm">{selectedTelemetry.fluidicsHealth.syringeBacklashMm} mm</strong>
                <span className="text-[10px] text-slate-500 block mt-1">Plunger seal wear</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Forecasting & Breakdown Alert Card */}
        <div className="lg:col-span-5 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-950 via-[#1b1104] to-slate-950 p-6 text-white space-y-5">
          <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
            <AlertTriangle className="h-6 w-6 text-amber-400 animate-pulse" />
            <div>
              <h3 className="text-base font-bold text-white">AI Breakdown Forecast</h3>
              <p className="text-xs text-amber-300/80">Subsystem failure prediction algorithm</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Vulnerable Subsystem</span>
              <p className="text-sm font-bold text-white mt-0.5">{selectedTelemetry.forecastedBreakdown.predictedSubsystem}</p>
            </div>

            <div className="flex items-center justify-between border-y border-amber-500/20 py-2">
              <span className="text-xs text-slate-300">Estimated Days Remaining:</span>
              <span className="text-base font-black font-mono text-amber-400">
                ~ {selectedTelemetry.forecastedBreakdown.estimatedDaysRemaining} Days
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Preventative Action:</span>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                &quot;{selectedTelemetry.forecastedBreakdown.recommendedAction}&quot;
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Replacement Part Number</span>
              <strong className="text-cyan-300">{selectedTelemetry.forecastedBreakdown.partNumber}</strong>
            </div>
            <button
              onClick={() =>
                handleOrderReplacementPart(
                  selectedTelemetry.forecastedBreakdown.partNumber,
                  selectedTelemetry.forecastedBreakdown.predictedSubsystem
                )
              }
              className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-600/30 hover:scale-105 transition-all"
            >
              Order Part Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
