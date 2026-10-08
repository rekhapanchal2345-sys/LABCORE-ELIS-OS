"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { testApi } from "@/lib/api";
import { SampleType, TestFormData, TestCategory } from "@/types";
import {
  FlaskConical,
  Zap,
  Tag,
  TestTube2,
  DollarSign,
  Clock3,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Percent,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  Info,
  Sliders,
  Plus,
  Trash2,
  Eye,
  Barcode,
  Layers,
  HeartPulse,
  Scale,
  Thermometer,
  Printer,
  ChevronRight,
  ArrowRight,
  HelpCircle
} from "lucide-react";

interface SubParameterDef {
  parameterName: string;
  shortName: string;
  unit: string;
  dataType: string;
  displayOrder: number;
  isRequired: boolean;
  maleLow?: number;
  maleHigh?: number;
  femaleLow?: number;
  femaleHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
}

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
  clinicalSignificance: string;
  description: string;
  parameters: SubParameterDef[];
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
    clinicalSignificance: "Evaluates hematological balance, anemia, infections, leukemia, and platelet disorders.",
    description: "Evaluates cellular components of blood including RBC, WBC, Platelet indices and 5-part differential.",
    parameters: [
      { parameterName: "Hemoglobin (Hb)", shortName: "Hb", unit: "g/dL", dataType: "NUMERIC", displayOrder: 1, isRequired: true, maleLow: 13.5, maleHigh: 17.5, femaleLow: 12.0, femaleHigh: 15.5, criticalLow: 7.0, criticalHigh: 20.0 },
      { parameterName: "Total Leukocyte Count (WBC)", shortName: "TLC / WBC", unit: "10^3/µL", dataType: "NUMERIC", displayOrder: 2, isRequired: true, maleLow: 4.0, maleHigh: 11.0, femaleLow: 4.0, femaleHigh: 11.0, criticalLow: 2.0, criticalHigh: 30.0 },
      { parameterName: "Total RBC Count", shortName: "RBC", unit: "10^6/µL", dataType: "NUMERIC", displayOrder: 3, isRequired: true, maleLow: 4.5, maleHigh: 5.9, femaleLow: 4.0, femaleHigh: 5.2 },
      { parameterName: "Platelet Count", shortName: "PLT", unit: "10^3/µL", dataType: "NUMERIC", displayOrder: 4, isRequired: true, maleLow: 150, maleHigh: 450, femaleLow: 150, femaleHigh: 450, criticalLow: 50, criticalHigh: 1000 },
      { parameterName: "Packed Cell Volume (PCV / Hematocrit)", shortName: "PCV", unit: "%", dataType: "NUMERIC", displayOrder: 5, isRequired: false, maleLow: 40, maleHigh: 50, femaleLow: 36, femaleHigh: 46 },
      { parameterName: "Mean Corpuscular Volume (MCV)", shortName: "MCV", unit: "fL", dataType: "NUMERIC", displayOrder: 6, isRequired: false, maleLow: 80, maleHigh: 100, femaleLow: 80, femaleHigh: 100 },
    ],
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
    clinicalSignificance: "Cardiovascular risk stratification, dyslipidemia, and atherosclerosis screening.",
    description: "Assesses cardiovascular risk: Total Cholesterol, HDL, LDL, VLDL, and Triglycerides.",
    parameters: [
      { parameterName: "Total Cholesterol", shortName: "CHOL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 1, isRequired: true, maleLow: 125, maleHigh: 200, femaleLow: 125, femaleHigh: 200, criticalHigh: 300 },
      { parameterName: "Triglycerides", shortName: "TRIG", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 2, isRequired: true, maleLow: 50, maleHigh: 150, femaleLow: 50, femaleHigh: 150, criticalHigh: 500 },
      { parameterName: "HDL Direct (Good Cholesterol)", shortName: "HDL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 3, isRequired: true, maleLow: 40, maleHigh: 60, femaleLow: 50, femaleHigh: 70 },
      { parameterName: "LDL Calculated (Bad Cholesterol)", shortName: "LDL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 4, isRequired: true, maleLow: 60, maleHigh: 100, femaleLow: 60, femaleHigh: 100, criticalHigh: 190 },
      { parameterName: "VLDL Cholesterol", shortName: "VLDL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 5, isRequired: false, maleLow: 5, maleHigh: 30, femaleLow: 5, femaleHigh: 30 },
      { parameterName: "Cholesterol / HDL Ratio", shortName: "CHOL/HDL", unit: "Ratio", dataType: "NUMERIC", displayOrder: 6, isRequired: false, maleLow: 3.0, maleHigh: 5.0, femaleLow: 3.0, femaleHigh: 4.5 },
    ],
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
    clinicalSignificance: "Primary screening and diagnostic biomarker for diabetes mellitus and impaired fasting glucose.",
    description: "Primary screening test for diabetes mellitus and glycemic homeostasis.",
    parameters: [
      { parameterName: "Fasting Blood Glucose", shortName: "FBS", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 1, isRequired: true, maleLow: 70, maleHigh: 99, femaleLow: 70, femaleHigh: 99, criticalLow: 45, criticalHigh: 400 },
    ],
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
    clinicalSignificance: "Reflects mean glycemic control over preceding 90-120 days. Gold standard for diabetes monitoring.",
    description: "Reflects average blood glucose control over the preceding 2 to 3 months.",
    parameters: [
      { parameterName: "HbA1c (Glycated Hemoglobin)", shortName: "HbA1c", unit: "%", dataType: "NUMERIC", displayOrder: 1, isRequired: true, maleLow: 4.0, maleHigh: 5.6, femaleLow: 4.0, femaleHigh: 5.6, criticalHigh: 10.0 },
      { parameterName: "Estimated Average Glucose (eAG)", shortName: "eAG", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 2, isRequired: false, maleLow: 70, maleHigh: 115, femaleLow: 70, femaleHigh: 115 },
    ],
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
    clinicalSignificance: "Evaluates hepatic synthetic function, hepatocellular injury, cholestasis, and biliary clearance.",
    description: "Bilirubin (Total/Direct/Indirect), SGOT, SGPT, Alkaline Phosphatase, Total Protein, Albumin/Globulin.",
    parameters: [
      { parameterName: "Bilirubin Total", shortName: "TBIL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 1, isRequired: true, maleLow: 0.2, maleHigh: 1.2, femaleLow: 0.2, femaleHigh: 1.2, criticalHigh: 15.0 },
      { parameterName: "Bilirubin Direct", shortName: "DBIL", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 2, isRequired: true, maleLow: 0.0, maleHigh: 0.3, femaleLow: 0.0, femaleHigh: 0.3 },
      { parameterName: "SGOT / AST", shortName: "SGOT", unit: "U/L", dataType: "NUMERIC", displayOrder: 3, isRequired: true, maleLow: 5, maleHigh: 40, femaleLow: 5, femaleHigh: 35, criticalHigh: 500 },
      { parameterName: "SGPT / ALT", shortName: "SGPT", unit: "U/L", dataType: "NUMERIC", displayOrder: 4, isRequired: true, maleLow: 5, maleHigh: 45, femaleLow: 5, femaleHigh: 35, criticalHigh: 500 },
      { parameterName: "Alkaline Phosphatase (ALP)", shortName: "ALP", unit: "U/L", dataType: "NUMERIC", displayOrder: 5, isRequired: true, maleLow: 44, maleHigh: 147, femaleLow: 44, femaleHigh: 147 },
      { parameterName: "Total Protein", shortName: "TP", unit: "g/dL", dataType: "NUMERIC", displayOrder: 6, isRequired: true, maleLow: 6.0, maleHigh: 8.3, femaleLow: 6.0, femaleHigh: 8.3 },
      { parameterName: "Serum Albumin", shortName: "ALB", unit: "g/dL", dataType: "NUMERIC", displayOrder: 7, isRequired: true, maleLow: 3.5, maleHigh: 5.2, femaleLow: 3.5, femaleHigh: 5.2 },
    ],
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
    clinicalSignificance: "Assesses glomerular filtration, renal clearance, electrolyte status, and metabolic waste excretion.",
    description: "Blood Urea, BUN, Serum Creatinine, Uric Acid, Calcium, and Phosphorus.",
    parameters: [
      { parameterName: "Blood Urea", shortName: "UREA", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 1, isRequired: true, maleLow: 15, maleHigh: 45, femaleLow: 15, femaleHigh: 45, criticalHigh: 100 },
      { parameterName: "Serum Creatinine", shortName: "CREAT", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 2, isRequired: true, maleLow: 0.7, maleHigh: 1.3, femaleLow: 0.5, femaleHigh: 1.1, criticalHigh: 4.0 },
      { parameterName: "Blood Urea Nitrogen (BUN)", shortName: "BUN", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 3, isRequired: false, maleLow: 7, maleHigh: 20, femaleLow: 7, femaleHigh: 20 },
      { parameterName: "Uric Acid", shortName: "UA", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 4, isRequired: true, maleLow: 3.5, maleHigh: 7.2, femaleLow: 2.6, femaleHigh: 6.0 },
      { parameterName: "Serum Calcium", shortName: "CA", unit: "mg/dL", dataType: "NUMERIC", displayOrder: 5, isRequired: false, maleLow: 8.8, maleHigh: 10.2, femaleLow: 8.8, femaleHigh: 10.2, criticalLow: 6.5, criticalHigh: 13.0 },
    ],
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
    clinicalSignificance: "Ultra-sensitive first-line test for primary hypothyroidism, hyperthyroidism, and anterior pituitary-thyroid axis.",
    description: "Sensitive first-line test for thyroid dysfunction (hypothyroidism and hyperthyroidism).",
    parameters: [
      { parameterName: "TSH (Thyroid Stimulating Hormone)", shortName: "TSH", unit: "µIU/mL", dataType: "NUMERIC", displayOrder: 1, isRequired: true, maleLow: 0.35, maleHigh: 4.94, femaleLow: 0.35, femaleHigh: 4.94, criticalLow: 0.05, criticalHigh: 20.0 },
    ],
  },
];

const TUBE_OPTIONS = [
  { label: "EDTA Purple", container: "EDTA vial (purple)", sampleType: "BLOOD", color: "#A855F7", bgHex: "#581c87", border: "border-purple-500", desc: "Whole Blood / Hematology" },
  { label: "SST Gold / Yellow", container: "SST Gel (gold/yellow)", sampleType: "SERUM", color: "#F59E0B", bgHex: "#78350f", border: "border-amber-500", desc: "Serum / Clot Gel" },
  { label: "Fluoride Grey", container: "Fluoride Oxalate (grey)", sampleType: "PLASMA", color: "#94A3B8", bgHex: "#334155", border: "border-slate-400", desc: "Glucose / Glycolysis Inhibitor" },
  { label: "Plain Red", container: "Plain vial (red top)", sampleType: "SERUM", color: "#EF4444", bgHex: "#7f1d1d", border: "border-rose-500", desc: "Clot Activator / Serology" },
  { label: "Citrate Blue", container: "Sodium Citrate (light blue)", sampleType: "PLASMA", color: "#38BDF8", bgHex: "#0369a1", border: "border-sky-400", desc: "Coagulation / 1:9 Ratio" },
  { label: "Heparin Green", container: "Lithium Heparin (green)", sampleType: "PLASMA", color: "#22C55E", bgHex: "#065f46", border: "border-emerald-500", desc: "STAT Clinical Chemistry" },
  { label: "Sterile Cup", container: "Sterile Universal Container", sampleType: "URINE", color: "#EAB308", bgHex: "#713f12", border: "border-yellow-500", desc: "Urine / Body Fluid" },
];

const COMMON_UNITS = [
  "g/dL", "mg/dL", "10^3/µL", "10^6/µL", "%", "U/L", "fL", "pg", "mmol/L", "µmol/L", "ng/mL", "µIU/mL", "mm/hr", "Ratio", "Index", "mg/L"
];

export default function NewTestPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [activeTab, setActiveTab] = useState<"general" | "specimen" | "parameters" | "pricing" | "preview">("general");

  // Form State
  const [formData, setFormData] = useState<TestFormData>({
    testCode: "",
    testName: "",
    shortName: "",
    categoryId: "",
    sampleType: "BLOOD",
    sampleContainer: "EDTA vial (purple)",
    sampleVolume: "2.0 mL",
    processingDepartment: "Central Hematology",
    method: "Automated Flow Cytometry",
    description: "",
    clinicalSignificance: "",
    patientPreparation: "No special fasting required. Hydration recommended.",
    price: 500,
    offerPrice: 350,
    b2bRate: 200,
    gstPercentage: 0,
    tatHours: 12,
    tatDisplay: "Same Day (8-12 hours)",
    displayOrder: 0,
    isActive: true,
  });

  // Additional Clinical Metadata
  const [isNablAccredited, setIsNablAccredited] = useState(true);
  const [isStatEligible, setIsStatEligible] = useState(true);
  const [storageTemp, setStorageTemp] = useState<"2-8C" | "ROOM_TEMP" | "-20C">("2-8C");
  const [inversionsCount, setInversionsCount] = useState("8 - 10 Inversions");

  // Sub-Parameters List
  const [parameters, setParameters] = useState<SubParameterDef[]>([
    {
      parameterName: "Hemoglobin (Hb)",
      shortName: "Hb",
      unit: "g/dL",
      dataType: "NUMERIC",
      displayOrder: 1,
      isRequired: true,
      maleLow: 13.5,
      maleHigh: 17.5,
      femaleLow: 12.0,
      femaleHigh: 15.5,
      criticalLow: 7.0,
      criticalHigh: 20.0,
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState("");
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
      clinicalSignificance: preset.clinicalSignificance,
      description: preset.description,
    }));

    if (preset.parameters && preset.parameters.length > 0) {
      setParameters(preset.parameters);
    }

    setSuccessToast(`Applied preset: ${preset.name}`);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  const handleAddParameter = () => {
    setParameters([
      ...parameters,
      {
        parameterName: "",
        shortName: "",
        unit: "mg/dL",
        dataType: "NUMERIC",
        displayOrder: parameters.length + 1,
        isRequired: true,
        maleLow: 0,
        maleHigh: 100,
      }
    ]);
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleParameterChange = (index: number, field: keyof SubParameterDef, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.testCode.trim()) {
      setError("Investigation Code is required (e.g. CBC, KFT, LIPID)");
      setActiveTab("general");
      setLoading(false);
      return;
    }

    if (!formData.testName.trim()) {
      setError("Full Investigation Name is required");
      setActiveTab("general");
      setLoading(false);
      return;
    }

    try {
      const testPayload: any = {
        testCode: formData.testCode.trim().toUpperCase(),
        testName: formData.testName.trim(),
        sampleType: formData.sampleType,
        price: Number(formData.price) || 0,
      };

      if (formData.shortName) testPayload.shortName = formData.shortName.trim();
      if (formData.categoryId) testPayload.categoryId = formData.categoryId;
      if (formData.sampleContainer) testPayload.sampleContainer = formData.sampleContainer;
      if (formData.sampleVolume) testPayload.sampleVolume = formData.sampleVolume;
      if (formData.processingDepartment) testPayload.processingDepartment = formData.processingDepartment;
      if (formData.method) testPayload.method = formData.method;
      if (formData.description) testPayload.description = formData.description;
      if (formData.clinicalSignificance) testPayload.clinicalSignificance = formData.clinicalSignificance;
      if (formData.patientPreparation) testPayload.patientPreparation = formData.patientPreparation;
      if (formData.offerPrice) testPayload.offerPrice = Number(formData.offerPrice);
      if (formData.b2bRate) testPayload.b2bRate = Number(formData.b2bRate);
      if (formData.gstPercentage !== undefined) testPayload.gstPercentage = Number(formData.gstPercentage);
      if (formData.tatHours) testPayload.tatHours = Number(formData.tatHours);
      if (formData.tatDisplay) testPayload.tatDisplay = formData.tatDisplay;
      if (formData.displayOrder) testPayload.displayOrder = Number(formData.displayOrder);
      if (formData.isActive !== undefined) testPayload.isActive = formData.isActive;

      // 1. Create Test Record
      const response = await testApi.create(testPayload);

      if (!response.success || !response.data?.id) {
        throw new Error(response.message || "Failed to register test investigation");
      }

      const createdTestId = response.data.id;

      // 2. Create discrete sub-parameters if defined
      if (parameters.length > 0) {
        for (const p of parameters) {
          if (p.parameterName.trim()) {
            try {
              const paramRes = await testApi.addParameter(createdTestId, {
                parameterName: p.parameterName.trim(),
                shortName: p.shortName || undefined,
                unit: p.unit || "",
                dataType: p.dataType || "NUMERIC",
                displayOrder: p.displayOrder,
                isRequired: p.isRequired,
                isActive: true,
              });

              if (paramRes?.success && paramRes.data?.id && (p.maleLow !== undefined || p.femaleLow !== undefined)) {
                // Add Reference Ranges
                const paramId = paramRes.data.id;
                if (p.maleLow !== undefined && p.maleHigh !== undefined) {
                  await testApi.addReferenceRange(paramId, {
                    gender: "MALE",
                    ageGroup: "ADULT",
                    minAge: 18,
                    maxAge: 100,
                    minAgeUnit: "YEARS",
                    maxAgeUnit: "YEARS",
                    normalLow: Number(p.maleLow),
                    normalHigh: Number(p.maleHigh),
                    criticalLow: p.criticalLow ? Number(p.criticalLow) : undefined,
                    criticalHigh: p.criticalHigh ? Number(p.criticalHigh) : undefined,
                    isActive: true,
                  }).catch(() => {});
                }
                if (p.femaleLow !== undefined && p.femaleHigh !== undefined) {
                  await testApi.addReferenceRange(paramId, {
                    gender: "FEMALE",
                    ageGroup: "ADULT",
                    minAge: 18,
                    maxAge: 100,
                    minAgeUnit: "YEARS",
                    maxAgeUnit: "YEARS",
                    normalLow: Number(p.femaleLow),
                    normalHigh: Number(p.femaleHigh),
                    criticalLow: p.criticalLow ? Number(p.criticalLow) : undefined,
                    criticalHigh: p.criticalHigh ? Number(p.criticalHigh) : undefined,
                    isActive: true,
                  }).catch(() => {});
                }
              }
            } catch (pErr) {
              console.warn("Parameter creation warning:", pErr);
            }
          }
        }
      }

      router.push(`/tests/${createdTestId}`);
    } catch (err) {
      console.error("Error creating test:", err);
      setError(err instanceof Error ? err.message : "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  // Live Financial Calculations
  const baseMRP = Number(formData.price) || 0;
  const offerPrice = Number(formData.offerPrice) || 0;
  const b2bRate = Number(formData.b2bRate) || 0;
  const hasDiscount = offerPrice > 0 && offerPrice < baseMRP;
  const discountPercent = hasDiscount ? Math.round(((baseMRP - offerPrice) / baseMRP) * 100) : 0;
  const savings = hasDiscount ? baseMRP - offerPrice : 0;
  const referralMargin = b2bRate > 0 && offerPrice > b2bRate ? offerPrice - b2bRate : 0;
  const referralMarginPercent = b2bRate > 0 && offerPrice > b2bRate ? Math.round((referralMargin / offerPrice) * 100) : 0;

  const currentTube = TUBE_OPTIONS.find((t) => t.container === formData.sampleContainer) || TUBE_OPTIONS[0];

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "PATHOLOGIST"]}>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Header Breadcrumb & Actions in Light White UI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <Link
              href="/tests"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition mb-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Diagnostic Directory / Master Investigations</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-xs">
                <FlaskConical className="h-6 w-6" />
              </span>
              <span>New Diagnostic Investigation Studio</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Configure clinical test profiles, vacutainer tubes, multi-analyte reference ranges, and diagnostic tariff matrices
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNablAccredited(!isNablAccredited)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isNablAccredited
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                  : "bg-slate-100 border-slate-300 text-slate-600"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isNablAccredited ? "NABL ISO 15189 Accredited" : "Non-Accredited"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsStatEligible(!isStatEligible)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isStatEligible
                  ? "bg-amber-50 border-amber-300 text-amber-800 shadow-xs"
                  : "bg-slate-100 border-slate-300 text-slate-600"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>{isStatEligible ? "STAT / ICU Emergency Ready" : "Routine Only"}</span>
            </button>
          </div>
        </div>

        {/* Clinical Quick Presets Bar (Light White Card) */}
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                Fast-Track Clinical Presets (1-Click Auto Configure)
              </span>
            </div>
            <span className="text-[11px] font-semibold text-blue-700">
              Click any panel below to load full parameters &amp; biological intervals
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {CLINICAL_PRESETS.map((p) => (
              <button
                type="button"
                key={p.code}
                onClick={() => applyPreset(p)}
                className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-blue-400 hover:bg-blue-50/70 hover:text-blue-900 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600 group-hover:scale-110 transition" />
                <span>{p.name}</span>
                <span className="rounded-md bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-mono text-blue-700 font-bold">
                  ₹{p.offerPrice}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications & Error alerts */}
        {successToast && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2.5 shadow-xs animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-300 p-4 text-xs font-bold text-rose-800 flex items-center gap-2.5 shadow-xs">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            <div>
              <span className="font-black">Validation Error: </span>
              {error}
            </div>
          </div>
        )}

        {/* Main Workstation Studio Grid (Form on Left 65%, Live Preview on Right 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Steps (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step Navigation Tabs in Clean White Design */}
            <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xs">
              {[
                { id: "general", label: "1. Definition & LOINC", icon: Tag },
                { id: "specimen", label: "2. Vacutainer SOP", icon: TestTube2 },
                { id: "parameters", label: `3. Analytes (${parameters.length})`, icon: Sliders },
                { id: "pricing", label: "4. Tariff Matrix", icon: DollarSign },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs border border-blue-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* TAB 1: GENERAL DEFINITION */}
              {activeTab === "general" && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>Investigation Identification &amp; Clinical Taxonomy</span>
                    </h2>
                    <span className="text-[11px] font-semibold text-slate-500">Step 1 of 4</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Test Code */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Test Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CBC, KFT, TSH"
                        value={formData.testCode}
                        onChange={(e) => setFormData({ ...formData, testCode: e.target.value.toUpperCase() })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-mono font-black uppercase text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Barcode scan &amp; analyzer identifier</span>
                    </div>

                    {/* Test Name */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Full Investigation Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Complete Blood Count with 5-Part Differential"
                        value={formData.testName}
                        onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {/* Short Name */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Short Name / Alias
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CBC / Hemogram"
                        value={formData.shortName || ""}
                        onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Department / Discipline
                      </label>
                      <select
                        value={formData.categoryId || ""}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="">Select Lab Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.department ? `(${c.department})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Processing Section */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Processing Lab Section
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Central Automated Hematology"
                        value={formData.processingDepartment || ""}
                        onChange={(e) => setFormData({ ...formData, processingDepartment: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Analytical Methodology
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Automated Flow Cytometry, HPLC, CLIA, Enzymatic"
                        value={formData.method || ""}
                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Display Order Sequence
                      </label>
                      <input
                        type="number"
                        value={formData.displayOrder ?? 0}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Clinical Significance &amp; Pathological Indications
                    </label>
                    <textarea
                      rows={3}
                      value={formData.clinicalSignificance || ""}
                      onChange={(e) => setFormData({ ...formData, clinicalSignificance: e.target.value })}
                      placeholder="Medical relevance, diagnosis value, differential diagnostic considerations..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("specimen")}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                      <span>Proceed to Vacutainer Tube SOP</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SPECIMEN & VACUTAINER SOP */}
              {activeTab === "specimen" && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-2">
                      <TestTube2 className="h-4 w-4" />
                      <span>Vacutainer Specimen Collection &amp; Cold-Chain Stability</span>
                    </h2>
                    <span className="text-[11px] font-semibold text-slate-500">Step 2 of 4</span>
                  </div>

                  {/* Vacutainer Tube Picker */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Standard CLSI Vacutainer Cap Picker (Click to Select):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
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
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? `border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs scale-[1.02]`
                                : `border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300`
                            }`}
                          >
                            <span
                              className="h-5 w-5 rounded-full shadow-xs mb-2 border border-slate-300"
                              style={{ backgroundColor: tube.color }}
                            />
                            <span className="text-[11px] font-bold text-slate-900 text-center leading-tight">
                              {tube.label}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-500 mt-1 uppercase">
                              {tube.sampleType}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* Sample Matrix */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Specimen Matrix Type
                      </label>
                      <select
                        value={formData.sampleType}
                        onChange={(e) => setFormData({ ...formData, sampleType: e.target.value as SampleType })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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

                    {/* Minimum Sample Volume */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Minimum Volume
                      </label>
                      <input
                        type="text"
                        value={formData.sampleVolume || ""}
                        onChange={(e) => setFormData({ ...formData, sampleVolume: e.target.value })}
                        placeholder="e.g. 2.0 mL"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {/* Storage Temperature */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Cold-Chain Storage Temp
                      </label>
                      <select
                        value={storageTemp}
                        onChange={(e) => setStorageTemp(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="2-8C">Refrigerated (2°C - 8°C)</option>
                        <option value="ROOM_TEMP">Room Temperature (18°C - 25°C)</option>
                        <option value="-20C">Deep Freeze (-20°C)</option>
                      </select>
                    </div>
                  </div>

                  {/* Fasting SOP Chips */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                        Patient Preparation &amp; Fasting Guidelines
                      </label>
                      <span className="text-[10px] text-slate-500">Click a chip to quick-fill:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {[
                        "10-12 hours overnight fasting required. Water permitted.",
                        "8-10 hours fasting. No tea/coffee in morning.",
                        "Post-prandial: exactly 2 hours after meal.",
                        "Early morning first void midstream urine.",
                        "No special fasting required. Hydration recommended.",
                      ].map((chip) => (
                        <button
                          type="button"
                          key={chip}
                          onClick={() => setFormData({ ...formData, patientPreparation: chip })}
                          className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition active:scale-95 cursor-pointer"
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("general")}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("parameters")}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                      <span>Proceed to Analytes ({parameters.length})</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: ANALYTE SUB-PARAMETERS */}
              {activeTab === "parameters" && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-2">
                        <Sliders className="h-4 w-4" />
                        <span>Discrete Analyte Parameters &amp; Biological Reference Intervals</span>
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Define parameters with normal low/high bounds and panic critical value triggers
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddParameter}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Parameter</span>
                    </button>
                  </div>

                  {parameters.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
                      <Sliders className="h-8 w-8 text-slate-400 mx-auto" />
                      <div className="text-xs font-bold text-slate-500">
                        No sub-parameters added. The investigation will be reported as a single summary result.
                      </div>
                      <button
                        type="button"
                        onClick={handleAddParameter}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-blue-600 hover:bg-slate-50 cursor-pointer shadow-xs"
                      >
                        + Add First Parameter
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {parameters.map((param, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 transition hover:border-slate-300"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-900">
                              <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                {index + 1}
                              </span>
                              <span>Parameter #{index + 1}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveParameter(index)}
                              className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                              title="Delete Parameter"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Parameter Name *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Hemoglobin, SGPT, Creatinine"
                                value={param.parameterName}
                                onChange={(e) => handleParameterChange(index, "parameterName", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Reporting Unit
                              </label>
                              <select
                                value={param.unit}
                                onChange={(e) => handleParameterChange(index, "unit", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                              >
                                {COMMON_UNITS.map((u) => (
                                  <option key={u} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Reference Bounds */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-wider text-blue-700 mb-1">
                                Male Normal Low
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={param.maleLow ?? ""}
                                onChange={(e) => handleParameterChange(index, "maleLow", parseFloat(e.target.value) || 0)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-wider text-blue-700 mb-1">
                                Male Normal High
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={param.maleHigh ?? ""}
                                onChange={(e) => handleParameterChange(index, "maleHigh", parseFloat(e.target.value) || 0)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-wider text-pink-700 mb-1">
                                Female Normal Low
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={param.femaleLow ?? ""}
                                onChange={(e) => handleParameterChange(index, "femaleLow", parseFloat(e.target.value) || 0)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-wider text-pink-700 mb-1">
                                Female Normal High
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={param.femaleHigh ?? ""}
                                onChange={(e) => handleParameterChange(index, "femaleHigh", parseFloat(e.target.value) || 0)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                              />
                            </div>
                          </div>

                          {/* Critical Panic Thresholds */}
                          <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-200">
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-wider text-rose-700 mb-1">
                                Critical Panic Low (Alert Trigger)
                              </label>
                              <input
                                type="number"
                                step="any"
                                placeholder="e.g. 7.0 (Immediate doctor alert)"
                                value={param.criticalLow ?? ""}
                                onChange={(e) => handleParameterChange(index, "criticalLow", parseFloat(e.target.value) || undefined)}
                                className="w-full rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-900 placeholder-rose-400"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase tracking-wider text-rose-700 mb-1">
                                Critical Panic High (Alert Trigger)
                              </label>
                              <input
                                type="number"
                                step="any"
                                placeholder="e.g. 20.0"
                                value={param.criticalHigh ?? ""}
                                onChange={(e) => handleParameterChange(index, "criticalHigh", parseFloat(e.target.value) || undefined)}
                                className="w-full rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-900 placeholder-rose-400"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("specimen")}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("pricing")}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                      <span>Proceed to Tariff &amp; Commercials</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: TARIFF & COMMERCIALS */}
              {activeTab === "pricing" && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Diagnostic Tariffs, Doctor Margins &amp; Turnaround SLA</span>
                    </h2>
                    <span className="text-[11px] font-semibold text-slate-500">Step 4 of 4</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* MRP */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Patient MRP (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-base font-black text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Standard walk-in retail rate</span>
                    </div>

                    {/* Offer Price */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Special Offer Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.offerPrice || ""}
                        onChange={(e) => setFormData({ ...formData, offerPrice: parseFloat(e.target.value) || 0 })}
                        placeholder="Discounted rate"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-base font-black text-emerald-700 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Direct patient discounted rate</span>
                    </div>

                    {/* B2B Rate */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        B2B / Referral Net (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.b2bRate || ""}
                        onChange={(e) => setFormData({ ...formData, b2bRate: parseFloat(e.target.value) || 0 })}
                        placeholder="Transfer rate"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-base font-black text-indigo-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Net rate billed to clinic partner</span>
                    </div>

                    {/* GST % */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        GST / Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="28"
                        value={formData.gstPercentage ?? 0}
                        onChange={(e) => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Exempted in clinical diagnostics</span>
                    </div>
                  </div>

                  {/* Live Financial Margin Matrix Card */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4.5 shadow-xs">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span>Live Commercial Margin Realization Matrix</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block font-semibold">Patient Pay Amount:</span>
                        <span className="text-xl font-black text-slate-900 mt-1 block">
                          ₹{(hasDiscount ? offerPrice : baseMRP).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block font-semibold">Patient Benefit / Discount:</span>
                        <span className="text-xl font-black text-emerald-600 mt-1 block">
                          {hasDiscount ? `${discountPercent}% (Save ₹${savings})` : "Standard MRP"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block font-semibold">Referring Doctor Margin:</span>
                        <span className="text-xl font-black text-indigo-700 mt-1 block">
                          {referralMargin > 0 ? `₹${referralMargin} (${referralMarginPercent}%)` : "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block font-semibold">Net Diagnostic Realization:</span>
                        <span className="text-xl font-black text-blue-700 mt-1 block">
                          ₹{(b2bRate > 0 ? b2bRate : hasDiscount ? offerPrice : baseMRP).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Turnaround Time (TAT) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Analytical Turnaround Time (TAT Hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.tatHours ?? 12}
                        onChange={(e) => setFormData({ ...formData, tatHours: parseInt(e.target.value) || 12 })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Receipt SLA Display
                      </label>
                      <input
                        type="text"
                        value={formData.tatDisplay || ""}
                        onChange={(e) => setFormData({ ...formData, tatDisplay: e.target.value })}
                        placeholder="e.g. Same Day (4-6 hours), 24 hours"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Active Switch */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/40"
                    />
                    <label htmlFor="isActive" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Publish Investigation in Diagnostic Catalog (Available immediately for CPOE requisitions &amp; Billing)
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab("parameters")}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                    >
                      ← Back to Analytes
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-7 py-3 text-xs font-bold text-white transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Registering Investigation &amp; Analytes...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Register &amp; Publish Investigation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Live Smart Clinical Preview Card (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="sticky top-6 space-y-4">
              {/* Card 1: 360° Requisition Card Preview */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>Live CPOE Order Preview</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    {formData.testCode || "CODE"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {formData.testName || "Investigation Name"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{formData.shortName || "Alias"}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs font-semibold text-blue-600">
                      {formData.processingDepartment || "Central Lab"}
                    </span>
                  </div>
                </div>

                {/* Pricing & TAT Pill */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Patient Price</span>
                    <span className="text-base font-black text-slate-900">
                      ₹{hasDiscount ? offerPrice : baseMRP}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] text-slate-400 line-through ml-1.5 font-bold">
                        ₹{baseMRP}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">TAT SLA</span>
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      <span>{formData.tatDisplay || `${formData.tatHours}h`}</span>
                    </span>
                  </div>
                </div>

                {/* Sub-Parameters Count */}
                <div className="text-xs text-slate-500 flex items-center justify-between px-1">
                  <span>Sub-Analytes Configured:</span>
                  <span className="font-bold text-slate-900">{parameters.length} Parameters</span>
                </div>
              </div>

              {/* Card 2: Physical Barcode Thermal Sticker Label Preview */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <Barcode className="h-4 w-4" />
                    <span>Specimen Barcode Sticker</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">2.0" × 1.0" Thermal</span>
                </div>

                {/* Realistic White Barcode Sticker */}
                <div className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black border-b border-slate-200 pb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-3 w-3 rounded-full border border-slate-300"
                        style={{ backgroundColor: currentTube.color }}
                      />
                      <span className="font-mono text-blue-700">{formData.testCode || "TEST"}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-600">{formData.sampleType}</span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-800">
                    <span className="truncate max-w-[140px]">{formData.testName || "Investigation"}</span>
                    <span>{formData.sampleVolume || "2.0 mL"}</span>
                  </div>

                  {/* Faux Barcode Lines */}
                  <div className="py-1 flex flex-col items-center justify-center">
                    <div className="h-7 w-full flex items-center justify-center gap-0.5 px-2 bg-slate-50 rounded border border-slate-200">
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3].map((w, i) => (
                        <div key={i} className="h-full bg-slate-900" style={{ width: `${w * 1.5}px` }} />
                      ))}
                    </div>
                    <span className="text-[8px] font-mono tracking-widest text-slate-500 mt-0.5">
                      *{formData.testCode || "LAB"}-SPECIMEN*
                    </span>
                  </div>

                  <div className="text-[8px] text-slate-500 flex justify-between border-t border-slate-200 pt-1">
                    <span>{storageTemp}</span>
                    <span>{inversionsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
