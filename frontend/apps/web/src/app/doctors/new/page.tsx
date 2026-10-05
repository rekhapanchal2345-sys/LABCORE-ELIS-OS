"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboardlayout";
import RegisterDoctorWizard from "@/components/doctors/RegisterDoctorWizard";
import { ArrowLeft, UserPlus, Sparkles, Building2, Stethoscope, ShieldCheck } from "lucide-react";

export default function NewDoctorPage() {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(true);

  return (
    <DashboardLayout title="Register New Doctor">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Doctor Directory
        </Link>

        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <UserPlus className="w-8 h-8" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-indigo-100 uppercase tracking-wider inline-flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3" /> Enterprise Registration
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Register Doctor & Clinical Partner</h1>
              <p className="text-xs text-indigo-100 mt-1 max-w-xl">
                Add referring practitioners, in-house pathologists with digital signatures, or partner hospitals with automated commission settlements.
              </p>
            </div>
          </div>
        </div>

        {/* Action card if modal was closed */}
        {!wizardOpen && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ready to register a new doctor?</h3>
              <p className="text-xs text-slate-500 mt-1">
                The 8-step wizard handles personal, council registration, bank details, and report delivery preferences.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-md"
            >
              Open Registration Wizard
            </button>
          </div>
        )}

        {/* 8-Step Enterprise Doctor Wizard Modal */}
        <RegisterDoctorWizard
          isOpen={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            router.push("/doctors");
          }}
          onSuccess={() => {
            router.push("/doctors");
          }}
        />
      </div>
    </DashboardLayout>
  );
}

