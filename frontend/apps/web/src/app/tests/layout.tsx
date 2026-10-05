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
  ChevronRight
} from "lucide-react";

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/tests", label: "Master Test Catalog", icon: FlaskConical, exact: true },
    { href: "/tests/new", label: "Add Investigation", icon: PlusCircle },
    { href: "/tests/categories", label: "Lab Departments", icon: FolderTree },
    { href: "/tests/parameters", label: "Analyte Parameters", icon: Sliders },
    { href: "/tests/reference-ranges", label: "Biological Intervals", icon: Scale },
    { href: "/tests/packages", label: "Health Packages", icon: Package },
  ];

  return (
    <DashboardLayout title="Diagnostic Directory & Pathology Master">
      <div className="space-y-6">
        {/* Hospital Grade Sub-Navigation Ribbon */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl p-2 shadow-2xl">
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
                    className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Accreditation Badge */}
            <div className="hidden lg:flex items-center gap-2 pr-2 text-[11px] font-semibold text-slate-400 border-l border-slate-800 pl-4">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>NABL & ISO 15189 Master Specimen Directory</span>
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

