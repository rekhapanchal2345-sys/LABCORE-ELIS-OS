"use client";

import React, { useState, useEffect } from "react";
import { approvalApi } from "@/lib/api";

interface DeltaCheckViewerProps {
  resultId: string;
}

export default function DeltaCheckViewer({ resultId }: DeltaCheckViewerProps) {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await approvalApi.getHistory(resultId);
        if (isMounted && res?.success && res?.data) {
          setHistoryData(res.data);
        }
      } catch (e) {
        console.error("Failed to load delta check history:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [resultId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 animate-pulse space-y-3">
        <div className="h-4 w-48 bg-gray-200 rounded" />
        <div className="h-16 bg-gray-200 rounded" />
      </div>
    );
  }

  const parameters = historyData?.parameters || [];
  const parametersWithPrior = parameters.filter(
    (p: any) => p.history && p.history.length > 0
  );

  if (parametersWithPrior.length === 0) {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span>
            <strong>Baseline Examination:</strong> No previous historical reports on file for this patient. This result will establish the initial clinical baseline.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-indigo-100/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white text-xs font-bold">
            Δ
          </span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
            Delta Check & Historical Trend Comparison
          </h4>
        </div>
        <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          {parametersWithPrior.length} parameter{parametersWithPrior.length > 1 ? "s" : ""} tracked
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead>
            <tr className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2 text-left">Parameter</th>
              <th className="py-2 text-left">Previous (Date)</th>
              <th className="py-2 text-left">Current</th>
              <th className="py-2 text-center">Delta Shift</th>
              <th className="py-2 text-left">Clinical Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {parametersWithPrior.map((param: any) => {
              const latestPrior = param.latestPrior;
              const delta = latestPrior?.deltaPercent;
              const priorDate = latestPrior?.date
                ? new Date(latestPrior.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })
                : "—";

              let deltaColor = "bg-gray-100 text-gray-700";
              let alertText = "Stable trend";

              if (delta !== null && delta !== undefined) {
                const absDelta = Math.abs(delta);
                if (absDelta > 30) {
                  deltaColor = "bg-red-100 text-red-800 border-red-200 font-bold animate-pulse";
                  alertText = delta > 0 ? "⚡ Acute Spike (>30%)" : "⚠️ Acute Drop (>30%)";
                } else if (absDelta > 15) {
                  deltaColor = "bg-amber-100 text-amber-800 border-amber-200";
                  alertText = delta > 0 ? "Moderate elevation" : "Moderate decline";
                } else {
                  deltaColor = "bg-green-100 text-green-800 border-green-200";
                  alertText = "Consistent with baseline";
                }
              }

              return (
                <tr key={param.parameterId} className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 font-semibold text-gray-900">
                    {param.parameterName}
                  </td>
                  <td className="py-2.5 text-gray-600">
                    <span className="font-semibold text-gray-800">{latestPrior?.value}</span>{" "}
                    <span className="text-[10px] text-gray-400">({priorDate})</span>
                  </td>
                  <td className="py-2.5 font-bold text-gray-900">
                    {param.currentValue} <span className="text-[10px] text-gray-500 font-normal">{param.unit}</span>
                  </td>
                  <td className="py-2.5 text-center">
                    {delta !== null && delta !== undefined ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${deltaColor}`}>
                        {delta > 0 ? `+${delta}%` : `${delta}%`}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-gray-600 font-medium">
                    {alertText}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
