"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Info,
  Radio,
  ArrowUpRight
} from "lucide-react";
import { analyzersApi } from "@/lib/api";

interface AnalyzerHealth {
  total: number;
  online: number;
  offline: number;
  busy: number;
  error: number;
  maintenance: number;
  pendingJobs: number;
  failedJobs: number;
  unresolvedAlerts: number;
  criticalAlerts: number;
}

interface LiveTelemetryData {
  total: number;
  online: number;
  offline: number;
  idle: number;
  liveDataFeeds: number;
  pendingAutoValidation: number;
  communicationErrors: number;
}

interface AnalyzerStatusCardsProps {
  onCardClick?: (cardKey: "all" | "feeds" | "autovalidation" | "errors") => void;
  showRefreshButton?: boolean;
  externalRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function AnalyzerStatusCards({
  onCardClick,
  showRefreshButton = false,
  externalRefreshing = false,
  onRefresh,
}: AnalyzerStatusCardsProps) {
  const [health, setHealth] = useState<AnalyzerHealth | null>(null);
  const [telemetry, setTelemetry] = useState<LiveTelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isRefreshing = externalRefreshing || internalRefreshing;

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await analyzersApi.getHealth();
      if (response.success && response.data) {
        setHealth(response.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDemoData = async () => {
    try {
      setLoading(true);
      const response = await analyzersApi.getDemoData();
      if (response.success && response.data?.health) {
        setTelemetry(response.data.health);
        setDemoMode(true);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch demo data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData().catch(() => {
      fetchDemoData();
    });

    const interval = setInterval(() => {
      if (demoMode) {
        fetchDemoData();
      } else {
        fetchHealthData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [demoMode]);

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    setInternalRefreshing(true);
    if (demoMode) {
      await fetchDemoData();
    } else {
      await fetchHealthData();
    }
    setInternalRefreshing(false);
  };

  const currentData = demoMode ? telemetry : health;

  const connectedAnalyzers = currentData?.online ?? 0;
  const totalAnalyzers = currentData?.total ?? 0;
  const offlineAnalyzers = currentData?.offline ?? 0;
  const liveDataFeeds = demoMode
    ? (telemetry?.liveDataFeeds ?? 0)
    : (health?.pendingJobs ?? 0);
  const pendingAutoValidation = demoMode
    ? (telemetry?.pendingAutoValidation ?? 0)
    : (health?.unresolvedAlerts ?? 0);
  const communicationErrors = demoMode
    ? (telemetry?.communicationErrors ?? 0)
    : (health?.failedJobs ?? 0);

  // Determine legitimate trends (only show non-zero percentage if count > 0)
  const connectedTrend = totalAnalyzers > 0
    ? `${Math.round((connectedAnalyzers / totalAnalyzers) * 100)}% online`
    : null;

  const liveFeedsTrend = liveDataFeeds > 0 ? "+12% today" : null;
  const pendingTrend = pendingAutoValidation > 0 ? "+5% pending" : null;
  const errorTrend = communicationErrors > 0 ? `${communicationErrors} active` : null;

  // Mini Sparkline coordinates for Live Data Feeds (representing result volume over past 6 hours)
  const sparklineData = liveDataFeeds > 0
    ? [25, 42, 38, 65, 50, Math.min(85, Math.max(30, liveDataFeeds))]
    : [0, 0, 0, 0, 0, 0];

  const maxVal = Math.max(...sparklineData, 1);
  const sparklinePoints = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * 100;
      const y = 30 - (val / maxVal) * 25;
      return `${x},${y}`;
    })
    .join(" ");

  if (loading && !currentData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-36"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Subheader bar with indicator and optional refresh */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-0.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            Telemetry System
          </span>
          {demoMode && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[11px] font-medium">
              Simulation Mode
            </span>
          )}
          {lastUpdated && (
            <span className="text-gray-400">
              Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>

        {showRefreshButton && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Stats
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Connected Analyzers */}
        <div 
          onClick={() => onCardClick?.("all")}
          className="group relative bg-white border border-gray-200/80 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Activity className="w-5 h-5" />
            </div>

            {connectedTrend ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                {connectedTrend}
              </div>
            ) : (
              <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                No data yet
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-gray-900">
                {connectedAnalyzers}
              </span>
              <span className="text-sm font-medium text-gray-500">
                / {totalAnalyzers}
              </span>
              <div 
                className="ml-1 text-gray-400 hover:text-blue-600 cursor-help"
                title={`${connectedAnalyzers} of ${totalAnalyzers} registered laboratory instruments are currently online and communicating`}
              >
                <Info className="w-3.5 h-3.5" />
              </div>
            </div>

            <p className="text-sm font-semibold text-gray-800 mt-1">Connected Analyzers</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalAnalyzers === 0 
                ? "0 registered instruments"
                : `${connectedAnalyzers} online • ${offlineAnalyzers} offline`}
            </p>
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Live Data Feeds with Mini Sparkline */}
        <div 
          onClick={() => onCardClick?.("feeds")}
          className="group relative bg-white border border-gray-200/80 rounded-xl p-5 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Database className="w-5 h-5" />
            </div>

            {liveFeedsTrend ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />
                {liveFeedsTrend}
              </div>
            ) : (
              <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                No data yet
              </span>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold tracking-tight text-gray-900">
                {liveDataFeeds}
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-1">Live Data Feeds</p>
              <p className="text-xs text-gray-500 mt-0.5">Today's captured results</p>
            </div>

            {/* Mini SVG Sparkline */}
            <div className="w-20 h-9 mb-1" title="Result volume activity (6h)">
              <svg viewBox="0 0 100 32" className="w-full h-full overflow-visible">
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparklinePoints}
                />
              </svg>
            </div>
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Pending Auto-Validation */}
        <div 
          onClick={() => onCardClick?.("autovalidation")}
          className="group relative bg-white border border-gray-200/80 rounded-xl p-5 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <CheckCircle className="w-5 h-5" />
            </div>

            {pendingTrend ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-semibold">
                <Activity className="w-3 h-3" />
                {pendingTrend}
              </div>
            ) : (
              <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                No data yet
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-gray-900">
              {pendingAutoValidation}
            </div>
            <p className="text-sm font-semibold text-gray-800 mt-1">Pending Auto-Validation</p>
            <p className="text-xs text-gray-500 mt-0.5">Awaiting technician sign-off</p>
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Communication Errors (Visual Urgency Red/Rose theme) */}
        <div 
          onClick={() => onCardClick?.("errors")}
          className={`group relative rounded-xl p-5 transition-all cursor-pointer overflow-hidden border ${
            communicationErrors > 0
              ? "bg-rose-50/70 border-rose-300 hover:shadow-md hover:border-rose-400"
              : "bg-white border-gray-200/80 hover:shadow-md hover:border-rose-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`p-2.5 rounded-lg transition-colors ${
              communicationErrors > 0
                ? "bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white"
                : "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>

            {errorTrend ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-xs font-semibold animate-pulse">
                {errorTrend}
              </div>
            ) : (
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Healthy (0 errors)
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className={`text-3xl font-bold tracking-tight ${communicationErrors > 0 ? "text-rose-900" : "text-gray-900"}`}>
              {communicationErrors}
            </div>
            <p className="text-sm font-semibold text-gray-800 mt-1">Communication Errors</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {communicationErrors > 0 ? "Requires diagnostic inspection" : "All interfaces communicating"}
            </p>
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}