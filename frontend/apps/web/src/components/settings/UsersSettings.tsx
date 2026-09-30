"use client";

import React, { useState } from "react";
import UsersManagementView from "./UsersManagementView";
import RolesManagementView from "./RolesManagementView";
import { Users, Shield, Award } from "lucide-react";

interface UsersSettingsProps {
  saving?: boolean;
  initialValues?: any;
  initialRoles?: any[];
  onSave?: (data: any) => void;
}

export default function UsersSettings({
  saving,
  initialValues,
  initialRoles,
  onSave,
}: UsersSettingsProps = {}) {
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "roles">("directory");

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Switcher between Staff Directory & Roles Matrix */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab("directory")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "directory"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Staff & Signatories Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("roles")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "roles"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Roles & Granular Permissions Matrix</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            NABL ISO 15189 Certified RBAC
          </span>
        </div>
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === "directory" ? (
        <UsersManagementView />
      ) : (
        <RolesManagementView />
      )}
    </div>
  );
}