"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";
import TubeGuideModal from "@/components/tests/TubeGuideModal";
import TariffPrintModal from "@/components/tests/TariffPrintModal";
import TestDrawer from "@/components/tests/TestDrawer";
import PackageMatrixView from "@/components/tests/PackageMatrixView";
import ParameterMatrixView from "@/components/tests/ParameterMatrixView";
import {
  FlaskConical,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Printer,
  Copy,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Clock3,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Eye,
  Edit,
  Tag,
  Building2,
  ShieldCheck,
  Package,
  Activity,
  Flame,
  Table as TableIcon,
  LayoutGrid,
  ChevronRight,
  DollarSign,
  Loader2,
  FileText
} from "lucide-react";

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Master Workstation Tabs
  const [workstationTab, setWorkstationTab] = useState<"catalog" | "packages" | "parameters" | "tubes" | "tariff">("catalog");

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSampleType, setSelectedSampleType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedFasting, setSelectedFasting] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "code" | "price_asc" | "price_desc" | "tat">("name");

  // Multi-selection for bulk operations
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modals & Drawer
  const [inspectingTest, setInspectingTest] = useState<any | null>(null);
  const [isTubeGuideOpen, setIsTubeGuideOpen] = useState(false);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [testsRes, catRes] = await Promise.all([
        testApi.getAll(),
        testApi.getCategories().catch(() => ({ data: [] })),
      ]);

      if (testsRes.success && testsRes.data) {
        setTests(testsRes.data.tests || testsRes.data || []);
      } else {
        setError(testsRes.message || "Failed to fetch tests catalog");
      }

      if (catRes && catRes.data) {
        setCategories(catRes.data || []);
      }
    } catch (err) {
      console.error("Error fetching test data:", err);
      setError(err instanceof Error ? err.message : "Failed to load test data");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // 1-Click Inline Status Toggle Switch
  const handleToggleStatus = async (test: any) => {
    const newStatus = test.isActive === false ? true : false;
    const prevTests = [...tests];

    setTests(
      tests.map((t) =>
        t.id === test.id ? { ...t, isActive: newStatus } : t
      )
    );

    if (inspectingTest && inspectingTest.id === test.id) {
      setInspectingTest({ ...inspectingTest, isActive: newStatus });
    }

    try {
      const res = await testApi.update(String(test.id), { isActive: newStatus });
      if (res.success) {
        showNotification(`Test "${test.testName || test.name}" marked as ${newStatus ? "Active" : "Inactive"}`);
      } else {
        throw new Error(res.message || "Update failed");
      }
    } catch (err) {
      setTests(prevTests);
      alert(err instanceof Error ? err.message : "Failed to update test status");
    }
  };

  // Quick Duplicate / Clone Test
  const handleDuplicateTest = async (test: any) => {
    const newCode = `${test.testCode || test.code || 'TEST'}_COPY`;
    const newName = `${test.testName || test.name} (Copy)`;

    if (!confirm(`Create a clone of "${test.testName || test.name}" with code ${newCode}?`)) {
      return;
    }

    try {
      const cloneData = {
        testCode: newCode,
        testName: newName,
        shortName: test.shortName ? `${test.shortName}_C` : undefined,
        categoryId: test.categoryId || undefined,
        sampleType: test.sampleType || "BLOOD",
        sampleContainer: test.sampleContainer || undefined,
        sampleVolume: test.sampleVolume || undefined,
        processingDepartment: test.processingDepartment || undefined,
        method: test.method || undefined,
        description: test.description || undefined,
        clinicalSignificance: test.clinicalSignificance || undefined,
        patientPreparation: test.patientPreparation || undefined,
        price: Number(test.price) || 0,
        offerPrice: test.offerPrice ? Number(test.offerPrice) : undefined,
        b2bRate: test.b2bRate ? Number(test.b2bRate) : undefined,
        gstPercentage: Number(test.gstPercentage) || 0,
        tatHours: Number(test.tatHours) || 24,
        tatDisplay: test.tatDisplay || undefined,
        isActive: true,
      };

      const res = await testApi.create(cloneData);
      if (res.success && res.data) {
        setTests([res.data, ...tests]);
        showNotification(`Test duplicated successfully as ${newCode}!`);
      } else {
        alert(res.message || "Failed to duplicate test");
      }
    } catch (err) {
      console.error("Duplicate test error:", err);
      alert(err instanceof Error ? err.message : "Failed to duplicate test");
    }
  };

  // Vacutainer Cap Info
  const getTubeInfo = (container?: string, sampleType?: string) => {
    const text = `${container || ''} ${sampleType || ''}`.toLowerCase();
    if (text.includes("edta") || text.includes("purple") || text.includes("lavender")) {
      return { label: "EDTA Purple", color: "#9333EA", cap: "bg-purple-600", bg: "bg-purple-500/10 text-purple-300 border-purple-500/40" };
    }
    if (text.includes("fluoride") || text.includes("oxalate") || text.includes("grey") || text.includes("gray")) {
      return { label: "Fluoride Grey", color: "#64748B", cap: "bg-slate-500", bg: "bg-slate-500/10 text-slate-300 border-slate-500/40" };
    }
    if (text.includes("sst") || text.includes("gold") || text.includes("gel") || text.includes("yellow")) {
      return { label: "SST Gold", color: "#D97706", cap: "bg-amber-500", bg: "bg-amber-500/10 text-amber-300 border-amber-500/40" };
    }
    if (text.includes("red") || text.includes("plain") || text.includes("serum")) {
      return { label: "Plain Red", color: "#DC2626", cap: "bg-red-600", bg: "bg-red-500/10 text-red-300 border-red-500/40" };
    }
    if (text.includes("citrate") || text.includes("blue")) {
      return { label: "Citrate Blue", color: "#0284C7", cap: "bg-sky-500", bg: "bg-sky-500/10 text-sky-300 border-sky-500/40" };
    }
    if (text.includes("heparin") || text.includes("green")) {
      return { label: "Heparin Green", color: "#16A34A", cap: "bg-emerald-600", bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40" };
    }
    if (text.includes("urine") || text.includes("stool") || text.includes("swab") || text.includes("sputum")) {
      return { label: container || sampleType || "Sterile Cup", color: "#CA8A04", cap: "bg-yellow-500", bg: "bg-yellow-500/10 text-yellow-300 border-yellow-500/40" };
    }
    return { label: container || sampleType || "Standard Vial", color: "#475569", cap: "bg-slate-600", bg: "bg-slate-500/10 text-slate-300 border-slate-500/40" };
  };

  // Filtered and Sorted Tests
  const filteredTests = useMemo(() => {
    return tests
      .filter((test) => {
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchesName = (test.testName || test.name || "").toLowerCase().includes(q);
          const matchesCode = (test.testCode || test.code || "").toLowerCase().includes(q);
          const matchesShort = (test.shortName || "").toLowerCase().includes(q);
          const matchesMethod = (test.method || "").toLowerCase().includes(q);
          const matchesDept = (test.processingDepartment || "").toLowerCase().includes(q);
          if (!matchesName && !matchesCode && !matchesShort && !matchesMethod && !matchesDept) {
            return false;
          }
        }

        if (selectedCategory) {
          const testCatId = test.categoryId;
          const testCatName = test.category?.name || test.category;
          if (testCatId !== selectedCategory && testCatName !== selectedCategory) {
            return false;
          }
        }

        if (selectedSampleType && test.sampleType !== selectedSampleType) {
          return false;
        }

        if (selectedStatus === "active" && test.isActive === false) return false;
        if (selectedStatus === "inactive" && test.isActive !== false) return false;

        if (selectedFasting === "fasting") {
          const prep = (test.patientPreparation || "").toLowerCase();
          if (!prep.includes("fast") && !prep.includes("overnight") && !prep.includes("empty stomach")) {
            return false;
          }
        } else if (selectedFasting === "non-fasting") {
          const prep = (test.patientPreparation || "").toLowerCase();
          if (prep.includes("fast") || prep.includes("overnight")) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return (a.testName || a.name || "").localeCompare(b.testName || b.name || "");
        }
        if (sortBy === "code") {
          return (a.testCode || a.code || "").localeCompare(b.testCode || b.code || "");
        }
        if (sortBy === "price_asc") {
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        }
        if (sortBy === "price_desc") {
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        }
        if (sortBy === "tat") {
          return (Number(a.tatHours) || 24) - (Number(b.tatHours) || 24);
        }
        return 0;
      });
  }, [tests, searchTerm, selectedCategory, selectedSampleType, selectedStatus, selectedFasting, sortBy]);

  const totalActive = tests.filter((t) => t.isActive !== false).length;
  const statAvailableCount = tests.filter((t) => (t.tatHours && Number(t.tatHours) <= 4) || (t.tatDisplay && t.tatDisplay.toLowerCase().includes("stat"))).length;
  const totalCategoriesCount = categories.length || new Set(tests.map((t) => t.categoryId || t.category?.name)).size;

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <div className="space-y-6 pb-12">
        {/* Floating Notification */}
        {successMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-emerald-400 bg-emerald-950 text-white px-5 py-3.5 text-xs font-semibold shadow-2xl animate-in slide-in-from-top-3 duration-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Copy Feedback */}
        {copiedCode && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-xs font-bold text-white shadow-xl animate-in fade-in duration-200 flex items-center gap-2">
            <span>📋</span> Copied &quot;{copiedCode}&quot; to clipboard!
          </div>
        )}

        {/* Top Diagnostic Master Command Header */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              {/* Accreditation & Quality Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-cyan-200 backdrop-blur-md">
                  <FlaskConical className="h-3.5 w-3.5 text-cyan-300" /> Clinical Test Catalog Master
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-200 backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> NABL &amp; CAP / ISO 15189 Validated
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/40 bg-indigo-400/10 px-3 py-1 text-indigo-200 backdrop-blur-md">
                  <Activity className="h-3.5 w-3.5 text-indigo-300" /> LOINC &amp; SNOMED Coded
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-slate-100 via-cyan-100 to-indigo-100 bg-clip-text text-transparent">
                Diagnostic Test Directory &amp; Tariff Master
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Comprehensive pathology test catalog with multi-tier pricing, age/gender reference intervals, vacutainer tube SOPs, and health package bundles.
              </p>
            </div>

            {/* Action Hub */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsTubeGuideOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-purple-500/40 bg-purple-950/40 px-4 py-3 text-xs font-bold text-purple-300 hover:bg-purple-900/50 transition-all backdrop-blur-md"
              >
                🧪 Vacutainer Tube SOP
              </button>

              <button
                onClick={() => setIsTariffModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-xs font-bold text-slate-200 hover:border-slate-600 hover:text-white transition-all backdrop-blur-md"
              >
                <Printer className="h-4 w-4 text-cyan-400" /> Print Rate Card
              </button>

              <Link
                href="/tests/new"
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/60 bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-black text-slate-950 shadow-xl shadow-cyan-950/50 hover:from-cyan-400 hover:to-blue-500 hover:scale-105 transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span>Add Diagnostic Test</span>
              </Link>
            </div>
          </div>

          {/* Real-Time KPI Strip */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 border-t border-white/10 pt-6">
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Catalog Menu</span>
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <p className="mt-1 text-2xl font-black text-white">{tests.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{totalActive} Active Tests</p>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Departments</span>
              <p className="mt-1 text-2xl font-black text-white">{totalCategoriesCount}</p>
              <p className="text-[10px] text-indigo-200/80 mt-0.5">Biochem, Hema, Micro</p>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">STAT / Rapid</span>
                <Flame className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
              </div>
              <p className="mt-1 text-2xl font-black text-white">{statAvailableCount}</p>
              <p className="text-[10px] text-rose-200/80 mt-0.5">Sub-4h Turnaround</p>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Health Packages</span>
              <p className="mt-1 text-2xl font-black text-white">4</p>
              <p className="text-[10px] text-purple-200/80 mt-0.5">Full Body &amp; Profiles</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Quality Standard</span>
              <p className="mt-1 text-xl font-black text-white">ISO 15189</p>
              <p className="text-[10px] text-emerald-300/80 mt-0.5">NABL Compliant</p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 to-slate-900/60 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Price Tiers</span>
              <p className="mt-1 text-xl font-black text-white">OPD / IPD</p>
              <p className="text-[10px] text-amber-200/80 mt-0.5">B2B Rate Card Mapped</p>
            </div>
          </div>
        </div>

        {/* Master Workstation Mode Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setWorkstationTab("catalog")}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                workstationTab === "catalog"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-950/50 scale-105"
                  : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <TableIcon className="h-4 w-4" />
              <span>1. Diagnostic Test Menu</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${workstationTab === "catalog" ? "bg-slate-950 text-white" : "bg-slate-800 text-slate-300"}`}>
                {filteredTests.length}
              </span>
            </button>

            <button
              onClick={() => setWorkstationTab("packages")}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                workstationTab === "packages"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-950/50 scale-105"
                  : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Package className="h-4 w-4" />
              <span>2. Health Packages &amp; Profiles</span>
            </button>

            <button
              onClick={() => setWorkstationTab("parameters")}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition-all duration-300 ${
                workstationTab === "parameters"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-950/50 scale-105"
                  : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>3. Clinical Parameters &amp; Ref Matrix</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MASTER DIAGNOSTIC TEST DIRECTORY */}
        {workstationTab === "catalog" && (
          <div className="space-y-5">
            {/* Filter Toolbar */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="relative lg:col-span-2">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Search test name, code, method, department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    <option value="">All Departments</option>
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.id || c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedSampleType}
                    onChange={(e) => setSelectedSampleType(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    <option value="">All Specimen Matrices</option>
                    <option value="BLOOD">Whole Blood / Plasma</option>
                    <option value="SERUM">Serum</option>
                    <option value="URINE">Urine</option>
                    <option value="SWAB">Swab</option>
                    <option value="TISSUE">Tissue Biopsy</option>
                  </select>
                </div>

                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    <option value="name">Sort: Test Name (A-Z)</option>
                    <option value="code">Sort: Test Code</option>
                    <option value="price_asc">Sort: Price (Low to High)</option>
                    <option value="price_desc">Sort: Price (High to Low)</option>
                    <option value="tat">Sort: Turnaround Time (TAT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Test Catalog Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-950 shadow-2xl">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                  <p className="text-xs font-bold text-slate-400">Loading diagnostic test directory...</p>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-3">
                  <FlaskConical className="h-10 w-10 text-slate-700" />
                  <p className="text-sm font-bold text-slate-300">No matching diagnostic tests</p>
                  <p className="text-xs text-slate-600">Try adjusting search parameters or clear filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr>
                        <th className="px-5 py-4">Test Profile &amp; Code</th>
                        <th className="px-5 py-4">Department &amp; Method</th>
                        <th className="px-5 py-4">Specimen Tube SOP</th>
                        <th className="px-5 py-4">Preparation &amp; TAT</th>
                        <th className="px-5 py-4">Tariff &amp; Price</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-xs text-slate-300">
                      {filteredTests.map((test) => {
                        const tube = getTubeInfo(test.sampleContainer, test.sampleType);
                        const isStat = test.tatHours && Number(test.tatHours) <= 4;
                        const price = Number(test.price) || 0;
                        const offer = test.offerPrice ? Number(test.offerPrice) : null;
                        const hasDiscount = offer !== null && offer < price && offer > 0;

                        return (
                          <tr key={test.id} className="group hover:bg-slate-900/60 transition-colors">
                            {/* Test Name & Code */}
                            <td className="px-5 py-4">
                              <div className="space-y-1">
                                <button
                                  onClick={() => setInspectingTest(test)}
                                  className="font-bold text-slate-100 text-sm hover:text-cyan-300 text-left transition-colors flex items-center gap-1.5"
                                >
                                  {test.testName || test.name}
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                  <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-bold">
                                    {test.testCode || test.code}
                                  </span>
                                  <button
                                    onClick={(e) => copyToClipboard(test.testCode || test.code, e)}
                                    className="text-slate-500 hover:text-white"
                                    title="Copy code"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Department & Method */}
                            <td className="px-5 py-4">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-200">
                                  {test.category?.name || test.processingDepartment || "Core Pathology"}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {test.method || "Automated Clinical Chemistry"}
                                </p>
                              </div>
                            </td>

                            {/* Specimen Tube SOP */}
                            <td className="px-5 py-4">
                              <div className="space-y-1.5">
                                <div
                                  className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold shadow-sm"
                                  style={{
                                    borderColor: `${tube.color}55`,
                                    backgroundColor: `${tube.color}15`,
                                    color: tube.color,
                                  }}
                                >
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tube.color }} />
                                  <span>{test.sampleContainer || tube.label}</span>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  {test.sampleVolume || "3.0 mL"} · {test.sampleType || "BLOOD"}
                                </p>
                              </div>
                            </td>

                            {/* Preparation & TAT */}
                            <td className="px-5 py-4">
                              <div className="space-y-1 text-[10px]">
                                <span className={`inline-block font-semibold ${
                                  (test.patientPreparation || "").toLowerCase().includes("fast")
                                    ? "text-amber-300"
                                    : "text-slate-400"
                                }`}>
                                  {test.patientPreparation || "No special preparation"}
                                </span>
                                <p className="font-mono text-cyan-300 font-bold flex items-center gap-1">
                                  <Clock3 className="h-3 w-3 text-cyan-400" />
                                  TAT: {test.tatHours || 24}h {isStat && <span className="text-rose-400 font-black">(STAT)</span>}
                                </p>
                              </div>
                            </td>

                            {/* Tariff & Price */}
                            <td className="px-5 py-4">
                              <div className="space-y-0.5">
                                <div className="flex items-baseline gap-1.5 font-mono">
                                  <span className="text-sm font-black text-white">₹{hasDiscount ? offer : price}</span>
                                  {hasDiscount && (
                                    <span className="text-[10px] text-slate-500 line-through">₹{price}</span>
                                  )}
                                </div>
                                {test.b2bRate && (
                                  <span className="block text-[9px] text-slate-400 font-mono">
                                    B2B: ₹{test.b2bRate}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Status Switch */}
                            <td className="px-5 py-4">
                              <button
                                onClick={() => handleToggleStatus(test)}
                                className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase transition-all ${
                                  test.isActive !== false
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    : "bg-slate-800 text-slate-500 border border-slate-700"
                                }`}
                              >
                                {test.isActive !== false ? "Active" : "Inactive"}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setInspectingTest(test)}
                                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-slate-300 hover:text-white transition-colors"
                                  title="Inspect Test Dossier"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateTest(test)}
                                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-slate-300 hover:text-cyan-300 transition-colors"
                                  title="Clone / Duplicate Test"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                <Link
                                  href={`/tests/${test.id}/edit`}
                                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-slate-300 hover:text-indigo-300 transition-colors"
                                  title="Edit Test Master"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: HEALTH PACKAGES & PROFILES */}
        {workstationTab === "packages" && (
          <PackageMatrixView />
        )}

        {/* TAB 3: CLINICAL PARAMETERS & REFERENCE RANGES */}
        {workstationTab === "parameters" && (
          <ParameterMatrixView />
        )}

        {/* Test Slide-Over Inspection Drawer */}
        <TestDrawer
          test={inspectingTest}
          isOpen={!!inspectingTest}
          onClose={() => setInspectingTest(null)}
          onToggleStatus={handleToggleStatus}
          onDuplicate={handleDuplicateTest}
        />

        {/* Vacutainer Tube Guide Modal */}
        <TubeGuideModal
          isOpen={isTubeGuideOpen}
          onClose={() => setIsTubeGuideOpen(false)}
        />

        {/* Tariff Print Rate Card Modal */}
        <TariffPrintModal
          isOpen={isTariffModalOpen}
          onClose={() => setIsTariffModalOpen(false)}
          tests={tests}
          categories={categories}
        />
      </div>
    </ProtectedRoute>
  );
}
