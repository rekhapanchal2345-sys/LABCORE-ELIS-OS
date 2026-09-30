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
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Search
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Sample, barcode, patient..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Status
          </label>

          <select
            value={status}
            onChange={handleStatus}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
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
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Sample Type
          </label>

          <select
            value={sampleType}
            onChange={handleSampleType}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
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
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            From
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={handleDateFrom}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            To
          </label>

          <input
            type="date"
            value={dateTo}
            onChange={handleDateTo}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          Filter samples by barcode, patient, status,
          type and collection date.
        </p>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasFilters}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset Filters
        </button>
      </div>
    </section>
  );
}