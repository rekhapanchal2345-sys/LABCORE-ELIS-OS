"use client";

import React, { useState } from "react";
import { 
  Snowflake, Thermometer, Box, Search, CheckCircle2, 
  MapPin, ShieldCheck, AlertCircle, RefreshCw, Layers, 
  FlaskConical, Lock, Unlock, Eye, Sparkles
} from "lucide-react";

interface StorageSample {
  id: string;
  sampleNumber: string;
  barcode: string;
  sampleType: string;
  status: string;
  test: {
    testName: string;
    sampleContainer: string;
  };
  order: {
    patient: {
      firstName: string;
      lastName: string;
      uhid: string;
    };
  };
}

interface SampleStorageRackProps {
  samples: StorageSample[];
  onSelectSample: (sample: StorageSample) => void;
}

interface RackUnit {
  id: string;
  name: string;
  temperature: string;
  tempCategory: "ambient" | "chilled" | "frozen" | "cryo";
  tempC: string;
  room: string;
  capacity: number;
  totalSlots: number;
}

const STORAGE_UNITS: RackUnit[] = [
  { id: "RACK-01", name: "Analyzer Bay Pre-Analytical Rack A", temperature: "18°C - 22°C", tempCategory: "ambient", tempC: "+20.5°C", room: "Central Accession Hall", capacity: 96, totalSlots: 96 },
  { id: "COLD-01", name: "Primary Refrigerated Archive (2-8°C)", temperature: "2°C - 8°C", tempCategory: "chilled", tempC: "+4.2°C", room: "Cold Chain Room 102", capacity: 96, totalSlots: 96 },
  { id: "FREEZER-01", name: "Deep Specimen Bio-Bank (-20°C)", temperature: "-20°C ± 2°C", tempCategory: "frozen", tempC: "-21.8°C", room: "Pathology Storage Vault", capacity: 96, totalSlots: 96 },
  { id: "CRYO-01", name: "Ultra-Low Cryo-Preservation (-80°C)", temperature: "-80°C Cryo", tempCategory: "cryo", tempC: "-81.4°C", room: "Molecular Genetics Wing", capacity: 96, totalSlots: 96 },
];

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function SampleStorageRack({ samples, onSelectSample }: SampleStorageRackProps) {
  const [selectedUnit, setSelectedUnit] = useState<RackUnit>(STORAGE_UNITS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Map samples deterministically into rack positions for demo/real display
  const slotMap = new Map<string, StorageSample>();
  samples.forEach((sample, index) => {
    if (index < 96) {
      const rowIdx = Math.floor(index / 12);
      const colIdx = (index % 12) + 1;
      const slotCoord = `${ROWS[rowIdx]}${colIdx < 10 ? `0${colIdx}` : colIdx}`;
      slotMap.set(slotCoord, sample);
    }
  });

  const occupiedCount = Math.min(samples.length, 96);
  const occupancyRate = Math.round((occupiedCount / 96) * 100);

  const activeSampleInSlot = selectedSlot ? slotMap.get(selectedSlot) : null;

  return (
    <div className="space-y-6">
      {/* Bio-Repository Control Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-md">
              <Snowflake className="h-3.5 w-3.5 animate-spin" /> Cold Chain & Bio-Repository Management
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              Specimen Storage & Freezer Matrix
            </h2>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              Traceable 96-well cryogenic tube slot locator with automated cold-chain temperature telemetry.
            </p>
          </div>

          {/* Unit Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STORAGE_UNITS.map((unit) => {
              const isSelected = selectedUnit.id === unit.id;
              return (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`flex flex-col rounded-2xl border p-3 text-left transition-all duration-300 backdrop-blur-md ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-400/40"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase">{unit.id}</span>
                    <span className={`text-[10px] font-black ${
                      unit.tempCategory === "cryo" ? "text-cyan-300" :
                      unit.tempCategory === "frozen" ? "text-blue-300" :
                      unit.tempCategory === "chilled" ? "text-emerald-300" : "text-amber-300"
                    }`}>
                      {unit.tempC}
                    </span>
                  </div>
                  <p className="mt-1 font-bold text-xs truncate text-slate-200">{unit.name.split("(")[0]}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{unit.room}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid & Detail Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 96-Well Rack Interactive Layout (2 Cols) */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl lg:col-span-2 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Box className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {selectedUnit.name} — 8×12 Matrix Grid
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any slot coordinate to inspect specimen or assign newly accessioned tube
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-3 w-3 rounded-md bg-cyan-500 shadow-[0_0_8px_#06B6D4]" /> Occupied ({occupiedCount})
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-3 w-3 rounded-md border border-slate-700 bg-slate-900" /> Available ({96 - occupiedCount})
              </span>
              <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-bold text-cyan-300">
                {occupancyRate}% Utilization
              </span>
            </div>
          </div>

          {/* 8x12 Matrix Visualizer */}
          <div className="overflow-x-auto p-2">
            <div className="min-w-[650px]">
              {/* Column Numbers Header */}
              <div className="grid grid-cols-[30px_repeat(12,1fr)] gap-2 mb-2 text-center text-[11px] font-mono font-bold text-slate-400">
                <div></div>
                {COLS.map((c) => (
                  <div key={c}>{c < 10 ? `0${c}` : c}</div>
                ))}
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {ROWS.map((row) => (
                  <div key={row} className="grid grid-cols-[30px_repeat(12,1fr)] gap-2 items-center">
                    <span className="font-mono text-xs font-black text-cyan-400 text-center">{row}</span>
                    {COLS.map((col) => {
                      const slotKey = `${row}${col < 10 ? `0${col}` : col}`;
                      const sampleInSlot = slotMap.get(slotKey);
                      const isSelected = selectedSlot === slotKey;

                      return (
                        <button
                          key={slotKey}
                          onClick={() => {
                            setSelectedSlot(slotKey);
                            if (sampleInSlot) onSelectSample(sampleInSlot);
                          }}
                          className={`group relative flex h-11 flex-col items-center justify-center rounded-xl border transition-all duration-300 ${
                            isSelected
                              ? "border-cyan-300 bg-cyan-400/30 ring-2 ring-cyan-400 shadow-lg shadow-cyan-950/60"
                              : sampleInSlot
                              ? "border-cyan-500/50 bg-gradient-to-br from-cyan-950/60 to-indigo-950/60 hover:border-cyan-400 hover:scale-105"
                              : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/40"
                          }`}
                          title={sampleInSlot ? `Slot ${slotKey}: ${sampleInSlot.sampleNumber} (${sampleInSlot.test.testName})` : `Slot ${slotKey}: Available`}
                        >
                          {sampleInSlot ? (
                            <>
                              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
                              <span className="mt-1 font-mono text-[9px] font-bold text-slate-200 group-hover:text-cyan-200 truncate max-w-[36px]">
                                {slotKey}
                              </span>
                            </>
                          ) : (
                            <span className="font-mono text-[9px] font-semibold text-slate-600 group-hover:text-slate-400">
                              {slotKey}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Slot Specimen Telemetry Card */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Rack Slot Telemetry</h3>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 rounded-lg">
                {selectedSlot || "No Slot Selected"}
              </span>
            </div>

            {activeSampleInSlot ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-900 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Accessioned Specimen</span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                      SECURE ARCHIVED
                    </span>
                  </div>
                  <p className="font-mono text-base font-black text-white">{activeSampleInSlot.sampleNumber}</p>
                  <p className="font-mono text-xs text-slate-400">{activeSampleInSlot.barcode}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Patient Demographics</p>
                    <p className="font-bold text-slate-200 mt-0.5">
                      {activeSampleInSlot.order.patient.firstName} {activeSampleInSlot.order.patient.lastName}
                    </p>
                    <p className="text-slate-400 text-[11px]">UHID: {activeSampleInSlot.order.patient.uhid}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Test Required</p>
                    <p className="font-bold text-slate-200 mt-0.5">{activeSampleInSlot.test.testName}</p>
                    <p className="text-slate-400 text-[11px]">Container: {activeSampleInSlot.test.sampleContainer}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cold Chain Chamber</p>
                    <p className="font-semibold text-slate-200 mt-0.5">{selectedUnit.name}</p>
                    <p className="text-cyan-400 font-mono text-[11px] font-bold">Ambient: {selectedUnit.tempC}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectSample(activeSampleInSlot)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
                  >
                    <Eye className="h-4 w-4" /> Full Sample Dossier
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-12 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                <Box className="h-12 w-12 stroke-[1.5] text-slate-700" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Slot {selectedSlot || "—"} is Available</p>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
                    Select any occupied slot on the 8×12 rack to inspect specimen parameters.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-4 mt-6">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> ISO 15189 Cold Protocol
              </span>
              <span>24h Log Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
