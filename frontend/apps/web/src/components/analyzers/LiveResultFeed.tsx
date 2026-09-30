"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Database,
  RefreshCw,
  Send,
  Eye,
  FileText,
  UserCheck,
  Check,
  ShieldAlert
} from "lucide-react";
import { Analyzer } from "@/types";

export interface LiveFeedResult {
  id: string;
  analyzerId: string;
  analyzerName: string;
  barcode: string;
  orderNumber?: string;
  patientName?: string;
  patientUhid?: string;
  testCode: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
  timestamp: Date;
  status: "AUTO_APPROVED" | "PENDING_REVIEW" | "FLAGGED_CRITICAL";
  reviewedBy?: string;
}

interface LiveResultFeedProps {
  analyzers: Analyzer[];
  onOpenUnmatchedQueue?: () => void;
  unmatchedCount?: number;
}

export default function LiveResultFeed({
  analyzers,
  onOpenUnmatchedQueue,
  unmatchedCount = 3,
}: LiveResultFeedProps) {
  const [results, setResults] = useState<LiveFeedResult[]>([]);
  const [selectedAnalyzer, setSelectedAnalyzer] = useState<string>("ALL");
  const [selectedFlag, setSelectedFlag] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Generate realistic initial and live incoming results
  useEffect(() => {
    const initial: LiveFeedResult[] = [
      {
        id: "res-101",
        analyzerId: "SYS-001",
        analyzerName: "Sysmex XN-1000",
        barcode: "SMP-89021",
        orderNumber: "ORD-2026-0891",
        patientName: "John Doe",
        patientUhid: "UHID-2026-001",
        testCode: "WBC",
        testName: "White Blood Cell Count",
        value: "7.4",
        unit: "10^3/µL",
        referenceRange: "4.0 - 11.0",
        flag: "NORMAL",
        timestamp: new Date(Date.now() - 45 * 1000),
        status: "AUTO_APPROVED",
      },
      {
        id: "res-102",
        analyzerId: "ROC-001",
        analyzerName: "Roche Cobas c311",
        barcode: "SMP-89022",
        orderNumber: "ORD-2026-0892",
        patientName: "Jane Smith",
        patientUhid: "UHID-2026-002",
        testCode: "GLU",
        testName: "Fasting Blood Glucose",
        value: "285",
        unit: "mg/dL",
        referenceRange: "70 - 100",
        flag: "HIGH",
        timestamp: new Date(Date.now() - 120 * 1000),
        status: "PENDING_REVIEW",
      },
      {
        id: "res-103",
        analyzerId: "SYS-001",
        analyzerName: "Sysmex XN-1000",
        barcode: "SMP-89023",
        orderNumber: "ORD-2026-0893",
        patientName: "Robert Williams",
        patientUhid: "UHID-2026-003",
        testCode: "PLT",
        testName: "Platelet Count",
        value: "18",
        unit: "10^3/µL",
        referenceRange: "150 - 450",
        flag: "CRITICAL",
        timestamp: new Date(Date.now() - 210 * 1000),
        status: "FLAGGED_CRITICAL",
      },
      {
        id: "res-104",
        analyzerId: "ROC-001",
        analyzerName: "Roche Cobas c311",
        barcode: "SMP-89024",
        orderNumber: "ORD-2026-0894",
        patientName: "Emily Davis",
        patientUhid: "UHID-2026-004",
        testCode: "CREAT",
        testName: "Serum Creatinine",
        value: "0.9",
        unit: "mg/dL",
        referenceRange: "0.6 - 1.2",
        flag: "NORMAL",
        timestamp: new Date(Date.now() - 320 * 1000),
        status: "AUTO_APPROVED",
      },
    ];
    setResults(initial);
  }, []);

  // Simulate incoming real-time results when isLiveStreaming is on
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const templates = [
        { testCode: "HGB", testName: "Hemoglobin", value: (11 + Math.random() * 5).toFixed(1), unit: "g/dL", range: "12.0 - 16.0", normalMin: 12, normalMax: 16 },
        { testCode: "K", testName: "Potassium (K+)", value: (3.2 + Math.random() * 2.5).toFixed(1), unit: "mEq/L", range: "3.5 - 5.1", normalMin: 3.5, normalMax: 5.1 },
        { testCode: "RBC", testName: "Red Blood Cell Count", value: (4.1 + Math.random() * 1.5).toFixed(2), unit: "10^6/µL", range: "4.2 - 5.8", normalMin: 4.2, normalMax: 5.8 },
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const numVal = parseFloat(selected.value);

      let flag: "NORMAL" | "HIGH" | "LOW" | "CRITICAL" = "NORMAL";
      let status: "AUTO_APPROVED" | "PENDING_REVIEW" | "FLAGGED_CRITICAL" = "AUTO_APPROVED";

      if (numVal < selected.normalMin) {
        flag = "LOW";
        status = "PENDING_REVIEW";
      } else if (numVal > selected.normalMax) {
        flag = "HIGH";
        status = "PENDING_REVIEW";
      }

      if (selected.testCode === "K" && (numVal > 6.0 || numVal < 2.8)) {
        flag = "CRITICAL";
        status = "FLAGGED_CRITICAL";
      }

      const activeAnalyzers = analyzers.filter(a => a.status === "ONLINE");
      const chosenAnalyzer = activeAnalyzers.length > 0
        ? activeAnalyzers[Math.floor(Math.random() * activeAnalyzers.length)]
        : { id: "SYS-001", name: "Sysmex XN-1000" };

      const sampleNum = Math.floor(89025 + Math.random() * 50);

      const newResult: LiveFeedResult = {
        id: `res-${Date.now()}`,
        analyzerId: chosenAnalyzer.id,
        analyzerName: chosenAnalyzer.name,
        barcode: `SMP-${sampleNum}`,
        orderNumber: `ORD-2026-0${sampleNum - 88130}`,
        patientName: ["Michael Chen", "Sarah Jenkins", "Amit Patel", "Priya Sharma"][Math.floor(Math.random() * 4)],
        patientUhid: `UHID-2026-00${Math.floor(Math.random() * 9) + 1}`,
        testCode: selected.testCode,
        testName: selected.testName,
        value: selected.value,
        unit: selected.unit,
        referenceRange: selected.range,
        flag,
        timestamp: new Date(),
        status,
      };

      setResults((prev) => [newResult, ...prev.slice(0, 49)]); // Keep last 50
    }, 12000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, analyzers]);

  const handleApprove = (id: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "AUTO_APPROVED" as const, reviewedBy: "Technician (Manual sign-off)" } : r
      )
    );
  };

  const filteredResults = results.filter((r) => {
    if (selectedAnalyzer !== "ALL" && r.analyzerId !== selectedAnalyzer) return false;
    if (selectedFlag !== "ALL" && r.flag !== selectedFlag) return false;
    if (selectedStatus !== "ALL" && r.status !== selectedStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.barcode.toLowerCase().includes(term) ||
        r.testName.toLowerCase().includes(term) ||
        (r.patientName && r.patientName.toLowerCase().includes(term)) ||
        (r.patientUhid && r.patientUhid.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Alert banner for Unmatched Results if any */}
      {unmatchedCount > 0 && (
        <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3.5 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {unmatchedCount}
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                {unmatchedCount} Unmatched / Orphan Results In Queue
              </p>
              <p className="text-[11px] text-amber-700">
                Analyzers transmitted test results with barcodes that did not match any active patient order.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenUnmatchedQueue}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Review & Match Barcodes
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Control bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sample barcode, patient, test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedFlag}
            onChange={(e) => setSelectedFlag(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Clinical Flags</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="LOW">Low</option>
            <option value="CRITICAL">Critical Alerts</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Validation Statuses</option>
            <option value="AUTO_APPROVED">Auto-Approved</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="FLAGGED_CRITICAL">Flagged Critical</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isLiveStreaming
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-gray-50 text-gray-600 border-gray-300"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? "text-emerald-600 animate-pulse" : "text-gray-400"}`} />
            {isLiveStreaming ? "Live Feed Active" : "Stream Paused"}
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                <th className="px-4 py-3 text-left font-semibold">Source Analyzer</th>
                <th className="px-4 py-3 text-left font-semibold">Sample Barcode / Patient</th>
                <th className="px-4 py-3 text-left font-semibold">Test Parameter</th>
                <th className="px-4 py-3 text-left font-semibold">Result Value</th>
                <th className="px-4 py-3 text-left font-semibold">Reference Range</th>
                <th className="px-4 py-3 text-left font-semibold">Flag</th>
                <th className="px-4 py-3 text-left font-semibold">Validation State</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    No results captured matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredResults.map((r) => {
                  const isCritical = r.flag === "CRITICAL";
                  const isHigh = r.flag === "HIGH";
                  const isLow = r.flag === "LOW";

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isCritical ? "bg-rose-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-gray-500 whitespace-nowrap">
                        {r.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900 block">{r.analyzerName}</span>
                        <span className="text-[11px] text-gray-400 font-mono">{r.analyzerId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {r.barcode}
                          </span>
                        </div>
                        {r.patientName && (
                          <div className="text-[11px] text-gray-600 mt-0.5">
                            {r.patientName} <span className="text-gray-400">({r.patientUhid})</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{r.testName}</div>
                        <div className="text-[11px] font-mono text-gray-500">{r.testCode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono text-sm font-bold ${
                            isCritical
                              ? "text-rose-700"
                              : isHigh
                              ? "text-amber-700"
                              : isLow
                              ? "text-blue-700"
                              : "text-gray-900"
                          }`}
                        >
                          {r.value}{" "}
                          <span className="text-[11px] font-normal text-gray-500">{r.unit}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-500">{r.referenceRange}</td>
                      <td className="px-4 py-3">
                        {r.flag === "NORMAL" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Normal
                          </span>
                        )}
                        {r.flag === "HIGH" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            High (H)
                          </span>
                        )}
                        {r.flag === "LOW" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Low (L)
                          </span>
                        )}
                        {r.flag === "CRITICAL" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                            <ShieldAlert className="w-3 h-3" />
                            CRITICAL
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.status === "AUTO_APPROVED" && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Auto-Approved
                          </span>
                        )}
                        {r.status === "PENDING_REVIEW" && (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Review
                          </span>
                        )}
                        {r.status === "FLAGGED_CRITICAL" && (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Hold for Pathologist
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.status !== "AUTO_APPROVED" ? (
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">Released</span>
                        )}
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
