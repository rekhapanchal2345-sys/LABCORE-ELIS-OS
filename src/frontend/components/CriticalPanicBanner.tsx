import React from 'react';
import { ReportVerificationItem } from '../types/doctor.types';

interface Props {
  panicReports: ReportVerificationItem[];
  onReviewReport: (report: ReportVerificationItem) => void;
}

export const CriticalPanicBanner: React.FC<Props> = ({ panicReports, onReviewReport }) => {
  if (panicReports.length === 0) return null;

  const firstPanic = panicReports[0];

  return (
    <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-b border-rose-500/40 px-6 py-2.5 text-rose-200 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <span>
            <strong className="text-white">CRITICAL PANIC VALUE ALERT:</strong> Patient{' '}
            <strong className="text-rose-100">{firstPanic.patientName} ({firstPanic.uhid})</strong> has severe panic readings in{' '}
            <em className="text-rose-200">{firstPanic.testPanelName}</em>.
          </span>
        </div>
        <button
          onClick={() => onReviewReport(firstPanic)}
          className="underline font-bold text-white hover:text-rose-200 flex items-center gap-1 transition"
        >
          Review & Sign-Off Immediately <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};
