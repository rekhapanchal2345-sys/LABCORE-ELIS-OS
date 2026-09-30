"use client";

import React, { useState } from "react";
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ShieldCheck,
  Barcode,
  UserCheck,
  Camera,
  Activity,
  MapPin,
  User,
  Fingerprint,
  Filter,
  Download,
  Printer,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Lock
} from "lucide-react";

interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  status: "success" | "warning" | "error" | "info";
  user?: string;
  location?: string;
  metadata?: {
    patientVerified?: boolean;
    barcodeMatched?: boolean;
    sampleIntegrity?: boolean;
    qcPassed?: boolean;
  };
}

interface PremiumAuditTimelineProps {
  events: TimelineEvent[];
  title?: string;
  showFilters?: boolean;
  showExport?: boolean;
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "success":
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: "bg-emerald-500",
        text: "text-emerald-700"
      };
    case "warning":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: "bg-amber-500",
        text: "text-amber-700"
      };
    case "error":
      return {
        bg: "bg-rose-50",
        border: "border-rose-200",
        icon: "bg-rose-500",
        text: "text-rose-700"
      };
    default:
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "bg-blue-500",
        text: "text-blue-700"
      };
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "success":
      return CheckCircle2;
    case "warning":
      return AlertTriangle;
    case "error":
      return XCircle;
    default:
      return Activity;
  }
}

function getEventIcon(event: string) {
  const eventLower = event.toLowerCase();
  
  if (eventLower.includes("patient") || eventLower.includes("identity") || eventLower.includes("verify")) {
    return UserCheck;
  }
  if (eventLower.includes("barcode") || eventLower.includes("scan")) {
    return Barcode;
  }
  if (eventLower.includes("photo") || eventLower.includes("image")) {
    return Camera;
  }
  if (eventLower.includes("qc") || eventLower.includes("quality")) {
    return ShieldCheck;
  }
  if (eventLower.includes("fingerprint") || eventLower.includes("biometric")) {
    return Fingerprint;
  }
  
  return Activity;
}

export default function PremiumAuditTimeline({
  events,
  title = "Sample Audit Trail",
  showFilters = true,
  showExport = true
}: PremiumAuditTimelineProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "warning" | "error">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(true);

  const filteredEvents = events.filter(event => {
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    success: events.filter(e => e.status === "success").length,
    warning: events.filter(e => e.status === "warning").length,
    error: events.filter(e => e.status === "error").length,
    info: events.filter(e => e.status === "info").length
  };

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                {title}
                <span className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  ⭐ Premium
                </span>
              </h2>
              <p className="text-sm text-slate-600">
                Complete audit trail with patient identity verification
              </p>
            </div>
          </div>

          {showExport && (
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-bold text-white hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          )}
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-5 gap-3">
          <div className="rounded-xl bg-emerald-50 border-2 border-emerald-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">Success</span>
            </div>
            <div className="text-2xl font-black text-emerald-900">{statusCounts.success}</div>
          </div>
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">Warning</span>
            </div>
            <div className="text-2xl font-black text-amber-900">{statusCounts.warning}</div>
          </div>
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-700">Error</span>
            </div>
            <div className="text-2xl font-black text-rose-900">{statusCounts.error}</div>
          </div>
          <div className="rounded-xl bg-blue-50 border-2 border-blue-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700">Info</span>
            </div>
            <div className="text-2xl font-black text-blue-900">{statusCounts.info}</div>
          </div>
          <div className="rounded-xl bg-cyan-50 border-2 border-cyan-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Fingerprint className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-bold text-cyan-700">Biometric</span>
            </div>
            <div className="text-2xl font-black text-cyan-900">Active</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("success")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterStatus === "success"
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setFilterStatus("warning")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterStatus === "warning"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Warning
              </button>
              <button
                onClick={() => setFilterStatus("error")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterStatus === "error"
                    ? "bg-rose-500 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                Error
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Timeline Events</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              {filteredEvents.length} of {events.length} events
            </span>
            <span className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
              ⭐ Premium
            </span>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No events found</p>
            <p className="text-slate-400 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => {
              const statusColor = getStatusColor(event.status);
              const StatusIcon = getStatusIcon(event.status);
              const EventIcon = getEventIcon(event.event);
              const isLast = index === filteredEvents.length - 1;

              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-200" />
                  )}

                  {/* Status indicator */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${statusColor.border} ${statusColor.bg} ${statusColor.icon} text-white shadow-md z-10`}>
                    <EventIcon className="w-5 h-5" />
                  </div>

                  {/* Event content */}
                  <div className="flex-1 rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900">{event.event}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{event.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-slate-900">{formatTime(event.timestamp)}</div>
                        <div className="text-[10px] text-slate-500">{formatDate(event.timestamp)}</div>
                      </div>
                    </div>

                    {/* User and location */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-slate-600">
                      {event.user && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {event.user}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                    </div>

                    {/* Metadata badges */}
                    {event.metadata && (
                      <div className="flex flex-wrap gap-2">
                        {event.metadata.patientVerified !== undefined && (
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium ${
                            event.metadata.patientVerified
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            <UserCheck className="w-3 h-3" />
                            Patient: {event.metadata.patientVerified ? 'Verified' : 'Not Verified'}
                          </div>
                        )}
                        {event.metadata.barcodeMatched !== undefined && (
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium ${
                            event.metadata.barcodeMatched
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            <Barcode className="w-3 h-3" />
                            Barcode: {event.metadata.barcodeMatched ? 'Matched' : 'Mismatch'}
                          </div>
                        )}
                        {event.metadata.sampleIntegrity !== undefined && (
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium ${
                            event.metadata.sampleIntegrity
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            <ShieldCheck className="w-3 h-3" />
                            Integrity: {event.metadata.sampleIntegrity ? 'Good' : 'Compromised'}
                          </div>
                        )}
                        {event.metadata.qcPassed !== undefined && (
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium ${
                            event.metadata.qcPassed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            QC: {event.metadata.qcPassed ? 'Passed' : 'Failed'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Status */}
      <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Audit Trail Security</h4>
              <p className="text-sm text-slate-600">Advanced biometric verification enabled</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 text-emerald-700 border-2 border-emerald-300 px-3 py-1.5 text-sm font-black">
              SECURE
            </span>
            <span className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
              ⭐ Premium
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}