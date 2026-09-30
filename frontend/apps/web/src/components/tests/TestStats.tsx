"use client";

import React from "react";

interface TestStatsProps {
  total?: number;
  active?: number;
  inactive?: number;
  categories?: number;
  loading?: boolean;
}

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: string;
  loading?: boolean;
}

function StatCard({
  label,
  value,
  description,
  icon,
  loading,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {value.toLocaleString("en-IN")}
            </p>
          )}

          <p className="mt-2 text-xs text-gray-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function TestStats({
  total = 0,
  active = 0,
  inactive = 0,
  categories = 0,
  loading = false,
}: TestStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Tests"
        value={total}
        description="All configured laboratory tests"
        icon="🧪"
        loading={loading}
      />

      <StatCard
        label="Active Tests"
        value={active}
        description="Currently available for orders"
        icon="✓"
        loading={loading}
      />

      <StatCard
        label="Inactive Tests"
        value={inactive}
        description="Temporarily unavailable tests"
        icon="⏸"
        loading={loading}
      />

      <StatCard
        label="Categories"
        value={categories}
        description="Configured test categories"
        icon="▦"
        loading={loading}
      />
    </div>
  );
}