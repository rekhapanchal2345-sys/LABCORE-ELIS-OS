"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";

interface TestParameter {
  id: string;
  parameterName: string;
  shortName?: string;
  unit: string;
  dataType: string;
  measurementMethod?: string;
  dropdownOptions?: string;
  decimalPrecision?: number;
  displayOrder: number;
  isRequired: boolean;
  isActive: boolean;
  testId?: string;
  test?: {
    id: string;
    testName: string;
    testCode: string;
  };
  referenceRanges?: any[];
}

const COMMON_UNITS = [
  "g/dL",
  "mg/dL",
  "10^3/µL",
  "10^6/µL",
  "%",
  "U/L",
  "fL",
  "pg",
  "mmol/L",
  "µmol/L",
  "ng/mL",
  "µIU/mL",
  "mm/hr",
  "Ratio",
];

const CBC_STANDARD_PARAMETERS = [
  { parameterName: "Hemoglobin (Hb)", shortName: "Hb", unit: "g/dL", dataType: "NUMERIC", displayOrder: 1 },
  { parameterName: "Total Leukocyte Count (WBC)", shortName: "TLC / WBC", unit: "10^3/µL", dataType: "NUMERIC", displayOrder: 2 },
  { parameterName: "Total RBC Count", shortName: "RBC", unit: "10^6/µL", dataType: "NUMERIC", displayOrder: 3 },
  { parameterName: "Platelet Count", shortName: "PLT", unit: "10^3/µL", dataType: "NUMERIC", displayOrder: 4 },
  { parameterName: "Packed Cell Volume (PCV / Hematocrit)", shortName: "PCV / HCT", unit: "%", dataType: "NUMERIC", displayOrder: 5 },
  { parameterName: "Mean Corpuscular Volume (MCV)", shortName: "MCV", unit: "fL", dataType: "NUMERIC", displayOrder: 6 },
  { parameterName: "Mean Corpuscular Hemoglobin (MCH)", shortName: "MCH", unit: "pg", dataType: "NUMERIC", displayOrder: 7 },
  { parameterName: "MCH Concentration (MCHC)", shortName: "MCHC", unit: "g/dL", dataType: "NUMERIC", displayOrder: 8 },
  { parameterName: "Red Cell Distribution Width (RDW-CV)", shortName: "RDW", unit: "%", dataType: "NUMERIC", displayOrder: 9 },
  { parameterName: "Neutrophils", shortName: "NEUT", unit: "%", dataType: "NUMERIC", displayOrder: 10 },
  { parameterName: "Lymphocytes", shortName: "LYMPH", unit: "%", dataType: "NUMERIC", displayOrder: 11 },
  { parameterName: "Monocytes", shortName: "MONO", unit: "%", dataType: "NUMERIC", displayOrder: 12 },
  { parameterName: "Eosinophils", shortName: "EOS", unit: "%", dataType: "NUMERIC", displayOrder: 13 },
  { parameterName: "Basophils", shortName: "BASO", unit: "%", dataType: "NUMERIC", displayOrder: 14 },
];

export default function TestParametersPage() {
  const [parameters, setParameters] = useState<TestParameter[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingParam, setEditingParam] = useState<TestParameter | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    testId: "",
    parameterName: "",
    shortName: "",
    unit: "mg/dL",
    dataType: "NUMERIC",
    measurementMethod: "",
    dropdownOptions: "",
    decimalPrecision: 1,
    displayOrder: 1,
    isRequired: true,
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

        const allParameters: TestParameter[] = [];
        testsArray.forEach((test: any) => {
          if (test.parameters && Array.isArray(test.parameters)) {
            test.parameters.forEach((param: any) => {
              allParameters.push({
                ...param,
                testId: test.id,
                test: {
                  id: test.id,
                  testName: test.testName || test.name,
                  testCode: test.testCode || test.code,
                },
              });
            });
          }
        });
        setParameters(allParameters);
      } else {
        setError(response.message || "Failed to fetch parameters");
      }
    } catch (err) {
      console.error("Error fetching parameters:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch parameters");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleOpenAddModal = (testIdPrefill?: string) => {
    setEditingParam(null);
    setFormData({
      testId: testIdPrefill || selectedTest || (tests[0]?.id ? String(tests[0].id) : ""),
      parameterName: "",
      shortName: "",
      unit: "mg/dL",
      dataType: "NUMERIC",
      measurementMethod: "",
      dropdownOptions: "",
      decimalPrecision: 1,
      displayOrder: parameters.length + 1,
      isRequired: true,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEditParameter = (param: TestParameter) => {
    setEditingParam(param);
    setFormData({
      testId: param.test?.id || param.testId || "",
      parameterName: param.parameterName,
      shortName: param.shortName || "",
      unit: param.unit || "",
      dataType: param.dataType || "NUMERIC",
      measurementMethod: param.measurementMethod || "",
      dropdownOptions: param.dropdownOptions || "",
      decimalPrecision: param.decimalPrecision ?? 1,
      displayOrder: param.displayOrder || 1,
      isRequired: param.isRequired !== false,
      isActive: param.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDeleteParameter = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete parameter "${name}"?`)) return;

    try {
      await testApi.deleteParameter(id);
      showNotification(`Parameter "${name}" deleted`);
      setParameters(parameters.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete parameter");
    }
  };

  const handleSaveParameter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.testId) {
      alert("Please select a target test for this parameter");
      return;
    }
    setSaving(true);

    try {
      if (editingParam) {
        await testApi.updateParameter(editingParam.id, formData);
        showNotification(`Parameter "${formData.parameterName}" updated successfully!`);
      } else {
        await testApi.addParameter(formData.testId, formData);
        showNotification(`Parameter "${formData.parameterName}" added successfully!`);
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save parameter");
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Import CBC Standard Analytes Preset
  const handleImportCBCPreset = async () => {
    // Find CBC test
    const cbcTest = tests.find(
      (t) =>
        t.testCode?.toUpperCase() === "CBC" ||
        t.testName?.toLowerCase().includes("complete blood count")
    );

    const targetTestId = cbcTest?.id || (selectedTest ? selectedTest : tests[0]?.id);

    if (!targetTestId) {
      alert("Please create a test with code 'CBC' first before importing parameters.");
      return;
    }

    const testName = tests.find((t) => t.id === targetTestId)?.testName || "selected test";

    if (!confirm(`Import 14 standard CBC analytes into "${testName}"?`)) {
      return;
    }

    setSaving(true);
    let count = 0;
    try {
      for (const p of CBC_STANDARD_PARAMETERS) {
        await testApi.addParameter(String(targetTestId), {
          ...p,
          decimalPrecision: 1,
          isRequired: true,
          isActive: true,
        });
        count++;
      }
      showNotification(`Successfully imported ${count} CBC parameters!`);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error importing CBC parameters");
    } finally {
      setSaving(false);
    }
  };

  const filteredParameters = parameters.filter((param) => {
    const matchesSearch =
      !searchTerm ||
      param.parameterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (param.shortName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (param.test?.testName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTest = !selectedTest || param.test?.id === selectedTest || param.testId === selectedTest;

    return matchesSearch && matchesTest;
  });

  const getDataTypeColor = (dataType: string) => {
    const colors: Record<string, string> = {
      NUMERIC: "bg-blue-100 text-blue-800",
      TEXT: "bg-purple-100 text-purple-800",
      BOOLEAN: "bg-green-100 text-green-800",
      OPTION: "bg-amber-100 text-amber-800",
    };
    return colors[dataType] || "bg-gray-100 text-gray-800";
  };

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
              Test Parameters & Analytes
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Configure chemical and cellular parameters, measurement units, data precision, and result rules
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImportCBCPreset}
              className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition shadow-2xs"
            >
              <span>🩸</span> Import Standard CBC Profile (14 Analytes)
            </button>

            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Parameter
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800">
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Search Parameters</label>
              <input
                type="text"
                placeholder="Search by parameter name (e.g. Hemoglobin, SGPT, Creatinine) or test name..."
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
          </div>
        </div>

        {/* Parameters Data Table */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Parameter Name</th>
                  <th className="py-3 px-4">Assigned Test</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Data Type</th>
                  <th className="py-3 px-4 text-center">Ranges</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-500">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
                      Loading parameters catalog...
                    </td>
                  </tr>
                ) : filteredParameters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-500">
                      <p className="font-semibold text-gray-800">No parameters found</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Click &quot;Add Parameter&quot; to configure sub-analytes or use the CBC preset.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredParameters.map((param) => {
                    const rrCount = param.referenceRanges?.length || 0;

                    return (
                      <tr key={param.id} className="hover:bg-gray-50 transition">
                        <td className="py-3.5 px-4 font-mono text-gray-400 font-bold">
                          #{param.displayOrder || 1}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          <div>{param.parameterName}</div>
                          {param.shortName && (
                            <span className="text-[11px] font-mono text-gray-400 font-normal">
                              ({param.shortName})
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
                            {param.test?.testCode || "TEST"}
                          </span>
                          <span className="text-gray-700 font-medium">
                            {param.test?.testName || "—"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                          {param.unit ? (
                            <span className="rounded bg-gray-100 px-2 py-0.5">{param.unit}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getDataTypeColor(param.dataType)}`}>
                            {param.dataType || "NUMERIC"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/tests/reference-ranges?paramId=${param.id}`}
                            className="inline-flex items-center gap-1 rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
                          >
                            <span>🎯</span> {rrCount > 0 ? `${rrCount} Ranges` : "Add Range"}
                          </Link>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            param.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {param.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="py-3.5 pr-6 pl-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditParameter(param)}
                              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 transition"
                              title="Edit Parameter"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteParameter(param.id, param.parameterName)}
                              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition"
                              title="Delete Parameter"
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

        {/* Modal: Add/Edit Parameter */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  {editingParam ? "Edit Test Parameter" : "Add New Test Parameter"}
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

              <form onSubmit={handleSaveParameter} className="p-6 space-y-4">
                {/* Target Test Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Assign To Test <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={Boolean(editingParam)}
                    value={formData.testId}
                    onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
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

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Parameter Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hemoglobin, Serum Creatinine"
                      value={formData.parameterName}
                      onChange={(e) => setFormData({ ...formData, parameterName: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Short Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Hb, Cr"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Units Quick Select Pills */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Measurement Unit</label>
                    <span className="text-[10px] text-gray-400">Click a standard unit:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {COMMON_UNITS.map((u) => (
                      <button
                        type="button"
                        key={u}
                        onClick={() => setFormData({ ...formData, unit: u })}
                        className={`text-[10px] px-2 py-0.5 rounded border transition ${
                          formData.unit === u
                            ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Custom unit e.g. mg/dL, %"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Data Type</label>
                    <select
                      value={formData.dataType}
                      onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="NUMERIC">Numeric (Value)</option>
                      <option value="TEXT">Descriptive Text</option>
                      <option value="BOOLEAN">Yes / No</option>
                      <option value="OPTION">Dropdown Option</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Decimal Places</label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      value={formData.decimalPrecision}
                      onChange={(e) => setFormData({ ...formData, decimalPrecision: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Report Order</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {formData.dataType === "OPTION" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Dropdown Options (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Positive, Negative, Equivocal, Indeterminate"
                      value={formData.dropdownOptions}
                      onChange={(e) => setFormData({ ...formData, dropdownOptions: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    Mandatory for report approval
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    Active analyte
                  </label>
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
                    {saving ? "Saving..." : editingParam ? "Update Parameter" : "Add Parameter"}
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