"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { sampleApi, orderApi } from "@/lib/api";

interface PendingSample {
  id: string;
  order: {
    orderNumber: string;
    patient: {
      firstName: string;
      lastName: string;
      uhid: string;
    };
  };
  test: {
    testName: string;
    testCode: string;
    sampleType: string;
  };
  status: string;
}

export default function SampleCollectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [pendingSamples, setPendingSamples] = useState<PendingSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<PendingSample | null>(null);
  const [collectionNotes, setCollectionNotes] = useState("");
  const [collectedSamples, setCollectedSamples] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingSamples();
  }, []);

  useEffect(() => {
    if (orderId && pendingSamples.length > 0 && !selectedSample) {
      const match = pendingSamples.find(
        (s: any) => s.order?.id === orderId || s.orderId === orderId || s.order?.orderNumber === orderId
      );
      if (match) setSelectedSample(match);
    }
  }, [orderId, pendingSamples, selectedSample]);

  const displayedSamples = orderId 
    ? pendingSamples.filter((s: any) => s.order?.id === orderId || s.orderId === orderId || s.order?.orderNumber === orderId)
    : pendingSamples;

  const fetchPendingSamples = async () => {
    try {
      setLoading(true);
      const response = await sampleApi.getAll("?status=PENDING");
      if (response.success && response.data) {
        const samplesData = response.data.samples || response.data || [];
        setPendingSamples(Array.isArray(samplesData) ? samplesData : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pending samples");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: PendingSample) => {
    setSelectedSample(sample);
    setCollectionNotes("");
  };

  const handleMarkCollected = async () => {
    if (!selectedSample) return;

    try {
      setSubmitting(true);
      // This would call an API to mark sample as collected
      console.log(`Marking sample ${selectedSample.id} as collected with notes: ${collectionNotes}`);
      
      // For now, just simulate success
      setCollectedSamples(prev => new Set([...prev, selectedSample.id]));
      setSelectedSample(null);
      setCollectionNotes("");
      
      // Refresh the list
      await fetchPendingSamples();
    } catch (err) {
      setError("Failed to mark sample as collected");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipSample = () => {
    setSelectedSample(null);
    setCollectionNotes("");
  };

  const getSampleTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "BLOOD": "bg-red-50 text-red-700 border-red-200",
      "URINE": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "SERUM": "bg-orange-50 text-orange-700 border-orange-200",
      "PLASMA": "bg-purple-50 text-purple-700 border-purple-200",
      "SWAB": "bg-blue-50 text-blue-700 border-blue-200",
      "TISSUE": "bg-pink-50 text-pink-700 border-pink-200",
    };
    return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Sample Collection">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sample Collection</h1>
              <p className="text-sm text-gray-500">Collect and manage laboratory samples</p>
            </div>
            <Link
              href="/samples"
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              View All Samples
            </Link>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Samples List */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pending Samples ({pendingSamples.length})
                  </h2>
                </div>
                
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading pending samples...</div>
                ) : displayedSamples.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-lg font-medium">No pending samples</p>
                    <p className="text-sm">All samples have been collected</p>
                    {orderId && (
                      <button 
                        onClick={() => router.push('/samples/collect')} 
                        className="mt-4 text-sm text-blue-600 hover:underline"
                      >
                        View all pending samples
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {displayedSamples.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedSample?.id === sample.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {sample.order.orderNumber}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSampleTypeColor(sample.test.sampleType)}`}>
                                {sample.test.sampleType}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {sample.order.patient.firstName} {sample.order.patient.lastName}
                            </p>
                            <p className="text-xs text-gray-500">UHID: {sample.order.patient.uhid}</p>
                            <p className="text-sm text-gray-700 mt-1">
                              {sample.test.testName} ({sample.test.testCode})
                            </p>
                          </div>
                          {collectedSamples.has(sample.id) && (
                            <div className="ml-4">
                              <span className="inline-flex items-center text-green-600">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Collected
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Collection Form */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Sample Details
                </h2>
                
                {selectedSample ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Number
                      </label>
                      <p className="text-sm text-gray-900 font-medium">
                        {selectedSample.order.orderNumber}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedSample.order.patient.firstName} {selectedSample.order.patient.lastName}
                      </p>
                      <p className="text-xs text-gray-500">UHID: {selectedSample.order.patient.uhid}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedSample.test.testName}
                      </p>
                      <p className="text-xs text-gray-500">{selectedSample.test.testCode}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sample Type
                      </label>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getSampleTypeColor(selectedSample.test.sampleType)}`}>
                        {selectedSample.test.sampleType}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collection Notes
                      </label>
                      <textarea
                        value={collectionNotes}
                        onChange={(e) => setCollectionNotes(e.target.value)}
                        rows={3}
                        placeholder="Add any notes about sample collection..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleMarkCollected}
                        disabled={submitting}
                        className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {submitting ? "Processing..." : "Mark Collected"}
                      </button>
                      <button
                        onClick={handleSkipSample}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">Select a sample from the list to collect</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}