"use client";

import React from "react";

import type {
  DashboardActivity,
} from "../../types";

/* =======================================================
   TYPES
======================================================= */

interface RecentActivityProps {
  activities?: DashboardActivity[];
  loading?: boolean;
  maxItems?: number;
}

/* =======================================================
   HELPERS
======================================================= */

function getActivityIcon(
  type: DashboardActivity["type"]
): string {
  switch (type) {
    case "patient":
      return "👤";

    case "order":
      return "🧾";

    case "sample":
      return "🧪";

    case "result":
      return "📋";

    case "payment":
      return "💳";

    case "report":
      return "📄";

    default:
      return "•";
  }
}

function getActivityLabel(
  type: DashboardActivity["type"]
): string {
  switch (type) {
    case "patient":
      return "Patient";

    case "order":
      return "Order";

    case "sample":
      return "Sample";

    case "result":
      return "Result";

    case "payment":
      return "Payment";

    case "report":
      return "Report";

    default:
      return "Activity";
  }
}

function formatTime(
  timestamp: string
): string {
  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return timestamp;
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

/* =======================================================
   LOADING
======================================================= */

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-start gap-3"
        >
          <div className="h-10 w-10 rounded-full bg-gray-200" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =======================================================
   EMPTY STATE
======================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
      <div className="mb-3 text-4xl">
        📭
      </div>

      <h3 className="text-sm font-semibold text-gray-900">
        No recent activity
      </h3>

      <p className="mt-1 max-w-xs text-sm text-gray-500">
        Recent patient, order, sample,
        result and payment activity will
        appear here.
      </p>
    </div>
  );
}

/* =======================================================
   COMPONENT
======================================================= */

export default function RecentActivity({
  activities = [],
  loading = false,
  maxItems = 8,
}: RecentActivityProps) {
  const visibleActivities =
    activities.slice(
      0,
      maxItems
    );

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Latest activity across LabCore ELIS
          </p>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {activities.length}{" "}
          {activities.length === 1
            ? "activity"
            : "activities"}
        </span>
      </div>

      {/* Body */}

      <div className="p-5">
        {loading ? (
          <LoadingState />
        ) : visibleActivities.length ===
          0 ? (
          <EmptyState />
        ) : (
          <div className="relative">
            <div className="absolute bottom-5 left-5 top-5 w-px bg-gray-200" />

            <div className="space-y-5">
              {visibleActivities.map(
                (activity) => (
                  <div
                    key={activity.id}
                    className="relative flex items-start gap-3"
                  >
                    {/* Icon */}

                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-lg shadow-sm">
                      {getActivityIcon(
                        activity.type
                      )}
                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {activity.title}
                        </h3>

                        <span className="text-xs text-gray-400">
                          {formatTime(
                            activity.timestamp
                          )}
                        </span>
                      </div>

                      {activity.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {activity.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                          {getActivityLabel(
                            activity.type
                          )}
                        </span>

                        {activity.user && (
                          <span className="text-xs text-gray-400">
                            by{" "}
                            {activity.user.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}