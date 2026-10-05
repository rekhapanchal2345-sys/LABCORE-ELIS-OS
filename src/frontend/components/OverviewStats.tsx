import React from 'react';
import { ReportVerificationItem } from '../types/doctor.types';

interface Props {
  stats: {
    pendingReports: number;
    panicReports: number;
    totalDoctors: number;
    totalReferralPayout: number;
  };
  recentReports: ReportVerificationItem[];
  onNavigate: (tab: any) => void;
  onReviewReport: (report: ReportVerificationItem) => void;
}

export const OverviewStats: React.FC<Props> = ({
  stats,
  recentReports,
  onNavigate,
  onReviewReport
}) => {
  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reports In Queue</span>
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <i className="fa-solid fa-flask-vial"></i>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {stats.pendingReports}
          </div>
          <div className="text-xs text-sky-400 mt-1 flex items-center gap-1">
            <i className="fa-solid fa-clock"></i> Requires Pathologist Sign-Off
          </div>
        </div>

        <div className="glass-panel p-5 bg-slate-900/80 border border-rose-500/30 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">Critical Panic Values</span>
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center animate-pulse">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-2 font-mono">
            {stats.panicReports}
          </div>
          <div className="text-xs text-rose-300 mt-1 flex items-center gap-1">
            <i className="fa-solid fa-bell"></i> Immediate ER/Doctor Alert
          </div>
        </div>

        <div className="glass-panel p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Doctors</span>
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <i className="fa-solid fa-user-doctor"></i>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {stats.totalDoctors}
          </div>
          <div className="text-xs text-teal-400 mt-1 flex items-center gap-1">
            <i className="fa-solid fa-check-double"></i> In-House & Referring Partners
          </div>
        </div>

        <div className="glass-panel p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Referral Incentives</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
            ₹{stats.totalReferralPayout.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-300 mt-1 flex items-center gap-1">
            <i className="fa-solid fa-receipt"></i> Monthly Ledger (10% TDS)
          </div>
        </div>

      </div>

      {/* Quick Actions Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <i className="fa-solid fa-bolt text-amber-400"></i>
          <span>Quick Clinical Actions</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('verification')}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/20 transition flex items-center gap-2"
          >
            <i className="fa-solid fa-microscope"></i> Verify Pending Reports
          </button>
          <button
            onClick={() => onNavigate('prescriptions')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i> New E-Prescription (Rx)
          </button>
          <button
            onClick={() => onNavigate('emr')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <i className="fa-solid fa-chart-line"></i> Patient Longitudinal EMR
          </button>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <i className="fa-solid fa-list-check text-sky-400"></i> Recent Diagnostic Reports Awaiting Authorization
            </h3>
            <button
              onClick={() => onNavigate('verification')}
              className="text-xs text-sky-400 hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentReports.slice(0, 4).map(report => (
              <div
                key={report.reportId}
                className="flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-800/50 border border-slate-800 rounded-xl transition cursor-pointer"
                onClick={() => onReviewReport(report)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      report.panicAlertAudit?.isPanicReport
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-sky-500/20 text-sky-400'
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        report.panicAlertAudit?.isPanicReport ? 'fa-triangle-exclamation' : 'fa-flask-vial'
                      }`}
                    ></i>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-100">
                      {report.patientName}{' '}
                      <span className="text-xs text-slate-400 font-mono">({report.uhid})</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {report.testPanelName} • Ref: {report.referredByDoctor.doctorName}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      report.status.includes('Panic')
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : report.status.includes('Approved')
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {report.status.split('-')[0]}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {new Date(report.analyzerProcessedTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Quality & Accreditations Card */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 mb-3">
              <i className="fa-solid fa-shield-halved text-teal-400"></i> Clinical Quality & Compliance
            </h3>
            <ul className="text-xs text-slate-300 space-y-3">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5"></i>
                <span><strong>Delta Check Engine:</strong> Automatic flag if result deviates &gt;30% from patient baseline.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5"></i>
                <span><strong>Panic Telemetry:</strong> Instant SMS/WhatsApp trigger to referring physician.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5"></i>
                <span><strong>Encrypted Signature:</strong> Cryptographic token on authenticated report printouts.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5"></i>
                <span><strong>TDS Accounting:</strong> Section 194J 10% tax deduction on doctor referral incentives.</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            LabCore ELIS Engine • ISO 15189:2022 Compliant
          </div>
        </div>

      </div>
    </div>
  );
};
