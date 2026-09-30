"use client";

import React from "react";
import Link from "next/link";

export interface AuditLog {
  id: string | number;
  action?: string;
  entity?: string;
  entityId?: string | number;
  userId?: string | number;
  userName?: string;
  userEmail?: string;
  role?: string;
  ipAddress?: string;
  description?: string;
  createdAt?: string;
  status?: string;
}

interface AuditTableProps {
  logs: AuditLog[];
  loading?: boolean;
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

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, row) => (
        <tr key={row}>
          {Array.from({ length: 7 }).map((__, cell) => (
            <td key={cell} className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function AuditTable({
  logs,
  loading = false,
  onView,
}: AuditTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date & Time
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                User
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Action
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Entity
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Description
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                IP Address
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRows />
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center"
                >
                  <div className="text-3xl">🛡️</div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    No audit logs found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    System activity will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                    {formatDate(log.createdAt)}
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-800">
                      {log.userName ||
                        log.userEmail ||
                        "System"}
                    </p>

                    {log.role && (
                      <p className="mt-1 text-xs text-gray-400">
                        {log.role}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${actionClass(
                        log.action
                      )}`}
                    >
                      {log.action || "UNKNOWN"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-gray-700">
                      {log.entity || "—"}
                    </p>

                    {log.entityId && (
                      <p className="mt-1 font-mono text-xs text-gray-400">
                        #{log.entityId}
                      </p>
                    )}
                  </td>

                  <td className="max-w-md px-4 py-4">
                    <p className="truncate text-sm text-gray-600">
                      {log.description || "—"}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-gray-500">
                      {log.ipAddress || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    {onView ? (
                      <button
                        type="button"
                        onClick={() => onView(log)}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </button>
                    ) : (
                      <Link
                        href={`/audit/${log.id}`}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}