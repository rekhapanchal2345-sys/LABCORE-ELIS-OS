"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";

interface TestPackage {
  id: string;
  packageCode: string;
  packageName: string;
  description?: string;
  totalPrice: number;
  offerPrice?: number;
  discountPercentage?: number;
  tatHours?: number;
  tatDisplay?: string;
  targetAudience?: string;
  recommendedFor?: string;
  isPopular: boolean;
  isActive: boolean;
  color?: string;
  icon?: string;
  includesTestsCount: number;
  items?: any[];
}

const STANDARD_PACKAGES = [
  {
    packageCode: "PKG-FULLBODY",
    packageName: "Comprehensive Full Body Health Checkup",
    description: "Holistic 64-parameter screening covering complete blood count, lipid health, liver function, renal panel, diabetes screening, and thyroid.",
    totalPrice: 3200,
    offerPrice: 1499,
    discountPercentage: 53,
    targetAudience: "GENERAL_ADULT",
    recommendedFor: "Annual preventive health assessment for adults above 25 years.",
    tatDisplay: "Same Day (8-12 hours)",
    isPopular: true,
    color: "#10B981",
    icon: "🌟",
  },
  {
    packageCode: "PKG-DIABETIC",
    packageName: "Advanced Diabetic Care & Cardiac Risk Panel",
    description: "Fasting blood sugar, HbA1c (glycated hemoglobin), lipid profile, serum creatinine, urine microalbumin, and estimated GFR.",
    totalPrice: 1850,
    offerPrice: 999,
    discountPercentage: 46,
    targetAudience: "DIABETIC",
    recommendedFor: "Individuals with type 1/2 diabetes, pre-diabetes, or metabolic syndrome.",
    tatDisplay: "Same Day",
    isPopular: true,
    color: "#3B82F6",
    icon: "🩺",
  },
  {
    packageCode: "PKG-SENIOR",
    packageName: "Senior Citizen Comprehensive Wellness Profile",
    description: "Specially curated for elderly wellness: Complete hemogram, kidney panel, liver profile, electrolytes, calcium, uric acid, and cardiac markers.",
    totalPrice: 3600,
    offerPrice: 1799,
    discountPercentage: 50,
    targetAudience: "SENIOR_CITIZEN",
    recommendedFor: "Senior citizens (60+ years) for chronic disease monitoring and mobility assessment.",
    tatDisplay: "24 hours",
    isPopular: false,
    color: "#8B5CF6",
    icon: "👴",
  },
  {
    packageCode: "PKG-FEVER",
    packageName: "Acute Fever & Monsoon Infection Screening Panel",
    description: "Rapid differential diagnosis for acute fever: CBC, Malarial Parasite (MP), Dengue NS1 / IgM / IgG, Typhoid Widal, and Urine Routine.",
    totalPrice: 2200,
    offerPrice: 1199,
    discountPercentage: 45,
    targetAudience: "ACUTE_CARE",
    recommendedFor: "Patients with acute onset high fever, chills, body aches, or suspicion of vector-borne illness.",
    tatDisplay: "STAT (2 - 4 hours)",
    isPopular: true,
    color: "#EF4444",
    icon: "🌡️",
  },
];

export default function TestPackagesPage() {
  const [packages, setPackages] = useState<TestPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [seeding, setSeeding] = useState(false);

  // Inspector modal
  const [inspectingPackage, setInspectingPackage] = useState<TestPackage | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testApi.getPackages();
      if (response.success && response.data) {
        setPackages(response.data.packages || response.data || []);
      } else {
        setError(response.message || "Failed to fetch packages");
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleTogglePopular = async (pkg: TestPackage) => {
    const updated = !pkg.isPopular;
    try {
      await testApi.updatePackage(pkg.id, { isPopular: updated });
      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, isPopular: updated } : p)));
      showNotification(`Package "${pkg.packageName}" ${updated ? "marked as Featured" : "unfeatured"}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle popular status");
    }
  };

  const handleToggleActive = async (pkg: TestPackage) => {
    const updated = !pkg.isActive;
    try {
      await testApi.updatePackage(pkg.id, { isActive: updated });
      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, isActive: updated } : p)));
      showNotification(`Package "${pkg.packageName}" marked as ${updated ? "Active" : "Inactive"}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle active status");
    }
  };

  const handleDeletePackage = async (id: string, packageName: string) => {
    if (!confirm(`Are you sure you want to delete package "${packageName}"?`)) {
      return;
    }

    try {
      await testApi.deletePackage(id);
      setPackages(packages.filter((p) => p.id !== id));
      showNotification(`Package "${packageName}" deleted`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete package");
    }
  };

  const handleSeedStandardPackages = async () => {
    if (!confirm("Generate standard pathology wellness packages (Full Body Checkup, Diabetic Panel, Senior Wellness, Fever Profile)?")) {
      return;
    }

    setSeeding(true);
    let count = 0;
    for (const pkg of STANDARD_PACKAGES) {
      const exists = packages.some((p) => p.packageCode === pkg.packageCode);
      if (!exists) {
        try {
          await testApi.createPackage({
            ...pkg,
            isActive: true,
            displayOrder: count + 1,
          });
          count++;
        } catch (e) {
          console.warn("Failed seeding package:", e);
        }
      }
    }
    setSeeding(false);
    showNotification(`Generated ${count} standard health packages!`);
    await fetchPackages();
  };

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.packageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.targetAudience || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Health Checkup & Wellness Packages
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Bundle investigations into high-value diagnostic checkup profiles with promotional pricing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedStandardPackages}
              disabled={seeding}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-2xs disabled:opacity-50"
            >
              <span>📦</span>
              {seeding ? "Generating..." : "Load Standard Packages"}
            </button>

            <Link
              href="/tests/packages/new"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Package
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800">
            {error}
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <input
            type="text"
            placeholder="Search packages by title, code (e.g. PKG-FULLBODY), or target audience..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
            Loading diagnostic health checkup packages...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <span className="text-4xl">📦</span>
            <h3 className="mt-3 text-base font-bold text-gray-900">No health packages found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Create your first package or click &quot;Load Standard Packages&quot; to populate standard diagnostic panels.
            </p>
            <div className="mt-4">
              <button
                onClick={handleSeedStandardPackages}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Load Standard Packages
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPackages.map((pkg) => {
              const totalWorth = Number(pkg.totalPrice) || 0;
              const offerPrice = pkg.offerPrice ? Number(pkg.offerPrice) : totalWorth;
              const hasDiscount = offerPrice < totalWorth;
              const savings = hasDiscount ? totalWorth - offerPrice : 0;
              const discountPercent = hasDiscount
                ? Math.round(((totalWorth - offerPrice) / totalWorth) * 100)
                : pkg.discountPercentage || 0;

              const testsCount = pkg.includesTestsCount || pkg.items?.length || 0;
              const pkgColor = pkg.color || "#10B981";

              return (
                <div
                  key={pkg.id}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  <div className="h-2 w-full" style={{ backgroundColor: pkgColor }} />

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                            {pkg.packageCode}
                          </span>
                          {pkg.targetAudience && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              {pkg.targetAudience.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>

                        {/* Popular Star Toggle */}
                        <button
                          onClick={() => handleTogglePopular(pkg)}
                          className={`flex items-center gap-1 text-xs font-bold rounded-lg px-2 py-0.5 border transition ${
                            pkg.isPopular
                              ? "border-amber-300 bg-amber-50 text-amber-700"
                              : "border-gray-200 text-gray-400 hover:text-amber-500"
                          }`}
                          title={pkg.isPopular ? "Featured Package" : "Mark as Featured"}
                        >
                          ★ {pkg.isPopular ? "Popular" : "Feature"}
                        </button>
                      </div>

                      {/* Package Name */}
                      <h3 className="text-base font-bold text-gray-900 mt-2.5 leading-snug">
                        {pkg.packageName}
                      </h3>

                      {pkg.description && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {pkg.description}
                        </p>
                      )}

                      {/* Diagnostic Scope Pill */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 font-bold text-indigo-700">
                          {testsCount > 0 ? `${testsCount} Tests Bundled` : "Configured Bundle"}
                        </span>
                        <span className="text-gray-400 font-medium">
                          TAT: {pkg.tatDisplay || `${pkg.tatHours || 24}h`}
                        </span>
                      </div>
                    </div>

                    {/* Pricing Matrix */}
                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-lg font-extrabold text-gray-900">
                            ₹{offerPrice.toLocaleString("en-IN")}
                          </div>
                          {hasDiscount && (
                            <div className="text-xs text-gray-400 line-through">
                              Total Value: ₹{totalWorth.toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>

                        {hasDiscount && (
                          <div className="text-right">
                            <span className="inline-block text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {discountPercent}% OFF
                            </span>
                            <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                              Save ₹{savings.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {/* Active switch */}
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          pkg.isActive !== false ? "bg-green-600" : "bg-gray-300"
                        }`}
                        title={pkg.isActive !== false ? "Click to Deactivate" : "Click to Activate"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            pkg.isActive !== false ? "translate-x-3" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {pkg.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setInspectingPackage(pkg)}
                        className="rounded-lg bg-white border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
                      >
                        Inspect
                      </button>
                      <Link
                        href={`/tests/packages/${pkg.id}`}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeletePackage(pkg.id, pkg.packageName)}
                        className="rounded-lg p-1 text-red-600 hover:bg-red-50"
                        title="Delete Package"
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

        {/* Modal: Package Inspector */}
        {inspectingPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {inspectingPackage.packageCode}
                  </span>
                  <h2 className="text-base font-bold text-gray-900 mt-1">
                    {inspectingPackage.packageName}
                  </h2>
                </div>
                <button
                  onClick={() => setInspectingPackage(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {inspectingPackage.description && (
                  <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                    {inspectingPackage.description}
                  </p>
                )}

                {/* Target & Preparation */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 p-3">
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Target Audience</span>
                    <span className="font-bold text-gray-800 text-sm mt-0.5 block">
                      {inspectingPackage.targetAudience?.replace(/_/g, " ") || "General Public"}
                    </span>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-3">
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Turnaround Time</span>
                    <span className="font-bold text-blue-700 text-sm mt-0.5 block">
                      {inspectingPackage.tatDisplay || "24 Hours"}
                    </span>
                  </div>
                </div>

                {/* Bundled Tests */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">
                    Included Investigations in this Checkup Profile:
                  </h4>
                  {inspectingPackage.items && inspectingPackage.items.length > 0 ? (
                    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                      {inspectingPackage.items.map((item: any, idx: number) => (
                        <div key={item.id || idx} className="p-3 flex items-center justify-between hover:bg-gray-50">
                          <div>
                            <span className="font-mono text-xs font-bold text-blue-700 mr-2">
                              {item.test?.testCode || "TEST"}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {item.test?.testName || item.testName || `Test #${idx + 1}`}
                            </span>
                            <span className="text-[11px] text-gray-400 ml-2">
                              ({item.test?.sampleType || "Specimen"})
                            </span>
                          </div>
                          <span className="font-bold text-gray-800">
                            ₹{(Number(item.testPrice) || Number(item.test?.price) || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-gray-50 p-4 text-center text-gray-500">
                      Standard package bundling comprehensive organ panels (CBC, Lipid, LFT, KFT, Glucose).
                    </div>
                  )}
                </div>

                {/* Phlebotomy Specimen Preparation Rule */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-blue-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>🧪</span> Specimen Collection Advice:
                  </span>
                  <p>• Requires 10-12 hours overnight fasting. Water permitted.</p>
                  <p>• Collect Purple EDTA vial (CBC/HbA1c) + Gold SST Gel vial (Biochemistry/Lipid) + Grey Fluoride vial (Glucose).</p>
                </div>
              </div>

              <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setInspectingPackage(null)}
                  className="rounded-xl bg-gray-900 px-5 py-2 text-xs font-bold text-white hover:bg-black"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
