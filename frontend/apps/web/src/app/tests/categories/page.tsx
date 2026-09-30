"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";

interface TestCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  department?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive: boolean;
  tests?: any[];
}

const STANDARD_DEPARTMENTS = [
  {
    name: "Hematology & Coagulation",
    code: "HEMA",
    department: "Hematology",
    description: "Complete blood count, coagulation profiles, hemoglobinopathies, and bone marrow cytology.",
    color: "#8B5CF6",
    icon: "🩸",
  },
  {
    name: "Clinical Biochemistry",
    code: "BIO",
    department: "Biochemistry",
    description: "Metabolic panels, liver/kidney function, cardiac markers, lipid profiles, and therapeutic drugs.",
    color: "#3B82F6",
    icon: "🧪",
  },
  {
    name: "Clinical Microbiology",
    code: "MICRO",
    department: "Microbiology",
    description: "Aerobic/anaerobic cultures, antibiotic susceptibility testing (AST), fungal stains, and parasitology.",
    color: "#10B981",
    icon: "🧫",
  },
  {
    name: "Immunology & Serology",
    code: "IMMUNO",
    department: "Immunology",
    description: "Autoimmune disease screening, infectious disease serology, viral hepatitis, and HIV panels.",
    color: "#EC4899",
    icon: "🧬",
  },
  {
    name: "Endocrinology & Hormones",
    code: "ENDO",
    department: "Endocrinology",
    description: "Thyroid hormones, reproductive panels, cortisol, vitamin assays, and tumor markers.",
    color: "#F59E0B",
    icon: "🔬",
  },
  {
    name: "Clinical Pathology & Urinalysis",
    code: "CPATH",
    department: "Clinical Pathology",
    description: "Routine urine microscopy, body fluid examinations, semen analysis, and stool routine.",
    color: "#14B8A6",
    icon: "🟡",
  },
  {
    name: "Histopathology & Cytopathology",
    code: "HISTO",
    department: "Histopathology",
    description: "Biopsy tissue processing, surgical pathology, FNAC, and cervical Pap smears.",
    color: "#EF4444",
    icon: "🩻",
  },
];

const COLOR_OPTIONS = [
  { value: "#3B82F6", label: "Blue", bg: "bg-blue-500" },
  { value: "#8B5CF6", label: "Purple", bg: "bg-purple-500" },
  { value: "#10B981", label: "Green", bg: "bg-green-500" },
  { value: "#F59E0B", label: "Amber", bg: "bg-amber-500" },
  { value: "#EF4444", label: "Red", bg: "bg-red-500" },
  { value: "#EC4899", label: "Pink", bg: "bg-pink-500" },
  { value: "#6366F1", label: "Indigo", bg: "bg-indigo-500" },
  { value: "#14B8A6", label: "Teal", bg: "bg-teal-500" },
];

const ICON_PRESETS = ["🩸", "🧪", "🧫", "🧬", "🔬", "🟡", "🩻", "💊", "🏥", "💡"];

export default function TestCategoriesPage() {
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TestCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    department: "",
    color: "#3B82F6",
    icon: "🧪",
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await testApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      department: "",
      color: "#3B82F6",
      icon: "🧪",
      displayOrder: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEditCategory = (category: TestCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      code: category.code,
      description: category.description || "",
      department: category.department || "",
      color: category.color || "#3B82F6",
      icon: category.icon || "🧪",
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (cat: TestCategory) => {
    const updatedStatus = !cat.isActive;
    try {
      await testApi.updateCategory(cat.id, { isActive: updatedStatus });
      setCategories(categories.map((c) => (c.id === cat.id ? { ...c, isActive: updatedStatus } : c)));
      showNotification(`Category "${cat.name}" marked as ${updatedStatus ? "Active" : "Inactive"}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle status");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      await testApi.deleteCategory(id);
      showNotification(`Category "${name}" deleted`);
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const handleSeedStandardDepartments = async () => {
    if (!confirm("This will create standard medical departments (Hematology, Biochemistry, Microbiology, etc.) in your lab catalog. Proceed?")) {
      return;
    }

    setSeeding(true);
    let createdCount = 0;

    for (const dept of STANDARD_DEPARTMENTS) {
      // Check if already exists
      const exists = categories.some((c) => c.code === dept.code || c.name.toLowerCase() === dept.name.toLowerCase());
      if (!exists) {
        try {
          await testApi.createCategory({
            ...dept,
            isActive: true,
            displayOrder: createdCount + 1,
          });
          createdCount++;
        } catch (e) {
          console.warn(`Failed seeding ${dept.name}:`, e);
        }
      }
    }

    setSeeding(false);
    showNotification(`Generated ${createdCount} standard diagnostic departments!`);
    await fetchCategories();
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await testApi.updateCategory(editingCategory.id, formData);
        showNotification(`Category "${formData.name}" updated successfully!`);
      } else {
        await testApi.createCategory(formData);
        showNotification(`Category "${formData.name}" created successfully!`);
      }
      setShowModal(false);
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <div className="space-y-6">
        {/* Floating Success Notification */}
        {successMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-bold text-green-800 shadow-lg animate-in slide-in-from-top duration-200">
            <span>✓</span> {successMessage}
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Departments & Test Categories
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Organize tests into specialized pathology sections with dedicated color coding and department routing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedStandardDepartments}
              disabled={seeding}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs disabled:opacity-50"
            >
              <span>🏥</span>
              {seeding ? "Generating..." : "Generate Standard Departments"}
            </button>

            <button
              onClick={handleAddCategory}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Department
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800">
            {error}
          </div>
        )}

        {/* Categories Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
            Loading pathology departments...
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <span className="text-4xl">🏥</span>
            <h3 className="mt-3 text-base font-bold text-gray-900">No departments configured</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Get started by clicking &quot;Generate Standard Departments&quot; to auto-create standard pathology sections.
            </p>
            <div className="mt-4">
              <button
                onClick={handleSeedStandardDepartments}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Auto-Generate Pathology Departments
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category) => {
              const testCount = category.tests?.length || 0;
              const catColor = category.color || "#3B82F6";

              return (
                <div
                  key={category.id}
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Color Banner */}
                  <div className="h-2 w-full" style={{ backgroundColor: catColor }} />

                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg shadow-2xs"
                          style={{ backgroundColor: `${catColor}15`, color: catColor }}
                        >
                          {category.icon || "🧪"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                              {category.code}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                category.isActive !== false ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {category.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-gray-900 mt-0.5">{category.name}</h3>
                        </div>
                      </div>

                      {/* 1-Click Status switch */}
                      <button
                        onClick={() => handleToggleStatus(category)}
                        className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          category.isActive !== false ? "bg-green-600" : "bg-gray-300"
                        }`}
                        title={category.isActive !== false ? "Deactivate department" : "Activate department"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            category.isActive !== false ? "translate-x-3" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {category.description && (
                      <p className="text-xs text-gray-500 mt-2.5 line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>
                    )}

                    {/* Department Badge */}
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium">Department:</span>
                      <span className="font-semibold text-gray-700">
                        {category.department || "General Lab"}
                      </span>
                    </div>

                    {/* Tests in Category */}
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium">Active Tests:</span>
                      <span className="font-bold text-blue-600">
                        {testCount} Tests configured
                      </span>
                    </div>

                    {/* Test Chips Preview */}
                    {category.tests && category.tests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {category.tests.slice(0, 3).map((t: any) => (
                          <span
                            key={t.id}
                            className="rounded bg-gray-50 border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                          >
                            {t.testCode || t.testName}
                          </span>
                        ))}
                        {category.tests.length > 3 && (
                          <span className="text-[10px] text-gray-400 py-0.5 px-1">
                            +{category.tests.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-3 flex items-center justify-between text-xs">
                    <Link
                      href={`/tests?category=${category.id}`}
                      className="font-semibold text-blue-600 hover:text-blue-800"
                    >
                      View Tests Catalog →
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-200 transition"
                        title="Edit Department"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition"
                        title="Delete Department"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add/Edit Category */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  {editingCategory ? "Edit Department / Category" : "Add New Department"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HEMA"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono font-bold uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hematology & Coagulation"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Clinical Pathology, Central Lab"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Scope of investigations in this department..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Color & Icon Picker */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Color Scheme</label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          type="button"
                          key={c.value}
                          onClick={() => setFormData({ ...formData, color: c.value })}
                          className={`h-6 w-6 rounded-full transition ${c.bg} ${
                            formData.color === c.value ? "ring-2 ring-offset-2 ring-gray-900 scale-110" : "opacity-80 hover:opacity-100"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Icon / Symbol</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ICON_PRESETS.map((ic) => (
                        <button
                          type="button"
                          key={ic}
                          onClick={() => setFormData({ ...formData, icon: ic })}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg border text-sm transition ${
                            formData.icon === ic ? "border-blue-600 bg-blue-50 font-bold" : "border-gray-200 bg-white"
                          }`}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="catIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <label htmlFor="catIsActive" className="text-xs font-medium text-gray-700 cursor-pointer">
                    Active Department (available when registering new tests)
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
                    {saving ? "Saving..." : editingCategory ? "Update Department" : "Create Department"}
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
