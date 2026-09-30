"use client";

import React from "react";

interface TimelineEvent {
  event: string;
  user?: string;
  date: string;
  status: string;
  comments?: string;
}

interface ApprovalTimelineProps {
  events: TimelineEvent[];
}

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusColor(status: string) {
  const value = status.toLowerCase();
  if (value === "approved" || value === "completed") return "bg-green-100 text-green-700 border-green-200";
  if (value === "rejected" || value === "cancelled") return "bg-red-100 text-red-700 border-red-200";
  if (value === "pending" || value === "submitted" || value === "under_review") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function ApprovalTimeline({ events }: ApprovalTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Approval Timeline
          </h2>
        </div>
        <div className="p-5 text-center text-sm text-gray-500">
          No timeline events available
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="font-semibold text-gray-900">
          Approval Timeline
        </h2>
      </div>

      <div className="p-5">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Timeline events */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={index} className="relative pl-10">
                {/* Timeline dot */}
                <div className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 ${
                  index === events.length - 1 
                    ? 'bg-gray-900 border-gray-900' 
                    : 'bg-white border-gray-400'
                }`} />

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {event.event}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <time className="text-xs text-gray-500">
                      {formatDate(event.date)}
                    </time>
                  </div>

                  {event.user && (
                    <p className="mt-1 text-sm text-gray-600">
                      By: {event.user}
                    </p>
                  )}

                  {event.comments && (
                    <p className="mt-2 text-sm text-gray-700 italic">
                      "{event.comments}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}