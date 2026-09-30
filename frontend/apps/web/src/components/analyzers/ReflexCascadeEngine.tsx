"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Zap,
  Plus,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FlaskConical,
  Microscope,
  ShieldAlert,
  Sliders,
  Check,
  X,
  Play,
  FileText,
  RotateCcw,
  Copy,
  ChevronDown,
  Info,
  PhoneCall,
  Activity,
  Layers
} from "lucide-react";
import { Analyzer } from "@/types";

export interface ReflexRule {
  id: string;
  name: string;
  category: "IMMUNOLOGY" | "BIOCHEMISTRY" | "HEMATOLOGY" | "URINALYSIS" | "CRITICAL_PANIC";
  triggerAnalyte: string;
  triggerAnalyteName: string;
  operator: ">" | ">=" | "<" | "<=" | "EQUALS" | "DELTA_EXCEEDED";
  thresholdValue: number | string;
  unit: string;
  actionType: "AUTO_REFLEX_ORDER" | "AUTO_DILUTION_RERUN" | "CRITICAL_ESCALATION" | "SLIDE_PREP_SMEAR";
  actionPayload: {
    targetTests?: string[];
    dilutionRatio?: string;
    escalationChannel?: string[];
    targetDepartment?: string;
    instructions?: string;
  };
  linkedAnalyzers: string[];
  autoReleaseOriginal: boolean;
  isActive: boolean;
  triggerCount: number;
  lastTriggered?: string;
}

export interface ReflexExecutionRecord {
  id: string;
  timestamp: string;
  barcode: string;
  patientName: string;
  mrn: string;
  initialTest: string;
  initialValue: string;
  ruleTriggered: string;
  actionTaken: string;
  status: "EXECUTED" | "IN_PROGRESS" | "PENDING_APPROVAL";
  dispatchedToAnalyzer: string;
}

interface ReflexCascadeEngineProps {
  analyzers?: Analyzer[];
}

export default function ReflexCascadeEngine({ analyzers = [] }: ReflexCascadeEngineProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "simulator" | "history">("rules");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedRule, setSelectedRule] = useState<ReflexRule | null>(null);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Initial Real-World Clinical Reflex Rules
  const [rules, setRules] = useState<ReflexRule[]>([
    {
      id: "RFLX-001",
      name: "Thyroid Cascade: TSH Elevation Reflex",
      category: "IMMUNOLOGY",
      triggerAnalyte: "TSH",
      triggerAnalyteName: "Thyroid Stimulating Hormone",
      operator: ">",
      thresholdValue: 10.0,
      unit: "μIU/mL",
      actionType: "AUTO_REFLEX_ORDER",
      actionPayload: {
        targetTests: ["FT4 (Free T4)", "FT3 (Free T3)", "Anti-TPO Antibodies"],
        targetDepartment: "Immunology",
        instructions: "Auto-aliquot secondary serum sample for free thyroid panel without recollecting sample.",
      },
      linkedAnalyzers: ["demo-5", "demo-2"],
      autoReleaseOriginal: true,
      isActive: true,
      triggerCount: 42,
      lastTriggered: "14 mins ago",
    },
    {
      id: "RFLX-002",
      name: "Severe Thrombocytopenia: Slide Morphology Review",
      category: "HEMATOLOGY",
      triggerAnalyte: "PLT",
      triggerAnalyteName: "Platelet Count",
      operator: "<",
      thresholdValue: 50,
      unit: "10^3/μL",
      actionType: "SLIDE_PREP_SMEAR",
      actionPayload: {
        targetTests: ["Peripheral Blood Smear (PBS) Review", "Manual Platelet Confirmation"],
        targetDepartment: "Hematology Cytology",
        instructions: "Automated blood smear preparation on slide stainer to rule out EDTA pseudothrombocytopenia.",
      },
      linkedAnalyzers: ["demo-1"],
      autoReleaseOriginal: false,
      isActive: true,
      triggerCount: 19,
      lastTriggered: "1 hour ago",
    },
    {
      id: "RFLX-003",
      name: "Pancreatic Lipase Exceeds Linearity: 1:5 Auto-Dilution",
      category: "BIOCHEMISTRY",
      triggerAnalyte: "LIPASE",
      triggerAnalyteName: "Serum Lipase",
      operator: ">",
      thresholdValue: 600,
      unit: "U/L",
      actionType: "AUTO_DILUTION_RERUN",
      actionPayload: {
        dilutionRatio: "1:5 with 0.9% Normal Saline",
        instructions: "Machine onboard auto-dilution rerun to determine absolute kinetic value within dynamic linearity.",
      },
      linkedAnalyzers: ["demo-2", "demo-3"],
      autoReleaseOriginal: false,
      isActive: true,
      triggerCount: 28,
      lastTriggered: "3 hours ago",
    },
    {
      id: "RFLX-004",
      name: "Cardiac Troponin-I Critical Panic Escalation",
      category: "CRITICAL_PANIC",
      triggerAnalyte: "TROP_I",
      triggerAnalyteName: "High-Sensitivity Troponin I",
      operator: ">=",
      thresholdValue: 0.04,
      unit: "ng/mL",
      actionType: "CRITICAL_ESCALATION",
      actionPayload: {
        escalationChannel: ["Emergency SMS to Attending Cardiologist", "ICU Duty Desk Overhead Call", "WhatsApp Push"],
        instructions: "IMMEDIATE NOTIFICATION: Potential acute myocardial infarction. Repeat in 2 hours for kinetic delta.",
      },
      linkedAnalyzers: ["demo-5"],
      autoReleaseOriginal: false,
      isActive: true,
      triggerCount: 8,
      lastTriggered: "28 mins ago",
    },
    {
      id: "RFLX-005",
      name: "Prostate Health: PSA > 4.0 Reflex Free PSA Ratio",
      category: "IMMUNOLOGY",
      triggerAnalyte: "TOTAL_PSA",
      triggerAnalyteName: "Total Prostate-Specific Antigen",
      operator: ">",
      thresholdValue: 4.0,
      unit: "ng/mL",
      actionType: "AUTO_REFLEX_ORDER",
      actionPayload: {
        targetTests: ["Free PSA", "Free/Total PSA Ratio %"],
        targetDepartment: "Immunology",
        instructions: "Dispatch Free PSA to Roche Cobas e601 to aid in differential diagnosis of BPH vs carcinoma.",
      },
      linkedAnalyzers: ["demo-5"],
      autoReleaseOriginal: true,
      isActive: true,
      triggerCount: 15,
      lastTriggered: "Yesterday",
    },
    {
      id: "RFLX-006",
      name: "Serum Potassium Panic (Hyperkalemia Protocol)",
      category: "CRITICAL_PANIC",
      triggerAnalyte: "POTASSIUM",
      triggerAnalyteName: "Serum Potassium (K+)",
      operator: ">=",
      thresholdValue: 6.2,
      unit: "mmol/L",
      actionType: "CRITICAL_ESCALATION",
      actionPayload: {
        escalationChannel: ["Stat Call to Emergency Physician", "Stat Secondary Machine Verification"],
        instructions: "Rule out hemolysis (check serum H-index). If non-hemolyzed, immediately alert clinical care unit.",
      },
      linkedAnalyzers: ["demo-2", "demo-3", "demo-4"],
      autoReleaseOriginal: false,
      isActive: true,
      triggerCount: 11,
      lastTriggered: "5 hours ago",
    }
  ]);

  // Real-world execution audit trail
  const [executionHistory, setExecutionHistory] = useState<ReflexExecutionRecord[]>([
    {
      id: "EXEC-8821",
      timestamp: "Today, 14:32:10",
      barcode: "LAB-BC-90412",
      patientName: "Meera Subramanian",
      mrn: "MRN-OPD-7819",
      initialTest: "TSH",
      initialValue: "18.4 μIU/mL (High)",
      ruleTriggered: "Thyroid Cascade: TSH Elevation Reflex",
      actionTaken: "Reflexed FT4 + FT3 dispatch to Roche Cobas e601",
      status: "EXECUTED",
      dispatchedToAnalyzer: "Roche Cobas c311 / e601",
    },
    {
      id: "EXEC-8820",
      timestamp: "Today, 14:18:04",
      barcode: "STAT-ICU-1029",
      patientName: "Kishore Kumar",
      mrn: "MRN-ICU-9921",
      initialTest: "High-Sensitivity Troponin I",
      initialValue: "0.24 ng/mL (Panic)",
      ruleTriggered: "Cardiac Troponin-I Critical Panic Escalation",
      actionTaken: "Urgent SMS to Dr. Verma (Cardio) + ICU Alert",
      status: "EXECUTED",
      dispatchedToAnalyzer: "Abbott Architect i2000",
    },
    {
      id: "EXEC-8819",
      timestamp: "Today, 13:45:22",
      barcode: "LAB-BC-90377",
      patientName: "Vikram Chauhan",
      mrn: "MRN-OPD-7704",
      initialTest: "Platelet Count (PLT)",
      initialValue: "34 x10^3/μL (Critical Low)",
      ruleTriggered: "Severe Thrombocytopenia: Slide Morphology Review",
      actionTaken: "Triggered Automated Smear Slide Maker (PBS-01)",
      status: "IN_PROGRESS",
      dispatchedToAnalyzer: "Sysmex XN-550 (Slide Prep)",
    },
    {
      id: "EXEC-8818",
      timestamp: "Today, 11:20:19",
      barcode: "LAB-BC-89912",
      patientName: "Anita Roy",
      mrn: "MRN-IPD-3301",
      initialTest: "Serum Lipase",
      initialValue: "> 700 U/L (Exceeds Range)",
      ruleTriggered: "Pancreatic Lipase Exceeds Linearity: 1:5 Auto-Dilution",
      actionTaken: "Automatic 1:5 Saline Dilution Rerun executed: 840 U/L",
      status: "EXECUTED",
      dispatchedToAnalyzer: "Roche Cobas c311",
    }
  ]);

  // Live Simulator State
  const [simAnalyte, setSimAnalyte] = useState("TSH");
  const [simValue, setSimValue] = useState("14.5");
  const [simBarcode, setSimBarcode] = useState("SIM-TEST-7701");
  const [simPatient, setSimPatient] = useState("Aarav Mehta");
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, isActive: !r.isActive };
          showNotification(`Rule "${r.name}" ${updated.isActive ? "activated" : "deactivated"}`);
          return updated;
        }
        return r;
      })
    );
  };

  // Run Real-time Reflex Simulation
  const handleRunSimulation = () => {
    const numVal = parseFloat(simValue);
    if (isNaN(numVal)) {
      showNotification("Please enter a valid numeric test value.");
      return;
    }

    const matchedRules = rules.filter((r) => {
      if (!r.isActive) return false;
      if (r.triggerAnalyte.toLowerCase() !== simAnalyte.toLowerCase()) return false;
      const th = typeof r.thresholdValue === "number" ? r.thresholdValue : parseFloat(r.thresholdValue);
      if (r.operator === ">") return numVal > th;
      if (r.operator === ">=") return numVal >= th;
      if (r.operator === "<") return numVal < th;
      if (r.operator === "<=") return numVal <= th;
      if (r.operator === "EQUALS") return numVal === th;
      return false;
    });

    if (matchedRules.length === 0) {
      setSimulationResult({
        matched: false,
        analyte: simAnalyte,
        value: numVal,
        message: "No active reflex rules matched this test value. Original result is cleared for routine auto-validation.",
      });
    } else {
      const topRule = matchedRules[0];
      setSimulationResult({
        matched: true,
        rule: topRule,
        analyte: simAnalyte,
        value: numVal,
        action: topRule.actionType,
        details: topRule.actionPayload,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.triggerAnalyte.toLowerCase().includes(q) ||
          r.triggerAnalyteName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rules, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-[#0a1128] to-indigo-950/80 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-1 text-[11px] font-bold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                CLSI & CAP Cascade Protocol
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Active Reflex Engine (Zero-Delay)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Automated Reflex & Cascade Testing Rules Engine
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Eliminate patient recalls and diagnostic delays. When laboratory results cross pathological thresholds, automatically order confirmatory panels, perform inline instrument dilutions, trigger peripheral smear reviews, or alert critical care physicians.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("simulator")}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/40 bg-indigo-500/20 px-4 py-2.5 text-xs font-bold text-indigo-200 hover:bg-indigo-500/30 transition-all"
            >
              <Play className="h-3.5 w-3.5 text-indigo-300" />
              Live Reflex Sandbox
            </button>
            <button
              onClick={() => {
                showNotification("Rule builder modal initiated. Select template to save.");
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              Create Reflex Cascade
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Rules</p>
              <p className="text-sm font-black text-white">{rules.filter((r) => r.isActive).length} Cascades Live</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Reflexes Fired</p>
              <p className="text-sm font-black text-emerald-300">
                {rules.reduce((acc, r) => acc + r.triggerCount, 0)} Orders Handled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TAT Reduction</p>
              <p className="text-sm font-black text-amber-300">~ 18 Hours Saved</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Critical Panic Intercept</p>
              <p className="text-sm font-black text-rose-300">100% Escallated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "rules"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Active Cascade Rules ({rules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "simulator"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <Play className="h-3.5 w-3.5" />
          <span>Real-time Reflex Sandbox</span>
          <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "history"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Execution Audit Trail ({executionHistory.length})</span>
        </button>
      </div>

      {/* VIEW 1: ACTIVE CASCADE RULES */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by rule name, analyte code (TSH, PLT, LIPASE, PSA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["ALL", "IMMUNOLOGY", "BIOCHEMISTRY", "HEMATOLOGY", "CRITICAL_PANIC"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    categoryFilter === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map((rule) => {
              const isPanic = rule.category === "CRITICAL_PANIC";
              const isDilution = rule.actionType === "AUTO_DILUTION_RERUN";
              const isSlide = rule.actionType === "SLIDE_PREP_SMEAR";

              return (
                <div
                  key={rule.id}
                  className={`relative flex flex-col justify-between rounded-3xl border p-5 transition-all duration-300 hover:shadow-xl ${
                    rule.isActive
                      ? isPanic
                        ? "border-rose-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/20"
                        : "border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20"
                      : "border-slate-800/80 bg-slate-950/60 opacity-60"
                  }`}
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isPanic
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : isDilution
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : isSlide
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {rule.category}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{rule.id}</span>
                        </div>
                        <h3 className="mt-1.5 text-base font-bold text-white leading-snug">{rule.name}</h3>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          rule.isActive ? "bg-indigo-600" : "bg-slate-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            rule.isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Trigger Condition Box */}
                    <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-3.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Trigger Condition
                      </span>
                      <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                        <span className="rounded-lg bg-indigo-500/20 px-2 py-0.5 text-indigo-300">
                          {rule.triggerAnalyte}
                        </span>
                        <span className="text-slate-400 font-sans text-xs">({rule.triggerAnalyteName})</span>
                        <span className="text-amber-400 font-extrabold">{rule.operator}</span>
                        <span className="text-emerald-400">
                          {rule.thresholdValue} {rule.unit}
                        </span>
                      </div>
                    </div>

                    {/* Result Action Payload */}
                    <div className="mt-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Action Executed</span>
                        <span className="text-[11px] font-bold text-indigo-300">{rule.actionType}</span>
                      </div>

                      {rule.actionPayload.targetTests && (
                        <div className="flex flex-wrap gap-1.5">
                          {rule.actionPayload.targetTests.map((t) => (
                            <span
                              key={t}
                              className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-200"
                            >
                              + {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {rule.actionPayload.dilutionRatio && (
                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-200">
                          Dilution: {rule.actionPayload.dilutionRatio}
                        </div>
                      )}

                      {rule.actionPayload.escalationChannel && (
                        <div className="flex flex-wrap gap-1">
                          {rule.actionPayload.escalationChannel.map((ch) => (
                            <span
                              key={ch}
                              className="rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300"
                            >
                              🔔 {ch}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-[11px] text-slate-400 italic">
                        &quot;{rule.actionPayload.instructions}&quot;
                      </p>
                    </div>
                  </div>

                  {/* Footer status */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                    <span>Fired: <strong className="text-white">{rule.triggerCount} times</strong></span>
                    <span>Last: <span className="text-indigo-300">{rule.lastTriggered || "Never"}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Play className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Live Reflex Decision Sandbox</h3>
                <p className="text-xs text-slate-400">Simulate incoming analyzer result to test cascade logic</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Trigger Analyte</label>
                <select
                  value={simAnalyte}
                  onChange={(e) => setSimAnalyte(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="TSH">TSH (Thyroid Stimulating Hormone)</option>
                  <option value="PLT">PLT (Platelet Count)</option>
                  <option value="LIPASE">Serum Lipase</option>
                  <option value="TROP_I">High-Sensitivity Troponin I</option>
                  <option value="TOTAL_PSA">Total PSA</option>
                  <option value="POTASSIUM">Serum Potassium (K+)</option>
                  <option value="GLUCOSE">Serum Glucose</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Simulated Machine Result Value</label>
                <input
                  type="text"
                  value={simValue}
                  onChange={(e) => setSimValue(e.target.value)}
                  placeholder="e.g. 14.5"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs font-mono text-emerald-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Specimen Barcode</label>
                  <input
                    type="text"
                    value={simBarcode}
                    onChange={(e) => setSimBarcode(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={simPatient}
                    onChange={(e) => setSimPatient(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300"
                  />
                </div>
              </div>

              <button
                onClick={handleRunSimulation}
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-all"
              >
                Execute Reflex Simulation Test
              </button>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 mb-4">
              Real-time Decision Trace & LIS Dispatch Packet
            </h3>

            {!simulationResult ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <FlaskConical className="h-12 w-12 text-slate-600 mb-3 animate-pulse" />
                <p className="text-sm font-semibold">Awaiting simulation trigger</p>
                <p className="text-xs max-w-sm mt-1">
                  Adjust the analyte and measured value on the left, then click &quot;Execute Reflex Simulation Test&quot; to inspect rule triggering.
                </p>
              </div>
            ) : simulationResult.matched ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">
                      CASCADE TRIGGERED: {simulationResult.rule.name}
                    </h4>
                    <p className="text-xs text-emerald-200/80">
                      Measured value {simulationResult.value} {simulationResult.rule.unit} exceeded threshold ({simulationResult.rule.operator} {simulationResult.rule.thresholdValue} {simulationResult.rule.unit}).
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">
                    Auto-Generated LIS Reflex Order Packet (ASTM / HL7 Frame)
                  </span>
                  <pre className="text-slate-300 bg-black/60 p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
{`MSH|^~\\&|LABCORE_ELIS|MAIN_LAB|ANALYZER_ROUTER|CORE_LAB|${new Date().toISOString()}|ORM^O01|REF_${Date.now()}|P|2.5
PID|1||${simBarcode}||${simPatient}||19900101|M
PV1|1|O|LAB^^^
ORC|NW|REF_${Date.now()}||||^^^20260907143000|||||REFLEX_TRIGGERED
OBR|1|REF_${Date.now()}||${simulationResult.rule.actionPayload.targetTests ? simulationResult.rule.actionPayload.targetTests.join("^") : "DILUTION_RERUN"}||||||||||||||||REFLEX_CASCADE`}
                  </pre>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Automated Actions In Queue</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Action:</span>
                      <strong className="text-indigo-300">{simulationResult.action}</strong>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Instructions:</span>
                      <span className="text-slate-200">{simulationResult.details.instructions}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
                <Check className="mx-auto h-8 w-8 text-slate-500 mb-2" />
                <h4 className="text-sm font-bold text-white">Within Routine Parameters</h4>
                <p className="text-xs mt-1 text-slate-400">{simulationResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: EXECUTION AUDIT TRAIL */}
      {activeTab === "history" && (
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-300">
                <tr>
                  <th className="px-5 py-4 font-bold uppercase text-[10px] text-indigo-400">Specimen & Patient</th>
                  <th className="px-5 py-4 font-bold uppercase text-[10px] text-slate-400">Initial Finding</th>
                  <th className="px-5 py-4 font-bold uppercase text-[10px] text-amber-400">Reflex Trigger</th>
                  <th className="px-5 py-4 font-bold uppercase text-[10px] text-emerald-400">Action Dispatched</th>
                  <th className="px-5 py-4 font-bold uppercase text-[10px] text-slate-400">Target Analyzer</th>
                  <th className="px-5 py-4 font-bold uppercase text-[10px] text-right text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {executionHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{item.patientName}</div>
                      <div className="font-mono text-[10px] text-indigo-300">{item.barcode} · {item.mrn}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-rose-300">{item.initialTest}: </span>
                      <span className="font-mono text-slate-200">{item.initialValue}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 font-medium">{item.ruleTriggered}</td>
                    <td className="px-5 py-3.5 text-indigo-200 font-medium">{item.actionTaken}</td>
                    <td className="px-5 py-3.5 text-slate-300 font-mono text-[11px]">{item.dispatchedToAnalyzer}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
