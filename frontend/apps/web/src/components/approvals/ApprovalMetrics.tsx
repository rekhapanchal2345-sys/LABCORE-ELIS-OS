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
      accentBorder: "border-l-cyan-500",
      iconBg: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-cyan-500/10",
      valueColor: "text-white",
      badgeCn: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
      badge: "In Queue",
      glow: "shadow-cyan-500/10",
    },
    {
      key: "critical",
      title: "Critical / Panic Values",
      value: criticalValues,
      description: "Verbal doctor call notification required",
      icon: "🚨",
      accentBorder: "border-l-rose-500",
      iconBg: "border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-rose-500/10",
      valueColor: criticalValues > 0 ? "text-rose-300" : "text-white",
      badgeCn: criticalValues > 0 ? "border-rose-500/30 bg-rose-500/10 text-rose-300 animate-pulse" : "border-slate-700 bg-slate-800 text-slate-400",
      badge: criticalValues > 0 ? "URGENT ATTENTION" : "All Normal",
      isAlert: criticalValues > 0,
      glow: criticalValues > 0 ? "shadow-rose-500/10" : "shadow-slate-950/50",
    },
    {
      key: "approved",
      title: "Approved & Released",
      value: approvedToday,
      description: "Signed reports ready for patient dispatch",
      icon: "✓",
      accentBorder: "border-l-emerald-500",
      iconBg: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/10",
      valueColor: "text-white",
      badgeCn: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      badge: "Today's TAT: 98%",
      glow: "shadow-emerald-500/10",
    },
    {
      key: "rerun",
      title: "Returned & Reruns",
      value: rejectedRerun,
      description: "Re-sampling or technician clarification",
      icon: "↺",
      accentBorder: "border-l-amber-500",
      iconBg: "border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-amber-500/10",
      valueColor: "text-white",
      badgeCn: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      badge: "Rework Queue",
      glow: "shadow-amber-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3 border-l-4 border-l-slate-700"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-800" />
              <div className="h-8 w-16 animate-pulse rounded bg-slate-800" />
            </div>
            <div className="h-4 w-28 animate-pulse rounded bg-slate-800" />
            <div className="h-3 w-40 animate-pulse rounded bg-slate-900" />
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
            className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl transition-all duration-200 cursor-pointer border-l-4 ${metric.accentBorder} ${metric.glow} ${
              isSelected
                ? "ring-1 ring-cyan-500/30 shadow-lg -translate-y-0.5"
                : "hover:border-slate-700 hover:shadow-xl hover:-translate-y-0.5"
            }`}
          >
            {/* Top glow pulse for selected/critical */}
            {(isSelected || metric.isAlert) && (
              <div className={`absolute top-0 left-0 right-0 h-px ${metric.isAlert ? "bg-rose-500/60" : "bg-cyan-500/40"}`} />
            )}

            <div className="flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl font-bold shadow-md ${metric.iconBg} ${
                  metric.isAlert ? "animate-pulse" : ""
                }`}
              >
                {metric.icon}
              </div>

              <div className="text-right">
                <div className={`font-mono text-3xl font-black tracking-tight ${metric.valueColor}`}>
                  {metric.value}
                </div>
                <span
                  className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${metric.badgeCn}`}
                >
                  {metric.badge}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                {metric.title}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                {metric.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
