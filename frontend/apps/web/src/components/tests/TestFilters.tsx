"use client";

import React, {
  ChangeEvent,
} from "react";

interface TestFiltersProps {
  search: string;
  category: string;
  department: string;
  status: string;
  sampleType: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSampleTypeChange: (value: string) => void;
  onReset: () => void;
  categories?: string[];
  departments?: string[];
  sampleTypes?: string[];
}

export default function TestFilters({
  search,
  category,
  department,
  status,
  sampleType,
  onSearchChange,
  onCategoryChange,
  onDepartmentChange,
  onStatusChange,
  onSampleTypeChange,
  onReset,
  categories = [],
  departments = [],
  sampleTypes = [],
}: TestFiltersProps) {
  function handleSearch(
    event: ChangeEvent<HTMLInputElement>
  ) {
    onSearchChange(event.target.value);
  }

  function handleCategory(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    onCategoryChange(event.target.value);
  }

  function handleDepartment(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    onDepartmentChange(event.target.value);
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

  const hasFilters =
    Boolean(search) ||
    Boolean(category) ||
    Boolean(department) ||
    Boolean(status) ||
    Boolean(sampleType);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Search */}

        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Search Tests
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Search test name or code..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
          </div>
        </div>

        {/* Category */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Category
          </label>

          <select
            value={category}
            onChange={handleCategory}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">
              All categories
            </option>

            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Department
          </label>

          <select
            value={department}
            onChange={handleDepartment}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">
              All departments
            </option>

            {departments.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}

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

        {/* Sample Type */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Sample Type
          </label>

          <select
            value={sampleType}
            onChange={handleSampleType}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">
              All samples
            </option>

            {sampleTypes.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          Filter tests by category,
          department, sample or status.
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