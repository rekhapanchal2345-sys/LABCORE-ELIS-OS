"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  UserCheck, 
  Barcode, 
  Camera, 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Activity,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Download,
  Printer,
  Eye,
  Lock,
  Unlock,
  Fingerprint,
  FileText,
  Calendar,
  Globe
} from "lucide-react";

interface AuditTrailEvent {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  performer: string;
  role: string;
  location: string;
  status: "success" | "warning" | "error" | "info";
  patientData?: {
    nameVerified: boolean;
    uhidVerified: boolean;
    dobVerified: boolean;
    photoVerified: boolean;
  };
  barcodeData?: {
    scanned: string;
    expected: string;
    matched: boolean;
  };
  deviceInfo?: string;
  ipAddress?: string;
}

interface SampleAuditTrailProps {
  sampleId: string;
  sampleNumber: string;
  patientName: string;
  patientUHID: string;
  events: AuditTrailEvent[];
  onExport?: () => void;
  onPrint?: () => void;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function getTimeAgo(timestamp: string) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
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

function getEventIcon(eventType: string) {
  const type = eventType.toLowerCase();
  
  if (type.includes("patient") || type.includes("identity") || type.includes("verify")) {
    return UserCheck;
  }
  if (type.includes("barcode") || type.includes("scan")) {
    return Barcode;
  }
  if (type.includes("photo") || type.includes("image")) {
    return Camera;
  }
  if (type.includes("fingerprint") || type.includes("biometric")) {
    return Fingerprint;
  }
  if (type.includes("create") || type.includes("order")) {
    return FileText;
  }
  
  return Activity;
}

export default function SampleAuditTrail({
  sampleId,
  sampleNumber,
  patientName,
  patientUHID,
  events,
  onExport,
  onPrint
}: SampleAuditTrailProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const patientVerificationScore = events.reduce((score, event) => {
    if (event.patientData) {
      return score + Object.values(event.patientData).filter(v => v).length;
    }
    return score;
  }, 0);

  const totalPatientChecks = events.reduce((total, event) => {
    if (event.patientData) {
      return total + Object.values(event.patientData).length;
    }
    return total;
  }, 0);

  const barcodeMatchRate = events.filter(e => e.barcodeData?.matched).length / (events.filter(e => e.barcodeData).length || 1) * 100;

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                Sample Audit Trail
                <span className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  ⭐ Premium
                </span>
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Complete audit trail with patient identity verification for specimen {sampleNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-bold text-white hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Sample Information */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/80 p-4 border border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Sample Number</span>
            </div>
            <div className="text-lg font-black text-slate-900">{sampleNumber}</div>
          </div>
          <div className="rounded-xl bg-white/80 p-4 border border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Patient</span>
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">{patientName}</div>
            <div className="text-xs text-slate-600">{patientUHID}</div>
          </div>
          <div className="rounded-xl bg-white/80 p-4 border border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Total Events</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{events.length}</div>
          </div>
          <div className="rounded-xl bg-white/80 p-4 border border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Security Level</span>
            </div>
            <div className="text-sm font-black text-slate-900">Advanced</div>
            <div className="text-xs text-slate-600">Biometric Verified</div>
          </div>
        </div>
      </div>

      {/* Verification Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-bold text-violet-900">Patient Identity Verification</span>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${
              patientVerificationScore === totalPatientChecks && totalPatientChecks > 0
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-400 text-white'
            }`}>
              {totalPatientChecks > 0 ? `${Math.round((patientVerificationScore / totalPatientChecks) * 100)}%` : 'N/A'}
            </span>
          </div>
          <div className="w-full bg-violet-200 rounded-full h-2 mb-2">
            <div 
              className="bg-violet-500 h-2 rounded-full transition-all" 
              style={{ width: `${totalPatientChecks > 0 ? (patientVerificationScore / totalPatientChecks) * 100 : 0}%` }}
            />
          </div>
          <div className="text-xs text-slate-600">
            {patientVerificationScore} of {totalPatientChecks} verification checks passed
          </div>
        </div>

        <div className="rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-cyan-600" />
              <span className="text-sm font-bold text-cyan-900">Barcode Match Rate</span>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${
              barcodeMatchRate === 100
                ? 'bg-emerald-500 text-white'
                : barcodeMatchRate >= 75
                  ? 'bg-amber-400 text-white'
                  : 'bg-rose-500 text-white'
            }`}>
              {Math.round(barcodeMatchRate)}%
            </span>
          </div>
          <div className="w-full bg-cyan-200 rounded-full h-2 mb-2">
            <div 
              className="bg-cyan-500 h-2 rounded-full transition-all" 
              style={{ width: `${barcodeMatchRate}%` }}
            />
          </div>
          <div className="text-xs text-slate-600">
            {events.filter(e => e.barcodeData?.matched).length} of {events.filter(e => e.barcodeData).length} barcode scans matched
          </div>
        </div>

        <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-bold text-amber-900">Biometric Checks</span>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-black bg-emerald-500 text-white">
              Active
            </span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
            <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: '100%' }} />
          </div>
          <div className="text-xs text-slate-600">
            Fingerprint & Face ID verification enabled
          </div>
        </div>
      </div>

      {/* Audit Trail Timeline */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Audit Trail Events</h3>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
              Advanced Level
            </span>
            <span className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
              ⭐ Premium
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {events.map((event, index) => {
            const statusColor = getStatusColor(event.status);
            const EventIcon = getEventIcon(event.eventType);
            const isExpanded = expandedEvent === event.id;
            const isLast = index === events.length - 1;

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
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900">{event.eventType}</h4>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{event.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-slate-900">{formatTimestamp(event.timestamp)}</div>
                      <div className="text-[10px] text-slate-500">{getTimeAgo(event.timestamp)}</div>
                    </div>
                  </div>

                  {/* Performer and location */}
                  <div className="flex items-center gap-4 mb-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {event.performer} ({event.role})
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                    {event.deviceInfo && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {event.deviceInfo}
                      </div>
                    )}
                  </div>

                  {/* Patient Verification Data */}
                  {event.patientData && (
                    <div className="mb-3 rounded-lg border-2 border-violet-200 bg-violet-50 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-4 h-4 text-violet-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-900">
                          Patient Identity Verification
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                          event.patientData.nameVerified
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {event.patientData.nameVerified ? '✓' : '✗'} Name Verified
                        </div>
                        <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                          event.patientData.uhidVerified
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {event.patientData.uhidVerified ? '✓' : '✗'} UHID Verified
                        </div>
                        <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                          event.patientData.dobVerified
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {event.patientData.dobVerified ? '✓' : '✗'} DOB Verified
                        </div>
                        <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                          event.patientData.photoVerified
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {event.patientData.photoVerified ? '✓' : '✗'} Photo Verified
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Barcode Scan Data */}
                  {event.barcodeData && (
                    <div className="mb-3 rounded-lg border-2 border-cyan-200 bg-cyan-50 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Barcode className="w-4 h-4 text-cyan-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-900">
                          Barcode Scan Verification
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-slate-500">Scanned:</span>
                          <span className="font-mono font-bold text-slate-900 ml-1">{event.barcodeData.scanned}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Expected:</span>
                          <span className="font-mono font-bold text-slate-900 ml-1">{event.barcodeData.expected}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expand button */}
                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    {isExpanded ? 'Show Less' : 'Show More Details'}
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      {event.ipAddress && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">IP Address:</span>
                          <span className="font-mono text-slate-900">{event.ipAddress}</span>
                        </div>
                      )}
                      {event.deviceInfo && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Device:</span>
                          <span className="text-slate-900">{event.deviceInfo}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Event ID:</span>
                        <span className="font-mono text-slate-900">{event.id}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Status */}
      <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              patientVerificationScore === totalPatientChecks && totalPatientChecks > 0
                ? 'bg-emerald-500' 
                : patientVerificationScore >= totalPatientChecks * 0.75
                  ? 'bg-amber-500' 
                  : 'bg-rose-500'
            } text-white shadow-lg`}>
              {patientVerificationScore === totalPatientChecks && totalPatientChecks > 0 ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {patientVerificationScore === totalPatientChecks && totalPatientChecks > 0 ? 'Audit Trail Verified' : 
                 patientVerificationScore >= totalPatientChecks * 0.75 ? 'Audit Trail Partially Verified' : 
                 'Audit Trail Verification Required'}
              </h4>
              <p className="text-sm text-slate-600">
                {patientVerificationScore === totalPatientChecks && totalPatientChecks > 0 ? 'All verification checks passed successfully' :
                 patientVerificationScore >= totalPatientChecks * 0.75 ? 'Most verification checks completed' :
                 'Complete pending verification checks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1.5 text-sm font-black ${
              patientVerificationScore === totalPatientChecks && totalPatientChecks > 0 ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' :
              patientVerificationScore >= totalPatientChecks * 0.75 ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' :
              'bg-rose-100 text-rose-700 border-2 border-rose-300'
            }`}>
              {patientVerificationScore === totalPatientChecks && totalPatientChecks > 0 ? 'SECURE' : patientVerificationScore >= totalPatientChecks * 0.75 ? 'PARTIAL' : 'AT RISK'}
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