"use client";

import { 
  Users, 
  FileText, 
  TestTube, 
  CheckCircle2, 
  CreditCard, 
  Activity,
  QrCode,
  ArrowUpRight,
  Sparkles
} from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: string[];
  shortcut: string;
  badge?: string;
  gradient: string;
  iconColor: string;
}

interface QuickActionsProps {
  userRole?: string;
}

export default function QuickActions({ userRole }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      title: "New Patient Registration",
      description: "Fast intake & demographics",
      href: "/patients/new",
      icon: Users,
      allowedRoles: ["ADMIN", "FRONT_DESK"],
      shortcut: "Alt + P",
      gradient: "from-sky-500/10 to-blue-500/10",
      iconColor: "text-sky-600 bg-sky-50 border-sky-200",
    },
    {
      title: "New Diagnostic Order",
      description: "Test requisition & bill entry",
      href: "/orders/new",
      icon: FileText,
      allowedRoles: ["ADMIN", "FRONT_DESK", "DOCTOR"],
      shortcut: "Alt + O",
      badge: "Popular",
      gradient: "from-indigo-500/10 to-violet-500/10",
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      title: "Sample Accession & Barcode",
      description: "Phlebotomy & tube printing",
      href: "/samples",
      icon: TestTube,
      allowedRoles: ["ADMIN", "LAB_TECH"],
      shortcut: "Alt + S",
      gradient: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Enter Test Results",
      description: "Biochemistry & hematology entry",
      href: "/results",
      icon: Activity,
      allowedRoles: ["ADMIN", "LAB_TECH", "PATHOLOGIST"],
      shortcut: "Alt + R",
      gradient: "from-teal-500/10 to-emerald-500/10",
      iconColor: "text-teal-600 bg-teal-50 border-teal-200",
    },
    {
      title: "Pathologist Sign-off",
      description: "Medical verification queue",
      href: "/approvals",
      icon: CheckCircle2,
      allowedRoles: ["ADMIN", "PATHOLOGIST"],
      shortcut: "Alt + A",
      badge: "Priority",
      gradient: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Billing & Instant Invoice",
      description: "Generate bill, receipt & UPI QR",
      href: "/invoices",
      icon: CreditCard,
      allowedRoles: ["ADMIN", "FRONT_DESK"],
      shortcut: "Alt + B",
      gradient: "from-violet-500/10 to-purple-500/10",
      iconColor: "text-violet-600 bg-violet-50 border-violet-200",
    },
  ];

  const filteredActions = userRole
    ? actions.filter((a) => !a.allowedRoles || a.allowedRoles.includes(userRole))
    : actions;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Rapid Command Shortcuts
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              Keyboard Enabled
            </span>
          </h2>
          <p className="text-xs text-slate-500">Frequently triggered laboratory front-desk & clinical workflows</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {filteredActions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.title}
              href={action.href}
              className="group relative p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/60 hover:border-sky-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${action.iconColor} transition-transform duration-200 group-hover:scale-105`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  {action.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">
                      {action.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-xs text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                  {action.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {action.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/60">
                  {action.shortcut}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-sky-600 transition-colors" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}