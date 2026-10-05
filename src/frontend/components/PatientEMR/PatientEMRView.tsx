import React from 'react';
import { PatientEMR } from '../../types/doctor.types';

interface Props {
  emrs: PatientEMR[];
  selectedEMR: PatientEMR | null;
  onSelectPatient: (patient: PatientEMR) => void;
  onOpenRx: () => void;
}

export const PatientEMRView: React.FC<Props> = ({
  emrs,
  selectedEMR,
  onSelectPatient,
  onOpenRx
}) => {
  if (!selectedEMR) return null;

  return (
    <div className="space-y-5 text-xs">
      
      {/* Header Bar with Patient Selector */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-purple-400"></i>
            <span>Patient Longitudinal EMR & Diagnostic Trajectory</span>
          </h2>
          <p className="text-slate-400">
            Track multi-visit chronic disease trends, cumulative lab biomarkers, and medical history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-semibold">Select Patient:</label>
          <select
            value={selectedEMR.uhid}
            onChange={(e) => {
              const found = emrs.find(p => p.uhid === e.target.value);
              if (found) onSelectPatient(found);
            }}
            className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {emrs.map(p => (
              <option key={p.uhid} value={p.uhid}>
                {p.patientName} ({p.uhid}) - {p.gender}, {p.age}y
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient Profile Card */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold font-mono">
              {selectedEMR.uhid}
            </span>
            <div className="text-xl font-bold text-slate-100 mt-2">{selectedEMR.patientName}</div>
            <div className="text-slate-400">
              {selectedEMR.age} Yrs / {selectedEMR.gender} • Blood Group: {selectedEMR.bloodGroup || 'N/A'}
            </div>
            <div className="text-slate-400 mt-1">
              <i className="fa-solid fa-phone text-sky-400 mr-1"></i> {selectedEMR.contact.phone}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="font-semibold text-slate-400 mb-2">Chronic Conditions</div>
            <div className="flex flex-wrap gap-2">
              {selectedEMR.chronicConditions.map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-lg font-semibold"
                >
                  <i className="fa-solid fa-heart-pulse mr-1"></i> {c.condition} ({c.diagnosedSince})
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="font-semibold text-slate-400 mb-2">Consultation & Visit Timeline</div>
            <div className="space-y-3 mt-3">
              {selectedEMR.visitTimeline.map((v, i) => (
                <div key={i} className="relative pl-5 pb-3 border-l border-slate-700 last:border-l-0">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-purple-400 ring-4 ring-purple-950"></div>
                  <div className="font-bold text-purple-300">
                    {v.visitDate} • {v.visitType}
                  </div>
                  <div className="text-slate-200 mt-0.5">{v.diagnosis}</div>
                  <div className="text-[11px] text-slate-400">Attending: {v.attendingDoctor}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Longitudinal History Table & Biomarker Cards */}
        <div className="lg:col-span-2 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-200 text-sm">Longitudinal Lab Biomarker Records</h3>
                <p className="text-slate-400">Multi-session laboratory test value comparisons</p>
              </div>
              <span className="bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded font-semibold border border-rose-500/30">
                <i className="fa-solid fa-arrow-trend-up mr-1"></i> Chronic Alert: Suboptimal Control
              </span>
            </div>

            {/* Biomarker series display */}
            <div className="space-y-4">
              {selectedEMR.labHistoryTrends.map((trend) => (
                <div key={trend.paramCode} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sky-300">
                      {trend.paramName} ({trend.unit})
                    </span>
                    <span className="text-slate-500 text-[11px]">Normal: {trend.normalRange}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                    {trend.records.map((rec, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border ${
                          rec.flag === 'HIGH' || rec.flag === 'CRITICAL'
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400">{rec.testDate}</div>
                        <div className="font-bold text-sm mt-0.5">{rec.value} {trend.unit}</div>
                        <div className="text-[10px] uppercase font-semibold">{rec.flag}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">
              <i className="fa-solid fa-circle-info text-sky-400 mr-1"></i> HbA1c & Fasting Glucose elevated across 4 consecutive tests.
            </span>
            <button
              onClick={onOpenRx}
              className="text-sky-400 hover:underline font-bold"
            >
              Modify Therapy & Rx →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
