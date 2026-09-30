"use client";

import React, { useState } from "react";
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Barcode,
  Terminal,
  Send,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Cpu,
  Layers
} from "lucide-react";
import { Analyzer } from "@/types";

interface VirtualAnalyzerSimulatorProps {
  analyzers: Analyzer[];
}

interface TestResultParam {
  param: string;
  value: number;
  unit: string;
  range: string;
  flag: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
}

export default function VirtualAnalyzerSimulator({ analyzers }: VirtualAnalyzerSimulatorProps) {
  const [selectedAnalyzerId, setSelectedAnalyzerId] = useState(analyzers[0]?.id || "an-1");
  const [barcode, setBarcode] = useState("LAB-TUBE-8810");
  const [patientName, setPatientName] = useState("Pooja Sharma");
  const [profileType, setProfileType] = useState<"CBC" | "BIOCHEM_LFT" | "CARDIAC_TROP">("CBC");

  // Step 0: Idle, 1: Query Sent, 2: Order Matched, 3: Aspirating, 4: Results Emitted, 5: Auto-Validated
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [rawFrame, setRawFrame] = useState<string>("");
  const [results, setResults] = useState<TestResultParam[]>([]);

  const selectedAnalyzer = analyzers.find((a) => a.id === selectedAnalyzerId) || analyzers[0];

  const handleRunFullCycle = () => {
    setIsSimulating(true);
    setCurrentStep(1);
    setResults([]);

    // Step 1: Host Query sent from instrument
    setRawFrame(
      `H|\\^&|||${selectedAnalyzer?.name || "Analyzer"}|||||||P|1394-97\n` +
      `Q|1|^${barcode}||ALL||||||||O`
    );

    setTimeout(() => {
      // Step 2: LIS matches Order
      setCurrentStep(2);
      setRawFrame((prev) =>
        prev +
        `\n\n--- [LIS RESPONSE RECEIVED] ---\n` +
        `P|1||MRN-9021||${patientName}|||F\n` +
        `O|1|${barcode}||^^^${profileType}|R||||||A`
      );

      setTimeout(() => {
        // Step 3: Aspirating sample
        setCurrentStep(3);

        setTimeout(() => {
          // Step 4: Analyzer measures & emits Results
          setCurrentStep(4);
          let sampleResults: TestResultParam[] = [];
          if (profileType === "CBC") {
            sampleResults = [
              { param: "Hemoglobin (HGB)", value: 13.8, unit: "g/dL", range: "12.0 - 15.5", flag: "NORMAL" },
              { param: "White Blood Cells (WBC)", value: 14.2, unit: "10*3/uL", range: "4.0 - 11.0", flag: "HIGH" },
              { param: "Platelets (PLT)", value: 18, unit: "10*3/uL", range: "150 - 450", flag: "CRITICAL" },
              { param: "Red Blood Cells (RBC)", value: 4.65, unit: "10*6/uL", range: "3.8 - 5.2", flag: "NORMAL" },
              { param: "Hematocrit (HCT)", value: 41.2, unit: "%", range: "36.0 - 46.0", flag: "NORMAL" },
            ];
          } else if (profileType === "BIOCHEM_LFT") {
            sampleResults = [
              { param: "Total Bilirubin", value: 1.1, unit: "mg/dL", range: "0.2 - 1.2", flag: "NORMAL" },
              { param: "SGPT / ALT", value: 68, unit: "U/L", range: "7 - 56", flag: "HIGH" },
              { param: "SGOT / AST", value: 52, unit: "U/L", range: "10 - 40", flag: "HIGH" },
              { param: "Serum Alkaline Phosphatase", value: 110, unit: "U/L", range: "44 - 147", flag: "NORMAL" },
            ];
          } else {
            sampleResults = [
              { param: "Troponin-I High Sensitivity", value: 0.185, unit: "ng/mL", range: "< 0.040", flag: "CRITICAL" },
              { param: "CK-MB Mass", value: 8.4, unit: "ng/mL", range: "< 5.0", flag: "HIGH" },
              { param: "Myoglobin", value: 65, unit: "ng/mL", range: "28 - 72", flag: "NORMAL" },
            ];
          }

          setResults(sampleResults);
          const resultAstm = sampleResults
            .map((r, i) => `R|${i + 1}|^^^${r.param}|${r.value}|${r.unit}|${r.range}|${r.flag === "NORMAL" ? "N" : r.flag === "CRITICAL" ? "C" : "H"}||F`)
            .join("\n");

          setRawFrame((prev) => prev + `\n\n--- [ANALYZER EMITTED RESULT OBX] ---\n` + resultAstm + `\nL|1|N`);

          setTimeout(() => {
            // Step 5: Finished
            setCurrentStep(5);
            setIsSimulating(false);
          }, 800);
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setRawFrame("");
    setResults([]);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600">
              Interactive Test Bench
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Virtual Analyzer End-to-End Workflow Simulator
            </h2>
            <p className="text-xs text-slate-600">
              Test bidirectional ASTM query matching, tube aspiration, result parsing, and auto-validation without needing physical instrument cables.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Reset Test Bench
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Test Configuration & Stepper */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Simulation Parameters
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Instrument</label>
              <select
                value={selectedAnalyzerId}
                onChange={(e) => setSelectedAnalyzerId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                {analyzers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.protocol})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tube Barcode</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Test Order Profile</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "CBC", label: "Complete Blood Count" },
                  { id: "BIOCHEM_LFT", label: "Liver Function" },
                  { id: "CARDIAC_TROP", label: "Cardiac Troponin" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProfileType(p.id as any)}
                    className={`rounded-xl border p-2 text-left transition-all ${
                      profileType === p.id
                        ? "border-blue-600 bg-blue-50 text-blue-900 font-bold"
                        : "border-slate-200 bg-white text-slate-600 text-[11px]"
                    }`}
                  >
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">{p.id}</span>
                    <span className="text-[11px] block truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleRunFullCycle}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
            >
              <Play className={`h-4 w-4 ${isSimulating ? "animate-spin" : ""}`} />
              {isSimulating ? "Simulating Test Cycle..." : "Execute 5-Step Simulation"}
            </button>
          </div>

          {/* Workflow Stepper */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Live Interface Cycle
            </h4>

            <div className="space-y-3">
              {[
                { step: 1, title: "1. Instrument Host Query (ASTM Q)", desc: "Scanner reads tube barcode and requests worklist" },
                { step: 2, title: "2. LIS Order Matching (ASTM P/O)", desc: "LIS identifies patient and transmits test parameters" },
                { step: 3, title: "3. Specimen Aspiration & Cycle", desc: "Sample probe aspirates 25uL whole blood / serum" },
                { step: 4, title: "4. Result Transmission (ASTM R)", desc: "Raw numerical values transmitted via TCP/Serial" },
                { step: 5, title: "5. Auto-Validation & Panic Flagging", desc: "Results checked against reference ranges and released" },
              ].map((s) => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <div key={s.step} className="flex items-start gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        isPassed
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-blue-600 text-white animate-pulse"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isPassed ? "✓" : s.step}
                    </span>
                    <div>
                      <p className={`text-xs font-bold ${isPassed ? "text-slate-900" : "text-slate-400"}`}>
                        {s.title}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Terminal & Parsed Results */}
        <div className="lg:col-span-7 space-y-4">
          {/* Raw Protocol Terminal */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="flex items-center gap-2 font-mono text-[11px] text-cyan-400 font-bold">
                <Terminal className="h-4 w-4" />
                ASTM E1394 / HL7 Wire Protocol Stream
              </span>
              <span className="text-[10px] font-mono text-slate-500">Port 5000 · RS-232 COM3</span>
            </div>

            <pre className="h-44 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl">
              {rawFrame || "// Click 'Execute 5-Step Simulation' to watch bidirectional ASTM packets exchange live..."}
            </pre>
          </div>

          {/* Parsed Clinical Result Report */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">LIS Diagnostic Report Output</h4>
                <p className="text-[11px] text-slate-500">
                  {patientName} · {barcode} · {selectedAnalyzer?.name}
                </p>
              </div>
              {results.some((r) => r.flag === "CRITICAL") && (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700 animate-pulse">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                  CRITICAL PANIC VALUE DETECTED
                </span>
              )}
            </div>

            {results.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Run the simulation to view parsed test results and abnormal flags.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 text-left">Test Parameter</th>
                      <th className="py-2 text-left">Value</th>
                      <th className="py-2 text-left">Units</th>
                      <th className="py-2 text-left">Reference Range</th>
                      <th className="py-2 text-right">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((r) => (
                      <tr key={r.param} className="hover:bg-slate-50">
                        <td className="py-2.5 font-bold text-slate-800">{r.param}</td>
                        <td className="py-2.5 font-mono font-bold text-slate-900">{r.value}</td>
                        <td className="py-2.5 text-slate-500">{r.unit}</td>
                        <td className="py-2.5 font-mono text-slate-500">{r.range}</td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                              r.flag === "NORMAL"
                                ? "bg-emerald-100 text-emerald-800"
                                : r.flag === "CRITICAL"
                                ? "bg-rose-100 text-rose-800 border border-rose-300"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {r.flag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
