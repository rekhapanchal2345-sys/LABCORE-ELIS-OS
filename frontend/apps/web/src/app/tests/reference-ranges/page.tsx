"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";

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
        setError(response.message || "Failed to fetch reference ranges");
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

  // Available parameters based on selected test in modal
  const selectedTestObj = tests.find((t) => t.id === formData.testId);
  const availableParameters = selectedTestObj?.parameters || [];

  const handleOpenAddModal = () => {
    const firstTest = tests[0];
    const firstParam = firstTest?.parameters?.[0];

    setEditingRange(null);
    setFormData({
      testId: firstTest ? String(firstTest.id) : "",
      parameterId: firstParam ? String(firstParam.id) : "",
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
      criticalLow: range.criticalLow !== undefined && range.criticalLow !== null ? String(range.criticalLow) : "",
      normalLow: range.normalLow !== undefined && range.normalLow !== null ? String(range.normalLow) : "",
      normalHigh: range.normalHigh !== undefined && range.normalHigh !== null ? String(range.normalHigh) : "",
      criticalHigh: range.criticalHigh !== undefined && range.criticalHigh !== null ? String(range.criticalHigh) : "",
      normalValueText: range.normalValueText || "",
      interpretation: range.interpretation || "",
      notes: range.notes || "",
      isActive: range.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDeleteRange = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reference range?")) return;

    try {
      await testApi.deleteReferenceRange(id);
      showNotification("Reference range deleted successfully");
      setRanges(ranges.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete reference range");
    }
  };

  const handleSaveRange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parameterId) {
      alert("Please select a target parameter for this reference range");
      return;
    }
    setSaving(true);

    try {
      const payload: any = {
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        minAge: Number(formData.minAge) || 0,
        maxAge: Number(formData.maxAge) || 120,
        minAgeUnit: formData.minAgeUnit,
        maxAgeUnit: formData.maxAgeUnit,
        isActive: formData.isActive,
      };

      if (formData.criticalLow !== "") payload.criticalLow = parseFloat(formData.criticalLow);
      if (formData.normalLow !== "") payload.normalLow = parseFloat(formData.normalLow);
      if (formData.normalHigh !== "") payload.normalHigh = parseFloat(formData.normalHigh);
      if (formData.criticalHigh !== "") payload.criticalHigh = parseFloat(formData.criticalHigh);
      if (formData.normalValueText) payload.normalValueText = formData.normalValueText;
      if (formData.interpretation) payload.interpretation = formData.interpretation;
      if (formData.notes) payload.notes = formData.notes;

      if (editingRange) {
        await testApi.updateReferenceRange(editingRange.id, payload);
        showNotification("Reference range updated successfully!");
      } else {
        await testApi.addReferenceRange(formData.parameterId, payload);
        showNotification("Reference range added successfully!");
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save reference range");
    } finally {
      setSaving(false);
    }
  };

  const filteredRanges = ranges.filter((range) => {
    const matchesSearch =
      !searchTerm ||
      (range.parameter?.parameterName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (range.parameter?.test?.testName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (range.parameter?.test?.testCode || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender = !selectedGender || range.gender === selectedGender;
    const matchesTest = !selectedTest || range.parameter?.test?.id === selectedTest;

    return matchesSearch && matchesGender && matchesTest;
  });

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <div className="space-y-6">
        {/* Floating Notification */}
        {successMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-bold text-green-800 shadow-lg animate-in slide-in-from-top duration-200">
            <span>✓</span> {successMessage}
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Clinical Reference Ranges & Critical Panic Values
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Configure physiological safe zones, demographic thresholds (age & gender), and critical alert values
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Reference Range
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Search Ranges</label>
              <input
                type="text"
                placeholder="Search by parameter or test name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Filter by Test</label>
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Tests ({tests.length} tests)</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.testCode} - {t.testName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Gender Cohort</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Genders</option>
                <option value="MALE">Male Only</option>
                <option value="FEMALE">Female Only</option>
                <option value="OTHER">Both / Universal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reference Ranges Data Table */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Test & Parameter</th>
                  <th className="py-3 px-4">Cohort (Age & Gender)</th>
                  <th className="py-3 px-4 text-center">Panic Low</th>
                  <th className="py-3 px-4 text-center">Normal Safe Range</th>
                  <th className="py-3 px-4 text-center">Panic High</th>
                  <th className="py-3 px-4 text-center">Visual Gauge</th>
                  <th className="py-3 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
                      Loading clinical reference ranges...
                    </td>
                  </tr>
                ) : filteredRanges.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      <p className="font-semibold text-gray-800">No reference ranges configured</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Click &quot;Add Reference Range&quot; to define age/gender ranges and critical panic alert limits.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRanges.map((range) => {
                    const unit = range.parameter?.unit || "";

                    return (
                      <tr key={range.id} className="hover:bg-gray-50 transition">
                        {/* Parameter & Test */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
                            {range.parameter?.test?.testCode || "TEST"}
                          </span>
                          <span className="font-bold text-gray-900">
                            {range.parameter?.parameterName || "—"}
                          </span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">
                            {range.parameter?.test?.testName}
                          </span>
                        </td>

                        {/* Demographics */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              range.gender === "MALE"
                                ? "bg-blue-100 text-blue-800"
                                : range.gender === "FEMALE"
                                ? "bg-pink-100 text-pink-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {range.gender || "ALL"}
                            </span>
                            <span className="text-gray-700 font-medium">
                              {range.ageGroup ? range.ageGroup : `${range.minAge || 0} - ${range.maxAge || 120} ${range.maxAgeUnit || "Yrs"}`}
                            </span>
                          </div>
                        </td>

                        {/* Panic Low */}
                        <td className="py-3.5 px-4 text-center">
                          {range.criticalLow !== undefined && range.criticalLow !== null ? (
                            <span className="font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              &lt; {range.criticalLow}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Normal Range */}
                        <td className="py-3.5 px-4 text-center">
                          {range.normalLow !== undefined && range.normalHigh !== undefined && range.normalLow !== null ? (
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                              {range.normalLow} - {range.normalHigh} {unit}
                            </span>
                          ) : range.normalValueText ? (
                            <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {range.normalValueText}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not set</span>
                          )}
                        </td>

                        {/* Panic High */}
                        <td className="py-3.5 px-4 text-center">
                          {range.criticalHigh !== undefined && range.criticalHigh !== null ? (
                            <span className="font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              &gt; {range.criticalHigh}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Visual Range Indicator Bar */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 w-28 mx-auto">
                            <span className="h-2 w-4 rounded-l bg-red-400" title="Panic Low Threshold" />
                            <span className="h-2 w-12 bg-green-500 rounded-xs" title="Normal Safe Zone" />
                            <span className="h-2 w-4 rounded-r bg-red-400" title="Panic High Threshold" />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pr-6 pl-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditRange(range)}
                              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 transition"
                              title="Edit Range"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteRange(range.id)}
                              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition"
                              title="Delete Range"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add/Edit Reference Range */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  {editingRange ? "Edit Reference Range" : "Add Demographic Reference Range"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveRange} className="p-6 space-y-4">
                {/* Test & Parameter Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Parent Test <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={Boolean(editingRange)}
                      value={formData.testId}
                      onChange={(e) => {
                        const newTestId = e.target.value;
                        const tObj = tests.find((t) => t.id === newTestId);
                        setFormData({
                          ...formData,
                          testId: newTestId,
                          parameterId: tObj?.parameters?.[0]?.id || "",
                        });
                      }}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    >
                      <option value="">Select Test</option>
                      {tests.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.testCode} - {t.testName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Target Parameter <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={Boolean(editingRange)}
                      value={formData.parameterId}
                      onChange={(e) => setFormData({ ...formData, parameterId: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    >
                      <option value="">Select Parameter</option>
                      {availableParameters.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.parameterName} ({p.unit || "no unit"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Demographics: Gender & Age Presets */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="MALE">Male (Adult / Pediatric)</option>
                      <option value="FEMALE">Female (Adult / Pediatric)</option>
                      <option value="OTHER">Both / Universal Cohort</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Age Group</label>
                    <select
                      value={formData.ageGroup}
                      onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="ADULT">Adult</option>
                      <option value="PEDIATRIC">Pediatric</option>
                      <option value="SENIOR">Senior / Geriatric</option>
                      <option value="INFANT">Infant</option>
                      <option value="NEWBORN">Newborn</option>
                      <option value="ALL">All Ages</option>
                    </select>
                  </div>
                </div>

                {/* Age Range Inputs */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Min Age</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minAge}
                      onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Max Age</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxAge}
                      onChange={(e) => setFormData({ ...formData, maxAge: parseInt(e.target.value) || 120 })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Age Unit</label>
                    <select
                      value={formData.maxAgeUnit}
                      onChange={(e) => setFormData({ ...formData, minAgeUnit: e.target.value, maxAgeUnit: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="YEARS">Years</option>
                      <option value="MONTHS">Months</option>
                      <option value="DAYS">Days</option>
                    </select>
                  </div>
                </div>

                {/* Numerical Reference Safe Zone & Panic Limits */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Numerical Safe Zone & Panic Thresholds
                  </h3>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block text-red-600 font-bold mb-1">Panic Low (&lt;)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 7.0"
                        value={formData.criticalLow}
                        onChange={(e) => setFormData({ ...formData, criticalLow: e.target.value })}
                        className="w-full rounded-xl border border-red-300 bg-red-50/50 px-3 py-2 text-xs font-bold text-red-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-emerald-700 font-bold mb-1">Normal Low</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 13.0"
                        value={formData.normalLow}
                        onChange={(e) => setFormData({ ...formData, normalLow: e.target.value })}
                        className="w-full rounded-xl border border-emerald-300 bg-emerald-50/50 px-3 py-2 text-xs font-bold text-emerald-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-emerald-700 font-bold mb-1">Normal High</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 17.0"
                        value={formData.normalHigh}
                        onChange={(e) => setFormData({ ...formData, normalHigh: e.target.value })}
                        className="w-full rounded-xl border border-emerald-300 bg-emerald-50/50 px-3 py-2 text-xs font-bold text-emerald-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-red-600 font-bold mb-1">Panic High (&gt;)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 20.0"
                        value={formData.criticalHigh}
                        onChange={(e) => setFormData({ ...formData, criticalHigh: e.target.value })}
                        className="w-full rounded-xl border border-red-300 bg-red-50/50 px-3 py-2 text-xs font-bold text-red-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Qualitative Textual Range */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Qualitative / Text Normal Value (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Negative, Non-Reactive, Clear / Pale Yellow"
                    value={formData.normalValueText}
                    onChange={(e) => setFormData({ ...formData, normalValueText: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Used for non-numeric or serology tests</span>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingRange ? "Update Range" : "Save Reference Range"}
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
