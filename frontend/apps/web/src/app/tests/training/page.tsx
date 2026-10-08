"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ClinicalTrainingEngine from "@/components/tests/ClinicalTrainingEngine";
import { ChevronLeft } from "lucide-react";

export default function ClinicalTrainingPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <div className="space-y-6 pb-20">
        <div className="border-b border-slate-200/90 pb-4">
          <Link
            href="/tests"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition mb-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Diagnostic Directory / Master Investigations</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Clinical AI Diagnostic Training &amp; Reflex Simulator
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Pathologist decision support, clinical correlation training, automated reflex cascade protocols, and Westgard QC workshop
          </p>
        </div>

        <ClinicalTrainingEngine />
      </div>
    </ProtectedRoute>
  );
}
