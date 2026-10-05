import React, { useState } from 'react';
import { ReportVerificationItem } from '../../types/doctor.types';

interface Props {
  report: ReportVerificationItem | null;
  onClose: () => void;
  onSignOff: (reportId: string, remarks: string) => Promise<any>;
  onOrderReRun: (reportId: string, reason: string) => Promise<any>;
}

export const ParameterReviewModal: React.FC<Props> = ({
  report,
  onClose,
  onSignOff,
  onOrderReRun
}) => {
  const [remarks, setRemarks] = useState(
    report?.signOff?.doctorRemarks ||
    (report?.panicAlertAudit?.isPanicReport
      ? 'Critical panic values confirmed on automated secondary run. Attending physician alerted immediately.'
      : 'Results clinically correlated and verified.')
  );
  const [submitting, setSubmitting] = useState(false);

  if (!report) return null;

  const handleSign = async () => {
    setSubmitting(true);
    await onSignOff(report.reportId, remarks);
    setSubmitting(false);
  };

  const handleReRun = async () => {
    const reason = prompt('Specify clinical reason for Test Re-Run / Sample Redraw:', 'Discordance with clinical baseline; repeat sample recommended.');
    if (!reason) return;
    setSubmitting(true);
    await onOrderReRun(report.reportId, reason);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-sky-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <i className="fa-solid fa-microscope"></i>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Pathologist Diagnostic Review & Authorization</h3>
              <div className="text-xs text-slate-400">
                Report: <span className="text-sky-300 font-mono font-bold">{report.reportId}</span> • Accession:{' '}
                <span className="text-slate-300 font-mono">{report.accessionNumber}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Patient Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500">Patient:</span>{' '}
              <strong className="text-slate-200">
                {report.patientName} ({report.patientAge}y / {report.patientGender})
              </strong>
            </div>
            <div>
              <span className="text-slate-500">UHID:</span>{' '}
              <strong className="text-sky-300 font-mono">{report.uhid}</strong>
            </div>
            <div>
              <span className="text-slate-500">Referred By:</span>{' '}
              <strong className="text-slate-200">{report.referredByDoctor.doctorName}</strong>
            </div>
          </div>

          <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <i className="fa-solid fa-vial-circle-check text-sky-400"></i>
            <span>{report.testPanelName}</span>
          </div>

          {/* Parameters Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Test Parameter</th>
                  <th className="py-2.5 px-3">Observed Result</th>
                  <th className="py-2.5 px-3">Reference Range</th>
                  <th className="py-2.5 px-3">Delta vs Prior</th>
                  <th className="py-2.5 px-3">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report.parameters.map((p, idx) => {
                  const isCritical = p.flag.includes('PANIC');
                  const isDelta = p.deltaCheck?.isDeltaAlert;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{p.paramName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.methodology}</div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={`font-bold text-sm ${isCritical ? 'text-rose-400' : 'text-slate-100'}`}>
                          {p.observedValue}
                        </span>{' '}
                        <span className="text-slate-400 text-[11px]">{p.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {p.normalReferenceRange.displayRange} {p.unit}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {p.deltaCheck?.hasPreviousResult ? (
                          <div className={isDelta ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                            Prev: {p.deltaCheck.previousValue} {p.unit} <br />
                            <span className={Number(p.deltaCheck.percentageChange) > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                              ({Number(p.deltaCheck.percentageChange) > 0 ? '+' : ''}{p.deltaCheck.percentageChange}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">No Prior Data</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isCritical ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                            CRITICAL PANIC
                          </span>
                        ) : p.flag === 'HIGH' ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            HIGH 🔺
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            NORMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Remarks input */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Pathologist Clinical Interpretation & Impression:
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReRun}
            disabled={submitting}
            className="px-4 py-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate-right"></i> Order Re-Run / Redraw
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSign}
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2"
            >
              <i className="fa-solid fa-signature"></i> Digitally Sign & Authorize Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
