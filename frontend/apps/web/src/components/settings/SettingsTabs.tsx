"use client";

import React from "react";
import {
  User,
  Sliders,
  Users,
  Building2,
  CreditCard,
  Bell,
  ShieldCheck,
  Cpu,
  Terminal,
  Archive,
  Palette,
  HardDriveDownload,
  CheckCircle2,
} from "lucide-react";

export type SettingsTab =
  | "profile"
  | "general"
  | "users"
  | "laboratory"
  | "billing"
  | "notifications"
  | "security"
  | "integrations"
  | "advanced"
  | "data_retention"
  | "branding"
  | "backup";

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

interface TabDefinition {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  verified?: boolean;
}

const tabs: TabDefinition[] = [
  {
    id: "profile",
    label: "My Profile",
    icon: User,
    verified: true,
  },
  {
    id: "laboratory",
    label: "Laboratory & Accreditation",
    icon: Building2,
    badge: "NABL",
    verified: true,
  },
  {
    id: "general",
    label: "General Settings",
    icon: Sliders,
  },
  {
    id: "users",
    label: "Users & Roles",
    icon: Users,
  },
  {
    id: "billing",
    label: "Billing & GST",
    icon: CreditCard,
  },
  {
    id: "notifications",
    label: "Alerts & WhatsApp",
    icon: Bell,
    badge: "Live",
  },
  {
    id: "security",
    label: "Security & 2FA",
    icon: ShieldCheck,
    verified: true,
  },
  {
    id: "branding",
    label: "Branding & Reports",
    icon: Palette,
  },
  {
    id: "backup",
    label: "Cloud Backup",
    icon: HardDriveDownload,
    badge: "Daily",
  },
  {
    id: "integrations",
    label: "Integrations & HL7",
    icon: Cpu,
  },
  {
    id: "data_retention",
    label: "Data Retention",
    icon: Archive,
  },
  {
    id: "advanced",
    label: "Advanced Config",
    icon: Terminal,
  },
];

/**
 * Valid tab identifiers for the ?tab= query parameter, derived from `tabs` so the
 * URL contract can never drift from the rendered navigation.
 */
export const SETTINGS_TABS: readonly SettingsTab[] = tabs.map((tab) => tab.id);

/** Narrows an arbitrary ?tab= value to a known SettingsTab. */
export function isSettingsTab(value: string | null): value is SettingsTab {
  return value !== null && (SETTINGS_TABS as readonly string[]).includes(value);
}

export default function SettingsTabs({
  activeTab,
  onTabChange,
}: SettingsTabsProps) {
  const navRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (navRef.current) {
      const activeEl = navRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeTab]);

  const scroll = (direction: "left" | "right") => {
    if (navRef.current) {
      const amount = direction === "left" ? -250 : 250;
      navRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-xl p-1.5 shadow-sm group">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
        aria-label="Scroll left"
      >
        ‹
      </button>

      <nav
        ref={navRef as any}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5"
        aria-label="Settings navigation"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              data-active={active}
              onClick={() => onTabChange(tab.id)}
              className={`group relative flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-semibold tracking-tight transition-all duration-200 ${
                active
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-indigo-600 dark:text-white dark:shadow-indigo-600/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200"
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-colors ${
                  active
                    ? "text-cyan-300 dark:text-white"
                    : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
                }`}
              />
              <span className="whitespace-nowrap">{tab.label}</span>

              {tab.badge && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase transition-colors ${
                    active
                      ? "bg-cyan-400/20 text-cyan-200 border border-cyan-400/30"
                      : "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              {tab.verified && (
                <CheckCircle2
                  className={`h-3 w-3 ${
                    active ? "text-emerald-300" : "text-emerald-600/70"
                  }`}
                />
              )}

              {/* Active Pill Glow */}
              {active && (
                <span className="absolute -bottom-1.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-cyan-400 dark:bg-indigo-400 shadow-sm" />
              )}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
}