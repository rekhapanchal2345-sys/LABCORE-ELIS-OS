"use client";

import React, { ChangeEvent } from "react";

interface AnalyzerFiltersProps {
  search: string;
  status: string;
  connectionType: string;
  manufacturer: string;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onConnectionTypeChange: (value: string) => void;
  onManufacturerChange: (value: string) => void;
  onReset: () => void;
}

export default function AnalyzerFilters({
  search,
  status,
  connectionType,
  manufacturer,
  onSearchChange,
  onStatusChange,
  onConnectionTypeChange,
  onManufacturerChange,
  onReset,
}: AnalyzerFiltersProps) {
  const hasFilters =
    Boolean(search) ||
    Boolean(status) ||
    Boolean(connectionType) ||
    Boolean(manufacturer);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Search Analyzer
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
              placeholder="Name, code, model, serial..."
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
            <option value="online">Online</option>
            <option value="connected">Connected</option>
            <option value="active">Active</option>
            <option value="offline">Offline</option>
            <option value="disconnected">
              Disconnected
            </option>
            <option value="maintenance">
              Maintenance
            </option>
            <option value="error">Error</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Connection
          </label>

          <select
            value={connectionType}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onConnectionTypeChange(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">All connections</option>
            <option value="ASTM">ASTM</option>
            <option value="HL7">HL7</option>
            <option value="TCP/IP">TCP/IP</option>
            <option value="HTTP">HTTP</option>
            <option value="Serial">Serial</option>
            <option value="File">File</option>
            <option value="API">API</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Manufacturer
          </label>

          <input
            type="text"
            value={manufacturer}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onManufacturerChange(e.target.value)
            }
            placeholder="e.g. Abbott"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          Filter analyzers by connection, manufacturer
          and current device status.
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