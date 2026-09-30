"use client";

import React, { ChangeEvent } from "react";

interface ResultFiltersProps {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  department: string;
  testName: string;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onTestNameChange: (value: string) => void;
  onReset: () => void;
}

export default function ResultFilters({
  search,
  status,
  dateFrom,
  dateTo,
  department,
  testName,
  onSearchChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onDepartmentChange,
  onTestNameChange,
  onReset,
}: ResultFiltersProps) {
  const hasFilters =
    Boolean(search) ||
    Boolean(status) ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    Boolean(department) ||
    Boolean(testName);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Search Results
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="search"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onSearchChange(e.target.value)
              }
              placeholder="Patient, test, result ID..."
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
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onStatusChange(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ENTERED">Entered</option>
            <option value="VERIFIED">Verified</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Department
          </label>

          <select
            value={department}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onDepartmentChange(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">All departments</option>
            <option value="Hematology">Hematology</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Microbiology">Microbiology</option>
            <option value="Immunology">Immunology</option>
            <option value="Histopathology">Histopathology</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Test Name
          </label>

          <input
            type="text"
            value={testName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onTestNameChange(e.target.value)
            }
            placeholder="Filter by test..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Date Range
          </label>

          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onDateFromChange(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-2 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onDateToChange(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-2 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          Filter laboratory results by patient, test, department, status and date.
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