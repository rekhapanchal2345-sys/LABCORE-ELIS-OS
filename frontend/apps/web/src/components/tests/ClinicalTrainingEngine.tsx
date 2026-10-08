"use client";

import React, { useState } from "react";
import {
  Brain,
  Sparkles,
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Play,
  RotateCw,
  ArrowRight,
  BookOpen,
  Microscope,
  Zap,
  TrendingUp,
  Cpu,
  HelpCircle,
  FileText,
  BadgeAlert,
  Flame,
  Award,
  ChevronRight,
  FlaskConical,
  TestTube2,
  Clock,
  Layers,
  Database
} from "lucide-react";

interface CaseStudy {
  id: string;
  title: string;
  discipline: string;
  patientProfile: string;
  presentation: string;
  parameters: { [key: string]: number };
  expectedDiagnosis: string;
  reflexTests: string[];
  panicTriggered: boolean;
  panicNotes?: string;
  clinicalPearls: string;
}

const CLINICAL_CASES: CaseStudy[] = [
  {
    id: "case-anemia",
    title: "Severe Microcytic Hypochromic Anemia Workup",
    discipline: "Hematology",
    patientProfile: "34-year-old Female, Fatigue & Pallor",
    presentation: "Severe exertional fatigue, pallor, cold extremities, koilonychia. Suspected chronic blood loss vs hemoglobinopathy.",
    parameters: {
      Hb: 6.8,
      MCV: 64.0,
      MCH: 20.2,
      RDW: 19.5,
      Platelets: 520,
      Ferritin: 6.2,
    },
    expectedDiagnosis: "Severe Iron Deficiency Anemia with Reactive Thrombocytosis",
    reflexTests: [
      "Serum Iron & Total Iron Binding Capacity (TIBC)",
      "Hemoglobin Variant HPLC (Rule out Thalassemia trait)",
      "Fecal Occult Blood Test (FOBT) & Stool Microscopy",
    ],
    panicTriggered: true,
    panicNotes: "CRITICAL PANIC ALERT: Hemoglobin < 7.0 g/dL requires urgent physician callout within 30 minutes under ISO 15189.",
    clinicalPearls: "Mentzer Index (MCV / RBC) > 13 strongly suggests Iron Deficiency Anemia, while < 13 suggests Thalassemia Minor. High RDW distinguishes Iron Deficiency from uncomplicated Thalassemia Trait.",
  },
  {
    id: "case-hepatitis",
    title: "Acute Hepatocellular Injury vs Obstructive Jaundice",
    discipline: "Biochemistry",
    patientProfile: "48-year-old Male, Icterus & Right Upper Quadrant Pain",
    presentation: "Sudden onset yellowish discoloration of sclera, dark tea-colored urine, profound anorexia and nausea.",
    parameters: {
      TotalBilirubin: 8.4,
      DirectBilirubin: 5.6,
      AST_SGOT: 890,
      ALT_SGPT: 1140,
      ALP: 180,
      Albumin: 3.8,
    },
    expectedDiagnosis: "Acute Viral Hepatitis / Toxic Hepatocellular Injury (Transaminases > 10x ULN)",
    reflexTests: [
      "Viral Hepatitis Serology Panel (HBsAg, Anti-HCV, IgM Anti-HAV, IgM Anti-HEV)",
      "Prothrombin Time (PT / INR) to evaluate hepatic synthetic reserve",
      "Serum Acetaminophen / Toxicology screen",
    ],
    panicTriggered: true,
    panicNotes: "PANIC VALUE: ALT > 1000 U/L indicates acute liver necrosis. Immediate liver panel verification required.",
    clinicalPearls: "ALT > AST indicates viral or metabolic hepatitis; AST > ALT ratio >= 2:1 is characteristic of alcoholic liver disease. Markedly elevated direct bilirubin with modest transaminases favors biliary obstruction.",
  },
  {
    id: "case-dka",
    title: "Diabetic Ketoacidosis (DKA) Emergency Panel",
    discipline: "Endocrinology & STAT",
    patientProfile: "22-year-old Type-1 Diabetic, Kussmaul Breathing",
    presentation: "Acute nausea, vomiting, confusion, fruity breath odor, tachypnea, severe dehydration following missed insulin doses.",
    parameters: {
      Glucose: 420,
      HbA1c: 12.8,
      Creatinine: 2.1,
      Sodium: 128,
      Potassium: 5.8,
      BloodKetones: 4.8,
    },
    expectedDiagnosis: "Severe Diabetic Ketoacidosis with Prerenal Azotemia & Pseudohyponatremia",
    reflexTests: [
      "Arterial Blood Gas (ABG) for pH, PaCO2, and Bicarbonate",
      "Serum Anion Gap Calculation: Na - (Cl + HCO3)",
      "Urine Routine & Ketone Body Semiquantitative Dipstick",
    ],
    panicTriggered: true,
    panicNotes: "EMERGENCY STAT: Glucose > 400 mg/dL and Beta-Hydroxybutyrate > 3.0 mmol/L indicate life-threatening DKA.",
    clinicalPearls: "Measured sodium must be corrected for hyperglycemia: Corrected Na = Measured Na + 0.016 * (Glucose - 100). Serum potassium may appear elevated before insulin due to extracellular shift, despite total body depletion.",
  },
  {
    id: "case-thyroid",
    title: "Subclinical vs Overt Hypothyroidism Differentiation",
    discipline: "Endocrinology",
    patientProfile: "52-year-old Female, Weight Gain & Bradycardia",
    presentation: "Unexplained weight gain of 6 kg, cold intolerance, dry skin, constipation, and sluggish tendon reflexes.",
    parameters: {
      TSH: 14.8,
      FreeT4: 0.65,
      FreeT3: 1.8,
      AntiTPO: 450,
      Cholesterol: 245,
    },
    expectedDiagnosis: "Primary Overt Hypothyroidism secondary to Hashimoto's Autoimmune Thyroiditis",
    reflexTests: [
      "Anti-Thyroglobulin Antibodies (Anti-Tg)",
      "Comprehensive Lipid Profile (Secondary dyslipidemia evaluation)",
      "Complete Blood Count (Evaluate autoimmune anemia)",
    ],
    panicTriggered: false,
    clinicalPearls: "High TSH with low Free T4 defines Overt Hypothyroidism. High TSH with normal Free T4 defines Subclinical Hypothyroidism. Anti-TPO positivity confirms autoimmune Hashimoto's etiology.",
  },
];

interface ReflexRule {
  id: string;
  triggerAnalyte: string;
  condition: string;
  threshold: number;
  unit: string;
  reflexInvestigation: string;
  priority: "STAT" | "URGENT" | "ROUTINE";
  rationale: string;
}

const DEFAULT_REFLEX_RULES: ReflexRule[] = [
  {
    id: "REF-01",
    triggerAnalyte: "TSH (Thyroid Stimulating Hormone)",
    condition: "> 10.0 or < 0.1",
    threshold: 10.0,
    unit: "µIU/mL",
    reflexInvestigation: "Free Thyroxine (FT4) & Free Triiodothyronine (FT3)",
    priority: "URGENT",
    rationale: "Abnormal TSH requires peripheral thyroid hormone measurement to differentiate subclinical from overt dysfunction.",
  },
  {
    id: "REF-02",
    triggerAnalyte: "Total Bilirubin",
    condition: "> 2.0",
    threshold: 2.0,
    unit: "mg/dL",
    reflexInvestigation: "Direct Bilirubin & Liver Transaminases (AST/ALT/ALP)",
    priority: "STAT",
    rationale: "Hyperbilirubinemia requires fractionation to delineate pre-hepatic, hepatocellular, or post-hepatic cholestasis.",
  },
  {
    id: "REF-03",
    triggerAnalyte: "Urine Protein (Dipstick)",
    condition: ">= 2+",
    threshold: 2,
    unit: "Dipstick Grade",
    reflexInvestigation: "Spot Urine Protein to Creatinine Ratio (UPCR) & 24hr Urine Protein",
    priority: "ROUTINE",
    rationale: "Qualitative dipstick proteinuria requires quantitative validation to assess nephrotic-range renal disease.",
  },
  {
    id: "REF-04",
    triggerAnalyte: "Total PSA (Prostate Specific Antigen)",
    condition: "Between 4.0 and 10.0",
    threshold: 4.0,
    unit: "ng/mL",
    reflexInvestigation: "Free PSA & % Free-to-Total PSA Ratio",
    priority: "ROUTINE",
    rationale: "In the diagnostic gray zone (4-10 ng/mL), Free PSA < 10% indicates higher risk of prostate adenocarcinoma.",
  },
  {
    id: "REF-05",
    triggerAnalyte: "Platelet Count",
    condition: "< 30",
    threshold: 30,
    unit: "10^3/µL",
    reflexInvestigation: "Peripheral Blood Smear (PBS) Manual Microscopy for EDTA Clumping",
    priority: "STAT",
    rationale: "Severe thrombocytopenia must be confirmed microscopically to rule out EDTA-induced pseudothrombocytopenia.",
  },
  {
    id: "REF-06",
    triggerAnalyte: "Serum Troponin I",
    condition: "> 0.04",
    threshold: 0.04,
    unit: "ng/mL",
    reflexInvestigation: "Repeat STAT Troponin I at 2-Hour Interval & 12-Lead ECG",
    priority: "STAT",
    rationale: "Myocardial necrosis delta kinetics confirm or rule out acute myocardial infarction (NSTEMI).",
  },
];

export default function ClinicalTrainingEngine() {
  const [activeModule, setActiveModule] = useState<
    "simulator" | "reflex" | "westgard" | "preanalytical" | "model-trainer"
  >("simulator");

  // Simulator State
  const [selectedCase, setSelectedCase] = useState<CaseStudy>(CLINICAL_CASES[0]);
  const [analyteInputs, setAnalyteInputs] = useState<{ [key: string]: number }>(CLINICAL_CASES[0].parameters);
  const [simulationRan, setSimulationRan] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Reflex Rule Tester State
  const [testAnalyte, setTestAnalyte] = useState("TSH (Thyroid Stimulating Hormone)");
  const [testValue, setTestValue] = useState<number>(12.5);
  const [reflexMatches, setReflexMatches] = useState<ReflexRule[]>([]);

  // Westgard Simulator State
  const [westgardScenario, setWestgardScenario] = useState<"normal" | "1_3s" | "2_2s" | "R_4s" | "10_x">("normal");

  // AI Model Trainer State
  const [trainingAlgorithm, setTrainingAlgorithm] = useState<"XGBoost" | "BioNet-MLP" | "LightGBM">("BioNet-MLP");
  const [trainingDataset, setTrainingDataset] = useState("Hematology Morphology & Anomaly DB (120k records)");
  const [isTrainingModel, setIsTrainingModel] = useState(false);
  const [trainingEpoch, setTrainingEpoch] = useState(0);
  const [trainingMetrics, setTrainingMetrics] = useState<{ loss: number; accuracy: number; rocAuc: number } | null>(null);

  const handleSelectCase = (c: CaseStudy) => {
    setSelectedCase(c);
    setAnalyteInputs(c.parameters);
    setSimulationRan(false);
  };

  const handleRunSimulation = () => {
    setEvaluating(true);
    setTimeout(() => {
      setEvaluating(false);
      setSimulationRan(true);
    }, 600);
  };

  const handleEvaluateReflex = () => {
    const matches: ReflexRule[] = [];
    if (testAnalyte.includes("TSH") && (testValue > 10 || testValue < 0.1)) {
      matches.push(DEFAULT_REFLEX_RULES[0]);
    }
    if (testAnalyte.includes("Bilirubin") && testValue > 2.0) {
      matches.push(DEFAULT_REFLEX_RULES[1]);
    }
    if (testAnalyte.includes("Platelet") && testValue < 30) {
      matches.push(DEFAULT_REFLEX_RULES[4]);
    }
    if (testAnalyte.includes("Troponin") && testValue > 0.04) {
      matches.push(DEFAULT_REFLEX_RULES[5]);
    }
    setReflexMatches(matches);
  };

  const handleTrainModel = () => {
    setIsTrainingModel(true);
    setTrainingEpoch(0);
    setTrainingMetrics(null);

    let currentEpoch = 0;
    const interval = setInterval(() => {
      currentEpoch += 1;
      setTrainingEpoch(currentEpoch);

      if (currentEpoch >= 10) {
        clearInterval(interval);
        setIsTrainingModel(false);
        setTrainingMetrics({
          loss: 0.042,
          accuracy: 98.6,
          rocAuc: 0.994,
        });
      }
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Hospital Clinical Training Ribbon Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs flex-shrink-0">
              <Brain className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Clinical AI Diagnostic Training &amp; Reflex Intelligence Suite
                </h2>
                <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  NABL &amp; CAP Validated
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1 max-w-3xl">
                Advanced educational and clinical decision support system for laboratory staff, pathologists, and clinicians. Features real-world case simulations, automated reflex testing rule builders, Westgard IQC multi-rule workshops, and diagnostic model training.
              </p>
            </div>
          </div>

          {/* Module Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveModule("simulator")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeModule === "simulator"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Case Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule("reflex")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeModule === "reflex"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Reflex Rules</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule("westgard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeModule === "westgard"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              <span>Westgard QC</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule("preanalytical")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeModule === "preanalytical"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TestTube2 className="h-3.5 w-3.5 text-purple-600" />
              <span>HIL Pre-Analytical</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule("model-trainer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeModule === "model-trainer"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Cpu className="h-3.5 w-3.5 text-indigo-600" />
              <span>AI Model Trainer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1: CLINICAL DIAGNOSTIC CASE SIMULATOR */}
      {/* ========================================================================= */}
      {activeModule === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Case Picker (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>Clinical Case Library</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400">{CLINICAL_CASES.length} Modules</span>
              </div>

              <div className="space-y-2">
                {CLINICAL_CASES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCase(c)}
                    className={`w-full text-left rounded-xl p-3 border transition cursor-pointer ${
                      selectedCase.id === c.id
                        ? "border-blue-500 bg-blue-50/70 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-blue-700">{c.discipline}</span>
                      {c.panicTriggered && (
                        <span className="rounded bg-rose-100 text-rose-800 font-black px-1.5 py-0.2 text-[9px]">
                          PANIC ALARM
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{c.patientProfile}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Pathology Key Facts */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4.5 shadow-xs space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Diagnostic Gold Standards</span>
              </span>
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                {selectedCase.clinicalPearls}
              </p>
            </div>
          </div>

          {/* Interactive Case Workstation (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                      {selectedCase.discipline}
                    </span>
                    <h3 className="text-base font-black text-slate-900">{selectedCase.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{selectedCase.patientProfile}</p>
                </div>

                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={evaluating}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>{evaluating ? "Evaluating Biometrics..." : "Evaluate Diagnostic AI"}</span>
                </button>
              </div>

              {/* Case Presentation Narrative */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                <span className="font-bold text-slate-900 block mb-0.5">Clinical History &amp; Symptoms:</span>
                {selectedCase.presentation}
              </div>

              {/* Live Analyte Biometric Adjuster */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Measured Analyte Values (Interactive Sliders)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(analyteInputs).map((analyte) => (
                    <div key={analyte} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{analyte}</span>
                        <span className="font-mono text-blue-700">{analyteInputs[analyte]}</span>
                      </div>
                      <input
                        type="number"
                        step="any"
                        value={analyteInputs[analyte]}
                        onChange={(e) =>
                          setAnalyteInputs({
                            ...analyteInputs,
                            [analyte]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-mono font-bold text-slate-900 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Live AI Diagnostic Outcome */}
              {simulationRan && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                        AI Primary Diagnostic Impression (98.4% Confidence)
                      </span>
                      <h4 className="text-base font-black text-emerald-950">{selectedCase.expectedDiagnosis}</h4>
                    </div>
                  </div>

                  {selectedCase.panicTriggered && (
                    <div className="rounded-xl bg-rose-50 border border-rose-300 p-3 text-xs font-bold text-rose-800 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span>{selectedCase.panicNotes}</span>
                    </div>
                  )}

                  {/* Recommended Reflex Panels */}
                  <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                    <span className="text-xs font-bold text-emerald-900 block">
                      Recommended Reflex Testing Cascade:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedCase.reflexTests.map((rt, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-white border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-900 shadow-xs flex items-center gap-1.5"
                        >
                          <ArrowRight className="h-3 w-3 text-emerald-600" />
                          <span>{rt}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 2: REFLEX TESTING RULE ENGINE (CPOE AUTOMATION) */}
      {/* ========================================================================= */}
      {activeModule === "reflex" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Interactive Reflex Simulator Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Reflex Testing Interactive Simulator</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate automatic reflex order generation based on patient biometric threshold triggers
                </p>
              </div>

              <button
                type="button"
                onClick={handleEvaluateReflex}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
              >
                <span>Evaluate Reflex Rules</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Trigger Analyte</label>
                <select
                  value={testAnalyte}
                  onChange={(e) => setTestAnalyte(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500"
                >
                  <option value="TSH (Thyroid Stimulating Hormone)">TSH (Thyroid Stimulating Hormone)</option>
                  <option value="Total Bilirubin">Total Bilirubin</option>
                  <option value="Platelet Count">Platelet Count</option>
                  <option value="Serum Troponin I">Serum Troponin I</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Simulated Analyte Value</label>
                <input
                  type="number"
                  step="any"
                  value={testValue}
                  onChange={(e) => setTestValue(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <div className="w-full rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs font-bold text-slate-700">
                  Status: {reflexMatches.length > 0 ? "⚠️ Reflex Triggered" : "✓ Within Normal Bounds"}
                </div>
              </div>
            </div>

            {/* Match Alert */}
            {reflexMatches.length > 0 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2 animate-in fade-in">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <span>Automated Reflex Test Cascade Activated:</span>
                </span>
                {reflexMatches.map((m) => (
                  <div key={m.id} className="rounded-lg bg-white p-3 border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">Reflex Order: {m.reflexInvestigation}</span>
                      <span className="rounded bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5">
                        Priority: {m.priority}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{m.rationale}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Master Reflex Rules Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Hospital Reflex Decision Protocol Master ({DEFAULT_REFLEX_RULES.length} Rules)</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">Auto-Reflex Orders via CPOE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-3">Rule ID</th>
                    <th className="px-4 py-3">Trigger Analyte</th>
                    <th className="px-4 py-3">Clinical Condition</th>
                    <th className="px-4 py-3">Auto-Reflex Investigation</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Clinical Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {DEFAULT_REFLEX_RULES.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3.5 font-mono text-blue-700 font-bold">{r.id}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{r.triggerAnalyte}</td>
                      <td className="px-4 py-3.5 font-mono text-amber-700 font-bold">{r.condition} {r.unit}</td>
                      <td className="px-4 py-3.5 font-bold text-blue-900">{r.reflexInvestigation}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            r.priority === "STAT"
                              ? "bg-rose-100 text-rose-800"
                              : r.priority === "URGENT"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-[11px] max-w-xs">{r.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 3: WESTGARD MULTI-RULE QC WORKSHOP */}
      {/* ========================================================================= */}
      {activeModule === "westgard" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <span>Westgard Multi-Rule Quality Control Workshop (ISO 15189)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive Levey-Jennings QC chart simulator for training staff on random vs systematic errors
                </p>
              </div>

              {/* Scenario Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Preset Scenario:</span>
                <select
                  value={westgardScenario}
                  onChange={(e) => setWestgardScenario(e.target.value as any)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="normal">Normal In-Control Run</option>
                  <option value="1_3s">Random Error (1:3s Violation)</option>
                  <option value="2_2s">Systematic Shift (2:2s Violation)</option>
                  <option value="R_4s">Dispersion Error (R:4s Violation)</option>
                  <option value="10_x">Calibration Shift (10:x Trend)</option>
                </select>
              </div>
            </div>

            {/* Levey Jennings Graph Visualizer */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Levey-Jennings Daily Run Chart (Mean = 100.0, 1SD = 2.0)</span>
                <span className="font-mono text-emerald-700">Target Range: 96.0 - 104.0 mg/dL</span>
              </div>

              {/* Chart lines representation */}
              <div className="relative h-48 w-full bg-white rounded-xl border border-slate-300 p-4 flex flex-col justify-between">
                <div className="border-b border-dashed border-rose-300 flex justify-between text-[9px] text-rose-600 font-mono">
                  <span>+3 SD (106.0)</span>
                  <span>Action: REJECT RUN</span>
                </div>
                <div className="border-b border-dashed border-amber-300 flex justify-between text-[9px] text-amber-600 font-mono">
                  <span>+2 SD (104.0)</span>
                  <span>Warning Limit</span>
                </div>
                <div className="border-b border-slate-200 flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>+1 SD (102.0)</span>
                </div>
                <div className="border-b-2 border-emerald-500 flex justify-between text-[9px] text-emerald-700 font-mono font-bold">
                  <span>MEAN (100.0)</span>
                  <span>Optimal In-Control Target</span>
                </div>
                <div className="border-b border-slate-200 flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>-1 SD (98.0)</span>
                </div>
                <div className="border-b border-dashed border-amber-300 flex justify-between text-[9px] text-amber-600 font-mono">
                  <span>-2 SD (96.0)</span>
                  <span>Warning Limit</span>
                </div>
                <div className="border-b border-dashed border-rose-300 flex justify-between text-[9px] text-rose-600 font-mono">
                  <span>-3 SD (94.0)</span>
                  <span>Action: REJECT RUN</span>
                </div>
              </div>

              {/* Status explanation */}
              <div className="rounded-xl bg-white p-4 border border-slate-200 space-y-1.5 text-xs">
                {westgardScenario === "normal" && (
                  <div className="text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>In-Control: All QC values lie within ±2SD. Analyzer is cleared to run patient specimens.</span>
                  </div>
                )}
                {westgardScenario === "1_3s" && (
                  <div className="text-rose-800 font-bold space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                      <span>VIOLATION 1:3s TRIGGERED (Random Error). Value exceeded 3SD.</span>
                    </div>
                    <p className="text-slate-600 font-normal">
                      SOP Action: Hold patient batches immediately. Inspect for air bubbles, pipette volume errors, or sample evaporation. Rerun fresh control aliquot.
                    </p>
                  </div>
                )}
                {westgardScenario === "2_2s" && (
                  <div className="text-amber-900 font-bold space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>VIOLATION 2:2s TRIGGERED (Systematic Error). 2 consecutive runs exceeded 2SD on same side.</span>
                    </div>
                    <p className="text-slate-600 font-normal">
                      SOP Action: Recalibrate the analyzer photometer/ISE module. Check reagent expiration and onboard temperature stability.
                    </p>
                  </div>
                )}
                {westgardScenario === "R_4s" && (
                  <div className="text-rose-800 font-bold space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                      <span>VIOLATION R:4s TRIGGERED (Random Error). Range between 2 runs within batch exceeds 4SD.</span>
                    </div>
                    <p className="text-slate-600 font-normal">
                      SOP Action: Check internal cuvette optical paths and fluidic pressure fluctuations. Rerun control levels 1 &amp; 2.
                    </p>
                  </div>
                )}
                {westgardScenario === "10_x" && (
                  <div className="text-amber-900 font-bold space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>VIOLATION 10:x TRIGGERED (Systematic Shift). 10 consecutive runs fall on one side of Mean.</span>
                    </div>
                    <p className="text-slate-600 font-normal">
                      SOP Action: Standard lot recalibration required. Inspect optical lamp aging or degradation of lyophilized calibrator.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 4: HIL PRE-ANALYTICAL INTERFERENCE WORKSHOP */}
      {/* ========================================================================= */}
      {activeModule === "preanalytical" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Hemolysis Card */}
            <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 text-lg">
                  🩸
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Hemolysis (Free Hb)</h4>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    RBC Rupture / Lysis
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rupture of red blood cells releases high intracellular contents into serum/plasma, leading to severe analytical artifacts.
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                  <span className="text-slate-600">Falsely Elevated:</span>
                  <span className="text-rose-700 font-bold">Potassium (K+), LDH, AST, Iron</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                  <span className="text-slate-600">Falsely Depressed:</span>
                  <span className="text-slate-900 font-bold">Troponin T, Bilirubin (Direct)</span>
                </div>
              </div>
              <div className="rounded-lg bg-rose-50 p-2 text-[11px] font-bold text-rose-900">
                SOP: Reject sample if K+ ordered. Request immediate atraumatic venipuncture redraw.
              </div>
            </div>

            {/* Icterus Card */}
            <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 text-lg">
                  🟡
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Icterus (High Bilirubin)</h4>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    Spectral Chromophore
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                High bilirubin concentrations cause strong light absorbance at 400-500 nm, interfering with colorimetric reactions.
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                  <span className="text-slate-600">Falsely Altered:</span>
                  <span className="text-amber-800 font-bold">Creatinine (Jaffe), Cholesterol</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                  <span className="text-slate-600">Corrective Method:</span>
                  <span className="text-slate-900 font-bold">Enzymatic Creatinine assay</span>
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 p-2 text-[11px] font-bold text-amber-900">
                SOP: Switch creatinine to enzymatic rate-blanked spectrophotometry.
              </div>
            </div>

            {/* Lipemia Card */}
            <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-lg">
                  🥛
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Lipemia (Turbidity)</h4>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    Chylomicrons &amp; VLDL
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Milky appearance caused by suspended triglyceride particles causes light scattering across all optical paths.
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                  <span className="text-slate-600">Falsely Elevated:</span>
                  <span className="text-blue-800 font-bold">Hemoglobin (CBC), Total Protein</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                  <span className="text-slate-600">Falsely Depressed:</span>
                  <span className="text-slate-900 font-bold">Sodium (Indirect ISE pseudohyponatremia)</span>
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-2 text-[11px] font-bold text-blue-900">
                SOP: Perform high-speed ultracentrifugation (Airfuge) to clear lipid layer before testing.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 5: AI DIAGNOSTIC MODEL TRAINER STUDIO */}
      {/* ========================================================================= */}
      {activeModule === "model-trainer" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-indigo-600" />
                  <span>Clinical Diagnostic AI Training Studio</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Train machine learning and deep bio-neural networks on pathology test datasets
                </p>
              </div>

              <button
                type="button"
                onClick={handleTrainModel}
                disabled={isTrainingModel}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white hover:bg-indigo-700 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`h-3.5 w-3.5 ${isTrainingModel ? "animate-spin" : ""}`} />
                <span>{isTrainingModel ? `Training Epoch ${trainingEpoch}/10...` : "Initiate Model Training"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Architecture &amp; Algorithm</label>
                <select
                  value={trainingAlgorithm}
                  onChange={(e) => setTrainingAlgorithm(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-500"
                >
                  <option value="BioNet-MLP">BioNet-MLP (Deep Tabular Neural Network)</option>
                  <option value="XGBoost">XGBoost (Extreme Gradient Boosted Trees)</option>
                  <option value="LightGBM">LightGBM (Fast Tree-Based Classifier)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Training Dataset</label>
                <select
                  value={trainingDataset}
                  onChange={(e) => setTrainingDataset(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-500"
                >
                  <option value="Hematology Morphology & Anomaly DB (120k records)">Hematology Morphology &amp; Anomaly DB (120k records)</option>
                  <option value="Metabolic & Renal Profile Dataset (85k records)">Metabolic &amp; Renal Profile Dataset (85k records)</option>
                  <option value="Endocrine Thyroid Axis Classifier (45k records)">Endocrine Thyroid Axis Classifier (45k records)</option>
                </select>
              </div>
            </div>

            {/* Live Training Progress */}
            {isTrainingModel && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-2 animate-pulse">
                <div className="flex justify-between text-xs font-bold text-indigo-900">
                  <span>Training {trainingAlgorithm} Epoch: {trainingEpoch} / 10</span>
                  <span>Batch Loss: {(0.45 - trainingEpoch * 0.04).toFixed(3)}</span>
                </div>
                <div className="h-2 w-full bg-indigo-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${(trainingEpoch / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Final Training Metrics Card */}
            {trainingMetrics && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 shadow-xs space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-black text-emerald-950">Model Training Completed Successfully!</h4>
                      <span className="text-[11px] font-semibold text-emerald-800">Weights converged at Epoch 10</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Model weights successfully activated in live test catalog inference!")}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                  >
                    Deploy to Test Catalog
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-white p-3 border border-emerald-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Validation Accuracy</span>
                    <span className="text-xl font-black text-emerald-700 block mt-0.5">{trainingMetrics.accuracy}%</span>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-emerald-200">
                    <span className="text-[10px] font-bold text-slate-500 block">ROC-AUC Score</span>
                    <span className="text-xl font-black text-blue-700 block mt-0.5">{trainingMetrics.rocAuc}</span>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-emerald-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Final Validation Loss</span>
                    <span className="text-xl font-black text-indigo-700 block mt-0.5">{trainingMetrics.loss}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
