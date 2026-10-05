"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";
import {
  Package,
  Plus,
  Sparkles,
  Search,
  Star,
  CheckCircle2,
  Trash2,
  Edit,
  Clock3,
  DollarSign,
  Percent,
  ShieldCheck,
  ChevronRight,
  Eye,
  X,
  FlaskConical,
  HeartPulse,
  Activity,
  Layers,
  Tag
} from "lucide-react";

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
        setPackages(response.data);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch health packages");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleTogglePopular = async (pkg: TestPackage, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = !pkg.isPopular;
    try {
      await testApi.updatePackage(pkg.id, { isPopular: updated });
      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, isPopular: updated } : p)));
      showNotification(`Package "${pkg.packageName}" ${updated ? "marked as Featured" : "unmarked"}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update package");
    }
  };

  const handleToggleActive = async (pkg: TestPackage, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = !pkg.isActive;
    try {
      await testApi.updatePackage(pkg.id, { isActive: updated });
      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, isActive: updated } : p)));
      showNotification(`Package "${pkg.packageName}" ${updated ? "activated" : "deactivated"}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDeletePackage = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete package "${name}"?`)) return;

    try {
      await testApi.deletePackage(id);
      showNotification(`Package "${name}" deleted`);
      setPackages(packages.filter((p) => p.id !== id));
      if (inspectingPackage?.id === id) setInspectingPackage(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete package");
    }
  };

  const handleSeedStandardPackages = async () => {
    if (!confirm("This will configure 4 standard multi-test health checkup packages (Full Body, Diabetic, Senior Citizen, Acute Fever). Proceed?")) {
      return;
    }

    setSeeding(true);
    let created = 0;

    for (const pkg of STANDARD_PACKAGES) {
      const exists = packages.some((p) => p.packageCode === pkg.packageCode);
      if (!exists) {
        try {
          await testApi.createPackage({
            ...pkg,
            isActive: true,
          });
          created++;
        } catch (e) {
          console.warn("Failed seeding package:", e);
        }
      }
    }

    setSeeding(false);
    showNotification(`Generated ${created} standard health checkup packages!`);
    await fetchPackages();
  };

  const filteredPackages = packages.filter((pkg) => {
    return (
      pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.packageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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
              <Package className="h-3.5 w-3.5" />
              <span>Preventive Healthcare & Multi-Test Health Profiles</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Health Packages & Preventive Panels</span>
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Bundle multiple diagnostic investigations into high-value health checkup packages with bundled savings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedStandardPackages}
              disabled={seeding}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-4 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition shadow-lg shadow-indigo-500/10 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>{seeding ? "Generating..." : "Generate 4 Standard Packages"}</span>
            </button>

            <Link
              href="/tests/packages/new"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4.5 py-2.5 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Package</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-xl flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search packages by name, code, or clinical scope..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <span className="text-xs font-bold text-slate-400 px-2">
            {filteredPackages.length} Health Packages
          </span>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-950/60 border border-rose-500/40 p-4 text-xs font-bold text-rose-300">
            {error}
          </div>
        )}

        {/* Packages Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent mx-auto" />
            <div className="text-xs font-bold text-slate-400">Loading Health Packages Catalog...</div>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <Package className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-black text-white">No health packages found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create multi-test health checkup profiles or auto-generate 4 standard hospital packages.
            </p>
            <button
              onClick={handleSeedStandardPackages}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25"
            >
              ⚡ Generate Standard Packages
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPackages.map((pkg) => {
              const offerRate = pkg.offerPrice || pkg.totalPrice;
              const hasDiscount = pkg.offerPrice && pkg.offerPrice < pkg.totalPrice;
              const discountPct = hasDiscount ? Math.round(((pkg.totalPrice - offerRate) / pkg.totalPrice) * 100) : 0;
              const pkgColor = pkg.color || "#3B82F6";

              return (
                <div
                  key={pkg.id}
                  onClick={() => setInspectingPackage(pkg)}
                  className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-xl cursor-pointer ${
                    pkg.isActive
                      ? "border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:shadow-2xl"
                      : "border-slate-800/50 bg-slate-950/40 opacity-70"
                  }`}
                >
                  <div
                    className="h-1.5 w-full transition-all group-hover:h-2"
                    style={{ backgroundColor: pkgColor, boxShadow: `0 0 12px ${pkgColor}88` }}
                  />

                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-lg border border-white/10"
                          style={{ backgroundColor: `${pkgColor}25` }}
                        >
                          {pkg.icon || "🌟"}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-slate-400">
                              {pkg.packageCode}
                            </span>
                            {pkg.isPopular && (
                              <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-400 border border-amber-500/30">
                                <Star className="h-2.5 w-2.5 fill-amber-400" />
                                <span>FEATURED</span>
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-white leading-tight mt-0.5">
                            {pkg.packageName}
                          </h3>
                        </div>
                      </div>

                      {/* Status Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleActive(pkg, e)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                          pkg.isActive
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        }`}
                      >
                        {pkg.isActive ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed min-h-[36px]">
                      {pkg.description || "Comprehensive multi-test diagnostic screening package."}
                    </p>

                    {/* Pricing & Savings Box */}
                    <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">Package Offer Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-emerald-400">
                            ₹{offerRate.toLocaleString("en-IN")}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs font-bold text-slate-500 line-through">
                              ₹{pkg.totalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      {hasDiscount && (
                        <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-black text-emerald-400 border border-emerald-500/30">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock3 className="h-3.5 w-3.5 text-amber-400" />
                        <span>{pkg.tatDisplay || "Same Day"}</span>
                      </span>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePopular(pkg, e)}
                          className={`p-1.5 rounded-lg border transition ${
                            pkg.isPopular
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                          }`}
                          title="Toggle Popular"
                        >
                          <Star className={`h-3.5 w-3.5 ${pkg.isPopular ? "fill-amber-400" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePackage(pkg.id, pkg.packageName, e)}
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-800 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition"
                          title="Delete Package"
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

        {/* DRAWER / INSPECTOR: HEALTH PACKAGE DETAILS */}
        {inspectingPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="h-full w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                    Health Package Dossier
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingPackage(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  {inspectingPackage.packageName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-blue-400">{inspectingPackage.packageCode}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{inspectingPackage.targetAudience || "General Adult"}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Package Pricing & Commercials
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Standard Sum of MRPs:</span>
                    <span className="font-bold text-white">₹{inspectingPackage.totalPrice}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Package Offer Rate:</span>
                    <span className="font-bold text-emerald-400">₹{inspectingPackage.offerPrice || inspectingPackage.totalPrice}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Patient Savings:</span>
                    <span className="font-bold text-emerald-400">
                      ₹{inspectingPackage.totalPrice - (inspectingPackage.offerPrice || inspectingPackage.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Clinical Scope & Description
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {inspectingPackage.description || "Comprehensive diagnostic health screening profile."}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setInspectingPackage(null)}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-500 transition text-center"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
