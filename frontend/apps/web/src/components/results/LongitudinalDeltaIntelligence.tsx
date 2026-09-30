"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  History,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Search,
  Zap,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from "recharts";

export interface PatientDeltaRecord {
  uhid: string;
  patientName: string;
  age: string;
  gender: string;
  parameterName: string;
  testName: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  rcvThresholdPercent: number; // Biological variation RCV limit
  history: Array<{
    date: string;
    value: number;
    flag: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
    orderNumber: string;
  }>;
}

const SAMPLE_DELTA_RECORDS: PatientDeltaRecord[] = [
  {
    uhid: "UHID-88219",
    patientName: "Meenakshi Sundaram",
    age: "52y",
    gender: "F",
    parameterName: "Serum Creatinine",
    testName: "Renal Function Test",
    unit: "mg/dL",
    normalMin: 0.6,
    normalMax: 1.2,
    rcvThresholdPercent: 25.0, // RCV for creatinine
    history: [
      { date: "15 Jan 2026", value: 0.9, flag: "NORMAL", orderNumber: "ORD-8812" },
      { date: "02 Feb 2026", value: 1.0, flag: "NORMAL", orderNumber: "ORD-8940" },
      { date: "28 Feb 2026", value: 1.1, flag: "NORMAL", orderNumber: "ORD-9005" },
      { date: "25 Sep 2026", value: 2.8, flag: "CRITICAL", orderNumber: "ORD-9021" }, // +154% sudden jump -> Acute Kidney Injury or sample mixup
    ],
  },
  {
    uhid: "UHID-77341",
    patientName: "Devendra Nath Roy",
    age: "64y",
    gender: "M",
    parameterName: "Platelet Count",
    testName: "Complete Blood Count",
    unit: "x10³/µL",
    normalMin: 150,
    normalMax: 450,
    rcvThresholdPercent: 30.0,
    history: [
      { date: "10 Jun 2026", value: 210, flag: "NORMAL", orderNumber: "ORD-7102" },
      { date: "18 Aug 2026", value: 195, flag: "NORMAL", orderNumber: "ORD-7945" },
      { date: "10 Sep 2026", value: 185, flag: "NORMAL", orderNumber: "ORD-8301" },
      { date: "25 Sep 2026", value: 32, flag: "CRITICAL", orderNumber: "ORD-9028" }, // -82.7% acute drop
    ],
  },
  {
    uhid: "UHID-66102",
    patientName: "Kavita Ramesh Chawla",
    age: "36y",
    gender: "F",
    parameterName: "Hemoglobin",
    testName: "Complete Blood Count",
    unit: "g/dL",
    normalMin: 12.0,
    normalMax: 15.5,
    rcvThresholdPercent: 12.0, // Strict RCV for Hb
    history: [
      { date: "01 May 2026", value: 13.2, flag: "NORMAL", orderNumber: "ORD-6011" },
      { date: "15 Jul 2026", value: 13.0, flag: "NORMAL", orderNumber: "ORD-6450" },
      { date: "12 Aug 2026", value: 12.8, flag: "NORMAL", orderNumber: "ORD-6980" },
      { date: "25 Sep 2026", value: 12.6, flag: "NORMAL", orderNumber: "ORD-9042" }, // Consistent stable trend
    ],
  },
  {
    uhid: "UHID-98214",
    patientName: "Rajesh Kumar Verma",
    age: "58y",
    gender: "M",
    parameterName: "Serum Potassium (K+)",
    testName: "Electrolytes Panel",
    unit: "mmol/L",
    normalMin: 3.5,
    normalMax: 5.1,
    rcvThresholdPercent: 15.0,
    history: [
      { date: "20 May 2026", value: 4.2, flag: "NORMAL", orderNumber: "ORD-5501" },
      { date: "14 Jul 2026", value: 4.4, flag: "NORMAL", orderNumber: "ORD-6120" },
      { date: "05 Sep 2026", value: 4.6, flag: "NORMAL", orderNumber: "ORD-7810" },
      { date: "25 Sep 2026", value: 6.9, flag: "CRITICAL", orderNumber: "ORD-9114" }, // Huge jump, possible EDTA contamination / hemolysis
    ],
  },
];

export default function LongitudinalDeltaIntelligence() {
  const [records, setRecords] = useState<PatientDeltaRecord[]>(SAMPLE_DELTA_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<PatientDeltaRecord>(SAMPLE_DELTA_RECORDS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [clinicalCorrelationNote, setClinicalCorrelationNote] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredRecords = records.filter(
    (r) =>
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.parameterName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const history = selectedRecord.history;
  const current = history[history.length - 1];
  const previous = history.length > 1 ? history[history.length - 2] : null;

  const calculateDelta = () => {
    if (!previous || !current) return { deltaVal: 0, percentChange: 0, isExceeded: false };
    const deltaVal = current.value - previous.value;
    const percentChange = (deltaVal / previous.value) * 100;
    const isExceeded = Math.abs(percentChange) > selectedRecord.rcvThresholdPercent;
    return {
      deltaVal: Number(deltaVal.toFixed(2)),
      percentChange: Number(percentChange.toFixed(1)),
      isExceeded,
    };
  };

  const delta = calculateDelta();

  const handleMarkCorrelated = () => {
    setToastMessage(`Delta shift marked as clinically correlated by Pathologist. Added to audit trail.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTriggerPreanalyticalAudit = () => {
    setToastMessage(`Preanalytical discrepancy investigation ticket generated for sample #${current.orderNumber}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 px-5 py-4 text-emerald-300 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-cyan-600/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
              Longitudinal Delta Checking & Sample Mix-Up Sentry
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Biological Variation & Delta Check Intelligence
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">
              Automated multi-visit trend correlation and Reference Change Value (RCV) surveillance to catch sample mislabeling and rapid clinical deviations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">RCV Algorithm</span>
              <p className="text-xs font-bold text-cyan-300">EFLM Biological Variation 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Selector & Delta Review Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Patient Case Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, UHID, analyte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2.5">
            {filteredRecords.map((rec) => {
              const isSelected = selectedRecord.uhid === rec.uhid && selectedRecord.parameterName === rec.parameterName;
              const last = rec.history[rec.history.length - 1];
              const prev = rec.history[rec.history.length - 2];
              const pChange = prev ? ((last.value - prev.value) / prev.value) * 100 : 0;
              const isBreached = Math.abs(pChange) > rec.rcvThresholdPercent;

              return (
                <div
                  key={`${rec.uhid}-${rec.parameterName}`}
                  onClick={() => setSelectedRecord(rec)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-950/50"
                      : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400">{rec.uhid}</span>
                      <h4 className="text-sm font-bold text-white">{rec.patientName}</h4>
                      <p className="text-xs text-slate-300 font-medium">{rec.parameterName}</p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isBreached
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {isBreached ? (
                        <>
                          <ShieldAlert className="h-3 w-3" />
                          Delta Breach ({pChange > 0 ? "+" : ""}{pChange.toFixed(0)}%)
                        </>
                      ) : (
                        "Delta Pass"
                      )}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                    <span>Current: <strong className="text-white">{last.value} {rec.unit}</strong></span>
                    <span>Prev: <strong className="text-slate-300">{prev ? prev.value : "—"} {rec.unit}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Longitudinal Trend & RCV Analysis (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card: Longitudinal Chart */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  {selectedRecord.uhid} · {selectedRecord.patientName} ({selectedRecord.age}/{selectedRecord.gender})
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedRecord.parameterName} Longitudinal Trajectory
                </h3>
                <p className="text-xs text-slate-400">
                  Biological Normal Interval: {selectedRecord.normalMin} - {selectedRecord.normalMax} {selectedRecord.unit} · RCV Limit: ±{selectedRecord.rcvThresholdPercent}%
                </p>
              </div>

              {/* Delta Status Badge */}
              <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 ${
                delta.isExceeded
                  ? "border-rose-500/40 bg-rose-950/30 text-rose-200"
                  : "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
              }`}>
                {delta.percentChange > 0 ? (
                  <ArrowUpRight className={`h-5 w-5 ${delta.isExceeded ? "text-rose-400" : "text-emerald-400"}`} />
                ) : (
                  <ArrowDownRight className={`h-5 w-5 ${delta.isExceeded ? "text-rose-400" : "text-emerald-400"}`} />
                )}
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider">
                    {delta.isExceeded ? "Discrepancy Alert" : "Within Biological Limits"}
                  </p>
                  <p className="text-base font-black">
                    {delta.percentChange > 0 ? "+" : ""}{delta.percentChange}% Shift
                  </p>
                </div>
              </div>
            </div>

            {/* Recharts Line Graph */}
            <div className="mt-5 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedRecord.history} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                    labelStyle={{ color: "#38bdf8", fontWeight: "bold" }}
                  />
                  {/* Reference Area for Normal Biological Range */}
                  <ReferenceArea
                    y1={selectedRecord.normalMin}
                    y2={selectedRecord.normalMax}
                    fill="#10b981"
                    fillOpacity={0.08}
                    stroke="#10b981"
                    strokeOpacity={0.2}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ fill: "#0284c7", stroke: "#e0f2fe", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, stroke: "#38bdf8", strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Multi-Visit History Timeline Table */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-2.5 px-4">Visit Date</th>
                    <th className="py-2.5 px-4">Order #</th>
                    <th className="py-2.5 px-4 text-right">Analyte Result</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Step Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {selectedRecord.history.map((h, idx) => {
                    const prevH = idx > 0 ? selectedRecord.history[idx - 1] : null;
                    const stepDelta = prevH ? ((h.value - prevH.value) / prevH.value) * 100 : null;

                    return (
                      <tr key={h.orderNumber} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-4 text-slate-200 font-medium">{h.date}</td>
                        <td className="py-2.5 px-4 font-mono text-cyan-400">{h.orderNumber}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                          {h.value} {selectedRecord.unit}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            h.flag === "CRITICAL"
                              ? "bg-red-500/20 text-red-300 border border-red-500/40"
                              : h.flag === "HIGH"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}>
                            {h.flag}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-[11px]">
                          {stepDelta !== null ? (
                            <span className={Math.abs(stepDelta) > selectedRecord.rcvThresholdPercent ? "text-rose-400 font-bold" : "text-slate-400"}>
                              {stepDelta > 0 ? "+" : ""}{stepDelta.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-600">Baseline</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Differential Diagnosis & Pathologist Action Bar */}
            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Activity className="h-4 w-4 text-cyan-400" />
                Biological Plausibility & Clinical Assessment
              </div>

              {delta.isExceeded ? (
                <div className="mt-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-rose-300">Significant Delta Exceedance Detected:</strong>
                      <p className="mt-0.5 text-slate-300 text-[11px]">
                        The result shifted by <strong>{delta.percentChange}%</strong>, which surpasses the biological Reference Change Value (RCV {selectedRecord.rcvThresholdPercent}%).
                        Check for: (1) Misidentified patient / sample tube swap, (2) Preanalytical IV fluid dilution, (3) Acute organ deterioration (e.g. contrast-induced nephropathy, acute hemolysis).
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Biological variation is within acceptable physiological parameters. No evidence of specimen mix-up.</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-3">
                <button
                  onClick={handleTriggerPreanalyticalAudit}
                  className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/40"
                >
                  Request Preanalytical Tube Audit
                </button>
                <button
                  onClick={handleMarkCorrelated}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Clinically Correlated
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
