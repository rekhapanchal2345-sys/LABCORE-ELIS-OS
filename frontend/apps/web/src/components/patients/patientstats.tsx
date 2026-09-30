"use client";

import React from "react";

interface PatientStatsProps {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  loading?: boolean;
}

interface StatItemProps {
  label: string;
  value: number;
  icon: string;
  description: string;
}

function StatItem({
  label,
  value,
  icon,
  description,
}: StatItemProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
      </div>

      <div className="mt-4 h-3 w-32 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

export default function PatientStats({
  total,
  active,
  inactive,
  newThisMonth,
  loading = false,
}: PatientStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatItem
        label="Total Patients"
        value={total}
        icon="👥"
        description="All registered patients"
      />

      <StatItem
        label="Active Patients"
        value={active}
        icon="✓"
        description="Currently active records"
      />

      <StatItem
        label="Inactive Patients"
        value={inactive}
        icon="○"
        description="Inactive patient records"
      />

      <StatItem
        label="New This Month"
        value={newThisMonth}
        icon="+"
        description="Patients registered this month"
      />
    </div>
  );
}