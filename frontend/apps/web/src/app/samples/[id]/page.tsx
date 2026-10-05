"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { sampleApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import SampleDetails from "@/components/samples/SampleDetails";
import { ArrowLeft, FlaskConical, Loader2, ShieldCheck, Building2 } from "lucide-react";
import Link from "next/link";

export default function SampleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [sample, setSample] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sampleId = params.id as string;

  const fetchSample = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!sampleId) {
        setError("Invalid sample ID");
        return;
      }

      const response = await sampleApi.getOne(sampleId);

      if (response?.data?.sample) {
        setSample(response.data.sample);
      } else if (response?.data) {
        setSample(response.data);
      } else if (response) {
        setSample(response);
      } else {
        setError("Sample record not found in laboratory database");
      }
    } catch (err) {
      console.error("Error fetching sample:", err);
      setError(err instanceof Error ? err.message : "Failed to load specimen details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sampleId) {
      fetchSample();
    }
  }, [sampleId]);

  return (
    <ProtectedRoute>
      <DashboardLayout title={`Specimen ${sample?.sampleNumber || sampleId}`}>
        <div className="space-y-6 pb-12">
          {/* Top Medical Navigation Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <Link
                href="/samples"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 shadow-md transition-all hover:bg-slate-800 hover:text-white hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white">
                    Clinical Specimen Dossier
                  </h1>
                  <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-[10px] font-black text-cyan-300">
                    NABL / ISO 15189
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-analytical verification, tube container handling SOP &amp; immutable audit trail
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="h-4 w-4" /> Chain-of-Custody Verified
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex h-72 flex-col items-center justify-center space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
              <p className="text-sm font-bold text-slate-300">Retrieving laboratory specimen record...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-500/40 bg-rose-950/30 p-8 text-center shadow-2xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <FlaskConical className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-black text-rose-200">Error Loading Specimen</h3>
              <p className="mt-2 text-xs text-rose-300/80">{error}</p>
              <button
                onClick={() => router.push("/samples")}
                className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-black text-slate-950 shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                Return to Worklist
              </button>
            </div>
          ) : sample ? (
            <SampleDetails sample={sample} onRefresh={fetchSample} />
          ) : null}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
