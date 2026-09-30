"use client";

import React from "react";
import {
  ArrowDown,
  ArrowUp,
  LucideIcon,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel = "from last period",
  loading = false,
  className = "",
}: StatsCardProps) {
  if (loading) {
    return (
      <div
        className={`rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl p-5 shadow-lg shadow-purple-500/20 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 animate-pulse rounded bg-purple-500/20" />
          <div className="h-10 w-10 animate-pulse rounded-lg bg-purple-500/20" />
        </div>

        <div className="mt-5 h-8 w-24 animate-pulse rounded bg-purple-500/20" />

        <div className="mt-3 h-3 w-36 animate-pulse rounded bg-purple-500/10" />
      </div>
    );
  }

  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={`rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl p-5 shadow-lg shadow-purple-500/20 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/30 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-purple-300/80">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            {value}
          </p>
        </div>

        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <Icon className="h-5 w-5 text-purple-400" />
          </div>
        )}
      </div>

      {(trend !== undefined || subtitle) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                isPositive
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="h-3.5 w-3.5" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5" />
              )}

              {Math.abs(trend)}%
            </span>
          )}

          {trend !== undefined && (
            <span className="text-purple-400/60">
              {trendLabel}
            </span>
          )}

          {subtitle && (
            <span className="text-purple-300/70">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}