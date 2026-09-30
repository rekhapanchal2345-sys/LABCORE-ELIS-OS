"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { sampleApi, orderApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface SampleData {
  id: string;
  sampleNumber: string;
  barcode: string;
  patientId: string;
  orderId: string;
  testId: string;
  sampleType: string;
  status: string;
  collectedById?: string;
  collectedBy?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
  collectionType?: string;
  priority?: string;
  collectedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    barcode: string;
    patient: {
      id: string;
      uhid: string;
      firstName: string;
      lastName: string;
      gender: string;
      dateOfBirth?: string;
      age?: number;
      phone?: string;
    };
    doctor?: {
      id: string;
      doctorCode: string;
      fullName: string;
      specialization: string;
    };
  };
  test: {
    id: string;
    testCode: string;
    testName: string;
    sampleType: string;
    sampleContainer: string;
  };
}

export default function SampleLabelPage() {
  const params = useParams();
  const router = useRouter();
  const [sample, setSample] = useState<SampleData | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labelSize, setLabelSize] = useState<'4x2' | '2x1' | 'custom'>('4x2');
  const [customWidth, setCustomWidth] = useState(400);
  const [customHeight, setCustomHeight] = useState(200);
  const [showPreview, setShowPreview] = useState(false);
  const [patientVerified, setPatientVerified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching sample with ID:', params.id);
        
        // Fetch sample data
        const sampleResponse = await sampleApi.getById(params.id as string);
        console.log('Sample response:', sampleResponse);
        
        if (sampleResponse.success && sampleResponse.data) {
          setSample(sampleResponse.data);
          
          // Fetch full order data for additional context
          try {
            const orderResponse = await orderApi.getById(sampleResponse.data.orderId);
            if (orderResponse.success && orderResponse.data) {
              setOrder(orderResponse.data);
            }
          } catch (orderErr) {
            console.warn('Could not fetch order details:', orderErr);
          }
        } else {
          console.error('Invalid sample response structure:', sampleResponse);
          setError("Failed to load sample data - invalid response");
        }
      } catch (err) {
        console.error('Error fetching sample:', err);
        setError(err instanceof Error ? err.message : "Failed to load sample");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPatientAge = (dateOfBirth?: string, age?: number) => {
    if (age) return `${age} Years`;
    if (!dateOfBirth) return "—";
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let calculatedAge = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      calculatedAge--;
    }
    return `${calculatedAge} Years`;
  };

  const getContainerColor = (container: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      "EDTA Purple": { 
        bg: "bg-purple-100", 
        text: "text-purple-800", 
        border: "border-purple-400",
        icon: "🟣"
      },
      "Serum Separator Red": { 
        bg: "bg-red-100", 
        text: "text-red-800", 
        border: "border-red-400",
        icon: "🔴"
      },
      "Citrate Blue": { 
        bg: "bg-blue-100", 
        text: "text-blue-800", 
        border: "border-blue-400",
        icon: "🔵"
      },
      "Urine Container Yellow": { 
        bg: "bg-yellow-100", 
        text: "text-yellow-800", 
        border: "border-yellow-400",
        icon: "🟡"
      },
      "Fluoride Grey": { 
        bg: "bg-gray-200", 
        text: "text-gray-800", 
        border: "border-gray-400",
        icon: "⚪"
      },
      "Heparin Green": { 
        bg: "bg-green-100", 
        text: "text-green-800", 
        border: "border-green-400",
        icon: "🟢"
      },
    };
    return colors[container] || { 
      bg: "bg-gray-100", 
      text: "text-gray-800", 
      border: "border-gray-400",
      icon: "⚪"
    };
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "STAT":
        return "bg-red-600 text-white border-red-700";
      case "URGENT":
        return "bg-orange-500 text-white border-orange-600";
      case "ROUTINE":
      default:
        return "bg-blue-500 text-white border-blue-600";
    }
  };

  // Generate barcode bars as React components (Code128 pattern)
  const generateBarcodeBars = (text: string) => {
    const bars = [];
    const barWidth = 2;
    const gapWidth = 1;
    
    // Simple Code128-like pattern generation
    const startPattern = [2, 1, 2, 2, 2, 2];
    for (let i = 0; i < startPattern.length; i++) {
      if (i % 2 === 0) {
        bars.push({ width: barWidth * startPattern[i], isBar: true });
      } else {
        bars.push({ width: gapWidth * startPattern[i], isBar: false });
      }
    }

    // Encode each character
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const pattern = [];
      for (let j = 0; j < 6; j++) {
        pattern.push((charCode >> (j * 2)) & 3 + 1);
      }
      
      for (let j = 0; j < pattern.length; j++) {
        if (j % 2 === 0) {
          bars.push({ width: barWidth * pattern[j], isBar: true });
        } else {
          bars.push({ width: gapWidth * pattern[j], isBar: false });
        }
      }
    }

    // Stop pattern
    const stopPattern = [2, 2, 1, 2, 2, 2];
    for (let i = 0; i < stopPattern.length; i++) {
      if (i % 2 === 0) {
        bars.push({ width: barWidth * stopPattern[i], isBar: true });
      } else {
        bars.push({ width: gapWidth * stopPattern[i], isBar: false });
      }
    }

    return bars;
  };

  const getLabelDimensions = () => {
    switch (labelSize) {
      case '4x2':
        return { width: 400, height: 200 };
      case '2x1':
        return { width: 200, height: 100 };
      case 'custom':
        return { width: customWidth, height: customHeight };
      default:
        return { width: 400, height: 200 };
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sample label...</p>
            <p className="text-xs text-gray-400 mt-2">Sample ID: {params.id}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !sample) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🏷️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Sample Label</h2>
            <p className="text-gray-600 mb-4">{error || "Sample not found"}</p>
            <p className="text-xs text-gray-400 mb-4">Sample ID: {params.id}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const { width: labelWidth, height: labelHeight } = getLabelDimensions();
  const containerColors = getContainerColor(sample.test.sampleContainer);
  const barcodeBars = generateBarcodeBars(sample.barcode);

  return (
    <ProtectedRoute>
      <div className="print-page-shell min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-8">
        {/* Advanced Level Screen-only controls */}
        <div className="max-w-6xl mx-auto px-4 mb-5 no-print">
          <div className="relative flex justify-between items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-blue-900/40 p-4 backdrop-blur-xl">
            {/* Animated glow orbs */}
            <div className="pointer-events-none absolute -top-8 -left-8 h-32 w-32 rounded-full bg-cyan-500/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl" />
            <div className="flex items-center gap-4 relative">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="relative inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-950 shadow-lg shadow-amber-500/30">
                  <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-amber-800"></span>
                  ⭐ Premium
                </span>
                <span className="relative inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-600 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-violet-500/40">
                  <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-white/80"></span>
                  Advanced Level
                </span>
              </div>
            </div>
            <div className="flex gap-2 relative">
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value as '4x2' | '2x1' | 'custom')}
                className="bg-white/10 text-white border border-white/20 px-3 py-2 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-400/50 backdrop-blur placeholder:text-slate-400 hover:bg-white/15 transition-all"
              >
                <option value="4x2" className="text-slate-900">4" × 2" Labels</option>
                <option value="2x1" className="text-slate-900">2" × 1" Labels</option>
                <option value="custom" className="text-slate-900">Custom Size</option>
              </select>
              {labelSize === 'custom' && (
                <>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    placeholder="Width (px)"
                    className="bg-white/10 text-white border border-white/20 px-3 py-2 rounded-xl text-sm w-24 font-medium focus:ring-2 focus:ring-cyan-400/50 placeholder:text-slate-500"
                  />
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    placeholder="Height (px)"
                    className="bg-white/10 text-white border border-white/20 px-3 py-2 rounded-xl text-sm w-24 font-medium focus:ring-2 focus:ring-cyan-400/50 placeholder:text-slate-500"
                  />
                </>
              )}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-white/10 text-slate-200 hover:bg-white/20 border border-white/20 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              >
                {showPreview ? '▲ Hide' : '▼ Preview'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/30 transition-all duration-200 hover:shadow-cyan-500/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Label
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 font-bold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500 border border-emerald-400/30 transition-all duration-200 hover:shadow-emerald-500/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Sample Info Strip */}
        <div className="max-w-6xl mx-auto px-4 mb-5 no-print">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-lg">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-violet-500/5" />
            <div className="flex items-center gap-3 relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sample</span>
                  <span className="text-sm font-black text-white">{sample.sampleNumber}</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Patient</span>
                  <span className="text-sm font-black text-white">{sample.order.patient.firstName} {sample.order.patient.lastName}</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Test</span>
                  <span className="text-sm font-black text-cyan-300">{sample.test.testName}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">Label Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Label Preview Shell */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="print-preview-shell rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl shadow-black/40 print:shadow-none print:rounded-none print:bg-white print:p-0">
            <div className="flex items-center justify-between mb-6 no-print">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Sample Label Preview</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Print-ready specimen identification label</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-amber-950 shadow-lg shadow-amber-500/30">
                  <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-amber-700"></span>
                  ⭐ Premium Feature
                </span>
                <span className="relative inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-violet-500/40">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                  Advanced Level
                </span>
              </div>
            </div>
            
            <div className="flex min-h-[300px] items-center justify-center print:min-h-0">
              <div
                className="print-label relative overflow-hidden rounded-xl border-2 border-slate-900 bg-white p-4 text-slate-950 shadow-2xl print:shadow-none"
                style={{ width: `${labelWidth}px`, height: `${labelHeight}px`, minWidth: `${labelWidth}px`, minHeight: `${labelHeight}px` }}
              >
                <div className="h-full flex flex-col justify-between">
                  {/* Premium Lab Header */}
                  <div className="border-b-2 border-slate-200 pb-3 mb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 text-xs font-black text-white shadow-md">
                          LC
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-950">LabCore Diagnostics</p>
                          <p className="text-[8px] font-bold uppercase tracking-wider text-blue-700">Advanced Specimen Label</p>
                        </div>
                      </div>
                      <div className={`rounded-lg px-2 py-1 text-[8px] font-black border-2 ${getPriorityColor(sample.priority)}`}>
                        {sample.priority || 'ROUTINE'}
                      </div>
                    </div>
                  </div>

                  {/* Premium Patient Info */}
                  <div className="mb-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 p-3 border border-violet-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[8px] font-bold text-white">P</span>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-violet-900">Patient Identity</p>
                      <span className="ml-auto rounded-full border border-emerald-300 bg-emerald-100 px-1.5 py-0.5 text-[6px] font-black tracking-wider text-emerald-800">MATCH REQUIRED</span>
                    </div>
                    <div className="grid grid-cols-[1.2fr_1fr] gap-2">
                      <div>
                        <p className="truncate text-[12px] font-black text-slate-950">{sample.order.patient.firstName} {sample.order.patient.lastName}</p>
                        <p className="text-[9px] font-bold text-violet-700">UHID {sample.order.patient.uhid}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-black text-slate-950">{sample.sampleNumber}</p>
                        <p className="text-[9px] font-bold text-violet-700">{getPatientAge(sample.order.patient.dateOfBirth, sample.order.patient.age)} / {sample.order.patient.gender}</p>
                      </div>
                    </div>
                  </div>

                  {/* Premium Sample & Test Info */}
                  <div className="mb-3">
                    <div className="rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 px-3 py-2 border-2 border-slate-200">
                      <p className="truncate text-[10px] font-black text-slate-900">{sample.test.testName}</p>
                      <p className="text-[8px] font-bold text-slate-600 mt-1">{sample.test.testCode}</p>
                    </div>
                  </div>

                  {/* Premium Status Grid */}
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 px-2 py-1.5">
                      <p className="text-[6px] font-bold uppercase tracking-wider text-emerald-700">Status</p>
                      <p className="mt-1 truncate text-[8px] font-black leading-none text-emerald-900">{sample.status.replace("_", " ")}</p>
                    </div>
                    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 px-2 py-1.5">
                      <p className="text-[6px] font-bold uppercase tracking-wider text-blue-700">Collected</p>
                      <p className="mt-1 truncate text-[8px] font-black leading-none text-blue-900">{sample.collectedAt ? formatDateTime(sample.collectedAt).split(",")[0] : "Pending"}</p>
                    </div>
                    <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 px-2 py-1.5">
                      <p className="text-[6px] font-bold uppercase tracking-wider text-amber-700">Profile</p>
                      <p className="mt-1 truncate text-[8px] font-black leading-none text-amber-900">AUTO-ID</p>
                    </div>
                  </div>

                  {/* Premium Tube/Container Section */}
                  <div className="mb-3 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{containerColors.icon}</span>
                        <div>
                          <p className="text-[7px] font-bold uppercase tracking-wider text-amber-700">Container</p>
                          <p className="text-[8px] font-black leading-none text-amber-900">{sample.test.sampleContainer}</p>
                        </div>
                      </div>
                      <span className={`rounded-lg px-2 py-1 text-[7px] font-black border-2 ${containerColors.bg} ${containerColors.text} ${containerColors.border}`}>
                        {sample.sampleType}
                      </span>
                    </div>
                  </div>

                  {/* Premium Barcode Section */}
                  <div className="flex justify-center mb-2">
                    <div className="w-full rounded-xl border-2 border-slate-300 bg-white p-2 shadow-sm">
                      <div className="mb-1 flex items-center justify-between text-[6px] font-black uppercase tracking-[0.16em] text-slate-500">
                        <span>Specimen identity barcode</span>
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-emerald-700">VERIFIED FORMAT</span>
                      </div>
                      <div className="flex items-stretch rounded-sm bg-white px-1">
                        <span className="w-1 shrink-0 bg-white" aria-hidden="true" />
                        {barcodeBars.map((bar: any, i: number) => (
                          <div
                            key={i}
                            className={bar.isBar ? 'bg-black' : 'bg-white'}
                            style={{ 
                              width: `${bar.width}px`,
                              height: '28px'
                            }}
                          />
                        ))}
                        <span className="w-1 shrink-0 bg-white" aria-hidden="true" />
                      </div>
                      <p className="mt-1 text-center font-mono text-[8px] font-black tracking-[0.18em] text-slate-950">{sample.barcode}</p>
                      <div className="mt-1 flex items-center justify-between gap-3 border-t border-slate-200 pt-1 text-[6px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Code 128 · quiet zone protected</span>
                        <span className="text-emerald-700">Scan-ready · 300 DPI</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Footer */}
                  <div className="text-center rounded-lg bg-slate-50 p-2 border border-slate-200">
                    <p className="text-[8px] font-bold leading-none text-slate-700 mt-0.5">{sample.sampleNumber}</p>
                    <p className="text-[7px] font-semibold leading-none text-slate-500 mt-0.5">
                      {sample.collectedAt ? formatDateTime(sample.collectedAt) : formatDate(sample.createdAt)}
                    </p>
                    {sample.collectedBy && (
                      <p className="text-[7px] font-semibold leading-none text-slate-500 mt-0.5">By: {sample.collectedBy.fullName}</p>
                    )}
                    <div className="mt-0.5 flex justify-between border-t border-dashed border-slate-200 pt-0.5 text-[6px] font-bold uppercase tracking-wider text-slate-400"><span>Secure accession</span><span>QC PASS</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Print Notes */}
            <div className="mt-6 no-print">
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-slate-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-200">Label Size: {labelWidth}px × {labelHeight}px</p>
                      <p className="text-[10px] text-slate-400">Code128 · 300 DPI recommended · Thermal printer optimized</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[9px] font-bold text-cyan-300">ISO 15223</span>
                    <span className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-2 py-1 text-[9px] font-bold text-violet-300">NABL Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes adv-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: ${labelWidth}px ${labelHeight}px;
            margin: 0;
          }
            html, body {
              width: ${labelWidth}px !important;
              height: ${labelHeight}px !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
            .print-page-shell {
              min-height: 0 !important;
              width: ${labelWidth}px !important;
              height: ${labelHeight}px !important;
              padding: 0 !important;
              background: white !important;
            }
            .print-preview-shell {
              width: ${labelWidth}px !important;
              height: ${labelHeight}px !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
              border: none !important;
              backdrop-filter: none !important;
            }
            .print-label {
              width: ${labelWidth}px !important;
              height: ${labelHeight}px !important;
              border-radius: 0 !important;
              border-width: 1px !important;
              box-shadow: none !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
        }
      `}</style>
    </ProtectedRoute>
  );
}