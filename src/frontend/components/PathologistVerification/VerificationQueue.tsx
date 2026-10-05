import React, { useState } from 'react';
import { ReportVerificationItem } from '../../types/doctor.types';

interface Props {
  reports: ReportVerificationItem[];
  onSelectReport: (report: ReportVerificationItem) => void;
  onPrintReport: (reportId: string) => void;
}

export const VerificationQueue: React.FC<Props> = ({
  reports,
  onSelectReport,
  onPrintReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const filtered = reports.filter(r => {
    const matchesSearch = 
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testPanelName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = departmentFilter === 'ALL' || r.department.includes(departmentFilter);

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-microscope text-sky-400"></i>
            <span>Pathologist & Diagnostic Sign-Off Station</span>
          </h2>
          <p className="text-xs text-slate-400">
            Review analyzer output, verify Delta deviations, and digitally authorize test reports.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Hematology">Hematology</option>
            <option value="Microbiology">Microbiology</option>
            <option value="Cardiac">Cardiac Lab</option>
          </select>

          <div className="relative w-full md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-500"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Patient, UHID, Test..."
              className="w-full bg-slate-950 border border-slate-700 text-xs rounded-xl pl-8 pr-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Report / Accession</th>
                <th className="py-3 px-4">Patient Details</th>
                <th className="py-3 px-4">Investigation Panel</th>
                <th className="py-3 px-4">Referred By</th>
                <th className="py-3 px-4">Critical Parameters</th>
                <th className="py-3 px-4">Status & Delta</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No reports pending matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(report => {
                  const isPanic = report.panicAlertAudit?.isPanicReport;
                  const isSigned = report.status.includes('Approved & Signed');

                  return (
                    <tr
                      key={report.reportId}
                      className={`hover:bg-slate-800/30 transition ${
                        isPanic ? 'bg-rose-950/20 border-l-4 border-l-rose-500' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-sky-400 font-bold">{report.reportId}</div>
                        <div className="text-[11px] text-slate-500">{report.accessionNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{report.patientName}</div>
                        <div className="text-[11px] text-slate-400">
                          {report.patientAge}y / {report.patientGender} • <span className="font-mono">{report.uhid}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{report.testPanelName}</div>
                        <div className="text-[11px] text-slate-400">{report.department}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium">{report.referredByDoctor.doctorName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          {report.parameters.slice(0, 2).map((param, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1 ${
                                param.flag.includes('PANIC')
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                                  : param.flag === 'HIGH' || param.flag === 'LOW'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'text-slate-300'
                              }`}
                            >
                              {param.paramName}: {param.observedValue} {param.unit}
                            </span>
                          ))}
                          {report.parameters.length > 2 && (
                            <span className="text-[10px] text-slate-500">
                              +{report.parameters.length - 2} more parameters
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[11px] rounded-full font-semibold inline-block ${
                            isPanic
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                              : isSigned
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isPanic ? '🚨 PANIC VALUE' : report.status}
                        </span>
                        {report.parameters.some(p => p.deltaCheck?.isDeltaAlert) && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                              <i className="fa-solid fa-chart-line"></i> Delta Alert
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectReport(report)}
                            className="px-3 py-1.5 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white rounded-lg font-semibold transition flex items-center gap-1"
                          >
                            <i className="fa-solid fa-microscope"></i> Review & Sign
                          </button>
                          {isSigned && (
                            <button
                              onClick={() => onPrintReport(report.reportId)}
                              className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white rounded-lg transition"
                              title="Print Authenticated PDF"
                            >
                              <i className="fa-solid fa-print"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
