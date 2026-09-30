"use client";

import { 
  FileText, 
  TestTube, 
  Cpu, 
  FileCheck, 
  CheckCircle2, 
  Send,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";

interface SpecimenPipelineProps {
  ordersCount: number;
  samplesCollected: number;
  testingCount: number;
  resultsPending: number;
  approvedCount: number;
  completedCount: number;
  loading?: boolean;
}

export default function SpecimenPipeline({
  ordersCount = 0,
  samplesCollected = 0,
  testingCount = 0,
  resultsPending = 0,
  approvedCount = 0,
  completedCount = 0,
  loading = false,
}: SpecimenPipelineProps) {
  const steps = [
    {
      id: "orders",
      stepNum: "01",
      title: "Order Intake",
      description: "Registered & Billed",
      count: ordersCount,
      icon: FileText,
      gradient: "from-sky-500 to-blue-600",
      textColor: "text-sky-600",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
      activeGlow: "border-sky-400/80 shadow-sky-100",
      href: "/orders",
    },
    {
      id: "collection",
      stepNum: "02",
      title: "Sample Accession",
      description: "Phlebotomy & Barcode",
      count: samplesCollected,
      icon: TestTube,
      gradient: "from-amber-500 to-orange-600",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      activeGlow: "border-amber-400/80 shadow-amber-100",
      href: "/samples",
    },
    {
      id: "testing",
      stepNum: "03",
      title: "Analyzer Run",
      description: "Automated Assays",
      count: testingCount,
      icon: Cpu,
      gradient: "from-indigo-500 to-purple-600",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      activeGlow: "border-indigo-400/80 shadow-indigo-100",
      href: "/analyzers",
    },
    {
      id: "review",
      stepNum: "04",
      title: "Tech Validation",
      description: "Result Input & QC",
      count: resultsPending,
      icon: FileCheck,
      gradient: "from-teal-500 to-emerald-600",
      textColor: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      activeGlow: "border-teal-400/80 shadow-teal-100",
      href: "/results",
    },
    {
      id: "signoff",
      stepNum: "05",
      title: "Pathologist Sign-off",
      description: "Doctor Sign-off",
      count: approvedCount,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      activeGlow: "border-emerald-400/80 shadow-emerald-100",
      href: "/approvals",
    },
    {
      id: "dispatch",
      stepNum: "06",
      title: "Report Dispatched",
      description: "PDF & WhatsApp Delivered",
      count: completedCount,
      icon: Send,
      gradient: "from-purple-500 to-violet-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      activeGlow: "border-purple-400/80 shadow-purple-100",
      href: "/reports",
    },
  ];

  const totalWorkflow = steps.reduce((sum, s) => sum + (s.count || 0), 0);
  const completionRate = totalWorkflow > 0 ? Math.round((completedCount / totalWorkflow) * 100) : 100;

  return (
    <div className="luxury-glass-card p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
      {/* Subtle background ambient line */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-tl from-sky-400/5 to-transparent rounded-full pointer-events-none blur-3xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Specimen Progression Funnel
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Live Conveyor
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              End-to-end diagnostic sample transit from phlebotomy chair to clinician delivery
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block font-medium">Batch Release Rate</span>
            <span className="text-sm font-extrabold text-slate-900">{completionRate}% Completed</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
            <span className="text-slate-400">Total Active:</span>
            <span className="text-slate-900 font-bold text-sm">{totalWorkflow}</span>
          </div>
        </div>
      </div>

      {/* Stepper Pipeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const hasActiveItems = step.count > 0;
          return (
            <a
              key={step.id}
              href={step.href}
              className={`relative p-3.5 rounded-2xl border transition-all duration-300 group flex flex-col justify-between ${
                hasActiveItems
                  ? `bg-white ${step.activeGlow} shadow-sm hover:shadow-md`
                  : "bg-white/80 border-slate-200/70 hover:border-slate-300"
              }`}
            >
              {/* Step Number Tag */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {step.stepNum}
                </span>

                {hasActiveItems && (
                  <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r ${step.gradient} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r ${step.gradient}`} />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-xl ${step.bgColor} ${step.textColor} flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-tight">
                    {step.title}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {step.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Items:</span>
                {loading ? (
                  <div className="h-5 w-8 bg-slate-100 animate-pulse rounded" />
                ) : (
                  <span className={`text-base font-black ${step.textColor}`}>
                    {step.count}
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
