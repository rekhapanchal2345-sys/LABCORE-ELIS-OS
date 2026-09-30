"use client";

import React from "react";
import Link from "next/link";
import type { Analyzer } from "./AnalyzerTable";

interface AnalyzerDetailsProps {
  analyzer: Analyzer;

  description?: string;
  protocol?: string;
  ipAddress?: string;
  port?: number | string;
  connectionStatus?: string;
  lastError?: string;

  onTestConnection?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestart?: () => void;
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium text-gray-800">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function AnalyzerDetails({
  analyzer,
  description,
  protocol,
  ipAddress,
  port,
  connectionStatus,
  lastError,
  onTestConnection,
  onEdit,
  onDelete,
  onRestart,
}: AnalyzerDetailsProps) {
  const currentStatus =
    connectionStatus || analyzer.status || "Unknown";

  return (
    <div className="space-y-6">
      {/* Header */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                ⚙️
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    {analyzer.name ||
                      `Analyzer #${analyzer.id}`}
                  </h1>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                      currentStatus
                    )}`}
                  >
                    {currentStatus}
                  </span>
                </div>

                <p className="mt-1 font-mono text-xs text-gray-400">
                  {analyzer.code ||
                    `AN-${analyzer.id}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {onTestConnection && (
                <button
                  type="button"
                  onClick={onTestConnection}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Test Connection
                </button>
              )}

              {onRestart && (
                <button
                  type="button"
                  onClick={onRestart}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Restart
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Device Information */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Device Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Name"
            value={analyzer.name}
          />

          <InfoItem
            label="Code"
            value={analyzer.code}
          />

          <InfoItem
            label="Manufacturer"
            value={analyzer.manufacturer}
          />

          <InfoItem
            label="Model"
            value={analyzer.model}
          />

          <InfoItem
            label="Serial Number"
            value={analyzer.serialNumber}
          />

          <InfoItem
            label="Analyzer Type"
            value={analyzer.type}
          />

          <InfoItem
            label="Location"
            value={analyzer.location}
          />

          <InfoItem
            label="Created At"
            value={formatDate(analyzer.createdAt)}
          />
        </dl>
      </section>

      {/* Communication */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Communication Configuration
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Connection Type"
            value={analyzer.connectionType}
          />

          <InfoItem
            label="Protocol"
            value={protocol}
          />

          <InfoItem
            label="IP Address"
            value={ipAddress}
          />

          <InfoItem
            label="Port"
            value={port}
          />

          <InfoItem
            label="Connection Status"
            value={
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                  currentStatus
                )}`}
              >
                {currentStatus}
              </span>
            }
          />

          <InfoItem
            label="Last Connected"
            value={formatDate(
              analyzer.lastConnectedAt
            )}
          />
        </dl>
      </section>

      {/* Description */}

      {description && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Description
            </h2>
          </div>

          <div className="p-5">
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {description}
            </p>
          </div>
        </section>
      )}

      {/* Last Error */}

      {lastError && (
        <section className="rounded-xl border border-red-200 bg-white shadow-sm">
          <div className="border-b border-red-100 px-5 py-4">
            <h2 className="font-semibold text-red-800">
              Latest Connection Error
            </h2>
          </div>

          <div className="p-5">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-red-700">
                {lastError}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Integration Capabilities */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Integration
          </h2>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Result Import",
            "Patient Orders",
            "ASTM / HL7",
            "Connection Logs",
          ].map((feature) => (
            <div
              key={feature}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-green-600">
                  ✓
                </span>

                <span className="text-sm font-medium text-gray-800">
                  {feature}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 p-5">
          <Link
            href="/analyzers"
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            All Analyzers
          </Link>

          <Link
            href={`/analyzers/${analyzer.id}/logs`}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Connection Logs
          </Link>
        </div>
      </section>
    </div>
  );
}