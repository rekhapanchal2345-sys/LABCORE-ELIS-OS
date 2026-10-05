import React from 'react';
import { Doctor } from '../../types/doctor.types';

interface Props {
  doctors: Doctor[];
}

export const DoctorRosterView: React.FC<Props> = ({ doctors }) => {
  const showSchedule = (doc: Doctor) => {
    alert(
      `Doctor: ${doc.title} ${doc.fullName}\nDepartment: ${doc.department}\nAvailability:\n` +
      doc.opdSettings.availability
        .map(a => `• ${a.dayOfWeek}: ${a.startTime} - ${a.endTime} (Room: ${a.roomNo})`)
        .join('\n')
    );
  };

  return (
    <div className="space-y-5 text-xs">
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <i className="fa-solid fa-user-doctor text-sky-400"></i>
            <span>Doctor Roster & OPD Consultation Schedule</span>
          </h2>
          <p className="text-slate-400">
            Manage Consultant profiles, Medical Council licensing, OPD token allocations, and referral rates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map(d => (
          <div
            key={d.id}
            className="p-5 bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 rounded-2xl flex flex-col justify-between transition group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2.5 py-1 rounded-full font-semibold ${
                    d.doctorType.includes('Pathologist')
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {d.doctorType}
                </span>
                <span className="text-amber-400 font-bold">
                  <i className="fa-solid fa-star mr-1"></i>
                  {d.metrics.rating}
                </span>
              </div>

              <div className="font-bold text-base text-slate-100 group-hover:text-sky-300 transition">
                {d.title} {d.fullName}
              </div>
              <div className="text-sky-400 font-medium mt-0.5">{d.specialization}</div>
              <div className="text-slate-400 mt-1">
                {d.department} • {d.qualification}
              </div>
              <div className="text-slate-500 mt-1 font-mono">
                Reg No: {d.medicalCouncilRegNo}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between font-mono">
                <div>
                  <div className="text-slate-500 text-[11px]">Consultation Fee</div>
                  <div className="text-slate-200 font-bold">₹{d.opdSettings?.consultationFee || 500}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-[11px]">Commission Tier</div>
                  <div className="text-emerald-400 font-bold">
                    {d.referralCommission?.isEligible
                      ? `${d.referralCommission.defaultPercentage}%`
                      : 'In-House'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-slate-400">
                <i className="fa-solid fa-phone text-sky-400 mr-1"></i> {d.contact.phone}
              </span>
              <button
                onClick={() => showSchedule(d)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg transition font-semibold"
              >
                <i className="fa-solid fa-calendar-days mr-1"></i> Slots
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
