"use client";

import React from "react";

interface ApprovalMetricsProps {
  pendingApproval?: number;
  criticalValues?: number;
  approvedToday?: number;
  rejectedRerun?: number;
  loading?: boolean;
  activeFilter?: string;
  onSelectMetric?: (filterKey: string) => void;
}

export default function ApprovalMetrics({
  pendingApproval = 0,
  criticalValues = 0,
  approvedToday = 0,
  rejectedRerun = 0,
  loading = false,
  activeFilter = "",
  onSelectMetric,
}: ApprovalMetricsProps) {
  const metrics = [
    {
      key: "pending",
      title: "Pending Approval",
      value: pendingApproval,
      description: "Awaiting pathologist digital sign-off",
      icon: "⏳",
      color: "bg-blue-500/10 text-blue-700 border-blue-200",
      accent: "from-blue-600 to-indigo-600",
      valueColor: "text-blue-950",
      badge: "In Queue",
    },
    {
      key: "critical",
      title: "Critical / Panic Values",
      value: criticalValues,
      description: "Verbal doctor call notification required",
      icon: "🚨",
      color: "bg-red-500/10 text-red-700 border-red-200",
      accent: "from-red-600 to-rose-700",
      valueColor: "text-red-950",
      badge: criticalValues > 0 ? "URGENT ATTENTION" : "All Normal",
      isAlert: criticalValues > 0,
    },
    {
      key: "approved",
      title: "Approved & Released",
      value: approvedToday,
      description: "Signed reports ready for patient dispatch",
      icon: "✓",
      color: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      accent: "from-emerald-600 to-teal-600",
      valueColor: "text-emerald-950",
      badge: "Today's TAT: 98%",
    },
    {
      key: "rerun",
      title: "Returned & Reruns",
      value: rejectedRerun,
      description: "Re-sampling or technician clarification",
      icon: "↺",
      color: "bg-amber-500/10 text-amber-700 border-amber-200",
      accent: "from-amber-500 to-orange-600",
      valueColor: "text-amber-950",
      badge: "Rework Queue",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const isSelected = activeFilter === metric.key;

        return (
          <div
            key={metric.key}
            onClick={() => onSelectMetric && onSelectMetric(metric.key)}
            className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 cursor-pointer ${
              isSelected
                ? "border-blue-500 ring-2 ring-blue-500/30 shadow-md transform -translate-y-0.5"
                : "border-gray-200/80 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            {/* Top gradient accent line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.accent} ${
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } transition-opacity`}
            />

            <div className="flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl font-bold shadow-inner ${metric.color} ${
                  metric.isAlert ? "animate-pulse" : ""
                }`}
              >
                {metric.icon}
              </div>

              <div className="text-right">
                <div className={`text-3xl font-black tracking-tight ${metric.valueColor}`}>
                  {metric.value}
                </div>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    metric.isAlert
                      ? "bg-red-100 text-red-700 animate-pulse"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {metric.badge}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {metric.title}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                {metric.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

