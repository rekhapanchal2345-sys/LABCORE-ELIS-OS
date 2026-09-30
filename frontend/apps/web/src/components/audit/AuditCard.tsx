"use client";

import React from "react";
import Link from "next/link";
import type { AuditLog } from "./AuditTable";

interface AuditCardProps {
  log: AuditLog;
  onView?: (log: AuditLog) => void;
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

export default function AuditCard({
  log,
  onView,
}: AuditCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
            🛡️
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {log.userName ||
                log.userEmail ||
                "System"}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {formatDate(log.createdAt)}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${actionClass(
            log.action
          )}`}
        >
          {log.action || "UNKNOWN"}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Entity
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">
              {log.entity || "—"}
            </span>

            {log.entityId && (
              <span className="font-mono text-xs text-gray-400">
                #{log.entityId}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Description
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            {log.description || "No description available."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
          <div>
            <p className="text-xs text-gray-400">
              Role
            </p>

            <p className="mt-1 text-sm font-medium text-gray-700">
              {log.role || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              IP Address
            </p>

            <p className="mt-1 font-mono text-xs text-gray-700">
              {log.ipAddress || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
        {onView ? (
          <button
            type="button"
            onClick={() => onView(log)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            View Details
          </button>
        ) : (
          <Link
            href={`/audit/${log.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            View Details
          </Link>
        )}
      </div>
    </article>
  );
}