"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { sampleApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import SampleDetails from "@/components/samples/SampleDetails";
import { ArrowLeft, FlaskConical, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SampleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [sample, setSample] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sampleId = params.id as string;

  useEffect(() => {
    const fetchSample = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ensure ID is passed and valid
        if (!sampleId) {
            setError("Invalid sample ID");
            return;
        }

        const response = await sampleApi.getOne(sampleId);
        
        // Handle nested or direct data structures defensively
        if (response?.data?.sample) {
          setSample(response.data.sample);
        } else if (response?.data) {
          setSample(response.data);
        } else if (response) {
          setSample(response);
        } else {
            setError("Sample data not found in response");
        }
      } catch (err) {
        console.error("Error fetching sample:", err);
        setError(err instanceof Error ? err.message : "Failed to load sample details.");
      } finally {
        setLoading(false);
      }
    };

    if (sampleId) {
      fetchSample();
    }
  }, [sampleId]);

  return (
    <ProtectedRoute>
      <DashboardLayout title={`Sample ${sample?.sampleNumber || sampleId}`}>
        <div className="space-y-6">
            
          {/* Header Bar */}
          <div className="flex items-center gap-4 border-b border-slate-200/50 pb-4">
            <Link 
              href="/samples"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900 hover:shadow"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Specimen Details
              </h1>
              <p className="text-sm text-slate-500">
                Detailed view of sample lifecycle and chain of custody
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-3xl border border-slate-200 bg-white/50 p-8 shadow-sm">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
              <p className="text-sm font-medium text-slate-500">Retrieving sample records...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FlaskConical className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-red-900">Error Loading Sample</h3>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <button 
                onClick={() => router.push("/samples")}
                className="mt-6 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                Return to Worklist
              </button>
            </div>
          ) : sample ? (
            <SampleDetails sample={sample} onRefresh={() => {
                // simple hack to force a refetch
                const id = sampleId;
                sampleApi.getOne(id).then(res => {
                     if (res?.data?.sample) setSample(res.data.sample);
                     else if (res?.data) setSample(res.data);
                });
            }} />
          ) : null}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
