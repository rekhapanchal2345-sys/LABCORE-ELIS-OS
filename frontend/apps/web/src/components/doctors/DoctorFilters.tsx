"use client";

import React, {
  ChangeEvent,
} from "react";

interface DoctorFiltersProps {
  search: string;
  specialization: string;
  status: string;
  onSearchChange: (value: string) => void;
  onSpecializationChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
  specializations?: string[];
}

export default function DoctorFilters({
  search,
  specialization,
  status,
  onSearchChange,
  onSpecializationChange,
  onStatusChange,
  onReset,
  specializations = [],
}: DoctorFiltersProps) {
  function handleSearch(
    event: ChangeEvent<HTMLInputElement>
  ) {
    onSearchChange(event.target.value);
  }

  function handleSpecialization(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    onSpecializationChange(
      event.target.value
    );
  }

  function handleStatus(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    onStatusChange(event.target.value);
  }

  const hasFilters =
    Boolean(search) ||
    Boolean(specialization) ||
    Boolean(status);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Search Doctors
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, ID, phone or email..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Specialization
          </label>

          <select
            value={specialization}
            onChange={handleSpecialization}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">
              All specializations
            </option>

            {specializations.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
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
            <option value="">
              All statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          Filter doctors by name,
          specialization or status.
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