"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { doctorApi } from "@/lib/api";
import DoctorForm, { DoctorFormData } from "@/components/doctors/DoctorFrom";

export default function NewDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: DoctorFormData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Submitting doctor data:", data);
      const response = await doctorApi.create(data);
      console.log("API response:", response);
      if (response.success) {
        alert("Doctor created successfully!");
        router.push("/doctors");
      } else {
        setError(response.message || "Failed to create doctor");
      }
    } catch (err) {
      console.error("Error creating doctor:", err);
      setError(err instanceof Error ? err.message : "Failed to create doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add New Doctor">
      <div className="max-w-6xl mx-auto">
        {/* Premium Header */}
        <div className="mb-8">
          <Link
            href="/doctors"
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mb-6"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Doctors
          </Link>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 p-8 md:p-10">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Register New Doctor</h1>
                  <p className="text-indigo-100 text-sm mt-1">Add a new medical professional to your healthcare network</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Form Container */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Doctor Information</h2>
                <p className="text-sm text-gray-500">Fill in the details below to register a new doctor</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 p-6 shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-red-900">Registration Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <DoctorForm
              loading={loading}
              submitLabel="Register Doctor"
              onSubmit={handleSubmit}
              onCancel={() => router.push("/doctors")}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
