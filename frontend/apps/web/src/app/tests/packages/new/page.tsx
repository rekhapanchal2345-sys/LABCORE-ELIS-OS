"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";

interface Test {
  id: string;
  testCode: string;
  testName: string;
  price: number;
  sampleType: string;
  sampleContainer?: string;
  category?: any;
}

interface PackageItem {
  testId: string;
  testPrice: number;
  discount: number;
  displayOrder: number;
  test?: Test;
}

const PACKAGE_PRESETS = [
  {
    name: "Full Body Master Health Checkup",
    code: "PKG-FULLBODY",
    target: "GENERAL_ADULT",
    desc: "Comprehensive multi-organ wellness evaluation covering hematology, cardiac lipid risk, liver enzymes, and renal function.",
    discount: 50,
  },
  {
    name: "Diabetic Care & Renal Panel",
    code: "PKG-DIABETIC",
    target: "DIABETIC",
    desc: "Glycemic status (HbA1c + Fasting Sugar) and early diabetic nephropathy/kidney damage screening.",
    discount: 40,
  },
  {
    name: "Cardiac Health & Lipid Profile",
    code: "PKG-CARDIAC",
    target: "EXECUTIVE",
    desc: "Atherogenic cardiovascular risk evaluation with lipid fractions and metabolic markers.",
    discount: 35,
  },
];

export default function NewPackagePage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [testSearch, setTestSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [formData, setFormData] = useState({
    packageCode: "",
    packageName: "",
    description: "",
    totalPrice: 0,
    offerPrice: 0,
    discountPercentage: 0,
    gstPercentage: 0,
    tatHours: 24,
    tatDisplay: "Same Day (8-12 hours)",
    targetAudience: "GENERAL_ADULT",
    recommendedFor: "",
    isActive: true,
    isPopular: false,
    displayOrder: 0,
    color: "#10B981",
    icon: "📦",
  });

  const [selectedTests, setSelectedTests] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingTests, setLoadingTests] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoadingTests(true);
      const response = await testApi.getAll();
      if (response.success && response.data) {
        const testsData = response.data.tests || response.data || [];
        setTests(Array.isArray(testsData) ? testsData : []);
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
    } finally {
      setLoadingTests(false);
    }
  };

  const handleToggleTest = (test: Test) => {
    const existing = selectedTests.find((item) => item.testId === test.id);
    if (existing) {
      const updated = selectedTests.filter((item) => item.testId !== test.id);
      setSelectedTests(updated);
      recalculateTotals(updated, formData.discountPercentage);
    } else {
      const updated = [
        ...selectedTests,
        {
          testId: test.id,
          testPrice: Number(test.price) || 0,
          discount: 0,
          displayOrder: selectedTests.length + 1,
          test,
        },
      ];
      setSelectedTests(updated);
      recalculateTotals(updated, formData.discountPercentage);
    }
  };

  const recalculateTotals = (items: PackageItem[], discountPercent: number) => {
    const total = items.reduce((sum, item) => sum + (Number(item.testPrice) || 0), 0);
    const offer = discountPercent > 0 ? Math.round(total * (1 - discountPercent / 100)) : total;
    setFormData((prev) => ({
      ...prev,
      totalPrice: total,
      offerPrice: offer,
      discountPercentage: discountPercent,
    }));
  };

  const handleOfferPriceChange = (newOffer: number) => {
    const total = formData.totalPrice;
    let disc = 0;
    if (total > 0 && newOffer < total) {
      disc = Math.round(((total - newOffer) / total) * 100);
    }
    setFormData((prev) => ({
      ...prev,
      offerPrice: newOffer,
      discountPercentage: disc,
    }));
  };

  const handleDiscountPercentChange = (newDisc: number) => {
    const total = formData.totalPrice;
    const offer = Math.round(total * (1 - newDisc / 100));
    setFormData((prev) => ({
      ...prev,
      discountPercentage: newDisc,
      offerPrice: offer,
    }));
  };

  // Automatic Calculation of Phlebotomy Vials Required
  const requiredVials = useMemo(() => {
    const vialsMap: Record<string, number> = {};
    selectedTests.forEach((item) => {
      const t = item.test || tests.find((x) => x.id === item.testId);
      const container = (t?.sampleContainer || t?.sampleType || "General Vial").toLowerCase();

      if (container.includes("edta") || container.includes("purple") || container.includes("lavender")) {
        vialsMap["EDTA Purple Vial (Lavender)"] = (vialsMap["EDTA Purple Vial (Lavender)"] || 0) + 1;
      } else if (container.includes("sst") || container.includes("gold") || container.includes("gel") || container.includes("yellow")) {
        vialsMap["SST Gold Gel Vial"] = (vialsMap["SST Gold Gel Vial"] || 0) + 1;
      } else if (container.includes("fluoride") || container.includes("grey") || container.includes("gray")) {
        vialsMap["Fluoride Grey Vial"] = (vialsMap["Fluoride Grey Vial"] || 0) + 1;
      } else if (container.includes("citrate") || container.includes("blue")) {
        vialsMap["Sodium Citrate Blue Vial"] = (vialsMap["Sodium Citrate Blue Vial"] || 0) + 1;
      } else if (container.includes("urine") || container.includes("stool") || container.includes("cup")) {
        vialsMap["Sterile Collection Cup"] = (vialsMap["Sterile Collection Cup"] || 0) + 1;
      } else {
        vialsMap[t?.sampleContainer || "Plain Red Vial"] = (vialsMap[t?.sampleContainer || "Plain Red Vial"] || 0) + 1;
      }
    });

    return Object.entries(vialsMap);
  }, [selectedTests, tests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.packageCode.trim()) {
      setError("Package code is required");
      return;
    }
    if (!formData.packageName.trim()) {
      setError("Package name is required");
      return;
    }
    if (selectedTests.length === 0) {
      setError("Please select at least 1 test to include in this package");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const packageData: any = {
        packageCode: formData.packageCode.trim().toUpperCase(),
        packageName: formData.packageName.trim(),
        totalPrice: formData.totalPrice,
        offerPrice: formData.offerPrice,
        discountPercentage: formData.discountPercentage,
        tatHours: Number(formData.tatHours) || 24,
        tatDisplay: formData.tatDisplay,
        targetAudience: formData.targetAudience,
        description: formData.description,
        recommendedFor: formData.recommendedFor,
        isActive: formData.isActive,
        isPopular: formData.isPopular,
        color: formData.color,
        icon: formData.icon,
        includesTestsCount: selectedTests.length,
        tests: selectedTests.map((item, idx) => ({
          testId: item.testId,
          testPrice: item.testPrice,
          discount: item.discount || 0,
          displayOrder: idx + 1,
        })),
      };

      const response = await testApi.createPackage(packageData);
      if (response.success) {
        router.push("/tests/packages");
      } else {
        setError(response.message || "Failed to create package");
      }
    } catch (err) {
      console.error("Error creating package:", err);
      setError(err instanceof Error ? err.message : "Failed to create package");
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((t) => {
    const q = testSearch.toLowerCase();
    const matchesSearch = !testSearch || t.testName.toLowerCase().includes(q) || t.testCode.toLowerCase().includes(q);
    const matchesCat = !selectedCategory || t.category?.id === selectedCategory || t.category?.name === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const savings = formData.totalPrice - formData.offerPrice;

  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div>
          <Link
            href="/tests/packages"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition mb-1"
          >
            ← Back to Packages
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Create Health Checkup Package
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Bundle individual investigations into promotional wellness checkup panels with automated collection vial calculation
          </p>
        </div>

        {/* Quick Presets Bar */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
            <span>⚡</span> Quick Package Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PACKAGE_PRESETS.map((p) => (
              <button
                type="button"
                key={p.code}
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    packageName: p.name,
                    packageCode: p.code,
                    description: p.desc,
                    targetAudience: p.target,
                    discountPercentage: p.discount,
                  }));
                }}
                className="rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:border-emerald-500 hover:bg-emerald-600 hover:text-white transition shadow-2xs"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col (2 spans): Details & Test Picker */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: Package Info */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <span>📦</span> Package Identification
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Package Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PKG-FULLBODY"
                      value={formData.packageCode}
                      onChange={(e) => setFormData({ ...formData, packageCode: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono font-bold uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Package Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Comprehensive Annual Health Checkup"
                      value={formData.packageName}
                      onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Target Demographic</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="GENERAL_ADULT">General Adult</option>
                      <option value="SENIOR_CITIZEN">Senior Citizen</option>
                      <option value="EXECUTIVE">Executive / Corporate</option>
                      <option value="DIABETIC">Diabetic Care</option>
                      <option value="WOMEN_WELLNESS">Women Wellness</option>
                      <option value="PEDIATRIC">Pediatric Wellness</option>
                      <option value="ACUTE_CARE">Acute Fever Screening</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Turnaround</label>
                    <input
                      type="text"
                      value={formData.tatDisplay}
                      onChange={(e) => setFormData({ ...formData, tatDisplay: e.target.value })}
                      placeholder="e.g. Same Day (8-12 hours)"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Package Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe what clinical profiles are included in this package..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Card 2: Interactive Test Picker */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <span>🔬</span> Select Investigations to Bundle ({selectedTests.length} Selected)
                  </h2>
                  <span className="text-xs font-bold text-blue-600">
                    Worth: ₹{formData.totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Search in tests */}
                <input
                  type="text"
                  placeholder="Filter tests by name or code to add..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {/* Test Selector List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 rounded-xl border border-gray-200 text-xs">
                  {loadingTests ? (
                    <div className="p-8 text-center text-gray-500">Loading catalog tests...</div>
                  ) : filteredTests.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No matching tests found.</div>
                  ) : (
                    filteredTests.map((test) => {
                      const isSelected = selectedTests.some((item) => item.testId === test.id);

                      return (
                        <div
                          key={test.id}
                          onClick={() => handleToggleTest(test)}
                          className={`p-3 flex items-center justify-between cursor-pointer transition ${
                            isSelected ? "bg-blue-50/80 font-medium" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <div>
                              <span className="font-mono text-xs font-bold text-blue-700 mr-2">
                                {test.testCode}
                              </span>
                              <span className="text-gray-900">{test.testName}</span>
                              <span className="text-[10px] text-gray-400 ml-2">
                                ({test.sampleContainer || test.sampleType})
                              </span>
                            </div>
                          </div>

                          <span className="font-bold text-gray-800">
                            ₹{Number(test.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Pricing & Phlebotomy Vial Preview */}
            <div className="space-y-6">
              {/* Card: Pricing Matrix */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-3">
                  💰 Tariff & Bundle Pricing
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-500 block">Total Individual MRP:</span>
                    <span className="text-xl font-extrabold text-gray-900 mt-0.5 block">
                      ₹{formData.totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Bundle Offer Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.offerPrice || ""}
                      onChange={(e) => handleOfferPriceChange(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base font-extrabold text-green-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Promotional Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={formData.discountPercentage || 0}
                      onChange={(e) => handleDiscountPercentChange(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {savings > 0 && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900 space-y-0.5">
                      <span className="font-bold block">Patient Value Proposition:</span>
                      <p>
                        Patients save <span className="font-bold">₹{savings.toLocaleString("en-IN")}</span> (
                        {formData.discountPercentage}% discount) over booking tests individually.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="font-semibold text-gray-800">Feature as Popular / Star Package ⭐</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="font-semibold text-gray-800">Publish Active in Patient Directory</span>
                  </label>
                </div>
              </div>

              {/* Card: Phlebotomy Vial Requirements Calculator */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <span>🩸</span> Phlebotomy Collection Vials
                </h3>

                {requiredVials.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-500">
                      Sample requirements automatically detected from bundled tests:
                    </p>
                    <div className="space-y-1.5">
                      {requiredVials.map(([name, count]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-800"
                        >
                          <span>{name}</span>
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                            1 Vial
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Select tests to calculate required phlebotomy vials.
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                >
                  {loading ? "Creating Package..." : "Publish Health Package"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}