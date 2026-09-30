"use client";

import React, { ChangeEvent } from "react";

interface AuditFiltersProps {
  search: string;
  action: string;
  entity: string;
  role: string;
  dateFrom: string;
  dateTo: string;

  onSearchChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onEntityChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
}

export default function AuditFilters({
  search,
  action,
  entity,
  role,
  dateFrom,
  dateTo,
  onSearchChange,
  onActionChange,
  onEntityChange,
  onRoleChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: AuditFiltersProps) {
  const hasFilters =
    Boolean(search) ||
    Boolean(action) ||
    Boolean(entity) ||
    Boolean(role) ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Search Activity
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
              placeholder="User, description, IP..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Action
          </label>

          <select
            value={action}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onActionChange(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">All actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
            <option value="VIEW">View</option>
            <option value="EXPORT">Export</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Entity
          </label>

          <select
            value={entity}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onEntityChange(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">All entities</option>
            <option value="User">User</option>
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Test">Test</option>
            <option value="Order">Order</option>
            <option value="Invoice">Invoice</option>
            <option value="Payment">Payment</option>
            <option value="Result">Result</option>
            <option value="Report">Report</option>
            <option value="Analyzer">Analyzer</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Role
          </label>

          <select
            value={role}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onRoleChange(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="LAB_TECH">Lab Tech</option>
            <option value="PATHOLOGIST">Pathologist</option>
            <option value="DOCTOR">Doctor</option>
            <option value="FRONT_DESK">Front Desk</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            From Date
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onDateFromChange(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            To Date
          </label>

          <input
            type="date"
            value={dateTo}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onDateToChange(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          Audit logs provide a traceable history of
          important system activity.
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