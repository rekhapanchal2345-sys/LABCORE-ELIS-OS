"use client";

import React, { useEffect, useState } from "react";
import { FileText, MessageCircle, Mail, Printer, Clock, AlertCircle } from "lucide-react";
import { reportsApi } from "@/lib/api";

interface ReportAnalyticsData {
  totalReportsGenerated: number;
  reportsGeneratedToday: number;
  reportsGeneratedThisMonth: number;
  whatsappDispatchCount: number;
  emailDispatchCount: number;
  hardCopyPrintedCount: number;
  pendingDispatchCount: number;
}

export default function ReportAnalyticsCards() {
  const [analytics, setAnalytics] = useState<ReportAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await reportsApi.getSummary();
        if (response.success && response.data) {
          setAnalytics(response.data);
        } else {
          setError(response.message || "Failed to load analytics");
        }
      } catch (err) {
        console.error("Error fetching report analytics:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Reports Generated",
      value: analytics.totalReportsGenerated,
      subtitle: `${analytics.reportsGeneratedToday} today`,
      icon: FileText,
      color: "blue",
      trend: "+12%",
    },
    {
      title: "Digital Dispatch",
      value: analytics.whatsappDispatchCount + analytics.emailDispatchCount,
      subtitle: `WhatsApp: ${analytics.whatsappDispatchCount} | Email: ${analytics.emailDispatchCount}`,
      icon: MessageCircle,
      color: "green",
      trend: "+8%",
    },
    {
      title: "Hard Copies Printed",
      value: analytics.hardCopyPrintedCount,
      subtitle: "Physical reports at counter",
      icon: Printer,
      color: "amber",
      trend: "+5%",
    },
    {
      title: "Pending Dispatch",
      value: analytics.pendingDispatchCount,
      subtitle: "Awaiting delivery",
      icon: Clock,
      color: "red",
      trend: "-3%",
    },
  ];

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      border: "border-green-200",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      border: "border-amber-200",
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
      border: "border-red-200",
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const colors = colorClasses[card.color as keyof typeof colorClasses];
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`card ${colors.bg} ${colors.border} border-2`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colors.bg}`}>
                <Icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-medium text-green-600">
                {card.trend}
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}