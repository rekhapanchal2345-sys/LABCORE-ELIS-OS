"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";
import {
  Scale,
  Plus,
  Search,
  FlaskConical,
  CheckCircle2,
  Trash2,
  Edit,
  Sparkles,
  Filter,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sliders,
  X,
  BellRing,
  User,
  Users,
  Baby,
  Activity
} from "lucide-react";

interface ReferenceRange {
  id: string;
  gender: string;
  ageGroup?: string;
  minAge?: number;
  maxAge?: number;
  minAgeUnit?: string;
  maxAgeUnit?: string;
  criticalLow?: number;
  normalLow?: number;
  normalHigh?: number;
  criticalHigh?: number;
  normalValueText?: string;
  interpretation?: string;
  notes?: string;
  isActive: boolean;
  parameterId?: string;
  parameter?: {
    id: string;
    parameterName: string;
    unit: string;
    test?: {
      id: string;
      testName: string;
      testCode: string;
    };
  };
}

const AGE_GROUP_PRESETS = [
  { label: "Adult (18 - 60 Years)", minAge: 18, maxAge: 60, unit: "YEARS" },
  { label: "Pediatric (1 - 12 Years)", minAge: 1, maxAge: 12, unit: "YEARS" },
  { label: "Adolescent (12 - 18 Years)", minAge: 12, maxAge: 18, unit: "YEARS" },
  { label: "Senior / Geriatric (60+ Years)", minAge: 60, maxAge: 120, unit: "YEARS" },
  { label: "Infant (1 - 12 Months)", minAge: 1, maxAge: 12, unit: "MONTHS" },
  { label: "Newborn (0 - 28 Days)", minAge: 0, maxAge: 28, unit: "DAYS" },
  { label: "All Age Groups (0 - 120 Years)", minAge: 0, maxAge: 120, unit: "YEARS" },
];

export default function ReferenceRangesPage() {
  const [ranges, setRanges] = useState<ReferenceRange[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedTest, setSelectedTest] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingRange, setEditingRange] = useState<ReferenceRange | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    testId: "",
    parameterId: "",
    gender: "MALE",
    ageGroup: "ADULT",
    minAge: 18,
    maxAge: 60,
    minAgeUnit: "YEARS",
    maxAgeUnit: "YEARS",
    criticalLow: "",
    normalLow: "",
    normalHigh: "",
    criticalHigh: "",
    normalValueText: "",
    interpretation: "",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testApi.getAll();
      if (response.success && response.data) {
        const testsData = response.data.tests || response.data || [];
        const testsArray = Array.isArray(testsData) ? testsData : [];
        setTests(testsArray);

        const allRanges: ReferenceRange[] = [];
        testsArray.forEach((test: any) => {
          if (test.parameters && Array.isArray(test.parameters)) {
            test.parameters.forEach((param: any) => {
              if (param.referenceRanges && Array.isArray(param.referenceRanges)) {
                param.referenceRanges.forEach((range: any) => {
                  allRanges.push({
                    ...range,
                    parameterId: param.id,
                    parameter: {
                      id: param.id,
                      parameterName: param.parameterName,
                      unit: param.unit,
                      test: {
                        id: test.id,
                        testName: test.testName || test.name,
                        testCode: test.testCode || test.code,
                      },
                    },
                  });
                });
              }
            });
          }
        });
        setRanges(allRanges);
      } else {
        setError(response.message || "Failed to fetch reference intervals");
      }
    } catch (err) {
      console.error("Error fetching reference ranges:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch reference ranges");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleOpenAddModal = (testIdPrefill?: string, paramIdPrefill?: string) => {
    setEditingRange(null);
    const defaultTest = testIdPrefill || (tests[0]?.id ? String(tests[0].id) : "");
    const testObj = tests.find((t) => t.id === defaultTest);
    const defaultParam = paramIdPrefill || (testObj?.parameters?.[0]?.id ? String(testObj.parameters[0].id) : "");

    setFormData({
      testId: defaultTest,
      parameterId: defaultParam,
      gender: "MALE",
      ageGroup: "ADULT",
      minAge: 18,
      maxAge: 60,
      minAgeUnit: "YEARS",
      maxAgeUnit: "YEARS",
      criticalLow: "",
      normalLow: "",
      normalHigh: "",
      criticalHigh: "",
      normalValueText: "",
      interpretation: "",
      notes: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEditRange = (range: ReferenceRange) => {
    setEditingRange(range);
    setFormData({
      testId: range.parameter?.test?.id || "",
      parameterId: range.parameterId || range.parameter?.id || "",
      gender: range.gender || "MALE",
      ageGroup: range.ageGroup || "ADULT",
      minAge: range.minAge ?? 18,
      maxAge: range.maxAge ?? 60,
      minAgeUnit: range.minAgeUnit || "YEARS",
      maxAgeUnit: range.maxAgeUnit || "YEARS",
      criticalLow: range.criticalLow !== undefined ? String(range.criticalLow) : "",
      normalLow: range.normalLow !== undefined ? String(range.normalLow) : "",
      normalHigh: range.normalHigh !== undefined ? String(range.normalHigh) : "",
      criticalHigh: range.criticalHigh !== undefined ? String(range.criticalHigh) : "",
      normalValueText: range.normalValueText || "",
      interpretation: range.interpretation || "",
      notes: range.notes || "",
      isActive: range.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDeleteRange = async (id: string) => {
    if (!confirm("Are you sure you want to delete this biological reference interval?")) return;

    try {
      await testApi.deleteReferenceRange(id);
      showNotification("Reference range interval deleted");
      setRanges(ranges.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete reference range");
    }
  };

  const handleSaveRange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parameterId) {
      alert("Please select a target analyte parameter for this interval");
      return;
    }
    setSaving(true);

    try {
      const payload: any = {
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        minAge: Number(formData.minAge),
        maxAge: Number(formData.maxAge),
        minAgeUnit: formData.minAgeUnit,
        maxAgeUnit: formData.maxAgeUnit,
        normalLow: formData.normalLow ? Number(formData.normalLow) : undefined,
        normalHigh: formData.normalHigh ? Number(formData.normalHigh) : undefined,
        criticalLow: formData.criticalLow ? Number(formData.criticalLow) : undefined,
        criticalHigh: formData.criticalHigh ? Number(formData.criticalHigh) : undefined,
        normalValueText: formData.normalValueText || undefined,
        interpretation: formData.interpretation || undefined,
        notes: formData.notes || undefined,
        isActive: formData.isActive,
      };

      if (editingRange) {
        await testApi.updateReferenceRange(editingRange.id, payload);
        showNotification("Reference interval updated successfully!");
      } else {
        await testApi.addReferenceRange(formData.parameterId, payload);
        showNotification("Reference interval added successfully!");
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save reference range");
    } finally {
      setSaving(false);
    }
  };

  // Filtered parameters of selected test in form modal
  const activeFormTest = tests.find((t) => t.id === formData.testId);
  const activeTestParameters = activeFormTest?.parameters || [];

  // Filtered ranges list
  const filteredRanges = ranges.filter((range) => {
    const matchesSearch =
      (range.parameter?.parameterName && range.parameter.parameterName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (range.parameter?.unit && range.parameter.unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (range.parameter?.test?.testName && range.parameter.test.testName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGender = selectedGender ? range.gender === selectedGender : true;
    const matchesTest = selectedTest ? range.parameter?.test?.id === selectedTest : true;

    return matchesSearch && matchesGender && matchesTest;
  });

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <div className="space-y-6 pb-24">
        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/90 px-5 py-3 text-xs font-black text-emerald-300 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Master Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
              <Scale className="h-3.5 w-3.5" />
              <span>NABL & CAP Biological Normal Limits / Decision Thresholds</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Biological Reference Intervals Matrix</span>
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Configure gender, age-stratified reference ranges, panic critical values, and interpretation guidelines
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4.5 py-2.5 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              <span>Add Reference Interval</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by analyte name, unit, or investigation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500"
            >
              <option value="">All Genders</option>
              <option value="MALE">Male Only</option>
              <option value="FEMALE">Female Only</option>
              <option value="BOTH">Universal (Both)</option>
            </select>

            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500"
            >
              <option value="">All Investigations ({tests.length})</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900">
                  {t.testCode || t.code} - {t.testName || t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-950/60 border border-rose-500/40 p-4 text-xs font-bold text-rose-300">
            {error}
          </div>
        )}

        {/* Intervals Table View */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent mx-auto" />
            <div className="text-xs font-bold text-slate-400">Loading Biological Intervals...</div>
          </div>
        ) : filteredRanges.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <Scale className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-black text-white">No reference intervals configured</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Configure physiological reference ranges (Male, Female, Pediatric, Geriatric) with panic critical thresholds.
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25"
            >
              + Add First Interval
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5">Analyte Parameter</th>
                    <th className="px-4 py-3.5">Investigation</th>
                    <th className="px-4 py-3.5">Gender / Age Demographic</th>
                    <th className="px-4 py-3.5">Normal Physiological Range</th>
                    <th className="px-4 py-3.5">Critical Panic Thresholds</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-medium text-slate-300">
                  {filteredRanges.map((range) => {
                    const hasCritical = range.criticalLow !== undefined || range.criticalHigh !== undefined;

                    return (
                      <tr key={range.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-white">
                            {range.parameter?.parameterName || "Parameter"}
                          </span>
                          <span className="ml-2 font-mono text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
                            {range.parameter?.unit || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-slate-300">
                          {range.parameter?.test?.testName || "—"}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              range.gender === "MALE"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                : range.gender === "FEMALE"
                                ? "bg-pink-500/10 text-pink-400 border border-pink-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            }`}>
                              {range.gender}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {range.minAge ?? 0} - {range.maxAge ?? 100} {range.minAgeUnit || "YEARS"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono">
                          {range.normalLow !== undefined && range.normalHigh !== undefined
                            ? `${range.normalLow} - ${range.normalHigh} ${range.parameter?.unit || ""}`
                            : range.normalValueText || "Qualitative"}
                        </td>

                        <td className="px-4 py-3.5">
                          {hasCritical ? (
                            <div className="space-y-0.5">
                              {range.criticalLow !== undefined && (
                                <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/40 mr-1">
                                  <span>&lt; {range.criticalLow}</span>
                                </span>
                              )}
                              {range.criticalHigh !== undefined && (
                                <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/40">
                                  <span>&gt; {range.criticalHigh}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">None</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditRange(range)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                              title="Edit Range"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRange(range.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition"
                              title="Delete Range"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT REFERENCE RANGE */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                    <Scale className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-white">
                      {editingRange ? "Edit Biological Reference Range" : "Add Biological Reference Interval"}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Configure gender, age thresholds, and panic alert triggers
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRange} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Parent Test */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Investigation
                    </label>
                    <select
                      value={formData.testId}
                      onChange={(e) => {
                        const newTestId = e.target.value;
                        const tObj = tests.find((t) => t.id === newTestId);
                        const firstP = tObj?.parameters?.[0]?.id || "";
                        setFormData({ ...formData, testId: newTestId, parameterId: firstP });
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500"
                    >
                      <option value="">Select Investigation</option>
                      {tests.map((t) => (
                        <option key={t.id} value={t.id} className="bg-slate-900">
                          {t.testCode || t.code} - {t.testName || t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Target Parameter */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Analyte Parameter <span className="text-rose-400">*</span>
                    </label>
                    <select
                      required
                      value={formData.parameterId}
                      onChange={(e) => setFormData({ ...formData, parameterId: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500"
                    >
                      <option value="">Select Parameter</option>
                      {activeTestParameters.map((p: any) => (
                        <option key={p.id} value={p.id} className="bg-slate-900">
                          {p.parameterName} ({p.unit || "—"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gender & Demographic */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Gender Demographic
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500"
                    >
                      <option value="MALE" className="bg-slate-900">Male Only</option>
                      <option value="FEMALE" className="bg-slate-900">Female Only</option>
                      <option value="BOTH" className="bg-slate-900">Universal (Both)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Min Age ({formData.minAgeUnit})
                    </label>
                    <input
                      type="number"
                      value={formData.minAge}
                      onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Max Age ({formData.maxAgeUnit})
                    </label>
                    <input
                      type="number"
                      value={formData.maxAge}
                      onChange={(e) => setFormData({ ...formData, maxAge: parseInt(e.target.value) || 120 })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Normal Bounds */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
                    Normal Reference Bounds
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-400 mb-1">
                        Normal Low Value
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.normalLow}
                        onChange={(e) => setFormData({ ...formData, normalLow: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-400 mb-1">
                        Normal High Value
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.normalHigh}
                        onChange={(e) => setFormData({ ...formData, normalHigh: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Panic Bounds */}
                <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-400 block">
                    Panic Critical Value Alert Triggers
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-rose-300 mb-1">
                        Critical Panic Low (Doctor Immediate Alert)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.criticalLow}
                        onChange={(e) => setFormData({ ...formData, criticalLow: e.target.value })}
                        className="w-full rounded-xl border border-rose-500/30 bg-slate-900 px-3 py-2 text-xs font-bold text-rose-300 placeholder-rose-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-rose-300 mb-1">
                        Critical Panic High (Doctor Immediate Alert)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.criticalHigh}
                        onChange={(e) => setFormData({ ...formData, criticalHigh: e.target.value })}
                        className="w-full rounded-xl border border-rose-500/30 bg-slate-900 px-3 py-2 text-xs font-bold text-rose-300 placeholder-rose-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingRange ? "Update Interval" : "Add Interval"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
