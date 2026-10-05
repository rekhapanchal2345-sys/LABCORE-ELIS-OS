"use client";

import React from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import RolesManagementView from "@/components/settings/RolesManagementView";
import { SETTINGS_ADMIN_ROLES } from "@/components/settings/settingsAccess";

/**
 * Legacy deep link retained so existing bookmarks keep working. The sidebar now
 * points at /settings?tab=users, which renders the same view inside the tab
 * strip. The role matrix is admin-tier.
 */
export default function RolesPage() {
  return (
    <ProtectedRoute requiredRoles={SETTINGS_ADMIN_ROLES}>
      <DashboardLayout title="Roles & Permissions Matrix">
        <div className="py-2">
          <RolesManagementView />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
