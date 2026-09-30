"use client";

import { 
  AlertTriangle, 
  ArrowRight, 
  PhoneCall, 
  ExternalLink,
  ShieldAlert,
  BellRing
} from "lucide-react";

interface AlertItem {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  createdAt: string;
  actionUrl?: string;
  patientPhone?: string;
  doctorPhone?: string;
}

interface CriticalAlertsProps {
  alerts: AlertItem[];
  loading?: boolean;
}

export default function CriticalAlerts({ alerts = [], loading = false }: CriticalAlertsProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return (
    <div className="luxury-glass-card p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
              alerts.length > 0 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-500"
            }`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                Panic & Critical Alert Hub
                {alerts.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" /> {alerts.length} Panic Value{alerts.length > 1 ? "s" : ""}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">Urgent laboratory results requiring immediate clinician phone notification</p>
            </div>
          </div>

          <a
            href="/results"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
          >
            Review All <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">No Critical Panic Values Flagged</p>
              <p className="text-[11px] text-slate-500 mt-0.5">All currently processed diagnostic assays are within safe clinical limits</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50/80 transition-all flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider">
                        {alert.severity}
                      </span>
                      <span className="font-semibold text-slate-900 truncate">
                        {alert.title}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Reported: {formatTime(alert.createdAt)}</span>
                      <span>•</span>
                      <span className="text-rose-700 font-semibold">Clinician Call Pending</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {alert.actionUrl && (
                      <a
                        href={alert.actionUrl}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-xs"
                      >
                        Action <ArrowRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 text-slate-600">
          <BellRing className="h-3.5 w-3.5 text-rose-500" /> Mandatory Telephonic Read-Back Required
        </span>
        <span className="text-rose-600 font-semibold">SOP Compliant</span>
      </div>
    </div>
  );
}