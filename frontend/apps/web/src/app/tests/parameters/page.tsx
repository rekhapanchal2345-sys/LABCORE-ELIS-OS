"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";
import {
  Sliders,
  Plus,
  Search,
  FlaskConical,
  CheckCircle2,
  Trash2,
  Edit,
  Sparkles,
  Filter,
  Scale,
  Hash,
  FileCode,
  Tag,
  X,
  ShieldCheck,
  ChevronRight,
  Layers,
  AlertTriangle,
  Activity,
  SlidersHorizontal,
  BellRing,
  HelpCircle,
  Eye,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Zap
} from "lucide-react";

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
  loincCode?: string;
  deltaCheckPercentage?: number;
  testId?: string;
  test?: {
    id: string;
    testName: string;
    testCode: string;
  };
  referenceRanges?: any[];
  // Extended Clinical Bounds
  maleLow?: number;
  maleHigh?: number;
  femaleLow?: number;
  femaleHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  panicLowAlert?: string;
  panicHighAlert?: string;
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
  "mg/L",
  "Index",
  "cells/HPF",
  "copies/mL"
];

interface MultiAnalyteBundle {
  bundleName: string;
  targetTestCode: string;
  description: string;
  icon: string;
  color: string;
  analytes: {
    parameterName: string;
    shortName: string;
    unit: string;
    dataType: string;
    displayOrder: number;
    maleLow?: number;
    maleHigh?: number;
    femaleLow?: number;
    femaleHigh?: number;
    criticalLow?: number;
    criticalHigh?: number;
    loincCode?: string;
    deltaCheckPercentage?: number;
  }[];
}

const STANDARD_ANALYTE_BUNDLES: MultiAnalyteBundle[] = [
  {
    bundleName: "Complete Blood Count (CBC / Hemogram)",
    targetTestCode: "CBC",
    description: "Full 7-parameter standard hematology panel with panic triggers for severe anemia & thrombocytopenia",
    icon: "🩸",
    color: "#7c3aed",
    analytes: [
      { parameterName: "Hemoglobin", shortName: "Hb", unit: "g/dL", dataType: "NUMERIC", displayOrder: 1, maleLow: 13.5, maleHigh: 17.5, femaleLow: 12.0, femaleHigh: 15.5, criticalLow: 7.0, criticalHigh: 20.0, loincCode: "718-7", deltaCheckPercentage: 15 },
      { parameterName: "Total Leukocyte Count (TLC / WBC)", shortName: "WBC", unit: "10^3/µL", dataType: "NUMERIC", displayOrder: 2, maleLow: 4.0, maleHigh: 11.0, femaleLow: 4.0, femaleHigh: 11.0, criticalLow: 2.0, criticalHigh: 30.0, loincCode: "6690-2", deltaCheckPercentage: 20 },
      { parameterName: "Total Platelet Count", shortName: "PLT", unit: "10^3/µL", dataType: "NUMERIC", displayOrder: 3, maleLow: 150, maleHigh: 450, femaleLow: 150, femaleHigh: 450, criticalLow: 50, criticalHigh: 1000, loincCode: "777-3", deltaCheckPercentage: 25 },
      { parameterName: "Packed Cell Volume (PCV)", shortName: "PCV", unit: "%", dataType: "NUMERIC", displayOrder: 4, maleLow: 40.0, maleHigh: 50.0, femaleLow: 36.0, femaleHigh: 46.0, criticalLow: 20.0, criticalHigh: 60.0, loincCode: "4544-3", deltaCheckPercentage: 15 },
      { parameterName: "Mean Corpuscular Volume (MCV)", shortName: "MCV", unit: "fL", dataType: "NUMERIC", displayOrder: 5, maleLow: 80.0, maleHigh: 100.0, femaleLow: 80.0, femaleHigh: 100.0, loincCode: "787-2", deltaCheckPercentage: 10 },
      { parameterName: "Mean Corpuscular Hemoglobin (MCH)", shortName: "MCH", unit: "pg", dataType: "NUMERIC", displayOrder: 6, maleLow: 27.0, maleHigh: 33.0, femaleLow: 27.0, femaleHigh: 33.0, loincCode: "785-6", deltaCheckPercentage: 10 },
      { parameterName: "Red Cell Distribution Width (RDW-CV)", shortName: "RDW", unit: "%", dataType: "NUMERIC", displayOrder: 7, maleLow: 11.5, maleHigh: 14.5, femaleLow: 11.5, femaleHigh: 14.5, loincCode: "788-0", deltaCheckPercentage: 15 },
    ]
  },
  {
    bundleName: "Liver Function Test (Comprehensive LFT)",
    targetTestCode: "LFT",
    description: "Hepatic enzymes, bilirubin fractions, total proteins & albumin with hepatotoxic panic thresholds",
    icon: "🧪",
    color: "#2563eb",
    analytes: [
      { parameterName: "Bilirubin Total", shortName: "T-Bili", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 1, maleLow: 0.2, maleHigh: 1.2, femaleLow: 0.2, femaleHigh: 1.2, criticalHigh: 15.0, loincCode: "1975-2", deltaCheckPercentage: 30 },
      { parameterName: "Bilirubin Direct (Conjugated)", shortName: "D-Bili", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 2, maleLow: 0.0, maleHigh: 0.3, femaleLow: 0.0, femaleHigh: 0.3, loincCode: "1968-7", deltaCheckPercentage: 30 },
      { parameterName: "SGOT / AST (Aspartate Aminotransferase)", shortName: "AST", unit: "U/L", dataType: "NUMERIC", displayOrder: 3, maleLow: 5, maleHigh: 40, femaleLow: 5, femaleHigh: 35, criticalHigh: 500, loincCode: "1920-8", deltaCheckPercentage: 40 },
      { parameterName: "SGPT / ALT (Alanine Aminotransferase)", shortName: "ALT", unit: "U/L", dataType: "NUMERIC", displayOrder: 4, maleLow: 7, maleHigh: 56, femaleLow: 7, femaleHigh: 45, criticalHigh: 500, loincCode: "1742-6", deltaCheckPercentage: 40 },
      { parameterName: "Alkaline Phosphatase (ALP)", shortName: "ALP", unit: "U/L", dataType: "NUMERIC", displayOrder: 5, maleLow: 44, maleHigh: 147, femaleLow: 44, femaleHigh: 147, loincCode: "6768-6", deltaCheckPercentage: 25 },
      { parameterName: "Total Protein", shortName: "TP", unit: "g/dL", dataType: "NUMERIC", displayOrder: 6, maleLow: 6.0, maleHigh: 8.3, femaleLow: 6.0, femaleHigh: 8.3, criticalLow: 4.5, loincCode: "2885-2", deltaCheckPercentage: 15 },
      { parameterName: "Serum Albumin", shortName: "ALB", unit: "g/dL", dataType: "NUMERIC", displayOrder: 7, maleLow: 3.5, maleHigh: 5.5, femaleLow: 3.5, femaleHigh: 5.5, criticalLow: 2.0, loincCode: "1751-7", deltaCheckPercentage: 15 },
    ]
  },
  {
    bundleName: "Kidney / Renal Function Panel (KFT / RFT)",
    targetTestCode: "KFT",
    description: "Renal profile with serum creatinine, blood urea, BUN, electrolytes & uric acid with uremic panic alerts",
    icon: "🧫",
    color: "#059669",
    analytes: [
      { parameterName: "Serum Creatinine", shortName: "CREAT", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 1, maleLow: 0.7, maleHigh: 1.3, femaleLow: 0.5, femaleHigh: 1.1, criticalHigh: 6.0, loincCode: "2160-0", deltaCheckPercentage: 25 },
      { parameterName: "Blood Urea", shortName: "UREA", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 2, maleLow: 15, maleHigh: 45, femaleLow: 15, femaleHigh: 45, criticalHigh: 150, loincCode: "3094-0", deltaCheckPercentage: 30 },
      { parameterName: "Blood Urea Nitrogen (BUN)", shortName: "BUN", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 3, maleLow: 7, maleHigh: 20, femaleLow: 7, femaleHigh: 20, criticalHigh: 80, loincCode: "3094-0", deltaCheckPercentage: 30 },
      { parameterName: "Serum Uric Acid", shortName: "UA", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 4, maleLow: 3.5, maleHigh: 7.2, femaleLow: 2.6, femaleHigh: 6.0, loincCode: "3084-1", deltaCheckPercentage: 20 },
      { parameterName: "Serum Sodium (Na+)", shortName: "Na", unit: "mmol/L", dataType: "NUMERIC", displayOrder: 5, maleLow: 135, maleHigh: 145, femaleLow: 135, femaleHigh: 145, criticalLow: 120, criticalHigh: 160, loincCode: "2951-2", deltaCheckPercentage: 5 },
      { parameterName: "Serum Potassium (K+)", shortName: "K", unit: "mmol/L", dataType: "NUMERIC", displayOrder: 6, maleLow: 3.5, maleHigh: 5.1, femaleLow: 3.5, femaleHigh: 5.1, criticalLow: 2.8, criticalHigh: 6.5, loincCode: "2823-3", deltaCheckPercentage: 10 },
    ]
  },
  {
    bundleName: "Lipid Profile & Atherogenic Risk Panel",
    targetTestCode: "LIPID",
    description: "Standard cardiovascular lipid panel: Total cholesterol, HDL, LDL, Triglycerides, and VLDL",
    icon: "❤️",
    color: "#db2777",
    analytes: [
      { parameterName: "Total Cholesterol", shortName: "CHOL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 1, maleLow: 125, maleHigh: 200, femaleLow: 125, femaleHigh: 200, criticalHigh: 400, loincCode: "2093-3", deltaCheckPercentage: 20 },
      { parameterName: "HDL Cholesterol (Good)", shortName: "HDL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 2, maleLow: 40, maleHigh: 60, femaleLow: 50, femaleHigh: 70, loincCode: "2085-9", deltaCheckPercentage: 15 },
      { parameterName: "LDL Cholesterol (Direct / Calc)", shortName: "LDL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 3, maleLow: 60, maleHigh: 100, femaleLow: 60, femaleHigh: 100, criticalHigh: 250, loincCode: "13457-7", deltaCheckPercentage: 20 },
      { parameterName: "Serum Triglycerides", shortName: "TRIG", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 4, maleLow: 50, maleHigh: 150, femaleLow: 50, femaleHigh: 150, criticalHigh: 500, loincCode: "2571-8", deltaCheckPercentage: 35 },
      { parameterName: "VLDL Cholesterol", shortName: "VLDL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 5, maleLow: 10, maleHigh: 30, femaleLow: 10, femaleHigh: 30, loincCode: "13458-5", deltaCheckPercentage: 25 },
    ]
  }
];

export default function TestParametersPage() {
  const [parameters, setParameters] = useState<TestParameter[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "matrix" | "grouped">("table");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingParam, setEditingParam] = useState<TestParameter | null>(null);
  const [saving, setSaving] = useState(false);
  const [inspectingParam, setInspectingParam] = useState<TestParameter | null>(null);
  const [importingBundle, setImportingBundle] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    testId: "",
    parameterName: "",
    shortName: "",
    unit: "mg/dL",
    dataType: "NUMERIC",
    loincCode: "",
    displayOrder: 1,
    isRequired: true,
    deltaCheckPercentage: 20,
    maleLow: 0,
    maleHigh: 100,
    femaleLow: 0,
    femaleHigh: 100,
    criticalLow: undefined as number | undefined,
    criticalHigh: undefined as number | undefined,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [paramRes, testRes] = await Promise.all([
        testApi.getParameters(),
        testApi.getAll("limit=200")
      ]);

      if (paramRes.success && paramRes.data) {
        setParameters(paramRes.data);
      }
      if (testRes.success && testRes.data) {
        setTests(testRes.data);
      }
    } catch (err) {
      console.error("Error fetching parameters:", err);
      setError(err instanceof Error ? err.message : "Failed to load parameters");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleOpenAddModal = (initialTestId?: string) => {
    setEditingParam(null);
    setFormData({
      testId: initialTestId || selectedTest || (tests[0]?.id || ""),
      parameterName: "",
      shortName: "",
      unit: "mg/dL",
      dataType: "NUMERIC",
      loincCode: "",
      displayOrder: parameters.length + 1,
      isRequired: true,
      deltaCheckPercentage: 20,
      maleLow: 0,
      maleHigh: 100,
      femaleLow: 0,
      femaleHigh: 100,
      criticalLow: undefined,
      criticalHigh: undefined,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (param: TestParameter) => {
    setEditingParam(param);
    setFormData({
      testId: param.testId || param.test?.id || "",
      parameterName: param.parameterName,
      shortName: param.shortName || "",
      unit: param.unit || "mg/dL",
      dataType: param.dataType || "NUMERIC",
      loincCode: param.loincCode || "",
      displayOrder: param.displayOrder || 1,
      isRequired: param.isRequired !== false,
      deltaCheckPercentage: param.deltaCheckPercentage || 20,
      maleLow: param.maleLow ?? 0,
      maleHigh: param.maleHigh ?? 100,
      femaleLow: param.femaleLow ?? 0,
      femaleHigh: param.femaleHigh ?? 100,
      criticalLow: param.criticalLow,
      criticalHigh: param.criticalHigh,
    });
    setShowModal(true);
  };

  const handleDeleteParam = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete analyte "${name}"? Biological intervals for this parameter will also be deleted.`)) {
      return;
    }

    try {
      await testApi.deleteParameter(id);
      showNotification(`Analyte "${name}" removed successfully.`);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete analyte parameter");
    }
  };

  const handleSaveParameter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!formData.testId) {
        throw new Error("Please select a parent test profile");
      }
      if (!formData.parameterName.trim()) {
        throw new Error("Analyte parameter name is required");
      }

      const payload = {
        parameterName: formData.parameterName.trim(),
        shortName: formData.shortName.trim() || undefined,
        unit: formData.unit,
        dataType: formData.dataType,
        loincCode: formData.loincCode.trim() || undefined,
        displayOrder: Number(formData.displayOrder) || 1,
        isRequired: formData.isRequired,
        deltaCheckPercentage: Number(formData.deltaCheckPercentage) || undefined,
        maleLow: Number(formData.maleLow),
        maleHigh: Number(formData.maleHigh),
        femaleLow: Number(formData.femaleLow),
        femaleHigh: Number(formData.femaleHigh),
        criticalLow: formData.criticalLow !== undefined ? Number(formData.criticalLow) : undefined,
        criticalHigh: formData.criticalHigh !== undefined ? Number(formData.criticalHigh) : undefined,
      };

      if (editingParam) {
        await testApi.updateParameter(editingParam.id, payload);
        showNotification(`Analyte "${payload.parameterName}" updated successfully!`);
      } else {
        await testApi.addParameter(formData.testId, payload);
        showNotification(`Analyte "${payload.parameterName}" created successfully!`);
      }

      setShowModal(false);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save parameter");
    } finally {
      setSaving(false);
    }
  };

  const handleImportBundle = async (bundle: MultiAnalyteBundle) => {
    const targetTest = tests.find((t) => t.testCode?.toUpperCase() === bundle.targetTestCode || t.code?.toUpperCase() === bundle.targetTestCode);
    const targetTestId = targetTest?.id || selectedTest || tests[0]?.id;

    if (!targetTestId) {
      alert("Please select a parent test or create a matching test first (e.g. CBC, LFT, KFT).");
      return;
    }

    if (!confirm(`Import ${bundle.analytes.length} standard analytes into test (${targetTest?.testName || 'Selected Test'})?`)) {
      return;
    }

    setImportingBundle(true);
    let imported = 0;

    for (const a of bundle.analytes) {
      try {
        const res = await testApi.addParameter(String(targetTestId), {
          ...a,
          isActive: true,
          isRequired: true,
        });

        if (res?.success && res.data?.id) {
          const pId = res.data.id;
          if (a.maleLow !== undefined && a.maleHigh !== undefined) {
            await testApi.addReferenceRange(pId, {
              gender: "MALE",
              ageGroup: "ADULT",
              normalLow: a.maleLow,
              normalHigh: a.maleHigh,
              criticalLow: a.criticalLow,
              criticalHigh: a.criticalHigh,
              isActive: true,
            }).catch(() => {});
          }
        }
        imported++;
      } catch (err) {
        console.warn("Error importing analyte:", err);
      }
    }

    setImportingBundle(false);
    showNotification(`Imported ${imported} analytes for ${bundle.bundleName}!`);
    await fetchData();
  };

  // Filtered & Grouped Parameters
  const filteredParameters = useMemo(() => {
    return parameters.filter((param) => {
      const matchesSearch =
        param.parameterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (param.shortName && param.shortName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (param.unit && param.unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (param.test?.testName && param.test.testName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (param.test?.testCode && param.test.testCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (param.loincCode && param.loincCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTest = selectedTest ? param.testId === selectedTest || param.test?.id === selectedTest : true;
      const matchesCritical = filterCriticalOnly ? (param.criticalLow !== undefined || param.criticalHigh !== undefined) : true;

      return matchesSearch && matchesTest && matchesCritical;
    });
  }, [parameters, searchTerm, selectedTest, filterCriticalOnly]);

  // Grouped by parent test
  const groupedParameters = useMemo(() => {
    const groups: { [key: string]: { testName: string; testCode: string; params: TestParameter[] } } = {};
    filteredParameters.forEach((p) => {
      const key = p.testId || p.test?.id || "unassigned";
      if (!groups[key]) {
        groups[key] = {
          testName: p.test?.testName || "Unassigned Test",
          testCode: p.test?.testCode || "N/A",
          params: [],
        };
      }
      groups[key].params.push(p);
    });
    return groups;
  }, [filteredParameters]);

  const totalAnalytes = parameters.length;
  const criticalCount = parameters.filter((p) => p.criticalLow !== undefined || p.criticalHigh !== undefined).length;
  const uniqueTestsCount = new Set(parameters.map((p) => p.testId || p.test?.id)).size;

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "FRONT_DESK", "LAB_TECH", "PATHOLOGIST", "DOCTOR"]}>
      <div className="space-y-6 pb-24">
        {/* Floating Success Notification */}
        {successMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-800 shadow-lg animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Master Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
              <Sliders className="h-3.5 w-3.5" />
              <span>Diagnostic Taxonomy / Analyte Parameters Master</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>Pathology Analyte Parameters &amp; Biological Bounds</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Manage discrete analytes, LOINC codes, reference intervals, critical panic triggers, and delta-check variance %
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4.5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Analyte Parameter</span>
            </button>
          </div>
        </div>

        {/* Clinical KPI Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Total Analytes</span>
              <Sliders className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalAnalytes}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Configured parameters</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Mapped Investigations</span>
              <FlaskConical className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-700">{uniqueTestsCount}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Parent test profiles</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Critical Panic Alarms</span>
              <BellRing className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-700">{criticalCount}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Panic triggers active</div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>NABL Delta-Check</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">48h Window</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Automatic delta verification</div>
          </div>
        </div>

        {/* 1-Click Multi-Analyte Quick Bundles Importer Bar */}
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4.5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                1-Click Standard Multi-Analyte Panels Importer
              </span>
            </div>
            <span className="text-[11px] font-semibold text-blue-700">
              Auto-inject standardized hospital reference intervals &amp; critical bounds
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STANDARD_ANALYTE_BUNDLES.map((bundle) => (
              <button
                type="button"
                key={bundle.bundleName}
                onClick={() => handleImportBundle(bundle)}
                disabled={importingBundle}
                className="group flex flex-col text-left rounded-2xl border border-slate-200 bg-white p-3.5 hover:border-blue-400 hover:bg-blue-50/50 transition-all shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{bundle.icon}</span>
                  <span className="text-[10px] font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {bundle.targetTestCode}
                  </span>
                </div>
                <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition">
                  {bundle.bundleName}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {bundle.description}
                </div>
                <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-blue-600 group-hover:translate-x-0.5 transition">
                  <span>+ Import {bundle.analytes.length} Analytes</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filter & View Switcher Bar */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by analyte name, unit, code, or LOINC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/60 pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full sm:w-60 rounded-xl border border-slate-300 bg-slate-50/60 px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="">All Investigations ({tests.length})</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.testCode || t.code} - {t.testName || t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            <button
              type="button"
              onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                filterCriticalOnly
                  ? "bg-rose-50 border-rose-300 text-rose-800 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BellRing className="h-3.5 w-3.5 text-rose-600" />
              <span>Panic Values Only</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "matrix" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Interval Gauges
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grouped")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "grouped" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Grouped View
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-300 p-4 text-xs font-bold text-rose-800 shadow-xs">
            {error}
          </div>
        )}

        {/* MAIN DISPLAY: TABLE VIEW / GAUGES / GROUPED */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mx-auto" />
            <div className="text-xs font-bold text-slate-500">Loading Analyte Parameters Matrix...</div>
          </div>
        ) : filteredParameters.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center space-y-4 shadow-xs">
            <Sliders className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-slate-900">No analyte parameters found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Configure analyte parameters for pathology investigations or auto-import standard multi-analyte bundles above.
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
            >
              + Add First Analyte
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW (LIGHT WHITE) */
          <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3.5">Analyte Parameter</th>
                    <th className="px-4 py-3.5">Parent Investigation</th>
                    <th className="px-4 py-3.5">Reporting Unit</th>
                    <th className="px-4 py-3.5">Normal Adult Range</th>
                    <th className="px-4 py-3.5">Critical Panic Thresholds</th>
                    <th className="px-4 py-3.5">Delta Check</th>
                    <th className="px-4 py-3.5">Mandatory</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredParameters.map((param) => {
                    const hasCritical = param.criticalLow !== undefined || param.criticalHigh !== undefined;

                    return (
                      <tr
                        key={param.id}
                        onClick={() => setInspectingParam(param)}
                        className="hover:bg-slate-50/80 cursor-pointer transition"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{param.parameterName}</span>
                            {param.shortName && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                                {param.shortName}
                              </span>
                            )}
                          </div>
                          {param.loincCode && (
                            <span className="text-[10px] font-mono text-slate-400">
                              LOINC: {param.loincCode}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-900">
                            {param.test?.testName || "—"}
                          </span>
                          {param.test?.testCode && (
                            <span className="block text-[10px] font-mono text-slate-500">
                              [{param.test.testCode}]
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {param.unit || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5 text-[11px]">
                            {param.maleLow !== undefined && param.maleHigh !== undefined ? (
                              <div className="text-slate-700">
                                <span className="text-blue-700 font-bold">M: </span>
                                <span>{param.maleLow} - {param.maleHigh} {param.unit}</span>
                              </div>
                            ) : null}
                            {param.femaleLow !== undefined && param.femaleHigh !== undefined ? (
                              <div className="text-slate-700">
                                <span className="text-pink-700 font-bold">F: </span>
                                <span>{param.femaleLow} - {param.femaleHigh} {param.unit}</span>
                              </div>
                            ) : null}
                            {!param.maleLow && !param.femaleLow && (
                              <span className="text-slate-400 italic">Standard range in report</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          {hasCritical ? (
                            <div className="space-y-0.5">
                              {param.criticalLow !== undefined && (
                                <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 mr-1">
                                  <span>&lt; {param.criticalLow}</span>
                                </span>
                              )}
                              {param.criticalHigh !== undefined && (
                                <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                                  <span>&gt; {param.criticalHigh}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">None</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {param.deltaCheckPercentage ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                              ±{param.deltaCheckPercentage}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              param.isRequired !== false
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {param.isRequired !== false ? "REQUIRED" : "OPTIONAL"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(param)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                              title="Edit Analyte"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParam(param.id, param.parameterName)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                              title="Delete Analyte"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === "matrix" ? (
          /* INTERVAL GAUGES MATRIX (LIGHT WHITE) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParameters.map((p) => {
              const maleLow = p.maleLow ?? 0;
              const maleHigh = p.maleHigh ?? 100;
              const hasPanic = p.criticalLow !== undefined || p.criticalHigh !== undefined;

              return (
                <div
                  key={p.id}
                  onClick={() => setInspectingParam(p)}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-blue-400 hover:shadow-md transition cursor-pointer space-y-3.5 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{p.parameterName}</h4>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {p.test?.testName || "Diagnostic Test"}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {p.unit}
                    </span>
                  </div>

                  {/* Biological Gauge Visual */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="text-rose-600 font-mono">Panic &lt; {p.criticalLow ?? "—"}</span>
                      <span className="text-emerald-700 font-mono">Normal: {maleLow} - {maleHigh}</span>
                      <span className="text-rose-600 font-mono">Panic &gt; {p.criticalHigh ?? "—"}</span>
                    </div>

                    <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
                      <div className="h-full bg-rose-200/80 w-1/5" title="Critical Low Zone" />
                      <div className="h-full bg-emerald-400/90 w-3/5" title="Biological Reference Interval" />
                      <div className="h-full bg-rose-200/80 w-1/5" title="Critical High Zone" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="font-mono text-slate-500">LOINC: {p.loincCode || "N/A"}</span>
                    <span className="font-bold text-blue-600 hover:underline">Inspect Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* GROUPED BY PARENT TEST VIEW (LIGHT WHITE) */
          <div className="space-y-6">
            {Object.keys(groupedParameters).map((testKey) => {
              const group = groupedParameters[testKey];

              return (
                <div key={testKey} className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                        {group.testCode}
                      </span>
                      <h3 className="text-sm font-black text-slate-900">{group.testName}</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {group.params.length} Analytes
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {group.params.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setInspectingParam(p)}
                        className="rounded-xl border border-slate-200 bg-white p-3 hover:border-blue-400 transition cursor-pointer flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{p.parameterName}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Unit: {p.unit} | M: {p.maleLow ?? "—"} - {p.maleHigh ?? "—"}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INSPECTION DRAWER MODAL (LIGHT WHITE) */}
        {inspectingParam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                    <Sliders className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{inspectingParam.parameterName}</h3>
                    <p className="text-[11px] text-slate-500">
                      Parent Test: {inspectingParam.test?.testName} ({inspectingParam.test?.testCode})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingParam(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Analytical & Clinical Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block">Reporting Unit</span>
                  <span className="text-sm font-mono font-bold text-blue-700 block mt-0.5">
                    {inspectingParam.unit}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block">Data Type</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">
                    {inspectingParam.dataType}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block">LOINC Standard</span>
                  <span className="text-sm font-mono font-bold text-slate-900 block mt-0.5">
                    {inspectingParam.loincCode || "N/A"}
                  </span>
                </div>
              </div>

              {/* Biological Reference Intervals Matrix */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-xs">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                  Biological Normative Reference Intervals
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-700 block">Adult Male</span>
                    <span className="text-base font-bold text-blue-900 block mt-0.5">
                      {inspectingParam.maleLow ?? "—"} - {inspectingParam.maleHigh ?? "—"} {inspectingParam.unit}
                    </span>
                  </div>
                  <div className="rounded-xl bg-pink-50/70 p-3 border border-pink-200">
                    <span className="text-[10px] font-bold text-pink-700 block">Adult Female</span>
                    <span className="text-base font-bold text-pink-900 block mt-0.5">
                      {inspectingParam.femaleLow ?? "—"} - {inspectingParam.femaleHigh ?? "—"} {inspectingParam.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Critical Panic Thresholds */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <BellRing className="h-3.5 w-3.5" />
                  <span>Immediate Pathologist Alert Thresholds</span>
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white p-2.5 border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-700 block">Critical Low Panic</span>
                    <span className="text-sm font-black text-rose-800 font-mono block mt-0.5">
                      {inspectingParam.criticalLow !== undefined ? `< ${inspectingParam.criticalLow} ${inspectingParam.unit}` : "None"}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-700 block">Critical High Panic</span>
                    <span className="text-sm font-black text-rose-800 font-mono block mt-0.5">
                      {inspectingParam.criticalHigh !== undefined ? `> ${inspectingParam.criticalHigh} ${inspectingParam.unit}` : "None"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const p = inspectingParam;
                    setInspectingParam(null);
                    handleOpenEditModal(p);
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
                >
                  Edit Analyte Parameters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT PARAMETER (LIGHT WHITE) */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                    <Sliders className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      {editingParam ? "Edit Analyte Parameter" : "Add Discrete Analyte Parameter"}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Configure reporting units, biological intervals, and critical panic alarm triggers
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveParameter} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Parent Test */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Parent Diagnostic Test <span className="text-rose-600">*</span>
                    </label>
                    <select
                      required
                      value={formData.testId}
                      onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select Test Profile</option>
                      {tests.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.testCode || t.code} - {t.testName || t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Parameter Name */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Analyte Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hemoglobin, Serum Creatinine"
                      value={formData.parameterName}
                      onChange={(e) => setFormData({ ...formData, parameterName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Short Name */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Short Abbreviation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hb, CREAT"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* LOINC Code */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      LOINC Universal Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 718-7"
                      value={formData.loincCode}
                      onChange={(e) => setFormData({ ...formData, loincCode: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Reporting Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {COMMON_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Data Type
                    </label>
                    <select
                      value={formData.dataType}
                      onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="NUMERIC">NUMERIC (Decimal)</option>
                      <option value="TEXT">TEXT / Observation</option>
                      <option value="DROPDOWN">DROPDOWN (Positive/Negative)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Delta Check Variance %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.deltaCheckPercentage}
                      onChange={(e) => setFormData({ ...formData, deltaCheckPercentage: parseInt(e.target.value) || 25 })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Biological Reference Bounds */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
                    Adult Biological Reference Bounds ({formData.unit})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-blue-700 mb-1">Male Low</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.maleLow}
                        onChange={(e) => setFormData({ ...formData, maleLow: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-700 mb-1">Male High</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.maleHigh}
                        onChange={(e) => setFormData({ ...formData, maleHigh: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-pink-700 mb-1">Female Low</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.femaleLow}
                        onChange={(e) => setFormData({ ...formData, femaleLow: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-pink-700 mb-1">Female High</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.femaleHigh}
                        onChange={(e) => setFormData({ ...formData, femaleHigh: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Critical Panic Triggers */}
                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-800 block">
                    Critical Panic Alert Alarms (Immediate Pathologist Callout)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-rose-800 mb-1">
                        Critical Panic Low Value
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 7.0 for Severe Anemia"
                        value={formData.criticalLow ?? ""}
                        onChange={(e) => setFormData({ ...formData, criticalLow: parseFloat(e.target.value) || undefined })}
                        className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs font-bold text-rose-900 placeholder-rose-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-rose-800 mb-1">
                        Critical Panic High Value
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 20.0 or 500 for ALT"
                        value={formData.criticalHigh ?? ""}
                        onChange={(e) => setFormData({ ...formData, criticalHigh: parseFloat(e.target.value) || undefined })}
                        className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs font-bold text-rose-900 placeholder-rose-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Saving Analyte..." : editingParam ? "Update Analyte" : "Save Analyte Parameter"}
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