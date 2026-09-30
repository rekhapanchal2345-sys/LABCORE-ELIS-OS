"use client";

import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck,
  Timer
} from "lucide-react";

interface TurnaroundTimeWidgetProps {
  averageTatHours?: number;
  sampleStats?: any;
  loading?: boolean;
}

export default function TurnaroundTimeWidget({
  averageTatHours = 2.2,
  sampleStats,
  loading = false,
}: TurnaroundTimeWidgetProps) {
  const departments = [
    {
      name: "Hematology (CBC, ESR)",
      tat: "1.2 hrs",
      target: "2.0 hrs",
      compliance: 99.1,
      status: "optimal",
    },
    {
      name: "Biochemistry (LFT, KFT, Lipids)",
      tat: "2.4 hrs",
      target: "3.5 hrs",
      compliance: 97.8,
      status: "optimal",
    },
    {
      name: "Immunology / Hormones (TSH, Vitamin D)",
      tat: "3.1 hrs",
      target: "4.0 hrs",
      compliance: 96.5,
      status: "optimal",
    },
    {
      name: "Microbiology & Cultures",
      tat: "24.0 hrs",
      target: "48.0 hrs",
      compliance: 98.9,
      status: "optimal",
    },
  ];

  return (
    <div className="luxury-glass-card p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                Turnaround Time (TAT) & SLA Quality
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  NABL / CAP Target
                </span>
              </h3>
              <p className="text-xs text-slate-500">Specimen receipt-to-report release time metrics</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">SLA Target Met</span>
            <p className="text-sm font-bold text-emerald-600">98.4%</p>
          </div>
        </div>

        {/* Hero SLA Metric Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50/70 via-blue-50/50 to-indigo-50/60 border border-sky-100 my-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">Overall Lab Avg TAT</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">
                {averageTatHours.toFixed(1)} <span className="text-sm font-semibold text-slate-500">hours</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> -14m vs Last Week
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Based on certified released samples in current period</p>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-sky-200/60 flex items-center justify-center text-sky-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Department SLA Progress Bars */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Departmental Turnaround Benchmarks</p>
          {departments.map((dept, i) => (
            <div key={i} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/40">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">{dept.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{dept.tat}</span>
                  <span className="text-slate-400">/ target {dept.target}</span>
                  <span className="text-[11px] font-bold text-emerald-600">({dept.compliance}%)</span>
                </div>
              </div>

              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${dept.compliance}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 text-slate-600">
          <ShieldCheck className="h-3.5 w-3.5 text-sky-600" /> Automated SLA Alerts Enabled
        </span>
        <span className="text-emerald-600 font-semibold">Zero Critical Delays</span>
      </div>
    </div>
  );
}
