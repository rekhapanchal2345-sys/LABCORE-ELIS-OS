"use client";

import React from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import UsersManagementView from "@/components/settings/UsersManagementView";

export default function UsersPage() {
  return (
    <DashboardLayout title="Clinical Personnel & Users">
      <div className="py-2">
        <UsersManagementView />
      </div>
    </DashboardLayout>
  );
}
