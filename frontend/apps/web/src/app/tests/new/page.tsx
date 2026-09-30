"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";
import { SampleType, TestFormData, TestCategory } from "@/types";

interface TestPreset {
  name: string;
  code: string;
  shortName: string;
  sampleType: SampleType;
  sampleContainer: string;
  sampleVolume: string;
  method: string;
  price: number;
  offerPrice: number;
  b2bRate: number;
  tatHours: number;
  tatDisplay: string;
  patientPreparation: string;
  description: string;
}

const CLINICAL_PRESETS: TestPreset[] = [
  {
    name: "Complete Blood Count (CBC)",
    code: "CBC",
    shortName: "CBC",
    sampleType: "BLOOD",
    sampleContainer: "EDTA vial (purple)",
    sampleVolume: "2.0 mL",
    method: "Automated Flow Cytometry & Impedance",
    price: 450,
    offerPrice: 350,
    b2bRate: 200,
    tatHours: 6,
    tatDisplay: "Same Day (4-6 hours)",
    patientPreparation: "No special fasting required. Hydration recommended.",
    description: "Evaluates cellular components of blood including RBC, WBC, Platelet indices and 5-part differential.",
  },
  {
    name: "Lipid Profile Comprehensive",
    code: "LIPID",
    shortName: "Lipid Panel",
    sampleType: "SERUM",
    sampleContainer: "SST Gel (gold/yellow)",
    sampleVolume: "3.0 mL",
    method: "Enzymatic Colorimetric",
    price: 750,
    offerPrice: 550,
    b2bRate: 350,
    tatHours: 12,
    tatDisplay: "Same Day (8-12 hours)",
    patientPreparation: "10-12 hours strict overnight fasting required. Water is permitted.",
    description: "Assesses cardiovascular risk: Total Cholesterol, HDL, LDL, VLDL, and Triglycerides.",
  },
  {
    name: "Fasting Blood Sugar (FBS)",
    code: "FBS",
    shortName: "Blood Sugar Fasting",
    sampleType: "PLASMA",
    sampleContainer: "Fluoride Oxalate (grey)",
    sampleVolume: "2.0 mL",
    method: "Hexokinase / GOD-POD",
    price: 120,
    offerPrice: 80,
    b2bRate: 50,
    tatHours: 4,
    tatDisplay: "2 - 4 hours",
    patientPreparation: "8-10 hours overnight fasting. No morning tea, coffee or medication before draw.",
    description: "Primary screening test for diabetes mellitus and glycemic homeostasis.",
  },
  {
    name: "Glycated Hemoglobin (HbA1c)",
    code: "HBA1C",
    shortName: "HbA1c",
    sampleType: "BLOOD",
    sampleContainer: "EDTA vial (purple)",
    sampleVolume: "2.0 mL",
    method: "HPLC (High Performance Liquid Chromatography)",
    price: 600,
    offerPrice: 450,
    b2bRate: 280,
    tatHours: 12,
    tatDisplay: "Same Day",
    patientPreparation: "Non-fasting. Random blood collection acceptable.",
    description: "Reflects average blood glucose control over the preceding 2 to 3 months.",
  },
  {
    name: "Liver Function Test (LFT)",
    code: "LFT",
    shortName: "Liver Panel",
    sampleType: "SERUM",
    sampleContainer: "SST Gel (gold/yellow)",
    sampleVolume: "3.0 mL",
    method: "Spectrophotometry / Photometric",
    price: 850,
    offerPrice: 650,
    b2bRate: 400,
    tatHours: 12,
    tatDisplay: "Same Day",
    patientPreparation: "8-10 hours fasting preferred. Avoid alcohol 24h prior to testing.",
    description: "Bilirubin (Total/Direct/Indirect), SGOT, SGPT, Alkaline Phosphatase, Total Protein, Albumin/Globulin.",
  },
  {
    name: "Kidney Function Test (KFT / RFT)",
    code: "KFT",
    shortName: "Renal Panel",
    sampleType: "SERUM",
    sampleContainer: "SST Gel (gold/yellow)",
    sampleVolume: "3.0 mL",
    method: "Enzymatic UV / Jaffe Kinetic",
    price: 800,
    offerPrice: 600,
    b2bRate: 380,
    tatHours: 12,
    tatDisplay: "Same Day",
    patientPreparation: "Overnight fasting recommended. Maintain normal hydration.",
    description: "Blood Urea, BUN, Serum Creatinine, Uric Acid, Calcium, and Phosphorus.",
  },
  {
    name: "Thyroid Stimulating Hormone (TSH)",
    code: "TSH",
    shortName: "TSH Ultrasensitive",
    sampleType: "SERUM",
    sampleContainer: "Plain Red or SST Gel",
    sampleVolume: "2.5 mL",
    method: "CLIA (Chemiluminescence Immunoassay)",
    price: 450,
    offerPrice: 350,
    b2bRate: 220,
    tatHours: 24,
    tatDisplay: "24 hours",
    patientPreparation: "Early morning fasting sample preferred before taking thyroid hormone medication.",
    description: "Sensitive first-line test for thyroid dysfunction (hypothyroidism and hyperthyroidism).",
  },
];

const TUBE_OPTIONS = [
  { label: "EDTA Purple", container: "EDTA vial (purple)", sampleType: "BLOOD", color: "#A855F7", bg: "bg-purple-50", border: "border-purple-300" },
  { label: "SST Gold / Yellow", container: "SST Gel (gold/yellow)", sampleType: "SERUM", color: "#F59E0B", bg: "bg-amber-50", border: "border-amber-300" },
  { label: "Fluoride Grey", container: "Fluoride Oxalate (grey)", sampleType: "PLASMA", color: "#6B7280", bg: "bg-gray-50", border: "border-gray-300" },
  { label: "Plain Red", container: "Plain vial (red top)", sampleType: "SERUM", color: "#EF4444", bg: "bg-red-50", border: "border-red-300" },
  { label: "Citrate Blue", container: "Sodium Citrate (light blue)", sampleType: "PLASMA", color: "#38BDF8", bg: "bg-sky-50", border: "border-sky-300" },
  { label: "Heparin Green", container: "Lithium Heparin (green)", sampleType: "PLASMA", color: "#22C55E", bg: "bg-emerald-50", border: "border-emerald-300" },
  { label: "Sterile Cup", container: "Sterile Universal Container", sampleType: "URINE", color: "#EAB308", bg: "bg-yellow-50", border: "border-yellow-300" },
];

export default function NewTestPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [formData, setFormData] = useState<TestFormData>({
    testCode: "",
    testName: "",
    shortName: "",
    categoryId: "",
    sampleType: "BLOOD",
    sampleContainer: "EDTA vial (purple)",
    sampleVolume: "2.0 mL",
    processingDepartment: "",
    method: "",
    description: "",
    clinicalSignificance: "",
    patientPreparation: "",
    price: 500,
    offerPrice: 350,
    b2bRate: 200,
    gstPercentage: 0,
    tatHours: 24,
    tatDisplay: "24 hours",
    displayOrder: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await testApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const applyPreset = (preset: TestPreset) => {
    setFormData((prev) => ({
      ...prev,
      testName: preset.name,
      testCode: preset.code,
      shortName: preset.shortName,
      sampleType: preset.sampleType,
      sampleContainer: preset.sampleContainer,
      sampleVolume: preset.sampleVolume,
      method: preset.method,
      price: preset.price,
      offerPrice: preset.offerPrice,
      b2bRate: preset.b2bRate,
      tatHours: preset.tatHours,
      tatDisplay: preset.tatDisplay,
      patientPreparation: preset.patientPreparation,
      description: preset.description,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.testCode.trim()) {
      setError("Test Code is required (e.g. CBC, FBS, LIPID)");
      setLoading(false);
      return;
    }

    if (!formData.testName.trim()) {
      setError("Test Name is required");
      setLoading(false);
      return;
    }

    try {
      const testData: any = {
        testCode: formData.testCode.trim().toUpperCase(),
        testName: formData.testName.trim(),
        sampleType: formData.sampleType,
        price: Number(formData.price) || 0,
      };

      if (formData.shortName) testData.shortName = formData.shortName.trim();
      if (formData.categoryId) testData.categoryId = formData.categoryId;
      if (formData.sampleContainer) testData.sampleContainer = formData.sampleContainer;
      if (formData.sampleVolume) testData.sampleVolume = formData.sampleVolume;
      if (formData.processingDepartment) testData.processingDepartment = formData.processingDepartment;
      if (formData.method) testData.method = formData.method;
      if (formData.description) testData.description = formData.description;
      if (formData.clinicalSignificance) testData.clinicalSignificance = formData.clinicalSignificance;
      if (formData.patientPreparation) testData.patientPreparation = formData.patientPreparation;
      if (formData.offerPrice) testData.offerPrice = Number(formData.offerPrice);
      if (formData.b2bRate) testData.b2bRate = Number(formData.b2bRate);
      if (formData.gstPercentage !== undefined) testData.gstPercentage = Number(formData.gstPercentage);
      if (formData.tatHours) testData.tatHours = Number(formData.tatHours);
      if (formData.tatDisplay) testData.tatDisplay = formData.tatDisplay;
      if (formData.displayOrder) testData.displayOrder = Number(formData.displayOrder);
      if (formData.isActive !== undefined) testData.isActive = formData.isActive;

      const response = await testApi.create(testData);

      if (response.success) {
        router.push("/tests");
      } else {
        setError(response.message || "Failed to create test");
      }
    } catch (err) {
      console.error("Error creating test:", err);
      setError(err instanceof Error ? err.message : "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  // Financial calculations
  const baseMRP = Number(formData.price) || 0;
  const offerPrice = Number(formData.offerPrice) || 0;
  const b2bRate = Number(formData.b2bRate) || 0;
  const hasDiscount = offerPrice > 0 && offerPrice < baseMRP;
  const discountPercent = hasDiscount ? Math.round(((baseMRP - offerPrice) / baseMRP) * 100) : 0;
  const savings = hasDiscount ? baseMRP - offerPrice : 0;
  const referralMargin = b2bRate > 0 && offerPrice > b2bRate ? offerPrice - b2bRate : 0;
  const referralMarginPercent = b2bRate > 0 && offerPrice > b2bRate ? Math.round((referralMargin / offerPrice) * 100) : 0;

  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/tests"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition mb-1"
            >
              ← Back to Tests Catalog
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Add New Laboratory Investigation
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Define test profile, specimen tubes, analytical method, patient preparation, and diagnostic tariffs
            </p>
          </div>
        </div>

        {/* Clinical Quick Presets Bar */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <span>⚡</span> Fast-Track Clinical Presets (1-Click Fill):
            </span>
            <span className="text-[11px] text-blue-600">Click any standard profile to populate form</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {CLINICAL_PRESETS.map((p) => (
              <button
                type="button"
                key={p.code}
                onClick={() => applyPreset(p)}
                className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:border-blue-500 hover:bg-blue-600 hover:text-white transition shadow-2xs"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Core Test Identification */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span>📋</span> Test Identification & Classification
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Test Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Test Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBC, FBS, LIPID"
                  value={formData.testCode}
                  onChange={(e) => setFormData({ ...formData, testCode: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono font-bold uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Unique billing code</span>
              </div>

              {/* Test Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Test Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count with Differential"
                  value={formData.testName}
                  onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Short Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Name / Alias</label>
                <input
                  type="text"
                  placeholder="e.g. CBC, Hemogram"
                  value={formData.shortName || ""}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department / Category</label>
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.department ? `(${c.department})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Processing Lab Department */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Processing Section</label>
                <input
                  type="text"
                  placeholder="e.g. Central Hematology"
                  value={formData.processingDepartment || ""}
                  onChange={(e) => setFormData({ ...formData, processingDepartment: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Specimen & Phlebotomy Collection */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span>🧪</span> Specimen Collection & Vacutainer Vial
            </h2>

            {/* Visual Tube Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Standard Phlebotomy Tube Picker (Click to Select):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {TUBE_OPTIONS.map((tube) => {
                  const isSelected = formData.sampleContainer === tube.container;
                  return (
                    <button
                      type="button"
                      key={tube.label}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          sampleContainer: tube.container,
                          sampleType: tube.sampleType as SampleType,
                        })
                      }
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full shadow-inner mb-1" style={{ backgroundColor: tube.color }} />
                      <span className="text-[11px] font-bold text-gray-800">{tube.label}</span>
                      <span className="text-[9px] text-gray-500 mt-0.5">{tube.sampleType}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Sample Matrix */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Specimen Matrix</label>
                <select
                  value={formData.sampleType}
                  onChange={(e) => setFormData({ ...formData, sampleType: e.target.value as SampleType })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="BLOOD">Whole Blood</option>
                  <option value="SERUM">Serum</option>
                  <option value="PLASMA">Plasma</option>
                  <option value="URINE">Urine</option>
                  <option value="STOOL">Stool</option>
                  <option value="SWAB">Swab</option>
                  <option value="SPUTUM">Sputum</option>
                  <option value="CSF">CSF</option>
                  <option value="TISSUE">Tissue</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Sample Container text */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Container Description</label>
                <input
                  type="text"
                  value={formData.sampleContainer || ""}
                  onChange={(e) => setFormData({ ...formData, sampleContainer: e.target.value })}
                  placeholder="e.g. EDTA Purple vial"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Volume */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Volume</label>
                <input
                  type="text"
                  value={formData.sampleVolume || ""}
                  onChange={(e) => setFormData({ ...formData, sampleVolume: e.target.value })}
                  placeholder="e.g. 2.0 mL"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Patient Fasting Chips */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">Patient Preparation & Fasting Guidelines</label>
                <span className="text-[10px] text-gray-400">Click a chip to quick-fill:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  "10-12 hours overnight fasting required. Water permitted.",
                  "8-10 hours fasting. No tea/coffee in morning.",
                  "Post-prandial: exactly 2 hours after meal.",
                  "Early morning first void midstream urine.",
                  "No special fasting required.",
                ].map((chip) => (
                  <button
                    type="button"
                    key={chip}
                    onClick={() => setFormData({ ...formData, patientPreparation: chip })}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md transition"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={formData.patientPreparation || ""}
                onChange={(e) => setFormData({ ...formData, patientPreparation: e.target.value })}
                placeholder="Specific instructions for phlebotomist and patient before collection..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Card 3: Tariff & Pricing Calculator */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span>💰</span> Tariff, Discount & Referral Margin Matrix
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* MRP */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Standard Patient MRP (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Standard retail price</span>
              </div>

              {/* Offer Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Special Offer Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.offerPrice || ""}
                  onChange={(e) => setFormData({ ...formData, offerPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="Optional discounted rate"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-green-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Direct patient offer rate</span>
              </div>

              {/* B2B Rate */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">B2B / Referral Net Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.b2bRate || ""}
                  onChange={(e) => setFormData({ ...formData, b2bRate: parseFloat(e.target.value) || 0 })}
                  placeholder="Rate for clinics/doctors"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-indigo-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Transfer rate to partner</span>
              </div>

              {/* GST % */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">GST / Tax (%)</label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  value={formData.gstPercentage ?? 0}
                  onChange={(e) => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Diagnostic services (typically 0%)</span>
              </div>
            </div>

            {/* Real-Time Live Margin Calculation Card */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 block">Final Patient Billing:</span>
                  <span className="text-base font-extrabold text-gray-900 mt-0.5 block">
                    ₹{(hasDiscount ? offerPrice : baseMRP).toLocaleString("en-IN")}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 block">Patient Discount:</span>
                  <span className="text-base font-extrabold text-green-700 mt-0.5 block">
                    {hasDiscount ? `${discountPercent}% (Save ₹${savings})` : "Standard MRP"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 block">Referring Doctor Margin:</span>
                  <span className="text-base font-extrabold text-indigo-700 mt-0.5 block">
                    {referralMargin > 0 ? `₹${referralMargin} (${referralMarginPercent}%)` : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 block">Net Lab Realization:</span>
                  <span className="text-base font-extrabold text-blue-700 mt-0.5 block">
                    ₹{(b2bRate > 0 ? b2bRate : hasDiscount ? offerPrice : baseMRP).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Turnaround Time, Analytical Method & Clinical Notes */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span>⏱️</span> Turnaround Time (TAT) & Analytical Method
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">TAT in Hours</label>
                <input
                  type="number"
                  min="1"
                  value={formData.tatHours ?? 24}
                  onChange={(e) => setFormData({ ...formData, tatHours: parseInt(e.target.value) || 24 })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Display TAT on Reports</label>
                <input
                  type="text"
                  value={formData.tatDisplay || ""}
                  onChange={(e) => setFormData({ ...formData, tatDisplay: e.target.value })}
                  placeholder="e.g. 24 hours, Same Day"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Measurement Method</label>
                <input
                  type="text"
                  value={formData.method || ""}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  placeholder="e.g. CLIA, HPLC, Hexokinase"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Test Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clinical summary and analytical scope of the test..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Clinical Significance</label>
                <textarea
                  rows={3}
                  value={formData.clinicalSignificance || ""}
                  onChange={(e) => setFormData({ ...formData, clinicalSignificance: e.target.value })}
                  placeholder="Medical conditions, differential diagnosis and significance..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <label htmlFor="isActive" className="text-xs font-semibold text-gray-700 cursor-pointer">
                Publish Test as Active in Directory (Patients and doctors can order this test)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/tests"
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving Test...
                </>
              ) : (
                "Save & Register Test"
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
