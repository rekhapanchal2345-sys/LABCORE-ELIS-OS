"use client";

import React from "react";
import Link from "next/link";
import type { AuditLog } from "./AuditTable";

interface AuditDetailsProps {
  log: AuditLog;

  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;

  onDelete?: () => void;
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function actionClass(action?: string) {
  const value = action?.toLowerCase() || "";

  if (
    value.includes("create") ||
    value.includes("add") ||
    value.includes("approve") ||
    value.includes("login")
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    value.includes("delete") ||
    value.includes("reject") ||
    value.includes("logout") ||
    value.includes("fail")
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    value.includes("update") ||
    value.includes("edit") ||
    value.includes("change")
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

      <dd className="mt-1 break-words text-sm font-medium text-gray-800">
        {value || "—"}
      </dd>
    </div>
  );
}

function JsonBlock({
  title,
  data,
}: {
  title: string;
  data?: Record<string, unknown> | null;
}) {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto p-5">
        <pre className="max-h-96 overflow-auto rounded-lg bg-gray-950 p-4 text-xs leading-6 text-gray-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </section>
  );
}

export default function AuditDetails({
  log,
  oldValues,
  newValues,
  metadata,
  onDelete,
}: AuditDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                🛡️
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    Audit Activity
                  </h1>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${actionClass(
                      log.action
                    )}`}
                  >
                    {log.action || "UNKNOWN"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(log.createdAt)}
                </p>
              </div>
            </div>

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete Log
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Activity Information */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Activity Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Action"
            value={log.action}
          />

          <InfoItem
            label="Entity"
            value={log.entity}
          />

          <InfoItem
            label="Entity ID"
            value={log.entityId}
          />

          <InfoItem
            label="Timestamp"
            value={formatDate(log.createdAt)}
          />

          <InfoItem
            label="Log ID"
            value={log.id}
          />

          <InfoItem
            label="Status"
            value={log.status}
          />
        </dl>
      </section>

      {/* User Information */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            User Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="User"
            value={log.userName}
          />

          <InfoItem
            label="Email"
            value={log.userEmail}
          />

          <InfoItem
            label="User ID"
            value={log.userId}
          />

          <InfoItem
            label="Role"
            value={log.role}
          />

          <InfoItem
            label="IP Address"
            value={
              <span className="font-mono text-xs">
                {log.ipAddress}
              </span>
            }
          />
        </dl>
      </section>

      {/* Description */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Description
          </h2>
        </div>

        <div className="p-5">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {log.description ||
                "No description available."}
            </p>
          </div>
        </div>
      </section>

      <JsonBlock
        title="Previous Values"
        data={oldValues}
      />

      <JsonBlock
        title="New Values"
        data={newValues}
      />

      <JsonBlock
        title="Additional Metadata"
        data={metadata}
      />

      {/* Related Entity */}

      {log.entity && log.entityId && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Related Entity
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {log.entity}
              </p>

              <p className="mt-1 font-mono text-xs text-gray-400">
                ID: {log.entityId}
              </p>
            </div>

            <Link
              href={`/${String(log.entity).toLowerCase()}s/${log.entityId}`}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Entity
            </Link>
          </div>
        </section>
      )}

      {/* Navigation */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 p-5">
          <Link
            href="/audit"
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            All Audit Logs
          </Link>
        </div>
      </section>
    </div>
  );
}