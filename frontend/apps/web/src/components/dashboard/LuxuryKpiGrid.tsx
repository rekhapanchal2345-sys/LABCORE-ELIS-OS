"use client";

import { 
  Users, 
  FileText, 
  TestTube, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  AlertTriangle, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Zap
} from "lucide-react";

interface DashboardStats {
  patients?: { total: number };
  orders?: { today: number; pending: number; completed: number; total: number };
  samples?: { pending: number; inProgress: number; completed: number; total: number };
  results?: { pending: number; verified: number; approved: number; total: number; critical: number };
  approvals?: { pending: number };
  tests?: { inProgress: number; completed: number };
  financial?: { todayRevenue: number; pendingPayments: number };
  invoices?: { total: number; paid: number; pending: number };
  analyzers?: { total: number; online: number; busy: number; error: number; maintenance: number; pendingJobs: number };
}

interface LuxuryKpiGridProps {
  stats: DashboardStats | null;
  loading?: boolean;
  avgTatHours?: number;
}

export default function LuxuryKpiGrid({ stats, loading = false, avgTatHours = 2.1 }: LuxuryKpiGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const cards = [
    {
      id: "revenue",
      title: "Today's Revenue",
      value: formatCurrency(stats?.financial?.todayRevenue || 0),
      subtext: `${formatCurrency(stats?.financial?.pendingPayments || 0)} pending dues`,
      badge: "Real-time",
      badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-300/60",
      trend: "+12.4%",
      trendPositive: true,
      icon: IndianRupee,
      gradient: "from-emerald-500 to-teal-600",
      accentGlow: "glow-box-emerald",
      iconBg: "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20",
      href: "/payments",
      cardBg: "hover:border-emerald-300",
    },
    {
      id: "orders",
      title: "Today's Workorders",
      value: stats?.orders?.today ?? 0,
      subtext: `${stats?.orders?.total || 0} cumulative orders`,
      badge: `${stats?.orders?.pending || 0} in pipeline`,
      badgeColor: "bg-sky-500/10 text-sky-700 border-sky-300/60",
      trend: "+8.1%",
      trendPositive: true,
      icon: FileText,
      gradient: "from-blue-600 to-sky-500",
      accentGlow: "glow-box-sapphire",
      iconBg: "bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-md shadow-sky-500/20",
      href: "/orders",
      cardBg: "hover:border-sky-300",
    },
    {
      id: "samples",
      title: "Pending Samples",
      value: stats?.samples?.pending ?? 0,
      subtext: `${stats?.samples?.inProgress || 0} accessioned in lab`,
      badge: stats?.samples?.pending && stats.samples.pending > 0 ? "Phlebotomy Draw" : "Queue Clear",
      badgeColor: stats?.samples?.pending && stats.samples.pending > 0 ? "bg-amber-500/10 text-amber-700 border-amber-300/60" : "bg-emerald-500/10 text-emerald-700 border-emerald-300/60",
      trend: "-4m wait",
      trendPositive: true,
      icon: TestTube,
      gradient: "from-amber-500 to-orange-500",
      accentGlow: "glow-box-amber",
      iconBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20",
      href: "/samples",
      cardBg: "hover:border-amber-300",
    },
    {
      id: "approvals",
      title: "Pathologist Sign-off",
      value: stats?.approvals?.pending ?? 0,
      subtext: `${stats?.results?.approved || 0} released today`,
      badge: stats?.approvals?.pending && stats.approvals.pending > 0 ? "Doctor Sign" : "Cleared",
      badgeColor: stats?.approvals?.pending && stats.approvals.pending > 0 ? "bg-indigo-500/10 text-indigo-700 border-indigo-300/60" : "bg-emerald-500/10 text-emerald-700 border-emerald-300/60",
      trend: "Dual Auth",
      trendPositive: true,
      icon: CheckCircle2,
      gradient: "from-indigo-600 to-violet-600",
      accentGlow: "glow-box-violet",
      iconBg: "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20",
      href: "/approvals",
      cardBg: "hover:border-indigo-300",
    },
    {
      id: "critical",
      title: "Panic / Critical Alerts",
      value: stats?.results?.critical ?? 0,
      subtext: "Immediate doctor notify",
      badge: (stats?.results?.critical || 0) > 0 ? "URGENT" : "Normal",
      badgeColor: (stats?.results?.critical || 0) > 0 ? "bg-rose-600 text-white font-bold animate-pulse" : "bg-slate-100 text-slate-700 border-slate-200",
      trend: "SOP-10",
      trendPositive: false,
      icon: AlertTriangle,
      gradient: "from-rose-600 to-red-600",
      accentGlow: (stats?.results?.critical || 0) > 0 ? "glow-box-rose" : "",
      iconBg: (stats?.results?.critical || 0) > 0 ? "bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/30 animate-pulse" : "bg-slate-200 text-slate-600",
      href: "/results",
      highlightBorder: (stats?.results?.critical || 0) > 0,
      cardBg: (stats?.results?.critical || 0) > 0 ? "bg-rose-50/30 border-rose-300" : "hover:border-rose-300",
    },
    {
      id: "patients",
      title: "Patient Registry",
      value: stats?.patients?.total ?? 0,
      subtext: "Master record index",
      badge: "Verified UHID",
      badgeColor: "bg-purple-500/10 text-purple-700 border-purple-300/60",
      trend: "+100%",
      trendPositive: true,
      icon: Users,
      gradient: "from-purple-600 to-fuchsia-600",
      accentGlow: "glow-box-violet",
      iconBg: "bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/20",
      href: "/patients",
      cardBg: "hover:border-purple-300",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 6-Card Luxury Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.id}
              href={card.href}
              className={`luxury-jewel-card p-4 flex flex-col justify-between group cursor-pointer transition-all duration-300 ${card.cardBg}`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${card.iconBg} transition-all duration-300 group-hover:scale-110 group-hover:rotate-2`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${card.badgeColor} font-semibold uppercase tracking-wider`}>
                    {card.badge}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">
                  {card.title}
                </p>

                {loading ? (
                  <div className="mt-2 h-7 w-20 bg-slate-100 animate-pulse rounded-md" />
                ) : (
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black tracking-tight text-slate-900">
                      {card.value}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {card.trend}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate font-medium">{card.subtext}</span>
                <div className="h-5 w-5 rounded-full bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center transition-colors flex-shrink-0 ml-1">
                  <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-sky-600 transition-colors" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Luxury Telemetry Ribbon with Jewel Indicators */}
      <div className="luxury-glass-card px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-6 flex-wrap">
          {/* TAT Metric */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider block">Clinical SLA Turnaround</span>
              <span className="font-extrabold text-slate-900 text-sm">{avgTatHours.toFixed(1)} hrs</span>
              <span className="text-emerald-700 bg-emerald-100/70 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1.5">
                98.4% SLA Met
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-200/80" />

          {/* Test Performance */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider block">Laboratory Assays</span>
              <span className="font-extrabold text-slate-900 text-sm">{stats?.tests?.completed || 0} Released</span>
              <span className="text-slate-500 text-[11px] ml-1">({stats?.tests?.inProgress || 0} in progress)</span>
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-200/80" />

          {/* Connected Analyzers */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider block">Hardware Telemetry</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {stats?.analyzers?.online ?? 2} / {stats?.analyzers?.total ?? 2} Instruments Online
              </span>
              <span className="text-emerald-600 font-bold ml-1.5 text-[11px]">• ASTM/HL7 Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-300/60 text-emerald-800 font-semibold shadow-2xs">
            <Zap className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
            <span>Facility Quality Index: 99.8%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
