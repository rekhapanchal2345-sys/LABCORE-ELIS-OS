"use client";

import React, { ChangeEvent, useState } from "react";

interface ApprovalFiltersProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: { status: string; dateFrom: string; dateTo: string; department?: string; filter?: string }) => void;
  viewMode?: "workstation" | "table";
  onViewModeChange?: (mode: "workstation" | "table") => void;
  activeFilter?: string;
  onSelectFilterPill?: (pill: string) => void;
  onOpenRules?: () => void;
}

export default function ApprovalFilters({
  onSearch,
  onFilterChange,
  viewMode = "table",
  onViewModeChange,
  activeFilter = "pending",
  onSelectFilterPill,
  onOpenRules,
}: ApprovalFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [department, setDepartment] = useState("");

  const quickPills = [
    { key: "pending", label: "⏳ Ready to Sign (Verified)", status: "VERIFIED", filter: "", accent: "cyan" },
    { key: "pipeline", label: "📋 All Registered & Lab Pipeline", status: "", filter: "pipeline", accent: "blue" },
    { key: "critical", label: "🚨 Critical & Panic Only", status: "VERIFIED", filter: "critical", accent: "rose" },
    { key: "normal", label: "⚡ 100% Normal (Clean)", status: "VERIFIED", filter: "normal", accent: "emerald" },
    { key: "abnormal", label: "⚠️ Abnormal Values", status: "VERIFIED", filter: "abnormal", accent: "amber" },
    { key: "rerun", label: "🔄 Returned & Rerun", status: "ENTERED", filter: "", accent: "orange" },
    { key: "approved", label: "📜 Signed Archive", status: "APPROVED", filter: "", accent: "violet" },
  ];

  const accentActiveMap: Record<string, string> = {
    cyan: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-500/40",
    blue: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-500/40",
    rose: "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-500/40 animate-pulse",
    emerald: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-500/40",
    amber: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 ring-1 ring-amber-400/40",
    orange: "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30 ring-1 ring-orange-500/40",
    violet: "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-500/40",
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearch(value);
  };

  const handleDepartmentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDepartment(value);
    onFilterChange({ status, dateFrom, dateTo, department: value });
  };

  const handleDateFromChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateFrom(value);
    onFilterChange({ status, dateFrom: value, dateTo, department });
  };

  const handleDateToChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateTo(value);
    onFilterChange({ status, dateFrom, dateTo: value, department });
  };

  const handlePillClick = (pill: typeof quickPills[0]) => {
    setStatus(pill.status);
    if (onSelectFilterPill) {
      onSelectFilterPill(pill.key);
    }
    onFilterChange({
      status: pill.status,
      dateFrom,
      dateTo,
      department,
      filter: pill.filter,
    });
  };

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setDepartment("");
    onSearch("");
    if (onSelectFilterPill) onSelectFilterPill("pending");
    onFilterChange({ status: "VERIFIED", dateFrom: "", dateTo: "", department: "", filter: "" });
  };

  const hasFilters =
    Boolean(search) ||
    Boolean(status && status !== "VERIFIED") ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    Boolean(department);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-950/80 space-y-4">
      {/* Top row: Quick Pills & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {quickPills.map((pill) => {
            const isPillActive = activeFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => handlePillClick(pill)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  isPillActive
                    ? accentActiveMap[pill.accent]
                    : "border border-slate-700/60 bg-slate-900/80 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher & Policy trigger */}
        <div className="flex items-center gap-2">
          {onOpenRules && (
            <button
              type="button"
              onClick={onOpenRules}
              className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>🛡️</span>
              <span>Sign-Off Policies</span>
            </button>
          )}

          {onViewModeChange && (
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => onViewModeChange("workstation")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === "workstation"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                <span>🩺</span>
                <span>Workstation</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("table")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                <span>📊</span>
                <span>Dense Table</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Filter Inputs */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Instant Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              🔍
            </span>
            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search Patient, UHID, Barcode, Test..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Laboratory Section
          </label>
          <select
            value={department}
            onChange={handleDepartmentChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
          >
            <option value="">All Departments</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Hematology">Hematology</option>
            <option value="Microbiology">Microbiology</option>
            <option value="Immunology">Immunology / Serology</option>
            <option value="Clinical Pathology">Clinical Pathology</option>
            <option value="Histopathology">Histopathology</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            From Date
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={handleDateFromChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            To Date
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={handleDateToChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasFilters}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </section>
  );
}