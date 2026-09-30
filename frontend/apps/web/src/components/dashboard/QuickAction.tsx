"use client";

import React from "react";
import Link from "next/link";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: string;
}

const actions: QuickAction[] = [
  {
    label: "New Patient",
    description: "Register a new patient",
    href: "/patients/new",
    icon: "👤",
  },
  {
    label: "New Order",
    description: "Create a laboratory order",
    href: "/orders/new",
    icon: "🧾",
  },
  {
    label: "Collect Sample",
    description: "Manage sample collection",
    href: "/samples",
    icon: "🧪",
  },
  {
    label: "Enter Results",
    description: "Enter laboratory results",
    href: "/results",
    icon: "📋",
  },
  {
    label: "Create Invoice",
    description: "Generate patient invoice",
    href: "/invoices",
    icon: "💰",
  },
  {
    label: "View Reports",
    description: "Open laboratory reports",
    href: "/reports",
    icon: "📄",
  },
];

interface QuickActionsProps {
  actionsList?: QuickAction[];
}

export default function QuickActions({
  actionsList = actions,
}: QuickActionsProps) {
  return (
    <section className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-lg shadow-purple-500/20">
      {/* Header */}

      <div className="border-b border-purple-500/30 px-5 py-4">
        <h2 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Quick Actions
        </h2>

        <p className="mt-1 text-xs text-purple-300/70">
          Frequently used laboratory operations
        </p>
      </div>

      {/* Actions */}

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        {actionsList.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-3 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3 transition-all duration-300 hover:border-cyan-500/50 hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-lg transition group-hover:bg-purple-500/30">
              {action.icon}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-purple-200 group-hover:text-cyan-400 transition-colors">
                {action.label}
              </p>

              <p className="mt-0.5 truncate text-xs text-purple-300/70">
                {action.description}
              </p>
            </div>

            <span className="text-purple-400/60 transition group-hover:translate-x-0.5 group-hover:text-cyan-400">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}