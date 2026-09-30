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
    { key: "pending", label: "⏳ Ready to Sign (Verified)", status: "VERIFIED", filter: "" },
    { key: "pipeline", label: "📋 All Registered & Lab Pipeline", status: "", filter: "pipeline" },
    { key: "critical", label: "🚨 Critical & Panic Only", status: "VERIFIED", filter: "critical" },
    { key: "normal", label: "⚡ 100% Normal (Clean)", status: "VERIFIED", filter: "normal" },
    { key: "abnormal", label: "⚠️ Abnormal Values", status: "VERIFIED", filter: "abnormal" },
    { key: "rerun", label: "🔄 Returned & Rerun", status: "ENTERED", filter: "" },
    { key: "approved", label: "📜 Signed Archive", status: "APPROVED", filter: "" },
  ];

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
    <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
      {/* Top row: Quick Pills & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
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
                    ? pill.key === "critical"
                      ? "bg-red-600 text-white shadow-sm ring-2 ring-red-300"
                      : "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300"
                    : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/70"
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
              className="rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>🛡️</span>
              <span>Sign-Off Policies</span>
            </button>
          )}

          {onViewModeChange && (
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => onViewModeChange("workstation")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === "workstation"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
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
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
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
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Instant Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search Patient, UHID, Barcode, Test..."
              className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Laboratory Section
          </label>
          <select
            value={department}
            onChange={handleDepartmentChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
            From Date
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={handleDateFromChange}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
            To Date
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={handleDateToChange}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasFilters}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </section>
  );
}