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
    panicLowAlert?: string;
    panicHighAlert?: string;
  }[];
}

const STANDARD_ANALYTE_BUNDLES: MultiAnalyteBundle[] = [
  {
    bundleName: "Complete Blood Count (14 Hemogram Analytes)",
    targetTestCode: "CBC",
    description: "Full cellular blood count: Hb, TLC, RBC, Platelet, indices & 5-part differential.",
    icon: "🩸",
    color: "#8B5CF6",
    analytes: [
      { parameterName: "Hemoglobin (Hb)", shortName: "Hb", unit: "g/dL", dataType: "NUMERIC", displayOrder: 1, maleLow: 13.0, maleHigh: 17.0, femaleLow: 12.0, femaleHigh: 15.0, criticalLow: 7.0, criticalHigh: 20.0, panicLowAlert: "Critical Anemia (< 7.0 g/dL)", panicHighAlert: "Polycythemia (> 20.0 g/dL)" },
      { parameterName: "Total Leukocyte Count (TLC / WBC)", shortName: "TLC / WBC", unit: "10^3/µL", dataType: "NUMERIC", displayOrder: 2, maleLow: 4.0, maleHigh: 11.0, femaleLow: 4.0, femaleHigh: 11.0, criticalLow: 2.0, criticalHigh: 30.0, panicLowAlert: "Agranulocytosis / Severe Sepsis", panicHighAlert: "Leukemoid Reaction / Hyperleukocytosis" },
      { parameterName: "Total RBC Count", shortName: "RBC", unit: "10^6/µL", dataType: "NUMERIC", displayOrder: 3, maleLow: 4.5, maleHigh: 5.9, femaleLow: 4.0, femaleHigh: 5.2 },
      { parameterName: "Platelet Count (PLT)", shortName: "PLT", unit: "10^3/µL", dataType: "NUMERIC", displayOrder: 4, maleLow: 150, maleHigh: 450, femaleLow: 150, femaleHigh: 450, criticalLow: 20, criticalHigh: 1000, panicLowAlert: "Severe Thrombocytopenia (Bleeding Risk)", panicHighAlert: "Extreme Thrombocytosis" },
      { parameterName: "Packed Cell Volume (PCV / Hematocrit)", shortName: "PCV", unit: "%", dataType: "NUMERIC", displayOrder: 5, maleLow: 40.0, maleHigh: 50.0, femaleLow: 36.0, femaleHigh: 46.0, criticalLow: 20.0, criticalHigh: 60.0 },
      { parameterName: "Mean Corpuscular Volume (MCV)", shortName: "MCV", unit: "fL", dataType: "NUMERIC", displayOrder: 6, maleLow: 80.0, maleHigh: 100.0, femaleLow: 80.0, femaleHigh: 100.0 },
      { parameterName: "Mean Corpuscular Hemoglobin (MCH)", shortName: "MCH", unit: "pg", dataType: "NUMERIC", displayOrder: 7, maleLow: 27.0, maleHigh: 32.0, femaleLow: 27.0, femaleHigh: 32.0 },
      { parameterName: "MCH Concentration (MCHC)", shortName: "MCHC", unit: "g/dL", dataType: "NUMERIC", displayOrder: 8, maleLow: 32.0, maleHigh: 36.0, femaleLow: 32.0, femaleHigh: 36.0 },
      { parameterName: "Red Cell Distribution Width (RDW-CV)", shortName: "RDW", unit: "%", dataType: "NUMERIC", displayOrder: 9, maleLow: 11.5, maleHigh: 14.5, femaleLow: 11.5, femaleHigh: 14.5 },
      { parameterName: "Neutrophils Absolute / %", shortName: "NEUT", unit: "%", dataType: "NUMERIC", displayOrder: 10, maleLow: 40.0, maleHigh: 75.0, femaleLow: 40.0, femaleHigh: 75.0, criticalLow: 10.0 },
      { parameterName: "Lymphocytes Absolute / %", shortName: "LYMPH", unit: "%", dataType: "NUMERIC", displayOrder: 11, maleLow: 20.0, maleHigh: 45.0, femaleLow: 20.0, femaleHigh: 45.0 },
      { parameterName: "Monocytes Absolute / %", shortName: "MONO", unit: "%", dataType: "NUMERIC", displayOrder: 12, maleLow: 2.0, maleHigh: 10.0, femaleLow: 2.0, femaleHigh: 10.0 },
      { parameterName: "Eosinophils Absolute / %", shortName: "EOS", unit: "%", dataType: "NUMERIC", displayOrder: 13, maleLow: 1.0, maleHigh: 6.0, femaleLow: 1.0, femaleHigh: 6.0 },
      { parameterName: "Basophils Absolute / %", shortName: "BASO", unit: "%", dataType: "NUMERIC", displayOrder: 14, maleLow: 0.0, maleHigh: 1.5, femaleLow: 0.0, femaleHigh: 1.5 },
    ],
  },
  {
    bundleName: "Liver Function Test (8 Hepatic Analytes)",
    targetTestCode: "LFT",
    description: "Hepatic panel: Bilirubin Total/Direct, SGOT/AST, SGPT/ALT, ALP, Total Protein, Albumin.",
    icon: "🧪",
    color: "#3B82F6",
    analytes: [
      { parameterName: "Serum Bilirubin Total", shortName: "TBIL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 1, maleLow: 0.2, maleHigh: 1.2, femaleLow: 0.2, femaleHigh: 1.2, criticalHigh: 15.0, panicHighAlert: "Severe Hyperbilirubinemia / Kernicterus Risk" },
      { parameterName: "Serum Bilirubin Direct (Conjugated)", shortName: "DBIL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 2, maleLow: 0.0, maleHigh: 0.3, femaleLow: 0.0, femaleHigh: 0.3 },
      { parameterName: "Serum Bilirubin Indirect (Unconjugated)", shortName: "IBIL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 3, maleLow: 0.1, maleHigh: 0.8, femaleLow: 0.1, femaleHigh: 0.8 },
      { parameterName: "SGOT / AST (Aspartate Aminotransferase)", shortName: "SGOT", unit: "U/L", dataType: "NUMERIC", displayOrder: 4, maleLow: 5.0, maleHigh: 40.0, femaleLow: 5.0, femaleHigh: 35.0, criticalHigh: 500.0, panicHighAlert: "Acute Hepatitis / Fulminant Hepatic Necrosis" },
      { parameterName: "SGPT / ALT (Alanine Aminotransferase)", shortName: "SGPT", unit: "U/L", dataType: "NUMERIC", displayOrder: 5, maleLow: 5.0, maleHigh: 45.0, femaleLow: 5.0, femaleHigh: 35.0, criticalHigh: 500.0, panicHighAlert: "Acute Hepatocellular Toxicity" },
      { parameterName: "Alkaline Phosphatase (ALP)", shortName: "ALP", unit: "U/L", dataType: "NUMERIC", displayOrder: 6, maleLow: 44.0, maleHigh: 147.0, femaleLow: 44.0, femaleHigh: 147.0 },
      { parameterName: "Total Serum Protein", shortName: "TP", unit: "g/dL", dataType: "NUMERIC", displayOrder: 7, maleLow: 6.0, maleHigh: 8.3, femaleLow: 6.0, femaleHigh: 8.3 },
      { parameterName: "Serum Albumin", shortName: "ALB", unit: "g/dL", dataType: "NUMERIC", displayOrder: 8, maleLow: 3.5, maleHigh: 5.2, femaleLow: 3.5, femaleHigh: 5.2, criticalLow: 1.8, panicLowAlert: "Severe Hypoalbuminemia" },
    ],
  },
  {
    bundleName: "Kidney Function / Renal Panel (6 Analytes)",
    targetTestCode: "KFT",
    description: "Renal clearance panel: Blood Urea, Creatinine, BUN, Uric Acid, Calcium, Phosphorus.",
    icon: "🫘",
    color: "#10B981",
    analytes: [
      { parameterName: "Blood Urea", shortName: "UREA", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 1, maleLow: 15.0, maleHigh: 45.0, femaleLow: 15.0, femaleHigh: 45.0, criticalHigh: 120.0, panicHighAlert: "Uremic Encephalopathy Risk" },
      { parameterName: "Serum Creatinine", shortName: "CREAT", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 2, maleLow: 0.7, maleHigh: 1.3, femaleLow: 0.5, femaleHigh: 1.1, criticalHigh: 4.5, panicHighAlert: "Acute Kidney Injury / Anuria Risk" },
      { parameterName: "Blood Urea Nitrogen (BUN)", shortName: "BUN", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 3, maleLow: 7.0, maleHigh: 20.0, femaleLow: 7.0, femaleHigh: 20.0 },
      { parameterName: "Serum Uric Acid", shortName: "UA", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 4, maleLow: 3.5, maleHigh: 7.2, femaleLow: 2.6, femaleHigh: 6.0, criticalHigh: 12.0 },
      { parameterName: "Serum Calcium Total", shortName: "CA", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 5, maleLow: 8.8, maleHigh: 10.2, femaleLow: 8.8, femaleHigh: 10.2, criticalLow: 6.5, criticalHigh: 13.0, panicLowAlert: "Tetany / Arrhythmia Risk", panicHighAlert: "Hypercalcemic Crisis" },
      { parameterName: "Serum Inorganic Phosphorus", shortName: "PHOS", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 6, maleLow: 2.5, maleHigh: 4.5, femaleLow: 2.5, femaleHigh: 4.5 },
    ],
  },
  {
    bundleName: "Serum Electrolytes Panel (4 Analytes)",
    targetTestCode: "ELECTROLYTES",
    description: "Ion-selective electrode panel: Sodium, Potassium, Chloride, Bicarbonate.",
    icon: "⚡",
    color: "#F59E0B",
    analytes: [
      { parameterName: "Serum Sodium (Na+)", shortName: "Na+", unit: "mmol/L", dataType: "NUMERIC", displayOrder: 1, maleLow: 136.0, maleHigh: 145.0, femaleLow: 136.0, femaleHigh: 145.0, criticalLow: 120.0, criticalHigh: 160.0, panicLowAlert: "Severe Hyponatremia (Seizure Risk)", panicHighAlert: "Severe Hypernatremia" },
      { parameterName: "Serum Potassium (K+)", shortName: "K+", unit: "mmol/L", dataType: "NUMERIC", displayOrder: 2, maleLow: 3.5, maleHigh: 5.1, femaleLow: 3.5, femaleHigh: 5.1, criticalLow: 2.8, criticalHigh: 6.2, panicLowAlert: "Hypokalemic Ventricular Arrhythmia", panicHighAlert: "Hyperkalemic Cardiac Arrest Risk" },
      { parameterName: "Serum Chloride (Cl-)", shortName: "Cl-", unit: "mmol/L", dataType: "NUMERIC", displayOrder: 3, maleLow: 98.0, maleHigh: 107.0, femaleLow: 98.0, femaleHigh: 107.0, criticalLow: 80.0, criticalHigh: 125.0 },
      { parameterName: "Serum Bicarbonate (HCO3-)", shortName: "HCO3-", unit: "mmol/L", dataType: "NUMERIC", displayOrder: 4, maleLow: 22.0, maleHigh: 29.0, femaleLow: 22.0, femaleHigh: 29.0, criticalLow: 10.0, criticalHigh: 40.0, panicLowAlert: "Severe Metabolic Acidosis" },
    ],
  },
];

export default function TestParametersPage() {
  const [parameters, setParameters] = useState<TestParameter[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "matrix" | "grouped">("table");
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  // Modals & Drawer
  const [showModal, setShowModal] = useState(false);
  const [editingParam, setEditingParam] = useState<TestParameter | null>(null);
  const [inspectingParam, setInspectingParam] = useState<TestParameter | null>(null);
  const [saving, setSaving] = useState(false);
  const [importingBundle, setImportingBundle] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    testId: "",
    parameterName: "",
    shortName: "",
    loincCode: "",
    unit: "mg/dL",
    dataType: "NUMERIC",
    measurementMethod: "",
    dropdownOptions: "",
    decimalPrecision: 1,
    displayOrder: 1,
    deltaCheckPercentage: 25,
    isRequired: true,
    isActive: true,
    maleLow: 0,
    maleHigh: 100,
    femaleLow: 0,
    femaleHigh: 100,
    criticalLow: undefined as number | undefined,
    criticalHigh: undefined as number | undefined,
    panicLowAlert: "",
    panicHighAlert: "",
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
      loincCode: "",
      unit: "mg/dL",
      dataType: "NUMERIC",
      measurementMethod: "",
      dropdownOptions: "",
      decimalPrecision: 1,
      displayOrder: parameters.length + 1,
      deltaCheckPercentage: 25,
      isRequired: true,
      isActive: true,
      maleLow: 0,
      maleHigh: 100,
      femaleLow: 0,
      femaleHigh: 100,
      criticalLow: undefined,
      criticalHigh: undefined,
      panicLowAlert: "",
      panicHighAlert: "",
    });
    setShowModal(true);
  };

  const handleEditParameter = (param: TestParameter) => {
    setEditingParam(param);
    setFormData({
      testId: param.test?.id || param.testId || "",
      parameterName: param.parameterName,
      shortName: param.shortName || "",
      loincCode: param.loincCode || "",
      unit: param.unit || "",
      dataType: param.dataType || "NUMERIC",
      measurementMethod: param.measurementMethod || "",
      dropdownOptions: param.dropdownOptions || "",
      decimalPrecision: param.decimalPrecision ?? 1,
      displayOrder: param.displayOrder || 1,
      deltaCheckPercentage: param.deltaCheckPercentage ?? 25,
      isRequired: param.isRequired !== false,
      isActive: param.isActive !== false,
      maleLow: param.maleLow ?? 0,
      maleHigh: param.maleHigh ?? 100,
      femaleLow: param.femaleLow ?? 0,
      femaleHigh: param.femaleHigh ?? 100,
      criticalLow: param.criticalLow,
      criticalHigh: param.criticalHigh,
      panicLowAlert: param.panicLowAlert || "",
      panicHighAlert: param.panicHighAlert || "",
    });
    setShowModal(true);
  };

  const handleDeleteParameter = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete analyte parameter "${name}"?`)) return;

    try {
      await testApi.deleteParameter(id);
      showNotification(`Parameter "${name}" deleted`);
      setParameters(parameters.filter((p) => p.id !== id));
      if (inspectingParam?.id === id) setInspectingParam(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete parameter");
    }
  };

  const handleSaveParameter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.testId) {
      alert("Please select a target parent investigation for this analyte parameter");
      return;
    }
    setSaving(true);

    try {
      if (editingParam) {
        await testApi.updateParameter(editingParam.id, formData);
        showNotification(`Analyte "${formData.parameterName}" updated successfully!`);
      } else {
        const res = await testApi.addParameter(formData.testId, formData);
        if (res?.success && res.data?.id && (formData.maleLow !== undefined || formData.femaleLow !== undefined)) {
          // Add male/female reference ranges if supported
          const paramId = res.data.id;
          await testApi.addReferenceRange(paramId, {
            gender: "MALE",
            ageGroup: "ADULT",
            normalLow: formData.maleLow,
            normalHigh: formData.maleHigh,
            criticalLow: formData.criticalLow,
            criticalHigh: formData.criticalHigh,
            isActive: true,
          }).catch(() => {});
        }
        showNotification(`Analyte "${formData.parameterName}" registered successfully!`);
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save parameter");
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Import Multi-Analyte Bundle
  const handleImportBundle = async (bundle: MultiAnalyteBundle) => {
    // Find or prompt target test
    let targetTest = tests.find(
      (t) =>
        t.testCode?.toUpperCase() === bundle.targetTestCode.toUpperCase() ||
        t.testName?.toLowerCase().includes(bundle.targetTestCode.toLowerCase())
    );

    const targetTestId = targetTest?.id || (selectedTest ? selectedTest : tests[0]?.id);

    if (!targetTestId) {
      alert(`Please create an investigation with code "${bundle.targetTestCode}" first or select an investigation.`);
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
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/90 px-5 py-3 text-xs font-black text-emerald-300 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Master Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
              <Sliders className="h-3.5 w-3.5" />
              <span>Diagnostic Taxonomy / Analyte Parameters Master</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Pathology Analyte Parameters & Biological Bounds</span>
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Manage discrete analytes, LOINC codes, reference intervals, critical panic triggers, and delta-check variance %
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4.5 py-2.5 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              <span>Add Analyte Parameter</span>
            </button>
          </div>
        </div>

        {/* Clinical KPI Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Total Analytes</span>
              <Sliders className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalAnalytes}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Configured parameters</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Mapped Investigations</span>
              <FlaskConical className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400">{uniqueTestsCount}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Parent test profiles</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Critical Panic Alarms</span>
              <BellRing className="h-4 w-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">{criticalCount}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Panic triggers active</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>NABL Delta-Check</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">48h Window</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Automatic delta verification</div>
          </div>
        </div>

        {/* 1-Click Multi-Analyte Quick Bundles Importer Bar */}
        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/70 via-indigo-950/40 to-slate-950/90 p-4.5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-blue-200">
                1-Click Standard Multi-Analyte Panels Importer
              </span>
            </div>
            <span className="text-[11px] font-semibold text-blue-300">
              Auto-inject standardized hospital reference intervals & critical bounds
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STANDARD_ANALYTE_BUNDLES.map((bundle) => (
              <button
                type="button"
                key={bundle.bundleName}
                onClick={() => handleImportBundle(bundle)}
                disabled={importingBundle}
                className="group flex flex-col text-left rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 hover:border-blue-500/60 hover:bg-slate-900 transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{bundle.icon}</span>
                  <span className="text-[10px] font-mono font-black text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/60">
                    {bundle.targetTestCode}
                  </span>
                </div>
                <div className="text-xs font-black text-white group-hover:text-blue-300 transition">
                  {bundle.bundleName}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {bundle.description}
                </div>
                <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-blue-400 group-hover:translate-x-0.5 transition">
                  <span>+ Import {bundle.analytes.length} Analytes</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filter & View Switcher Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by analyte name, unit, code, or LOINC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full sm:w-60 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white focus:border-blue-500"
            >
              <option value="">All Investigations ({tests.length})</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900">
                  {t.testCode || t.code} - {t.testName || t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            <button
              type="button"
              onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                filterCriticalOnly
                  ? "bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-md shadow-rose-500/10"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              <BellRing className="h-3.5 w-3.5 text-rose-400" />
              <span>Panic Values Only</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === "table" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === "matrix" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Interval Gauges
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grouped")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === "grouped" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Grouped View
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-950/60 border border-rose-500/40 p-4 text-xs font-bold text-rose-300">
            {error}
          </div>
        )}

        {/* MAIN DISPLAY: TABLE VIEW / GAUGES / GROUPED */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent mx-auto" />
            <div className="text-xs font-bold text-slate-400">Loading Analyte Parameters Matrix...</div>
          </div>
        ) : filteredParameters.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <Sliders className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-black text-white">No analyte parameters found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Configure analyte parameters for pathology investigations or auto-import standard multi-analyte bundles above.
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/25"
            >
              + Add First Analyte
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
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
                <tbody className="divide-y divide-slate-800/60 text-xs font-medium text-slate-300">
                  {filteredParameters.map((param) => {
                    const hasCritical = param.criticalLow !== undefined || param.criticalHigh !== undefined;

                    return (
                      <tr
                        key={param.id}
                        onClick={() => setInspectingParam(param)}
                        className="hover:bg-slate-800/40 cursor-pointer transition"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{param.parameterName}</span>
                            {param.shortName && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                                {param.shortName}
                              </span>
                            )}
                          </div>
                          {param.loincCode && (
                            <span className="text-[10px] font-mono text-slate-500">
                              LOINC: {param.loincCode}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-200">
                            {param.test?.testName || "—"}
                          </span>
                          {param.test?.testCode && (
                            <span className="block text-[10px] font-mono text-slate-500">
                              [{param.test.testCode}]
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                            {param.unit || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5 text-[11px]">
                            {param.maleLow !== undefined && param.maleHigh !== undefined ? (
                              <div className="text-slate-300">
                                <span className="text-blue-400 font-bold">M: </span>
                                <span>{param.maleLow} - {param.maleHigh} {param.unit}</span>
                              </div>
                            ) : null}
                            {param.femaleLow !== undefined && param.femaleHigh !== undefined ? (
                              <div className="text-slate-300">
                                <span className="text-pink-400 font-bold">F: </span>
                                <span>{param.femaleLow} - {param.femaleHigh} {param.unit}</span>
                              </div>
                            ) : null}
                            {!param.maleLow && !param.femaleLow && (
                              <span className="text-slate-500">Standard range defined in report</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          {hasCritical ? (
                            <div className="space-y-0.5">
                              {param.criticalLow !== undefined && (
                                <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/40 mr-1">
                                  <span>&lt; {param.criticalLow}</span>
                                </span>
                              )}
                              {param.criticalHigh !== undefined && (
                                <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/40">
                                  <span>&gt; {param.criticalHigh}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">None</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          ±{param.deltaCheckPercentage ?? 25}%
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black ${
                            param.isRequired
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {param.isRequired ? "REQUIRED" : "OPTIONAL"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditParameter(param)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                              title="Edit Parameter"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParameter(param.id, param.parameterName)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition"
                              title="Delete Parameter"
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
          /* INTERVAL GAUGES MATRIX */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParameters.map((param) => {
              const maleLow = param.maleLow ?? 0;
              const maleHigh = param.maleHigh ?? 100;
              const hasCritical = param.criticalLow !== undefined || param.criticalHigh !== undefined;

              return (
                <div
                  key={param.id}
                  onClick={() => setInspectingParam(param)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4.5 backdrop-blur-xl hover:border-slate-700 hover:shadow-xl transition cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white leading-tight">
                          {param.parameterName}
                        </h3>
                        {param.shortName && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-blue-300">
                            {param.shortName}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {param.test?.testName || "Parent Test"}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/50">
                      {param.unit}
                    </span>
                  </div>

                  {/* Biological Reference Gauge Bar */}
                  <div className="space-y-1.5 rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Crit Low: {param.criticalLow ?? "—"}</span>
                      <span className="text-emerald-400">Normal: {maleLow} - {maleHigh}</span>
                      <span>Crit High: {param.criticalHigh ?? "—"}</span>
                    </div>

                    {/* Gradient Gauge Line */}
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                      <div className="w-1/4 bg-rose-500/80" title="Critical Low Zone" />
                      <div className="w-1/2 bg-emerald-500" title="Normal Physiological Interval" />
                      <div className="w-1/4 bg-rose-500/80" title="Critical High Zone" />
                    </div>
                  </div>

                  {hasCritical && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/40">
                      <BellRing className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {param.panicLowAlert || param.panicHighAlert || "Immediate Doctor Panic Alert Configured"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* GROUPED BY PARENT INVESTIGATION */
          <div className="space-y-6">
            {Object.entries(groupedParameters).map(([testId, group]) => (
              <div
                key={testId}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-5 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <FlaskConical className="h-5 w-5 text-blue-400" />
                    <h3 className="text-base font-black text-white">
                      {group.testName}
                    </h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      [{group.testCode}]
                    </span>
                  </div>

                  <span className="text-xs font-bold text-blue-400">
                    {group.params.length} Analyte Parameters
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.params.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setInspectingParam(p)}
                      className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 hover:border-slate-700 transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-black text-white">{p.parameterName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.maleLow !== undefined ? `${p.maleLow} - ${p.maleHigh} ` : ""}{p.unit}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-blue-400 font-bold">
                        #{p.displayOrder}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DRAWER: INSPECT ANALYTE PARAMETER */}
        {inspectingParam && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="h-full w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                    Analyte Dossier
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingParam(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  {inspectingParam.parameterName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-blue-400">{inspectingParam.shortName || "NO_ALIAS"}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{inspectingParam.test?.testName || "Parent Test"}</span>
                </div>
              </div>

              {/* Reference Intervals Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Scale className="h-4 w-4" />
                  <span>Biological Reference Intervals</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Male Adult (18-60y):</span>
                    <span className="font-bold text-white">
                      {inspectingParam.maleLow ?? 0} - {inspectingParam.maleHigh ?? 100} {inspectingParam.unit}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Female Adult (18-60y):</span>
                    <span className="font-bold text-white">
                      {inspectingParam.femaleLow ?? 0} - {inspectingParam.femaleHigh ?? 100} {inspectingParam.unit}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Reporting Unit:</span>
                    <span className="font-mono font-bold text-blue-400">{inspectingParam.unit}</span>
                  </div>
                </div>
              </div>

              {/* Critical Panic Thresholds */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <BellRing className="h-4 w-4" />
                  <span>Critical Panic Alert Alarm Limits</span>
                </h3>
                <div className="text-xs space-y-1.5 text-slate-300">
                  {inspectingParam.criticalLow !== undefined && (
                    <div>
                      <span className="text-rose-400 font-bold">Panic Low: </span>
                      <span>&lt; {inspectingParam.criticalLow} {inspectingParam.unit}</span>
                    </div>
                  )}
                  {inspectingParam.criticalHigh !== undefined && (
                    <div>
                      <span className="text-rose-400 font-bold">Panic High: </span>
                      <span>&gt; {inspectingParam.criticalHigh} {inspectingParam.unit}</span>
                    </div>
                  )}
                  {!inspectingParam.criticalLow && !inspectingParam.criticalHigh && (
                    <div className="text-slate-500">No panic critical alert limits configured.</div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    handleEditParameter(inspectingParam);
                    setInspectingParam(null);
                  }}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-500 transition text-center shadow-lg shadow-blue-500/20"
                >
                  Edit Analyte
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteParameter(inspectingParam.id, inspectingParam.parameterName);
                  }}
                  className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-900/60"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT PARAMETER */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                    <Sliders className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-white">
                      {editingParam ? "Edit Analyte Parameter" : "Create New Analyte Parameter"}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Configure biological intervals, reporting units, and critical panic alarm bounds
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

              <form onSubmit={handleSaveParameter} className="space-y-4">
                {/* Parent Test */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                    Parent Diagnostic Investigation <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.testId}
                    onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500"
                  >
                    <option value="">Select Investigation</option>
                    {tests.map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900">
                        {t.testCode || t.code} - {t.testName || t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Analyte Parameter Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hemoglobin (Hb), SGPT, Fasting Glucose"
                      value={formData.parameterName}
                      onChange={(e) => setFormData({ ...formData, parameterName: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Short Code / Alias
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hb, SGPT"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Reporting Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500"
                    >
                      {COMMON_UNITS.map((u) => (
                        <option key={u} value={u} className="bg-slate-900">
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Data Type
                    </label>
                    <select
                      value={formData.dataType}
                      onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500"
                    >
                      <option value="NUMERIC" className="bg-slate-900">NUMERIC (Decimal)</option>
                      <option value="TEXT" className="bg-slate-900">TEXT / Observation</option>
                      <option value="DROPDOWN" className="bg-slate-900">DROPDOWN (Positive/Negative)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Delta Check Variance %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.deltaCheckPercentage}
                      onChange={(e) => setFormData({ ...formData, deltaCheckPercentage: parseInt(e.target.value) || 25 })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Biological Reference Bounds */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
                    Adult Biological Reference Bounds ({formData.unit})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-blue-400 mb-1">Male Low</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.maleLow}
                        onChange={(e) => setFormData({ ...formData, maleLow: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-400 mb-1">Male High</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.maleHigh}
                        onChange={(e) => setFormData({ ...formData, maleHigh: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-pink-400 mb-1">Female Low</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.femaleLow}
                        onChange={(e) => setFormData({ ...formData, femaleLow: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-pink-400 mb-1">Female High</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.femaleHigh}
                        onChange={(e) => setFormData({ ...formData, femaleHigh: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Critical Panic Triggers */}
                <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-400 block">
                    Critical Panic Alert Alarms (Immediate Pathologist Callout)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-rose-300 mb-1">
                        Critical Panic Low Value
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 7.0 for Severe Anemia"
                        value={formData.criticalLow ?? ""}
                        onChange={(e) => setFormData({ ...formData, criticalLow: parseFloat(e.target.value) || undefined })}
                        className="w-full rounded-xl border border-rose-500/30 bg-slate-900 px-3 py-2 text-xs font-bold text-rose-300 placeholder-rose-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-rose-300 mb-1">
                        Critical Panic High Value
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 20.0 or 500 for ALT"
                        value={formData.criticalHigh ?? ""}
                        onChange={(e) => setFormData({ ...formData, criticalHigh: parseFloat(e.target.value) || undefined })}
                        className="w-full rounded-xl border border-rose-500/30 bg-slate-900 px-3 py-2 text-xs font-bold text-rose-300 placeholder-rose-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 disabled:opacity-50"
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