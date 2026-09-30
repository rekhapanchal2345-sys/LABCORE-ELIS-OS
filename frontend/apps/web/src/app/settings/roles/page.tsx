"use client";

import React from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import RolesManagementView from "@/components/settings/RolesManagementView";

export default function RolesPage() {
  return (
    <DashboardLayout title="Roles & Permissions Matrix">
      <div className="py-2">
        <RolesManagementView />
      </div>
    </DashboardLayout>
  );
}
