"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

export interface PendingApproval {
  id: string;
  title: string;
  description?: string;
  type?: string;
  requestedBy?: string;
  createdAt?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | string;
}

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  loading?: boolean;
  viewAllHref?: string;
  title?: string;
}

const priorityClass = (priority?: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-50 text-red-700";

    case "MEDIUM":
      return "bg-yellow-50 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function PendingApprovals({
  approvals,
  loading = false,
  viewAllHref = "/approvals",
  title = "Pending Approvals",
}: PendingApprovalsProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              {title}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Items waiting for review
            </p>
          </div>
        </div>

        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 p-5">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="flex gap-3"
              >
                <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-56 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            )
          )}
        </div>
      ) : approvals.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />

          <p className="mt-3 font-medium text-gray-700">
            All caught up
          </p>

          <p className="mt-1 text-sm text-gray-500">
            There are no pending approvals.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {approvals.map((approval) => (
            <Link
              key={approval.id}
              href={`/approvals/${approval.id}`}
              className="block px-5 py-4 transition hover:bg-gray-50"
            >
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {approval.title}
                      </p>

                      {approval.type && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          {approval.type}
                        </p>
                      )}
                    </div>

                    {approval.priority && (
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-medium ${priorityClass(
                          approval.priority
                        )}`}
                      >
                        {approval.priority}
                      </span>
                    )}
                  </div>

                  {approval.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {approval.description}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    {approval.requestedBy && (
                      <span>
                        By {approval.requestedBy}
                      </span>
                    )}

                    {approval.createdAt && (
                      <span>
                        {formatDate(
                          approval.createdAt
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}