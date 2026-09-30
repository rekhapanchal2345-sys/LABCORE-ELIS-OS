"use client";

import React from "react";
import Link from "next/link";
import type { Analyzer } from "./AnalyzerTable";

interface AnalyzerCardProps {
  analyzer: Analyzer;
  onTestConnection?: (analyzer: Analyzer) => void;
  onDelete?: (analyzer: Analyzer) => void;
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status?: string) {
  const value = status?.toLowerCase();

  if (
    value === "online" ||
    value === "connected" ||
    value === "active"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    value === "offline" ||
    value === "disconnected" ||
    value === "inactive" ||
    value === "error"
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    value === "maintenance" ||
    value === "warning"
  ) {
    return "bg-yellow-50 text-yellow-700";
  }

  return "bg-gray-100 text-gray-600";
}

export default function AnalyzerCard({
  analyzer,
  onTestConnection,
  onDelete,
}: AnalyzerCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
            ⚙️
          </div>

          <div className="min-w-0">
            <Link
              href={`/analyzers/${analyzer.id}`}
              className="block truncate text-base font-semibold text-gray-900 hover:underline"
            >
              {analyzer.name ||
                `Analyzer #${analyzer.id}`}
            </Link>

            <p className="mt-1 font-mono text-xs text-gray-400">
              {analyzer.code ||
                `AN-${analyzer.id}`}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
            analyzer.status
          )}`}
        >
          {analyzer.status || "Unknown"}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">
              Manufacturer
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              {analyzer.manufacturer || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Model
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              {analyzer.model || "—"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Serial Number
          </p>

          <p className="mt-1 font-mono text-sm text-gray-700">
            {analyzer.serialNumber || "—"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
          <div>
            <p className="text-xs text-gray-400">
              Location
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {analyzer.location || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Connection
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {analyzer.connectionType ||
                "Not configured"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Last Connected
          </p>

          <p className="mt-1 text-sm text-gray-700">
            {formatDate(
              analyzer.lastConnectedAt
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Link
          href={`/analyzers/${analyzer.id}`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          View
        </Link>

        {onTestConnection && (
          <button
            type="button"
            onClick={() =>
              onTestConnection(analyzer)
            }
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Test Connection
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(analyzer)}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}