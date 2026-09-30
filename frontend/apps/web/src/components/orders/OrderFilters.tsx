"use client";

import React, {
  ChangeEvent,
} from "react";

interface OrderFiltersProps {
  search: string;
  status: string;
  priority: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
}

export default function OrderFilters({
  search,
  status,
  priority,
  paymentStatus,
  dateFrom,
  dateTo,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onPaymentStatusChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: OrderFiltersProps) {
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

  function handlePriority(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    onPriorityChange(event.target.value);
  }

  function handlePaymentStatus(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    onPaymentStatusChange(
      event.target.value
    );
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
    Boolean(priority) ||
    Boolean(paymentStatus) ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {/* Search */}

        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Search Orders
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Order no., patient name..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
          </div>
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

            <option value="pending">
              Pending
            </option>

            <option value="processing">
              Processing
            </option>

            <option value="collected">
              Collected
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {/* Priority */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Priority
          </label>

          <select
            value={priority}
            onChange={handlePriority}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">
              All priorities
            </option>

            <option value="NORMAL">
              Normal
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="URGENT">
              Urgent
            </option>

            <option value="STAT">
              STAT
            </option>
          </select>
        </div>

        {/* Payment */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Payment
          </label>

          <select
            value={paymentStatus}
            onChange={handlePaymentStatus}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">
              All payments
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="partial">
              Partially Paid
            </option>

            <option value="pending">
              Pending
            </option>
          </select>
        </div>

        {/* Date From */}

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

        {/* Date To */}

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
          Filter orders by patient, status,
          priority, payment and date.
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