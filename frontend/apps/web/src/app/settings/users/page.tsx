"use client";

import React from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import UsersManagementView from "@/components/settings/UsersManagementView";
import { SETTINGS_ADMIN_ROLES } from "@/components/settings/settingsAccess";

/**
 * Legacy deep link retained so existing bookmarks keep working. The sidebar now
 * points at /settings?tab=users, which renders the same view inside the tab
 * strip. User administration is admin-tier (users:edit / users:manage_roles).
 */
export default function UsersPage() {
  return (
    <ProtectedRoute requiredRoles={SETTINGS_ADMIN_ROLES}>
      <DashboardLayout title="Clinical Personnel & Users">
        <div className="py-2">
          <UsersManagementView />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
