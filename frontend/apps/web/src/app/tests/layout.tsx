"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import {
  FlaskConical,
  PlusCircle,
  FolderTree,
  Sliders,
  Scale,
  Package,
  ShieldCheck,
  Sparkles,
  Brain,
} from "lucide-react";

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/tests", label: "Diagnostic Test Catalog", icon: FlaskConical, exact: true },
    { href: "/tests/new", label: "Add Investigation", icon: PlusCircle },
    { href: "/tests/categories", label: "Lab Departments", icon: FolderTree },
    { href: "/tests/parameters", label: "Analyte Parameters", icon: Sliders },
    { href: "/tests/reference-ranges", label: "Biological Intervals", icon: Scale },
    { href: "/tests/packages", label: "Health Packages", icon: Package },
    { href: "/tests/training", label: "Clinical AI Training", icon: Brain },
  ];

  return (
    <DashboardLayout title="Diagnostic Directory & Pathology Master">
      <div className="space-y-6">
        {/* Hospital Grade Sub-Navigation Ribbon (Light White Professional UI) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 py-1">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 border border-blue-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Accreditation Badge */}
            <div className="hidden lg:flex items-center gap-2.5 pr-2 text-xs font-semibold text-slate-600 border-l border-slate-200 pl-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-800 leading-tight">ISO 15189 &amp; NABL Accredited</span>
                <span className="text-[10px] text-slate-500 leading-tight">CAP Validated Specimen Master</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
}
