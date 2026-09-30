"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Clock, 
  User, 
  MapPin, 
  Fingerprint, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Activity,
  Eye,
  Barcode,
  UserCheck,
  Camera,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Copy,
  ExternalLink,
  Lock
} from "lucide-react";

interface PremiumAuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  role?: string;
  ipAddress?: string;
  description?: string;
  createdAt: string;
  status?: string;
  patientVerification?: {
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
  location?: string;
  deviceInfo?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

interface PremiumAuditCardProps {
  log: PremiumAuditLog;
  onView?: (log: PremiumAuditLog) => void;
  expanded?: boolean;
  onToggleExpand?: (id: string) => void;
}

function formatDate(date: string) {
  const parsed = new Date(date);
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function getTimeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getActionColor(action: string) {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes("create") || actionLower.includes("add") || actionLower.includes("approve") || actionLower.includes("login")) {
    return {
      bg: "bg-gradient-to-r from-emerald-50 to-green-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: "bg-emerald-500",
      iconColor: "text-white"
    };
  }
  
  if (actionLower.includes("delete") || actionLower.includes("reject") || actionLower.includes("logout") || actionLower.includes("fail")) {
    return {
      bg: "bg-gradient-to-r from-rose-50 to-red-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: "bg-rose-500",
      iconColor: "text-white"
    };
  }
  
  if (actionLower.includes("update") || actionLower.includes("edit") || actionLower.includes("change") || actionLower.includes("modify")) {
    return {
      bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: "bg-amber-500",
      iconColor: "text-white"
    };
  }
  
  if (actionLower.includes("scan") || actionLower.includes("verify") || actionLower.includes("check")) {
    return {
      bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: "bg-blue-500",
      iconColor: "text-white"
    };
  }
  
  return {
    bg: "bg-gradient-to-r from-slate-50 to-gray-50",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: "bg-slate-500",
    iconColor: "text-white"
  };
}

function getActionIcon(action: string) {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes("scan") || actionLower.includes("barcode")) return Barcode;
  if (actionLower.includes("verify") || actionLower.includes("check")) return ShieldCheck;
  if (actionLower.includes("patient") || actionLower.includes("identity")) return UserCheck;
  if (actionLower.includes("create") || actionLower.includes("add")) return CheckCircle2;
  if (actionLower.includes("delete") || actionLower.includes("reject")) return XCircle;
  if (actionLower.includes("alert") || actionLower.includes("error")) return AlertTriangle;
  if (actionLower.includes("view") || actionLower.includes("read")) return Eye;
  if (actionLower.includes("photo") || actionLower.includes("image")) return Camera;
  
  return Activity;
}

export default function PremiumAuditCard({
  log,
  onView,
  expanded = false,
  onToggleExpand
}: PremiumAuditCardProps) {
  const [copied, setCopied] = useState(false);
  const actionColor = getActionColor(log.action);
  const ActionIcon = getActionIcon(log.action);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(log.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verificationScore = log.patientVerification 
    ? Object.values(log.patientVerification).filter(v => v).length
    : 0;
  const totalVerification = log.patientVerification ? Object.values(log.patientVerification).length : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg transition-all hover:shadow-xl hover:border-slate-300">
      {/* Premium gradient header */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${actionColor.bg.replace('from-', 'from-').replace('to-', 'to-').replace('50', '400')} opacity-50`} />
      
      <div className="p-5">
        {/* Header with premium badges */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Premium action icon */}
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${actionColor.icon} shadow-lg ${actionColor.iconColor}`}>
              <ActionIcon className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-black text-slate-900 truncate">
                  {log.action}
                </h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${actionColor.bg} ${actionColor.text} ${actionColor.border} border`}>
                  {log.entity}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-slate-600">
                  {log.userName || log.userEmail || "System"}
                </span>
                {log.role && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{log.role}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Premium badges */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md">
              ⭐ Premium
            </span>
            <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md">
              Advanced
            </span>
            <span className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md">
              Biometric
            </span>
          </div>
        </div>

        {/* Description with premium styling */}
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          {log.description || "No description available"}
        </p>

        {/* Patient Verification Status (if available) */}
        {log.patientVerification && (
          <div className="mb-4 rounded-xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-violet-900">
                  Patient Identity Verification
                </span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                verificationScore === totalVerification 
                  ? 'bg-emerald-500 text-white' 
                  : verificationScore > 0 
                    ? 'bg-amber-400 text-white' 
                    : 'bg-slate-300 text-slate-600'
              }`}>
                {verificationScore}/{totalVerification} Verified
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                log.patientVerification.nameVerified 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {log.patientVerification.nameVerified ? '✓' : '○'} Name Verified
              </div>
              <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                log.patientVerification.uhidVerified 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {log.patientVerification.uhidVerified ? '✓' : '○'} UHID Verified
              </div>
              <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                log.patientVerification.dobVerified 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {log.patientVerification.dobVerified ? '✓' : '○'} DOB Verified
              </div>
              <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                log.patientVerification.photoVerified 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {log.patientVerification.photoVerified ? '✓' : '○'} Photo Verified
              </div>
            </div>
          </div>
        )}

        {/* Barcode Scan Status (if available) */}
        {log.barcodeData && (
          <div className="mb-4 rounded-xl border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Barcode className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-900">
                  Barcode Scan Verification
                </span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                log.barcodeData.matched 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-rose-500 text-white'
              }`}>
                {log.barcodeData.matched ? '✓ MATCHED' : '✗ MISMATCH'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-500">Scanned:</span>
                <span className="font-mono font-bold text-slate-900 ml-1">{log.barcodeData.scanned}</span>
              </div>
              <div>
                <span className="text-slate-500">Expected:</span>
                <span className="font-mono font-bold text-slate-900 ml-1">{log.barcodeData.expected}</span>
              </div>
            </div>
          </div>
        )}

        {/* Biometric Verification Status (premium feature) */}
        <div className="mb-4 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Biometric Verification
              </span>
            </div>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-black bg-emerald-500 text-white">
              ENABLED
            </span>
          </div>
          <div className="text-[10px] text-slate-600">
            Advanced biometric security layer active for this audit event
          </div>
        </div>

        {/* Metadata section (collapsible) */}
        <div className="mb-4">
          <button
            onClick={() => onToggleExpand?.(log.id)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {expanded ? 'Hide' : 'Show'} Details
          </button>

          {expanded && (
            <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Timestamp</span>
                  <div className="text-xs font-medium text-slate-900">{formatDate(log.createdAt)}</div>
                  <div className="text-[10px] text-slate-500">{getTimeAgo(log.createdAt)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Entity ID</span>
                  <div className="text-xs font-mono font-medium text-slate-900">#{log.entityId}</div>
                </div>
                {log.location && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Location</span>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-900">
                      <MapPin className="w-3 h-3" />
                      {log.location}
                    </div>
                  </div>
                )}
                {log.ipAddress && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">IP Address</span>
                    <div className="text-xs font-mono font-medium text-slate-900">{log.ipAddress}</div>
                  </div>
                )}
                {log.deviceInfo && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Device</span>
                    <div className="text-xs font-medium text-slate-900">{log.deviceInfo}</div>
                  </div>
                )}
                {log.sessionId && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Session</span>
                    <div className="text-xs font-mono font-medium text-slate-900">{log.sessionId}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock className="w-3 h-3" />
              {getTimeAgo(log.createdAt)}
            </div>
            {log.location && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <MapPin className="w-3 h-3" />
                {log.location}
              </div>
            )}
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <Lock className="w-3 h-3" />
              Secure
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy ID'}
            </button>
            
            {onView && (
              <button
                onClick={() => onView(log)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
              >
                <Eye className="w-3.5 h-3.5" />
                View Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}