"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";
import TubeGuideModal from "@/components/tests/TubeGuideModal";
import TariffPrintModal from "@/components/tests/TariffPrintModal";
import TestDrawer from "@/components/tests/TestDrawer";

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSampleType, setSelectedSampleType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedFasting, setSelectedFasting] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "code" | "price_asc" | "price_desc" | "tat">("name");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

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
        testApi.getCategories(),
      ]);

      if (testsRes.success && testsRes.data) {
        setTests(testsRes.data.tests || testsRes.data || []);
      } else {
        setError(testsRes.message || "Failed to fetch tests catalog");
      }

      if (catRes.success && catRes.data) {
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

    // Optimistic UI update
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

  const handleDelete = async (test: any) => {
    if (!confirm(`Are you sure you want to permanently delete ${test.testName || test.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await testApi.delete(String(test.id));
      setTests(tests.filter((t) => t.id !== test.id));
      setSelectedTestIds(selectedTestIds.filter((id) => id !== test.id));
      if (inspectingTest && inspectingTest.id === test.id) {
        setInspectingTest(null);
      }
      showNotification(`Test "${test.testName || test.name}" deleted`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete test");
    }
  };

  // Bulk Operations
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTestIds(filteredTests.map((t) => String(t.id)));
    } else {
      setSelectedTestIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (activate: boolean) => {
    if (selectedTestIds.length === 0) return;
    if (!confirm(`${activate ? "Activate" : "Deactivate"} ${selectedTestIds.length} selected tests?`)) {
      return;
    }

    setBulkLoading(true);
    try {
      await Promise.all(
        selectedTestIds.map((id) => testApi.update(id, { isActive: activate }))
      );
      setTests(
        tests.map((t) =>
          selectedTestIds.includes(String(t.id)) ? { ...t, isActive: activate } : t
        )
      );
      showNotification(`${selectedTestIds.length} tests ${activate ? "activated" : "deactivated"} successfully!`);
      setSelectedTestIds([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkExportSelected = () => {
    const selected = tests.filter((t) => selectedTestIds.includes(String(t.id)));
    if (selected.length === 0) return;

    const headers = ["Test Code", "Test Name", "Category", "Sample Type", "Container", "Price", "Offer Price", "TAT", "Status"];
    const rows = selected.map((t) => [
      `"${t.testCode || t.code || ''}"`,
      `"${(t.testName || t.name || '').replace(/"/g, '""')}"`,
      `"${t.category?.name || t.category || ''}"`,
      `"${t.sampleType || ''}"`,
      `"${t.sampleContainer || ''}"`,
      t.price || 0,
      t.offerPrice || '',
      `"${t.tatDisplay || ''}"`,
      t.isActive !== false ? "Active" : "Inactive",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Selected_Tests_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${selected.length} tests to CSV!`);
  };

  const handleExportCatalog = async () => {
    try {
      const response = await testApi.exportCatalog();
      if (response.success && response.data) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `test-catalog-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification("Test catalog exported successfully!");
      } else {
        alert(response.message || "Failed to export catalog");
      }
    } catch (err) {
      console.error("Error exporting catalog:", err);
      alert(err instanceof Error ? err.message : "Failed to export catalog");
    }
  };

  const handleImportCatalog = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const content = await file.text();
        const data = JSON.parse(content);

        if (!confirm(`Import ${data.categories?.length || 0} categories and ${data.tests?.length || 0} tests into system?`)) {
          return;
        }

        const response = await testApi.importCatalog(data);
        if (response.success) {
          showNotification("Catalog imported successfully!");
          fetchInitialData();
        } else {
          alert(response.message || "Failed to import catalog");
        }
      } catch (err) {
        console.error("Error importing catalog:", err);
        alert(err instanceof Error ? err.message : "Failed to import catalog");
      }
    };
    input.click();
  };

  // Authentic Phlebotomy Vacutainer Cap Color Pill with Cylindrical Icon
  const getTubeInfo = (container?: string, sampleType?: string) => {
    const text = `${container || ''} ${sampleType || ''}`.toLowerCase();
    if (text.includes("edta") || text.includes("purple") || text.includes("lavender")) {
      return { label: "EDTA Purple", color: "#9333EA", cap: "bg-purple-600", bg: "bg-purple-50 text-purple-800 border-purple-200" };
    }
    if (text.includes("fluoride") || text.includes("oxalate") || text.includes("grey") || text.includes("gray")) {
      return { label: "Fluoride Grey", color: "#64748B", cap: "bg-slate-500", bg: "bg-slate-100 text-slate-800 border-slate-300" };
    }
    if (text.includes("sst") || text.includes("gold") || text.includes("gel") || text.includes("yellow")) {
      return { label: "SST Gold", color: "#D97706", cap: "bg-amber-500", bg: "bg-amber-50 text-amber-800 border-amber-200" };
    }
    if (text.includes("red") || text.includes("plain") || text.includes("serum")) {
      return { label: "Plain Red", color: "#DC2626", cap: "bg-red-600", bg: "bg-red-50 text-red-800 border-red-200" };
    }
    if (text.includes("citrate") || text.includes("blue")) {
      return { label: "Citrate Blue", color: "#0284C7", cap: "bg-sky-500", bg: "bg-sky-50 text-sky-800 border-sky-200" };
    }
    if (text.includes("heparin") || text.includes("green")) {
      return { label: "Heparin Green", color: "#16A34A", cap: "bg-emerald-600", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
    if (text.includes("urine") || text.includes("stool") || text.includes("swab") || text.includes("sputum")) {
      return { label: container || sampleType || "Sterile Cup", color: "#CA8A04", cap: "bg-yellow-500", bg: "bg-yellow-50 text-yellow-800 border-yellow-200" };
    }
    return { label: container || sampleType || "Standard Vial", color: "#475569", cap: "bg-slate-600", bg: "bg-slate-50 text-slate-700 border-slate-200" };
  };

  // Pricing formatting and discount detection
  const getPriceDetails = (test: any) => {
    let p1 = Number(test.price) || 0;
    let p2 = test.offerPrice ? Number(test.offerPrice) : null;

    let mrp = p1;
    let offer = p2;
    if (offer !== null && offer > mrp) {
      mrp = p2!;
      offer = p1;
    }

    const hasDiscount = offer !== null && offer < mrp && offer > 0;
    const discountPercent = hasDiscount ? Math.round(((mrp - offer!) / mrp) * 100) : 0;
    const savings = hasDiscount ? mrp - offer! : 0;

    return {
      currentPrice: hasDiscount ? offer! : mrp,
      originalPrice: hasDiscount ? mrp : null,
      hasDiscount,
      discountPercent,
      savings,
    };
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
          const matchesParam = test.parameters?.some((p: any) =>
            p.parameterName?.toLowerCase().includes(q) || p.shortName?.toLowerCase().includes(q)
          );
          if (!matchesName && !matchesCode && !matchesShort && !matchesMethod && !matchesParam) {
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

  const activeFilterCount = [
    searchTerm,
    selectedCategory,
    selectedSampleType,
    selectedStatus,
    selectedFasting,
  ].filter(Boolean).length;

  const totalActive = tests.filter((t) => t.isActive !== false).length;
  const statAvailableCount = tests.filter((t) => (t.tatHours && Number(t.tatHours) <= 4) || (t.tatDisplay && t.tatDisplay.toLowerCase().includes("stat"))).length;
  const totalCategoriesCount = categories.length || new Set(tests.map((t) => t.categoryId || t.category?.name)).size;

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <div className="space-y-6 pb-12">
        {/* Floating Notification */}
        {successMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-900 text-white px-5 py-3.5 text-xs font-semibold shadow-2xl animate-in slide-in-from-top-3 duration-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[11px] font-bold">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Copy Feedback */}
        {copiedCode && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white shadow-xl animate-in fade-in duration-200 flex items-center gap-2">
            <span>📋</span> Copied &quot;{copiedCode}&quot; to clipboard!
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. HERO HEADER WITH ENTERPRISE CLINICAL ACCENTS */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
          {/* Subtle background glow effect */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-300 border border-blue-400/30 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                  NABL & ISO 15189 Verified
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                  {totalActive} Active Operations
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Laboratory Tests Catalog
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Centralized directory of diagnostic investigations, automated phlebotomy tube mappings, clinical methodologies, and tariff pricing.
              </p>
            </div>

            {/* Quick Action Button Suite */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Phlebotomy Tube Guide Button */}
              <button
                onClick={() => setIsTubeGuideOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-950/40 px-3.5 py-2.5 text-xs font-bold text-purple-200 hover:bg-purple-900/60 hover:border-purple-400/60 transition shadow-sm backdrop-blur-md"
              >
                <span>🧪</span>
                <span>Tube Guide & Order of Draw</span>
              </button>

              {/* Print Tariff Card */}
              <button
                onClick={() => setIsTariffModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition shadow-sm backdrop-blur-md"
              >
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Tariff</span>
              </button>

              {/* Export JSON */}
              <button
                onClick={handleExportCatalog}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition shadow-sm"
                title="Export complete catalog JSON"
              >
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
              </button>

              {/* Import JSON */}
              <button
                onClick={handleImportCatalog}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition shadow-sm"
                title="Import catalog backup"
              >
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Import</span>
              </button>

              {/* Add New Test Primary Action */}
              <Link
                href="/tests/new"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Test</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. CLINICAL KPI METRIC CARDS WITH 1-CLICK FILTERING */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Tests */}
          <div
            onClick={() => {
              setSelectedStatus("");
              setSelectedCategory("");
              setSelectedSampleType("");
              setSelectedFasting("");
            }}
            className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Directory</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition">
                🧪
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{tests.length}</span>
              <span className="text-xs font-semibold text-slate-400">investigations</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Click to view all registered tests</p>
          </div>

          {/* Card 2: Active Tests */}
          <div
            onClick={() => setSelectedStatus("active")}
            className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Status</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
                ✓
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{totalActive}</span>
              <span className="text-xs font-semibold text-emerald-700">
                {tests.length > 0 ? `${Math.round((totalActive / tests.length) * 100)}% active` : "100%"}
              </span>
            </div>
            <p className="text-[10px] text-emerald-600/80 mt-1 font-medium">Click to filter operational tests</p>
          </div>

          {/* Card 3: STAT Turnaround */}
          <div
            onClick={() => setSearchTerm("STAT")}
            className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">STAT / Urgent Available</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition">
                ⚡
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{statAvailableCount > 0 ? statAvailableCount : "Instant"}</span>
              <span className="text-xs font-semibold text-amber-700">&le; 4h TAT</span>
            </div>
            <p className="text-[10px] text-amber-600/80 mt-1 font-medium">Click to view rapid tests</p>
          </div>

          {/* Card 4: Categories Link */}
          <Link
            href="/tests/categories"
            className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pathology Sections</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition">
                🏥
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-600">{totalCategoriesCount}</span>
              <span className="text-xs font-semibold text-indigo-700">Departments</span>
            </div>
            <p className="text-[10px] text-indigo-600/80 mt-1 font-medium">Manage Sections &amp; Routing &rarr;</p>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 3. DEPARTMENT NAVIGATION TABS WITH LIVE COUNTS */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("")}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              selectedCategory === ""
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>All Departments</span>
            <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              selectedCategory === "" ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600"
            }`}>
              {tests.length}
            </span>
          </button>

          {categories.map((c) => {
            const count = tests.filter((t) => t.categoryId === c.id || t.category?.name === c.name).length;
            const isSelected = selectedCategory === c.id || selectedCategory === c.name;

            return (
              <button
                key={c.id || c.name}
                onClick={() => setSelectedCategory(isSelected ? "" : (c.id || c.name))}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {c.color && (
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: isSelected ? '#FFFFFF' : c.color }} />
                )}
                <span>{c.name}</span>
                <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isSelected ? "bg-blue-800 text-blue-100" : "bg-slate-100 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 4. COMMAND & FILTER CONTROL CENTER */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Search Input with Keyboard Badge */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Search Investigation
              </label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, test code, method, parameter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-8 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Department
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Departments</option>
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.id || c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sample Matrix Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Specimen Matrix
              </label>
              <select
                value={selectedSampleType}
                onChange={(e) => setSelectedSampleType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Specimen Types</option>
                <option value="BLOOD">Whole Blood</option>
                <option value="SERUM">Serum</option>
                <option value="PLASMA">Plasma</option>
                <option value="URINE">Urine</option>
                <option value="STOOL">Stool</option>
                <option value="SWAB">Swab</option>
                <option value="SPUTUM">Sputum</option>
                <option value="CSF">CSF</option>
                <option value="TISSUE">Tissue</option>
                <option value="OTHER">Other Specimen</option>
              </select>
            </div>

            {/* Fasting Requirement Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Fasting Guideline
              </label>
              <select
                value={selectedFasting}
                onChange={(e) => setSelectedFasting(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Any Fasting Status</option>
                <option value="fasting">Overnight Fasting Req</option>
                <option value="non-fasting">Random / Non-Fasting</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Catalog Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Active &amp; Inactive</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Sub Control Row: Sorting, Segmented View Switcher & Clear Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium">Sort Catalog:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="name">Investigation Name (A &rarr; Z)</option>
                <option value="code">Test Code</option>
                <option value="price_asc">Price (Lowest First)</option>
                <option value="price_desc">Price (Highest First)</option>
                <option value="tat">TAT (Fastest First)</option>
              </select>

              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedSampleType("");
                    setSelectedStatus("");
                    setSelectedFasting("");
                  }}
                  className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg transition"
                >
                  Clear Filters ({activeFilterCount})
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-[11px]">
                Showing <span className="font-bold text-slate-800">{filteredTests.length}</span> of {tests.length} tests
              </span>

              {/* Segmented View Switcher */}
              <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-100">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
                    viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>☰</span> Table View
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
                    viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>⊞</span> Grid Cards
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. MULTI-SELECT BULK OPERATIONS FLOATING DOCK */}
        {/* ========================================================================= */}
        {selectedTestIds.length > 0 && (
          <div className="sticky top-4 z-40 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-white shadow-2xl animate-in slide-in-from-top-3 duration-200 border border-slate-700">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                {selectedTestIds.length}
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Investigations selected for batch operations
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={bulkLoading}
                onClick={() => handleBulkStatus(true)}
                className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-xs"
              >
                Activate All
              </button>
              <button
                disabled={bulkLoading}
                onClick={() => handleBulkStatus(false)}
                className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-500 transition shadow-xs"
              >
                Deactivate All
              </button>
              <button
                disabled={bulkLoading}
                onClick={handleBulkExportSelected}
                className="rounded-xl bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition border border-slate-700"
              >
                Export CSV
              </button>
              <button
                onClick={() => setSelectedTestIds([])}
                className="rounded-xl border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800 transition"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. ULTRA-PREMIUM DATA TABLE VIEW */}
        {/* ========================================================================= */}
        {viewMode === "table" ? (
          <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[11px] font-extrabold">
                  <tr>
                    <th className="py-4 pl-5 pr-2 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={filteredTests.length > 0 && selectedTestIds.length === filteredTests.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-4">Test Profile &amp; Analytes</th>
                    <th className="py-4 px-4">Code</th>
                    <th className="py-4 px-4">Department</th>
                    <th className="py-4 px-4">Specimen &amp; Phlebotomy Tube</th>
                    <th className="py-4 px-4">Tariff / Price</th>
                    <th className="py-4 px-4 text-center">Turnaround</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 pr-6 pl-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-20 text-center text-slate-500 text-sm">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
                          <span className="font-semibold text-slate-700">Loading diagnostic directory...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-20 text-center text-slate-500 text-sm">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-4xl">🔬</span>
                          <p className="font-bold text-slate-800 text-base">
                            {tests.length === 0 ? "No laboratory investigations registered" : "No tests match your filter criteria"}
                          </p>
                          <p className="text-xs text-slate-400 max-w-sm">
                            {tests.length === 0
                              ? "Click '+ Add New Test' to configure your laboratory investigations."
                              : "Try clearing active filters or refining your search keywords."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map((test) => {
                      const isSelected = selectedTestIds.includes(String(test.id));
                      const tube = getTubeInfo(test.sampleContainer, test.sampleType);
                      const priceInfo = getPriceDetails(test);
                      const paramCount = test.parameters?.length || 0;

                      return (
                        <tr
                          key={test.id}
                          className={`group transition-colors duration-150 hover:bg-blue-50/40 ${
                            isSelected ? "bg-blue-50/70" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-4 pl-5 pr-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(String(test.id))}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                            />
                          </td>

                          {/* Test Profile & Analytes */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3.5">
                              {/* Clinical Monogram Avatar */}
                              <div className="h-10 w-10 flex-shrink-0 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center text-white font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                                {(test.testName || test.name || "T").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <button
                                  onClick={() => setInspectingTest(test)}
                                  className="text-sm font-extrabold text-slate-900 hover:text-blue-600 text-left transition leading-snug"
                                >
                                  {test.testName || test.name}
                                </button>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {test.shortName && (
                                    <span className="text-[11px] text-slate-500 font-medium">
                                      {test.shortName}
                                    </span>
                                  )}
                                  {paramCount > 0 && (
                                    <span className="rounded-md bg-indigo-50 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                                      {paramCount} analytes
                                    </span>
                                  )}
                                  {test.patientPreparation && (
                                    <span
                                      className="rounded-md bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 border border-amber-200"
                                      title={test.patientPreparation}
                                    >
                                      Fasting
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Code with Copy Button */}
                          <td className="py-4 px-4">
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2 py-1">
                              <span className="font-mono text-xs font-extrabold text-blue-700">
                                {test.testCode || test.code}
                              </span>
                              <button
                                onClick={(e) => copyToClipboard(test.testCode || test.code, e)}
                                className="text-slate-400 hover:text-slate-700 transition"
                                title="Copy code"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>

                          {/* Category & Department */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5">
                              {test.category?.color && (
                                <span
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: test.category.color }}
                                />
                              )}
                              <span className="text-xs font-bold text-slate-800">
                                {test.category?.name || test.category || "General Lab"}
                              </span>
                            </div>
                            {test.category?.department && (
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                                {test.category.department}
                              </span>
                            )}
                          </td>

                          {/* Phlebotomy Tube with Cylindrical Cap Icon */}
                          <td className="py-4 px-4">
                            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${tube.bg}`}>
                              {/* Realistic micro vial representation */}
                              <div className="relative flex items-center justify-center">
                                <span className={`h-3 w-3 rounded-full ${tube.cap} shadow-xs`} />
                              </div>
                              <span>{tube.label}</span>
                            </div>
                          </td>

                          {/* Tariff Pricing */}
                          <td className="py-4 px-4">
                            <div className="text-sm font-black text-slate-900">
                              ₹{priceInfo.currentPrice.toLocaleString("en-IN")}
                              {priceInfo.hasDiscount && priceInfo.originalPrice && (
                                <span className="text-xs text-slate-400 ml-1.5 line-through font-normal">
                                  ₹{priceInfo.originalPrice.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                            {priceInfo.hasDiscount && (
                              <span className="inline-block mt-0.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded border border-emerald-300">
                                {priceInfo.discountPercent}% OFF • Save ₹{priceInfo.savings}
                              </span>
                            )}
                          </td>

                          {/* TAT */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                              🕒 {test.tatDisplay || (test.tatHours ? `${test.tatHours}h` : "24h")}
                            </span>
                          </td>

                          {/* 1-Click Inline Status Switch */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(test)}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                test.isActive !== false ? "bg-emerald-600 shadow-xs shadow-emerald-500/30" : "bg-slate-300"
                              }`}
                              title={test.isActive !== false ? "Click to Deactivate" : "Click to Activate"}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  test.isActive !== false ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                              {test.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Actions Suite */}
                          <td className="py-4 pr-6 pl-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Inspect */}
                              <button
                                onClick={() => setInspectingTest(test)}
                                className="rounded-xl p-1.5 text-blue-600 hover:bg-blue-100/80 transition"
                                title="Quick Inspect Parameters & Ranges"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>

                              {/* Edit */}
                              <Link
                                href={`/tests/${test.id}?edit=true`}
                                className="rounded-xl p-1.5 text-slate-600 hover:bg-slate-100 transition"
                                title="Edit Test Configuration"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>

                              {/* Clone */}
                              <button
                                onClick={() => handleDuplicateTest(test)}
                                className="rounded-xl p-1.5 text-indigo-600 hover:bg-indigo-50 transition"
                                title="Duplicate / Clone Test"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(test)}
                                className="rounded-xl p-1.5 text-red-600 hover:bg-red-50 transition"
                                title="Delete Test"
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
        ) : (
          /* ========================================================================= */
          /* 7. VISUAL INTERACTIVE CARD GRID VIEW */
          /* ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTests.map((test) => {
              const tube = getTubeInfo(test.sampleContainer, test.sampleType);
              const priceInfo = getPriceDetails(test);
              const paramCount = test.parameters?.length || 0;

              return (
                <div
                  key={test.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Code & 1-Click Status switch */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {test.testCode || test.code}
                        </span>
                        {test.category?.name && (
                          <span className="text-[11px] font-bold text-slate-500">
                            {test.category.name}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleStatus(test)}
                        className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          test.isActive !== false ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                        title={test.isActive !== false ? "Click to Deactivate" : "Click to Activate"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            test.isActive !== false ? "translate-x-3" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Test Title */}
                    <h3 className="mt-3 text-base font-extrabold text-slate-900 leading-snug">
                      <button
                        onClick={() => setInspectingTest(test)}
                        className="text-left hover:text-blue-600 transition"
                      >
                        {test.testName || test.name}
                      </button>
                    </h3>

                    {test.shortName && (
                      <p className="text-xs text-slate-400 mt-0.5">{test.shortName}</p>
                    )}

                    {/* Phlebotomy Specimen Tag & Analyte Counter */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2">
                      <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${tube.bg}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${tube.cap}`} />
                        <span>{tube.label}</span>
                      </div>

                      {paramCount > 0 && (
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-100">
                          {paramCount} Analytes
                        </span>
                      )}

                      {test.patientPreparation && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                          Fasting
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Price & Quick Action links */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-slate-900">
                        ₹{priceInfo.currentPrice.toLocaleString("en-IN")}
                        {priceInfo.hasDiscount && priceInfo.originalPrice && (
                          <span className="text-xs text-slate-400 ml-1.5 line-through font-normal">
                            ₹{priceInfo.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        TAT: {test.tatDisplay || (test.tatHours ? `${test.tatHours}h` : "24h")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setInspectingTest(test)}
                        className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                      >
                        Quick View
                      </button>
                      <Link
                        href={`/tests/${test.id}?edit=true`}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8. SLIDE-OVER QUICK TEST INSPECTOR DRAWER */}
        {/* ========================================================================= */}
        <TestDrawer
          test={inspectingTest}
          isOpen={Boolean(inspectingTest)}
          onClose={() => setInspectingTest(null)}
          onToggleStatus={handleToggleStatus}
          onDuplicate={handleDuplicateTest}
        />

        {/* ========================================================================= */}
        {/* 9. PHLEBOTOMY TUBE GUIDE & ORDER OF DRAW MODAL */}
        {/* ========================================================================= */}
        <TubeGuideModal
          isOpen={isTubeGuideOpen}
          onClose={() => setIsTubeGuideOpen(false)}
        />

        {/* ========================================================================= */}
        {/* 10. TARIFF RATE LIST PRINTABLE MODAL */}
        {/* ========================================================================= */}
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
