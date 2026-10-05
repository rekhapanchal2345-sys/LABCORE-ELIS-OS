import React from 'react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  panicCount: number;
  currentDoctor: {
    name: string;
    title: string;
    department: string;
  };
}

export const DoctorNavigation: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  panicCount,
  currentDoctor
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
    { id: 'verification', label: 'Pathologist Review', icon: 'fa-microscope', badge: panicCount > 0 },
    { id: 'prescriptions', label: 'E-Prescription & CPOE', icon: 'fa-file-prescription' },
    { id: 'referrals', label: 'Referral Accounting', icon: 'fa-hand-holding-dollar' },
    { id: 'emr', label: 'Patient EMR Trends', icon: 'fa-chart-line' },
    { id: 'doctors', label: 'Doctor Roster', icon: 'fa-user-doctor' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black text-xl">
            <i className="fa-solid fa-staff-snake"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-teal-300 to-white">
                LabCore ELIS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Doctor & LIMS PRO
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Enterprise Hospital & Laboratory Information System</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/20 text-white border border-sky-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Doctor Identity */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-200">{currentDoctor.name}</div>
            <div className="text-[11px] text-teal-400 font-medium">{currentDoctor.title}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-sm shadow">
            <i className="fa-solid fa-user-shield"></i>
          </div>
        </div>

      </div>
    </header>
  );
};
