"use client";

import { 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Award
} from "lucide-react";

interface ApprovalItem {
  id: string;
  result: {
    id: string;
    test: {
      testName: string;
      testCode: string;
    };
    order: {
      patient: {
        firstName: string;
        lastName: string;
        uhid: string;
      };
    };
  };
  createdAt: string;
}

interface ApprovalQueueProps {
  approvals: ApprovalItem[] | any;
  loading?: boolean;
}

export default function ApprovalQueue({ approvals, loading = false }: ApprovalQueueProps) {
  const approvalsArray: ApprovalItem[] = Array.isArray(approvals) 
    ? approvals 
    : (approvals?.approvals || approvals?.results || []);

  const formatWaitingTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ${diffHours % 24}h`;
    }
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  return (
    <div className="luxury-glass-card p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                Pathologist Sign-off Queue
                {approvalsArray.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                    {approvalsArray.length} Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">Medical doctor diagnostic validation & report digital sign-off</p>
            </div>
          </div>

          <a
            href="/approvals"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            Review Queue <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : approvalsArray.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Verification Queue Clear</p>
              <p className="text-[11px] text-slate-500 mt-0.5">All analyzed reports have been authorized by the duty Pathologist</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {approvalsArray.map((approval) => (
                <div
                  key={approval.id}
                  onClick={() => (window.location.href = `/approvals/${approval.id}`)}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/70 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {approval.result?.order?.patient?.firstName} {approval.result?.order?.patient?.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        UHID: {approval.result?.order?.patient?.uhid || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{approval.result?.test?.testName}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                        <Clock className="h-3 w-3" /> Waiting {formatWaitingTime(approval.createdAt)}
                      </span>
                    </div>

                    <a
                      href={`/approvals/${approval.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-[11px] hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      Sign-off
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Dual Verification Standard Active</span>
        <a href="/approvals" className="text-indigo-600 font-semibold hover:underline">
          Batch Sign-off &rarr;
        </a>
      </div>
    </div>
  );
}