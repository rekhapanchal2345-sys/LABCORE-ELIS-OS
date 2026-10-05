"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";
import { SampleType, TestFormData, TestCategory } from "@/types";
import {
  FlaskConical,
  Edit,
  Trash2,
  ChevronLeft,
  DollarSign,
  Clock3,
  TestTube2,
  Building2,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  ArrowRight,
  AlertCircle
} from "lucide-react";

export default function TestDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams ? searchParams.get('edit') === 'true' : false;
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : String(params.id || '');
  
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [test, setTest] = useState<any>(null);
  const [formData, setFormData] = useState<TestFormData>({
    testCode: "",
    testName: "",
    shortName: "",
    categoryId: "",
    sampleType: "BLOOD",
    sampleContainer: "",
    sampleVolume: "",
    processingDepartment: "",
    method: "",
    description: "",
    clinicalSignificance: "",
    patientPreparation: "",
    price: 0,
    offerPrice: 0,
    b2bRate: 0,
    gstPercentage: 0,
    tatHours: 24,
    tatDisplay: "",
    displayOrder: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchTest();
    fetchCategories();
  }, [id]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const response = await testApi.getById(id);
      if (response.success && response.data) {
        const testData = response.data;
        setTest(testData);
        setFormData({
          testCode: testData.testCode || "",
          testName: testData.testName || "",
          shortName: testData.shortName || "",
          categoryId: testData.categoryId || "",
          sampleType: testData.sampleType || "BLOOD",
          sampleContainer: testData.sampleContainer || "",
          sampleVolume: testData.sampleVolume || "",
          processingDepartment: testData.processingDepartment || "",
          method: testData.method || "",
          description: testData.description || "",
          clinicalSignificance: testData.clinicalSignificance || "",
          patientPreparation: testData.patientPreparation || "",
          price: testData.price || 0,
          offerPrice: testData.offerPrice || 0,
          b2bRate: testData.b2bRate || 0,
          gstPercentage: testData.gstPercentage || 0,
          tatHours: testData.tatHours || 24,
          tatDisplay: testData.tatDisplay || "",
          displayOrder: testData.displayOrder || 0,
          isActive: testData.isActive !== false,
        });
      } else {
        setError(response.message || "Failed to fetch test");
      }
    } catch (err) {
      console.error("Error fetching test:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch test");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await testApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const testData: any = {
        testCode: formData.testCode,
        testName: formData.testName,
        sampleType: formData.sampleType,
        price: Number(formData.price) || 0,
      };

      if (formData.shortName) testData.shortName = formData.shortName;
      if (formData.categoryId) testData.categoryId = formData.categoryId;
      if (formData.sampleContainer) testData.sampleContainer = formData.sampleContainer;
      if (formData.sampleVolume) testData.sampleVolume = formData.sampleVolume;
      if (formData.processingDepartment) testData.processingDepartment = formData.processingDepartment;
      if (formData.method) testData.method = formData.method;
      if (formData.description) testData.description = formData.description;
      if (formData.clinicalSignificance) testData.clinicalSignificance = formData.clinicalSignificance;
      if (formData.patientPreparation) testData.patientPreparation = formData.patientPreparation;
      if (formData.offerPrice) testData.offerPrice = Number(formData.offerPrice);
      if (formData.b2bRate) testData.b2bRate = Number(formData.b2bRate);
      if (formData.gstPercentage !== undefined) testData.gstPercentage = Number(formData.gstPercentage);
      if (formData.tatHours) testData.tatHours = Number(formData.tatHours);
      if (formData.tatDisplay) testData.tatDisplay = formData.tatDisplay;
      if (formData.displayOrder) testData.displayOrder = Number(formData.displayOrder);
      if (formData.isActive !== undefined) testData.isActive = formData.isActive;

      const response = await testApi.update(id, testData);

      if (response.success) {
        router.push(`/tests/${id}`);
        fetchTest();
      } else {
        setError(response.message || "Failed to update test");
      }
    } catch (err) {
      console.error("Error updating test:", err);
      setError(err instanceof Error ? err.message : "Failed to update test");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${test?.testName || 'this test'}?`)) {
      return;
    }

    try {
      await testApi.delete(id);
      router.push("/tests");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete test");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
        <div className="flex flex-col items-center justify-center p-16 space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <div className="text-xs font-bold text-slate-400">Loading Diagnostic Investigation Dossier...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !test) {
    return (
      <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            href="/tests"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Master Directory</span>
          </Link>
          <div className="rounded-2xl bg-rose-950/50 border border-rose-500/40 p-6 text-rose-300 font-semibold text-xs shadow-xl">
            {error}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/tests"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition mb-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Master Test Catalog</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {test?.testName || test?.name}
              </h1>
              <span className="rounded-lg bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 text-xs font-mono font-black text-blue-400">
                {test?.testCode || test?.code}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                test?.isActive !== false
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}>
                {test?.isActive !== false ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                <span>{test?.isActive !== false ? "Active Catalog" : "Inactive"}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editMode ? (
              <>
                <Link
                  href={`/tests/${id}?edit=true`}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit Parameters</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-900/50 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <Link
                href={`/tests/${id}`}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel Editing
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-950/50 border border-rose-500/40 p-4 text-xs font-semibold text-rose-300 flex items-center gap-2 shadow-lg">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Error: </span>
              {error}
            </div>
          </div>
        )}

        {editMode ? (
          /* EDIT MODE FORM */
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-6">
              <h2 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                <FlaskConical className="h-4 w-4" />
                <span>Modify Test Properties</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Test Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Test Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.testCode}
                    onChange={(e) => setFormData({ ...formData, testCode: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Short Name</label>
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                        {cat.name} ({cat.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Sample Type *</label>
                  <select
                    value={formData.sampleType}
                    onChange={(e) => setFormData({ ...formData, sampleType: e.target.value as SampleType })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="BLOOD" className="bg-slate-900">Whole Blood</option>
                    <option value="SERUM" className="bg-slate-900">Serum</option>
                    <option value="PLASMA" className="bg-slate-900">Plasma</option>
                    <option value="URINE" className="bg-slate-900">Urine</option>
                    <option value="STOOL" className="bg-slate-900">Stool</option>
                    <option value="SWAB" className="bg-slate-900">Swab</option>
                    <option value="SPUTUM" className="bg-slate-900">Sputum</option>
                    <option value="CSF" className="bg-slate-900">CSF</option>
                    <option value="TISSUE" className="bg-slate-900">Tissue</option>
                    <option value="OTHER" className="bg-slate-900">Other</option>
                  </select>
                </div>
              </div>

              {/* Specimen Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Sample Container</label>
                  <input
                    type="text"
                    value={formData.sampleContainer}
                    onChange={(e) => setFormData({ ...formData, sampleContainer: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Sample Volume</label>
                  <input
                    type="text"
                    value={formData.sampleVolume}
                    onChange={(e) => setFormData({ ...formData, sampleVolume: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Processing Department</label>
                  <input
                    type="text"
                    value={formData.processingDepartment}
                    onChange={(e) => setFormData({ ...formData, processingDepartment: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Pricing Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">MRP (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Offer Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">B2B Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.b2bRate}
                    onChange={(e) => setFormData({ ...formData, b2bRate: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">TAT (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.tatHours}
                    onChange={(e) => setFormData({ ...formData, tatHours: parseInt(e.target.value) || 24 })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/40"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-200 cursor-pointer">
                  Test is Active in Diagnostic Catalog
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Link
                  href={`/tests/${id}`}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* VIEW MODE DOSSIER */
          <div className="space-y-6">
            {/* 4 Clinical Metric Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                  <span>Patient Tariff (MRP)</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-xl font-black text-white">
                  ₹{test?.price || 0}
                </div>
                {test?.offerPrice && (
                  <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                    Offer: ₹{test.offerPrice} (Save ₹{test.price - test.offerPrice})
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                  <span>Turnaround Time (TAT)</span>
                  <Clock3 className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-xl font-black text-white">
                  {test?.tatHours ? `${test.tatHours} Hours` : "Same Day"}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  {test?.tatDisplay || "Standard routine queue"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                  <span>Specimen Tube</span>
                  <TestTube2 className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-base font-black text-white truncate">
                  {test?.sampleContainer || test?.sampleType || "Standard Vial"}
                </div>
                <div className="text-[11px] font-semibold text-purple-400 mt-0.5">
                  Vol: {test?.sampleVolume || "2.0 mL"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                  <span>Processing Lab</span>
                  <Building2 className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-base font-black text-white truncate">
                  {test?.processingDepartment || test?.category?.name || "General Lab"}
                </div>
                <div className="text-[11px] font-semibold text-blue-400 mt-0.5">
                  Method: {test?.method || "Automated"}
                </div>
              </div>
            </div>

            {/* Main Clinical Details */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-6">
              {/* Clinical Significance & Preparation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <span>📋</span> Clinical Significance & Medical Utility
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {test?.clinicalSignificance || test?.description || "Diagnostic screening and clinical pathology investigation."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>⚠️</span> Patient Fasting & Phlebotomy Preparation
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {test?.patientPreparation || "No special fasting requirements. Follow standard venipuncture SOP."}
                  </p>
                </div>
              </div>

              {/* Analyte Parameters Matrix */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                  <Sliders className="h-4 w-4 text-blue-400" />
                  <span>Configured Analyte Parameters ({test?.parameters?.length || 0})</span>
                </h3>

                {test?.parameters && test.parameters.length > 0 ? (
                  <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Parameter Name</th>
                          <th className="px-4 py-3">Reporting Unit</th>
                          <th className="px-4 py-3">Data Type</th>
                          <th className="px-4 py-3">Mandatory</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {test.parameters.map((p: any) => (
                          <tr key={p.id} className="hover:bg-slate-900/40 transition">
                            <td className="px-4 py-3 font-bold text-white">{p.parameterName}</td>
                            <td className="px-4 py-3 font-mono text-blue-400">{p.unit || "—"}</td>
                            <td className="px-4 py-3 text-slate-300">{p.dataType}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.isRequired ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-400"
                              }`}>
                                {p.isRequired ? "REQUIRED" : "OPTIONAL"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                    No discrete analyte sub-parameters configured for this test. The final result will be reported as a single report value.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}