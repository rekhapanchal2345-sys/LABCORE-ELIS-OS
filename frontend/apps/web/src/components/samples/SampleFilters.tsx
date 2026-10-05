"use client";

import React, { ChangeEvent } from "react";

interface SampleFiltersProps {
  search: string;
  status: string;
  sampleType: string;
  dateFrom: string;
  dateTo: string;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSampleTypeChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
}

export default function SampleFilters({
  search,
  status,
  sampleType,
  dateFrom,
  dateTo,
  onSearchChange,
  onStatusChange,
  onSampleTypeChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: SampleFiltersProps) {
  function handleSearch(
    event: ChangeEvent<HTMLInputElement>
  ) {
    onSearchChange(event.target.value);
  }

  function handleStatus(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    onStatusChange(event.target.value);
  }

  function handleSampleType(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    onSampleTypeChange(event.target.value);
  }

  function handleDateFrom(
    event: ChangeEvent<HTMLInputElement>
  ) {
    onDateFromChange(event.target.value);
  }

  function handleDateTo(
    event: ChangeEvent<HTMLInputElement>
  ) {
    onDateToChange(event.target.value);
  }

  const hasFilters =
    Boolean(search) ||
    Boolean(status) ||
    Boolean(sampleType) ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Search
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>

            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Sample, barcode, patient..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Status
          </label>

          <select
            value={status}
            onChange={handleStatus}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="collected">Collected</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Sample Type
          </label>

          <select
            value={sampleType}
            onChange={handleSampleType}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
          >
            <option value="">All types</option>
            <option value="Blood">Blood</option>
            <option value="Serum">Serum</option>
            <option value="Plasma">Plasma</option>
            <option value="Urine">Urine</option>
            <option value="Stool">Stool</option>
            <option value="Swab">Swab</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            From
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={handleDateFrom}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            To
          </label>

          <input
            type="date"
            value={dateTo}
            onChange={handleDateTo}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
        <p className="text-xs text-slate-400">
          Filter samples by barcode, patient, status, type and collection date.
        </p>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasFilters}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset Filters
        </button>
      </div>
    </section>
  );
}