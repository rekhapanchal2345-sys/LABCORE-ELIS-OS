"use client";

import React, { useEffect, useState } from "react";
import { resultsApi } from "@/lib/api";

interface MetricsData {
  pendingEntry: number;
  inVerification: number;
  approved: number;
  critical: number;
}

interface ResultMetricsCardsProps {
  onFilterChange?: (filter: string) => void;
}

export default function ResultMetricsCards({ onFilterChange }: ResultMetricsCardsProps) {
  const [metrics, setMetrics] = useState<MetricsData>({
    pendingEntry: 0,
    inVerification: 0,
    approved: 0,
    critical: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await resultsApi.getMetrics();
        if (response.success && response.data) {
          setMetrics(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const cards = [
    {
      title: "Pending Entry",
      value: metrics.pendingEntry,
      description: "Samples awaiting parameter input",
      color: "bg-slate-50",
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
      icon: "📝",
    },
    {
      title: "In Verification",
      value: metrics.inVerification,
      description: "Results awaiting pathologist review",
      color: "bg-amber-50",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      icon: "⏳",
    },
    {
      title: "Approved / Critical Passed",
      value: metrics.approved,
      description: "Tests verified and ready for reports",
      color: "bg-green-50",
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      icon: "✅",
    },
    {
      title: "Panic / Critical Values",
      value: metrics.critical,
      description: "Results requiring urgent attention",
      color: "bg-red-50",
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      icon: "🚨",
    },
  ];

  const getFilterForCard = (title: string): string => {
    switch (title) {
      case "Pending Entry":
        return "PENDING";
      case "In Verification":
        return "ENTERED";
      case "Approved / Critical Passed":
        return "APPROVED";
      case "Panic / Critical Values":
        return "CRITICAL";
      default:
        return "";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          onClick={() => onFilterChange && onFilterChange(getFilterForCard(card.title))}
            className={`group relative overflow-hidden ${card.color} rounded-2xl border border-gray-200 p-5 shadow-sm transition duration-200 cursor-pointer hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg`}
        >
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/60 blur-2xl transition group-hover:scale-125" />
            <div className="flex items-center justify-between">
              <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor} text-xl shadow-sm`}>
                {card.icon}
              </div>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            ) : (
              <div className="text-3xl font-semibold tracking-tight text-gray-900">
                {card.value}
              </div>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {card.title}
            </h3>
            <p className="mt-1 text-xs text-gray-600">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}