"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  UserCheck, 
  Barcode, 
  Camera, 
  Fingerprint,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Download,
  Printer,
  Eye,
  FileText,
  Lock,
  Unlock,
  Activity,
  TrendingUp
} from "lucide-react";

interface VerificationCheck {
  id: string;
  name: string;
  status: "verified" | "failed" | "pending" | "skipped";
  timestamp?: string;
  verifiedBy?: string;
  notes?: string;
}

interface SampleAuditVerificationProps {
  sampleId: string;
  sampleNumber: string;
  patientName: string;
  patientUHID: string;
  barcode: string;
  checks: VerificationCheck[];
  onVerify?: (checkId: string) => void;
  onExport?: () => void;
  onPrint?: () => void;
}

function getCheckIcon(status: string) {
  switch (status) {
    case "verified":
      return CheckCircle2;
    case "failed":
      return XCircle;
    case "pending":
      return Clock;
    default:
      return AlertTriangle;
  }
}

function getCheckColor(status: string) {
  switch (status) {
    case "verified":
      return {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: "bg-emerald-500"
    };
    case "failed":
      return {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      icon: "bg-rose-500"
    };
    case "pending":
      return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: "bg-amber-500"
    };
    default:
      return {
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-700",
      icon: "bg-slate-500"
    };
  }
}

export default function SampleAuditVerification({
  sampleId,
  sampleNumber,
  patientName,
  patientUHID,
  barcode,
  checks,
  onVerify,
  onExport,
  onPrint
}: SampleAuditVerificationProps) {
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  const verifiedCount = checks.filter(c => c.status === "verified").length;
  const failedCount = checks.filter(c => c.status === "failed").length;
  const pendingCount = checks.filter(c => c.status === "pending").length;
  const totalCount = checks.length;
  const completionRate = Math.round((verifiedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-violet-50 via-purple-50 to-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                Sample Audit Verification
                <span className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  ⭐ Premium
                </span>
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Advanced identity verification and audit trail for specimen {sampleNumber}
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
        <div className="grid grid-cols-5 gap-4">
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
              <Barcode className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Barcode</span>
            </div>
            <div className="text-sm font-mono font-bold text-slate-900">{barcode}</div>
          </div>
          <div className="rounded-xl bg-white/80 p-4 border border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Completion</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{completionRate}%</div>
            <div className="text-xs text-slate-600">{verifiedCount}/{totalCount} verified</div>
          </div>
          <div className="rounded-xl bg-white/80 p-4 border border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Biometric</span>
            </div>
            <div className="text-sm font-black text-slate-900">Enabled</div>
            <div className="text-xs text-slate-600">Advanced Security</div>
          </div>
        </div>
      </div>

      {/* Verification Status Overview */}
      <div className="grid grid-cols-5 gap-4">
        <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">Verified</span>
            </div>
            <span className="text-2xl font-black text-emerald-900">{verifiedCount}</span>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all" 
              style={{ width: `${(verifiedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-red-50 p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-bold text-rose-700">Failed</span>
            </div>
            <span className="text-2xl font-black text-rose-900">{failedCount}</span>
          </div>
          <div className="w-full bg-rose-200 rounded-full h-2">
            <div 
              className="bg-rose-500 h-2 rounded-full transition-all" 
              style={{ width: `${(failedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-bold text-amber-700">Pending</span>
            </div>
            <span className="text-2xl font-black text-amber-900">{pendingCount}</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all" 
              style={{ width: `${(pendingCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-bold text-violet-700">Overall</span>
            </div>
            <span className="text-2xl font-black text-violet-900">{completionRate}%</span>
          </div>
          <div className="w-full bg-violet-200 rounded-full h-2">
            <div 
              className="bg-violet-500 h-2 rounded-full transition-all" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-cyan-600" />
              <span className="text-sm font-bold text-cyan-700">Biometric</span>
            </div>
            <span className="text-2xl font-black text-cyan-900">Active</span>
          </div>
          <div className="w-full bg-cyan-200 rounded-full h-2">
            <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Verification Checks */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Verification Checks</h3>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
              Advanced Level
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {checks.map((check) => {
            const checkColor = getCheckColor(check.status);
            const CheckIcon = getCheckIcon(check.status);
            const isExpanded = expandedCheck === check.id;

            return (
              <div
                key={check.id}
                className={`rounded-xl border-2 ${checkColor.border} ${checkColor.bg} transition-all`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${checkColor.icon} text-white shadow-md`}>
                        <CheckIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{check.name}</h4>
                        {check.verifiedBy && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <User className="w-3 h-3" />
                            {check.verifiedBy}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {check.timestamp && (
                        <div className="text-right">
                          <div className="text-xs font-mono text-slate-900">
                            {new Date(check.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(check.timestamp).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short"
                            })}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedCheck(isExpanded ? null : check.id)}
                        className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                      >
                        <ChevronRight 
                          className={`w-5 h-5 text-slate-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                        />
                      </button>

                      {check.status === "pending" && onVerify && (
                        <button
                          onClick={() => onVerify(check.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && check.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200/50">
                      <div className="text-xs text-slate-600">
                        <span className="font-bold">Notes:</span> {check.notes}
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
              completionRate === 100 ? 'bg-emerald-500' : completionRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
            } text-white shadow-lg`}>
              {completionRate === 100 ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {completionRate === 100 ? 'Audit Verification Complete' : 
                 completionRate >= 75 ? 'Audit Verification In Progress' : 
                 'Audit Verification Required'}
              </h4>
              <p className="text-sm text-slate-600">
                {completionRate === 100 ? 'All verification checks passed successfully' :
                 completionRate >= 75 ? 'Most verification checks completed' :
                 'Complete pending verification checks to proceed'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1.5 text-sm font-black ${
              completionRate === 100 ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' :
              completionRate >= 75 ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' :
              'bg-rose-100 text-rose-700 border-2 border-rose-300'
            }`}>
              {completionRate === 100 ? 'SECURE' : completionRate >= 75 ? 'PARTIAL' : 'AT RISK'}
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