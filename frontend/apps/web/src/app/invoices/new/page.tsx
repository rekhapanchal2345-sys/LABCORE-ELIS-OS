"use client";

import React from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboardlayout";
import QuickPOSBilling from "@/components/invoices/QuickPOSBilling";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";

export default function NewInvoicePage() {
  return (
    <DashboardLayout title="Quick POS Billing">
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Title */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Point of Sale (POS) Diagnostic Billing
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  <Sparkles className="h-3 w-3" />
                  Fast-Track Counter
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Rapid patient checkout with live test autocomplete, discount engine, GST calculation, and instant thermal receipt printing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/invoices"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              View Invoices Register
            </Link>
          </div>
        </div>

        {/* Embedded POS Component */}
        <QuickPOSBilling />
      </div>
    </DashboardLayout>
  );
}
