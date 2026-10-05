"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";
import {
  FolderTree,
  Plus,
  Sparkles,
  Search,
  Building2,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Sliders,
  ShieldCheck,
  FlaskConical,
  Activity,
  Layers,
  ChevronRight,
  ArrowRight,
  X,
  Clock3,
  Check,
  Tag
} from "lucide-react";

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
  _count?: {
    tests?: number;
  };
}

const STANDARD_DEPARTMENTS = [
  {
    name: "Hematology & Coagulation",
    code: "HEMA",
    department: "Hematology",
    description: "Complete blood count, coagulation profiles, hemoglobinopathies, ESR, and bone marrow cytology.",
    color: "#8B5CF6",
    icon: "🩸",
  },
  {
    name: "Clinical Biochemistry & Metabolic",
    code: "BIO",
    department: "Biochemistry",
    description: "Metabolic panels, liver/kidney function, cardiac enzymes, lipid profiles, therapeutic drug monitoring, and electrolytes.",
    color: "#3B82F6",
    icon: "🧪",
  },
  {
    name: "Clinical Microbiology & AST",
    code: "MICRO",
    department: "Microbiology",
    description: "Aerobic/anaerobic cultures, antibiotic susceptibility testing (AST), fungal stains, mycobacteriology, and parasitology.",
    color: "#10B981",
    icon: "🧫",
  },
  {
    name: "Immunology & Infectious Serology",
    code: "IMMUNO",
    department: "Immunology",
    description: "Autoimmune disease screening, infectious disease serology, viral hepatitis (HBV/HCV/HIV), and syphilis VDRL.",
    color: "#EC4899",
    icon: "🧬",
  },
  {
    name: "Endocrinology, Hormones & Tumor Markers",
    code: "ENDO",
    department: "Endocrinology",
    description: "Thyroid hormones (TSH/FT3/FT4), reproductive fertility panels, cortisol, vitamin D/B12 assays, and oncology tumor markers.",
    color: "#F59E0B",
    icon: "🔬",
  },
  {
    name: "Clinical Pathology & Urinalysis",
    code: "CPATH",
    department: "Clinical Pathology",
    description: "Automated routine urine microscopy, 24-hr urine chemistry, body fluid examinations, semen analysis, and stool routine.",
    color: "#14B8A6",
    icon: "🟡",
  },
  {
    name: "Histopathology & Cytopathology",
    code: "HISTO",
    department: "Histopathology",
    description: "Biopsy tissue processing, surgical pathology, frozen sections, FNAC, and cervical Liquid-Based Cytology (Pap smears).",
    color: "#EF4444",
    icon: "🩻",
  },
  {
    name: "Molecular Diagnostics & Genetics / PCR",
    code: "MOL",
    department: "Molecular",
    description: "Real-time RT-PCR viral load assays, genetic mutation profiling, HLA typing, and oncology NGS panels.",
    color: "#6366F1",
    icon: "⚡",
  },
];

const COLOR_OPTIONS = [
  { value: "#3B82F6", label: "Sapphire Blue", bg: "bg-blue-500", glow: "shadow-blue-500/30" },
  { value: "#8B5CF6", label: "Purple Lavender", bg: "bg-purple-500", glow: "shadow-purple-500/30" },
  { value: "#10B981", label: "Emerald Green", bg: "bg-emerald-500", glow: "shadow-emerald-500/30" },
  { value: "#F59E0B", label: "Amber Gold", bg: "bg-amber-500", glow: "shadow-amber-500/30" },
  { value: "#EF4444", label: "Crimson Red", bg: "bg-red-500", glow: "shadow-red-500/30" },
  { value: "#EC4899", label: "Rose Pink", bg: "bg-pink-500", glow: "shadow-pink-500/30" },
  { value: "#6366F1", label: "Indigo", bg: "bg-indigo-500", glow: "shadow-indigo-500/30" },
  { value: "#14B8A6", label: "Cyan Teal", bg: "bg-teal-500", glow: "shadow-teal-500/30" },
];

const ICON_PRESETS = ["🩸", "🧪", "🧫", "🧬", "🔬", "🟡", "🩻", "⚡", "💊", "🏥", "💡", "🩺"];

export default function TestCategoriesPage() {
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

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
      setError(null);
      const response = await testApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch departments");
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
      displayOrder: categories.length + 1,
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
    const prevCategories = [...categories];
    setCategories(categories.map((c) => (c.id === cat.id ? { ...c, isActive: updatedStatus } : c)));

    try {
      const res = await testApi.updateCategory(cat.id, { isActive: updatedStatus });
      if (res.success) {
        showNotification(`Department "${cat.name}" marked as ${updatedStatus ? "Active" : "Inactive"}`);
      } else {
        throw new Error(res.message || "Failed to update status");
      }
    } catch (err) {
      setCategories(prevCategories);
      alert(err instanceof Error ? err.message : "Failed to toggle status");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete department "${name}"? Tests mapped to this department will need reassignment.`)) {
      return;
    }

    try {
      await testApi.deleteCategory(id);
      showNotification(`Department "${name}" deleted`);
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete department");
    }
  };

  const handleSeedStandardDepartments = async () => {
    if (!confirm("This will configure 8 standard NABL/CAP hospital pathology departments (Hematology, Biochemistry, Microbiology, Serology, Endocrinology, etc.). Proceed?")) {
      return;
    }

    setSeeding(true);
    let createdCount = 0;

    for (const dept of STANDARD_DEPARTMENTS) {
      const exists = categories.some((c) => c.code.toUpperCase() === dept.code.toUpperCase() || c.name.toLowerCase() === dept.name.toLowerCase());
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
    showNotification(`Generated ${createdCount} standard hospital pathology departments!`);
    await fetchCategories();
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!formData.code.trim()) {
        throw new Error("Department Code is required");
      }
      if (!formData.name.trim()) {
        throw new Error("Department Name is required");
      }

      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
      };

      if (editingCategory) {
        await testApi.updateCategory(editingCategory.id, payload);
        showNotification(`Department "${payload.name}" updated successfully!`);
      } else {
        await testApi.createCategory(payload);
        showNotification(`Department "${payload.name}" created successfully!`);
      }
      setShowModal(false);
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save department");
    } finally {
      setSaving(false);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.department && cat.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "ALL"
        ? true
        : filterStatus === "ACTIVE"
        ? cat.isActive
        : !cat.isActive;

    return matchesSearch && matchesStatus;
  });

  // Department KPIs
  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const totalTestsMapped = categories.reduce((acc, c) => acc + (c.tests?.length || c._count?.tests || 0), 0);

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <div className="space-y-6 pb-20">
        {/* Floating Success Notification */}
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
              <FolderTree className="h-3.5 w-3.5" />
              <span>Laboratory Structure / Clinical Taxonomy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Pathology Departments & Disciplines</span>
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Organize tests into specialized clinical divisions with analyzer routing, department turnaround SLAs, and NABL oversight
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedStandardDepartments}
              disabled={seeding}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-4 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition shadow-lg shadow-indigo-500/10 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>{seeding ? "Generating..." : "Generate 8 Standard Departments"}</span>
            </button>

            <button
              onClick={handleAddCategory}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4.5 py-2.5 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              <span>Add Department</span>
            </button>
          </div>
        </div>

        {/* Clinical KPI Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Total Departments</span>
              <Building2 className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalCount}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Clinical sections</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Active Disciplines</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Operational in routing</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Mapped Investigations</span>
              <FlaskConical className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400">{totalTestsMapped}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Tests assigned</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>NABL Quality Standard</span>
              <ShieldCheck className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">ISO 15189</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Compliant routing</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by department name, code, or discipline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterStatus === status
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {status === "ALL" ? "All Sections" : status === "ACTIVE" ? "Active Only" : "Inactive"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-950/60 border border-rose-500/40 p-4 text-xs font-bold text-rose-300">
            {error}
          </div>
        )}

        {/* Department Cards Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent mx-auto" />
            <div className="text-xs font-bold text-slate-400">Loading Clinical Departments...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <span className="text-4xl">🏥</span>
            <h3 className="text-base font-black text-white">No laboratory departments match your search</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click the button below to generate standard pathology departments or add a custom department.
            </p>
            <button
              onClick={handleSeedStandardDepartments}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25"
            >
              ⚡ Generate Standard Hospital Departments
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((cat) => {
              const deptColor = cat.color || "#3B82F6";
              const testsCount = cat.tests?.length || cat._count?.tests || 0;

              return (
                <div
                  key={cat.id}
                  className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-xl ${
                    cat.isActive
                      ? "border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5"
                      : "border-slate-800/50 bg-slate-950/40 opacity-70"
                  }`}
                >
                  {/* Top Glowing Color Stripe */}
                  <div
                    className="h-1.5 w-full transition-all group-hover:h-2"
                    style={{ backgroundColor: deptColor, boxShadow: `0 0 12px ${deptColor}88` }}
                  />

                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-lg border border-white/10"
                          style={{ backgroundColor: `${deptColor}25` }}
                        >
                          {cat.icon || "🧪"}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-slate-400">
                              {cat.code}
                            </span>
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: deptColor }}
                            />
                          </div>
                          <h3 className="text-base font-black text-white leading-tight mt-0.5">
                            {cat.name}
                          </h3>
                        </div>
                      </div>

                      {/* Status Pill Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(cat)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition ${
                          cat.isActive
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                        }`}
                        title="Click to toggle status"
                      >
                        {cat.isActive ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed min-h-[36px]">
                      {cat.description || "Specialized clinical pathology department with automated analyzer routing."}
                    </p>

                    {/* Sub-metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                      <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-400 block">Discipline</span>
                        <span className="text-xs font-bold text-white truncate block mt-0.5">
                          {cat.department || "General Lab"}
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-400 block">Active Tests</span>
                        <span className="text-xs font-black text-blue-400 block mt-0.5">
                          {testsCount} Investigations
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <Link
                        href={`/tests/new?categoryId=${cat.id}`}
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition"
                      >
                        <span>+ Add Test</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditCategory(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                          title="Edit Department"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition"
                          title="Delete Department"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL: ADD / EDIT DEPARTMENT */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-white">
                      {editingCategory ? "Edit Department & Discipline" : "Create New Pathology Department"}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Configure clinical taxonomy, department color badge, and routing details
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

              {/* Modal Form */}
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Code */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Code <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HEMA, BIO"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono font-black uppercase text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Department Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Clinical Biochemistry & Metabolic"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Discipline */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Discipline Section
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Biochemistry, Hematology"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Display Order Sequence
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Color Theme Selector */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                    Department Brand Color Tag:
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => setFormData({ ...formData, color: c.value })}
                        className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                          formData.color === c.value
                            ? "border-white ring-2 ring-blue-500 scale-110 shadow-lg"
                            : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c.value }}
                      >
                        {formData.color === c.value && <Check className="h-4 w-4 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Preset Picker */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                    Discipline Icon:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_PRESETS.map((icon) => (
                      <button
                        type="button"
                        key={icon}
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`h-9 w-9 rounded-xl border text-lg flex items-center justify-center transition ${
                          formData.icon === icon
                            ? "border-blue-500 bg-blue-950/60 ring-2 ring-blue-500/30 scale-110 shadow-md"
                            : "border-slate-700 bg-slate-950 hover:bg-slate-800"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                    Department Scope & Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Analytical scope, clinical services, automated analyzer details..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="deptActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/40"
                  />
                  <label htmlFor="deptActive" className="text-xs font-bold text-slate-200 cursor-pointer">
                    Publish Department as Active in Test Catalog & CPOE Routing
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25 disabled:opacity-50"
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
