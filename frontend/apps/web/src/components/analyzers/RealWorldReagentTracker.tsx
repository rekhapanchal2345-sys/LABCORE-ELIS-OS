"use client";

import React, { useState } from "react";
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Check,
  Zap,
  PackageCheck,
  HelpCircle,
  FlaskConical,
  Barcode,
  Clock,
  ShoppingCart,
  X,
  Sparkles,
  QrCode,
  ShieldCheck,
  RotateCw
} from "lucide-react";
import { Analyzer } from "@/types";

export interface ReagentPack {
  id: string;
  analyzerId: string;
  analyzerName: string;
  reagentName: string;
  shortCode: string;
  lotNumber: string;
  expiryDate: string;
  remainingPercentage: number;
  testsRemaining: number;
  initialTests: number;
  status: "OPTIMAL" | "LOW_VOLUME" | "CRITICAL_EMPTY" | "EXPIRED";
  unit: string;
  carouselSlot: number;
  openVialStabilityHoursLeft: number;
  calibrated: boolean;
  calibrationDueDays: number;
}

interface RealWorldReagentTrackerProps {
  analyzers: Analyzer[];
}

export default function RealWorldReagentTracker({ analyzers }: RealWorldReagentTrackerProps) {
  const [reagents, setReagents] = useState<ReagentPack[]>([
    {
      id: "rg-1",
      analyzerId: analyzers[0]?.id || "an-1",
      analyzerName: analyzers[0]?.name || "Sysmex XN-550 (Hematology)",
      reagentName: "Cellpack DCL (Diluent)",
      shortCode: "DCL",
      lotNumber: "LOT-CP-9082",
      expiryDate: "2027-02-15",
      remainingPercentage: 74,
      testsRemaining: 680,
      initialTests: 900,
      status: "OPTIMAL",
      unit: "Tests",
      carouselSlot: 1,
      openVialStabilityHoursLeft: 340,
      calibrated: true,
      calibrationDueDays: 18,
    },
    {
      id: "rg-2",
      analyzerId: analyzers[0]?.id || "an-1",
      analyzerName: analyzers[0]?.name || "Sysmex XN-550 (Hematology)",
      reagentName: "Fluorocell WDF (Lyse Reagent)",
      shortCode: "WDF",
      lotNumber: "LOT-FC-3310",
      expiryDate: "2026-11-20",
      remainingPercentage: 12,
      testsRemaining: 38,
      initialTests: 350,
      status: "LOW_VOLUME",
      unit: "Tests",
      carouselSlot: 2,
      openVialStabilityHoursLeft: 42,
      calibrated: true,
      calibrationDueDays: 5,
    },
    {
      id: "rg-3",
      analyzerId: analyzers[1]?.id || "an-2",
      analyzerName: analyzers[1]?.name || "Roche Cobas c311 (Biochemistry)",
      reagentName: "ALT/SGPT Kinetic UV",
      shortCode: "ALT",
      lotNumber: "LOT-ALT-8819",
      expiryDate: "2026-12-05",
      remainingPercentage: 88,
      testsRemaining: 395,
      initialTests: 450,
      status: "OPTIMAL",
      unit: "Tests",
      carouselSlot: 3,
      openVialStabilityHoursLeft: 520,
      calibrated: true,
      calibrationDueDays: 24,
    },
    {
      id: "rg-4",
      analyzerId: analyzers[1]?.id || "an-2",
      analyzerName: analyzers[1]?.name || "Roche Cobas c311 (Biochemistry)",
      reagentName: "Creatinine Jaffe Rate-Blanked",
      shortCode: "CREA",
      lotNumber: "LOT-CR-1102",
      expiryDate: "2026-10-30",
      remainingPercentage: 8,
      testsRemaining: 22,
      initialTests: 300,
      status: "CRITICAL_EMPTY",
      unit: "Tests",
      carouselSlot: 4,
      openVialStabilityHoursLeft: 14,
      calibrated: false,
      calibrationDueDays: 0,
    },
    {
      id: "rg-5",
      analyzerId: analyzers[2]?.id || "an-3",
      analyzerName: analyzers[2]?.name || "Roche Cobas e411 (Immunoassay)",
      reagentName: "Troponin I High Sensitivity",
      shortCode: "TROP-I",
      lotNumber: "LOT-TROP-7711",
      expiryDate: "2027-01-10",
      remainingPercentage: 62,
      testsRemaining: 186,
      initialTests: 300,
      status: "OPTIMAL",
      unit: "Tests",
      carouselSlot: 5,
      openVialStabilityHoursLeft: 280,
      calibrated: true,
      calibrationDueDays: 14,
    },
    {
      id: "rg-6",
      analyzerId: analyzers[2]?.id || "an-3",
      analyzerName: analyzers[2]?.name || "Roche Cobas e411 (Immunoassay)",
      reagentName: "Procell M Wash Solution (10L)",
      shortCode: "PROCELL",
      lotNumber: "LOT-PRC-4001",
      expiryDate: "2026-12-31",
      remainingPercentage: 92,
      testsRemaining: 1400,
      initialTests: 1500,
      status: "OPTIMAL",
      unit: "Cycles",
      carouselSlot: 6,
      openVialStabilityHoursLeft: 700,
      calibrated: true,
      calibrationDueDays: 45,
    },
  ]);

  const [filter, setFilter] = useState<string>("ALL");
  const [selectedAnalyzerId, setSelectedAnalyzerId] = useState<string>("ALL");
  const [selectedSlot, setSelectedSlot] = useState<ReagentPack | null>(reagents[0]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [orderToast, setOrderToast] = useState<string | null>(null);

  // New Reagent Form State
  const [newReagentName, setNewReagentName] = useState("");
  const [newShortCode, setNewShortCode] = useState("");
  const [newLotNumber, setNewLotNumber] = useState("");
  const [newTests, setNewTests] = useState(500);
  const [newExpiry, setNewExpiry] = useState("2027-04-30");
  const [targetAnalyzer, setTargetAnalyzer] = useState(analyzers[0]?.id || "an-1");

  const handleReplenish = (reagentId: string) => {
    setReagents((prev) =>
      prev.map((r) => {
        if (r.id !== reagentId) return r;
        return {
          ...r,
          remainingPercentage: 100,
          testsRemaining: r.initialTests,
          status: "OPTIMAL",
          lotNumber: `LOT-FRESH-${Math.floor(1000 + Math.random() * 9000)}`,
          openVialStabilityHoursLeft: 600,
          calibrated: true,
          calibrationDueDays: 30,
        };
      })
    );
  };

  const handleSimulateScan = () => {
    const randomLot = `LOT-${Math.floor(10000 + Math.random() * 90000)}`;
    setNewLotNumber(randomLot);
    setNewReagentName("HbA1c Direct Immunoturbidimetric");
    setNewShortCode("HBA1C");
    setNewTests(400);
    setNewExpiry("2027-06-30");
  };

  const handleRegisterReagent = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedAnalyzer = analyzers.find((a) => a.id === targetAnalyzer);
    const newPack: ReagentPack = {
      id: `rg-${Date.now()}`,
      analyzerId: targetAnalyzer,
      analyzerName: matchedAnalyzer?.name || "Primary Analyzer",
      reagentName: newReagentName || "New Reagent Pack",
      shortCode: newShortCode.toUpperCase() || "REAG",
      lotNumber: newLotNumber || `LOT-${Date.now().toString().slice(-4)}`,
      expiryDate: newExpiry,
      remainingPercentage: 100,
      testsRemaining: newTests,
      initialTests: newTests,
      status: "OPTIMAL",
      unit: "Tests",
      carouselSlot: reagents.length + 1,
      openVialStabilityHoursLeft: 720,
      calibrated: true,
      calibrationDueDays: 30,
    };

    setReagents((prev) => [newPack, ...prev]);
    setSelectedSlot(newPack);
    setShowRegisterModal(false);
    setNewReagentName("");
    setNewLotNumber("");
  };

  const handleOrderRestock = (pack: ReagentPack) => {
    setOrderToast(`Emergency Restock PO #PO-${Math.floor(10000 + Math.random() * 90000)} submitted for ${pack.reagentName}`);
    setTimeout(() => setOrderToast(null), 4000);
  };

  const filteredReagents = reagents.filter((r) => {
    if (selectedAnalyzerId !== "ALL" && r.analyzerId !== selectedAnalyzerId) return false;
    if (filter === "LOW" && !["LOW_VOLUME", "CRITICAL_EMPTY"].includes(r.status)) return false;
    return true;
  });

  const lowCount = reagents.filter((r) => ["LOW_VOLUME", "CRITICAL_EMPTY"].includes(r.status)).length;

  return (
    <div className="space-y-6">
      {/* Restock Notification Toast */}
      {orderToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/50 bg-slate-900/95 p-4 text-xs font-bold text-emerald-300 shadow-2xl backdrop-blur-md animate-bounce">
          <ShoppingCart className="h-5 w-5 text-emerald-400" />
          {orderToast}
        </div>
      )}

      {/* Header Bar */}
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                <Droplets className="h-3.5 w-3.5 text-blue-400" />
                Real-Time Fluidics & Consumables Ledger
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Auto-Telemetry Synchronized
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              On-Board Reagent Carousel & Bay Cartridge Management
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl">
              Track real-time aspiration counts, tests-remaining forecasts, on-board stability hours, and automated RFID/barcode lot onboarding across all laboratory analyzers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4" />
              Register New Reagent Lot
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Carousel Rotor Bay Visualizer */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <RotateCw className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Physical Carousel Bay Rotor Slots
            </h3>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
              Interactive Hardware Map
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Click any cartridge bay slot below to view full fluidics telemetry and stability lifespan.
          </p>
        </div>

        {/* Carousel Slot Pills Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {reagents.map((pack) => {
            const isSelected = selectedSlot?.id === pack.id;
            const isCrit = pack.status === "CRITICAL_EMPTY";
            const isLow = pack.status === "LOW_VOLUME";

            return (
              <div
                key={pack.id}
                onClick={() => setSelectedSlot(pack)}
                className={`relative cursor-pointer rounded-2xl border p-3 transition-all text-center group ${
                  isSelected
                    ? "border-cyan-400 bg-slate-800/95 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/50 scale-105"
                    : isCrit
                    ? "border-rose-500/50 bg-rose-950/20 hover:border-rose-400"
                    : isLow
                    ? "border-amber-500/50 bg-amber-950/20 hover:border-amber-400"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                  <span className="text-slate-400">Bay #{pack.carouselSlot}</span>
                  <span
                    className={`font-bold ${
                      isCrit ? "text-rose-400" : isLow ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {pack.remainingPercentage}%
                  </span>
                </div>

                {/* Circular Gauge Ring Simulation */}
                <div className="my-2 flex justify-center">
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                      isCrit
                        ? "border-rose-500 bg-rose-500/10 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse"
                        : isLow
                        ? "border-amber-500 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                        : "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    <span className="text-xs font-black tracking-tighter">{pack.shortCode}</span>
                  </div>
                </div>

                <div className="truncate text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {pack.reagentName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {pack.testsRemaining} {pack.unit} Left
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Slot Detailed HUD */}
        {selectedSlot && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/40">
                    #{selectedSlot.carouselSlot}
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {selectedSlot.reagentName} ({selectedSlot.shortCode})
                  </h4>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      selectedSlot.status === "CRITICAL_EMPTY"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : selectedSlot.status === "LOW_VOLUME"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {selectedSlot.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Instrument: <strong className="text-slate-200">{selectedSlot.analyzerName}</strong> · Lot:{" "}
                  <strong className="text-sky-300 font-mono">{selectedSlot.lotNumber}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOrderRestock(selectedSlot)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/25 transition-all"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Order Refill Pack
                </button>
                <button
                  type="button"
                  onClick={() => handleReplenish(selectedSlot.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Load Fresh Cartridge
                </button>
              </div>
            </div>

            {/* Micro Metrics Grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Volume Remaining</span>
                <span className="text-base font-mono font-black text-white mt-1 block">
                  {selectedSlot.remainingPercentage}%
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedSlot.testsRemaining} / {selectedSlot.initialTests} {selectedSlot.unit}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Open-Vial Stability</span>
                <span className="text-base font-mono font-black text-sky-400 mt-1 block">
                  {selectedSlot.openVialStabilityHoursLeft} Hours
                </span>
                <span className="text-[10px] text-slate-400">Remaining on-board</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lot Expiration</span>
                <span className="text-base font-mono font-black text-slate-200 mt-1 block">
                  {selectedSlot.expiryDate}
                </span>
                <span className="text-[10px] text-slate-400">Manufacturer expiration</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Calibration Status</span>
                <span className="text-base font-mono font-black text-emerald-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  {selectedSlot.calibrated ? "Verified" : "Due"}
                </span>
                <span className="text-[10px] text-slate-400">
                  Valid for {selectedSlot.calibrationDueDays} days
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              filter === "ALL"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All Packs ({reagents.length})
          </button>
          <button
            onClick={() => setFilter("LOW")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              filter === "LOW"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Low & Critical Depleted ({lowCount})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Instrument Filter:</span>
          <select
            value={selectedAnalyzerId}
            onChange={(e) => setSelectedAnalyzerId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
          >
            <option value="ALL">All Laboratory Fleet</option>
            {analyzers.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reagents Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReagents.map((reagent) => {
          const isCritical = reagent.status === "CRITICAL_EMPTY";
          const isLow = reagent.status === "LOW_VOLUME";

          return (
            <div
              key={reagent.id}
              className={`rounded-3xl border p-5 shadow-xl transition-all ${
                isCritical
                  ? "border-rose-500/40 bg-slate-900/90"
                  : isLow
                  ? "border-amber-500/40 bg-slate-900/90"
                  : "border-slate-800 bg-slate-900/70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl font-black text-xs font-mono border ${
                      isCritical
                        ? "border-rose-500/50 bg-rose-500/20 text-rose-300"
                        : isLow
                        ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                        : "border-cyan-500/50 bg-cyan-500/20 text-cyan-300"
                    }`}
                  >
                    #{reagent.carouselSlot}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{reagent.reagentName}</h4>
                    <p className="text-[11px] text-slate-400">{reagent.analyzerName}</p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                    isCritical
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : isLow
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {isCritical ? "CRITICAL EMPTY" : isLow ? "LOW PACK" : "READY"}
                </span>
              </div>

              {/* Progress Gauge */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Aspiration Capacity</span>
                  <span
                    className={`font-mono ${
                      isCritical ? "text-rose-400" : isLow ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {reagent.remainingPercentage}% ({reagent.testsRemaining} {reagent.unit})
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical
                        ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                        : isLow
                        ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500"
                    }`}
                    style={{ width: `${reagent.remainingPercentage}%` }}
                  />
                </div>
              </div>

              {/* Metrics Detail */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-3">
                <div className="rounded-xl bg-slate-950/60 p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lot Number</span>
                  <span className="font-mono font-bold text-slate-200 mt-0.5 block truncate">
                    {reagent.lotNumber}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Stability Hours</span>
                  <span className="font-mono font-bold text-sky-400 mt-0.5 block">
                    {reagent.openVialStabilityHoursLeft}h on-board
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span className="text-[11px] text-slate-400">
                  Exp: <span className="font-mono text-slate-300">{reagent.expiryDate}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleReplenish(reagent.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition-all ${
                    isCritical || isLow
                      ? "bg-sky-600 text-white hover:bg-sky-500 shadow-sky-600/30"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  <RefreshCw className="h-3 w-3" />
                  Load New Cassette
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register New Reagent Lot Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Register New Reagent Lot</h3>
                  <p className="text-xs text-slate-400">Onboard Cartridge to Physical Carousel Bay</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="rounded-xl border border-slate-800 p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleSimulateScan}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all mb-4"
              >
                <Sparkles className="h-4 w-4" />
                Simulate 2D DataMatrix RFID Scanner (Auto-Fill)
              </button>

              <form onSubmit={handleRegisterReagent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target Analyzer</label>
                  <select
                    value={targetAnalyzer}
                    onChange={(e) => setTargetAnalyzer(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    {analyzers.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Reagent Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ALT / SGPT Kinetic"
                      value={newReagentName}
                      onChange={(e) => setNewReagentName(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Short Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ALT"
                      value={newShortCode}
                      onChange={(e) => setNewShortCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Lot Number</label>
                    <input
                      type="text"
                      required
                      placeholder="LOT-XXXX"
                      value={newLotNumber}
                      onChange={(e) => setNewLotNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Initial Tests</label>
                    <input
                      type="number"
                      required
                      value={newTests}
                      onChange={(e) => setNewTests(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Expiration</label>
                    <input
                      type="date"
                      required
                      value={newExpiry}
                      onChange={(e) => setNewExpiry(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:scale-105 transition-all"
                  >
                    <PackageCheck className="h-4 w-4" />
                    Onboard Cartridge to Bay
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

