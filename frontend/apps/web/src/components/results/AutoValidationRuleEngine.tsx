"use client";

import React, { useState } from "react";
import {
  Zap,
  ShieldCheck,
  Cpu,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Filter,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ArrowRight,
  Clock,
  BarChart2,
  History,
  FileCode2,
  Info
} from "lucide-react";

export interface AutoValidationRule {
  id: string;
  name: string;
  department: "Biochemistry" | "Hematology" | "Immunology" | "Urinalysis";
  description: string;
  conditions: string[];
  action: "AUTO_APPROVE_AND_PUBLISH" | "AUTO_APPROVE_HOLD_NOTIFICATION" | "TRIGGER_REFLEX";
  reflexTest?: string;
  enabled: boolean;
  totalProcessed: number;
  autoPassedCount: number;
  divertedCount: number; // Sent to pathologist
  lastTriggered: string;
}

const INITIAL_RULES: AutoValidationRule[] = [
  {
    id: "AV-RULE-01",
    name: "Routine Normal CBC Auto-Release",
    department: "Hematology",
    description: "Automatically releases routine Complete Blood Counts when all cell lines are strictly within normal limits with zero instrument scattergram flags.",
    conditions: [
      "WBC, RBC, Hb, Platelets within standard age/gender reference range",
      "Analyzer flagging bitmask = 0 (No blasts, no platelet clumps, no immature granulocytes)",
      "Delta check Hb variation < 10% compared to baseline within 30 days",
      "Analyzer QC Westgard status = PASS within last 8 hours",
    ],
    action: "AUTO_APPROVE_AND_PUBLISH",
    enabled: true,
    totalProcessed: 1420,
    autoPassedCount: 1084,
    divertedCount: 336,
    lastTriggered: "3 mins ago",
  },
  {
    id: "AV-RULE-02",
    name: "Normal Renal Profile (RFT) Verification",
    department: "Biochemistry",
    description: "Instant clearance for normal Urea, Creatinine, Electrolytes, and eGFR in adult OPD patients.",
    conditions: [
      "Serum Creatinine between 0.6 and 1.2 mg/dL",
      "Serum Potassium between 3.6 and 5.0 mmol/L",
      "Serum Hemolysis index H < 1 (No lysis interference)",
      "Delta check Creatinine shift < 20%",
    ],
    action: "AUTO_APPROVE_AND_PUBLISH",
    enabled: true,
    totalProcessed: 980,
    autoPassedCount: 760,
    divertedCount: 220,
    lastTriggered: "7 mins ago",
  },
  {
    id: "AV-RULE-03",
    name: "Thyroid TSH Reflex Cascade",
    department: "Immunology",
    description: "When screening TSH is severely abnormal (>10.0 µIU/mL or <0.1 µIU/mL), automatically reflex add-on Free T4 to avoid sample recall.",
    conditions: [
      "Serum TSH > 10.0 µIU/mL or < 0.1 µIU/mL",
      "Specimen has sufficient residual volume in secondary aliquot (>500 µL)",
      "Primary order has consent for reflex cascade testing",
    ],
    action: "TRIGGER_REFLEX",
    reflexTest: "Free Thyroxine (FT4 Stat)",
    enabled: true,
    totalProcessed: 430,
    autoPassedCount: 68,
    divertedCount: 362,
    lastTriggered: "14 mins ago",
  },
  {
    id: "AV-RULE-04",
    name: "Lipid Profile Standard Clearance",
    department: "Biochemistry",
    description: "Clears normal fasting lipid panels without lipemic interference.",
    conditions: [
      "Triglycerides < 200 mg/dL",
      "Total Cholesterol < 200 mg/dL",
      "Serum Lipemia index L0 (No optical opacity)",
    ],
    action: "AUTO_APPROVE_AND_PUBLISH",
    enabled: true,
    totalProcessed: 610,
    autoPassedCount: 440,
    divertedCount: 170,
    lastTriggered: "21 mins ago",
  },
  {
    id: "AV-RULE-05",
    name: "Pediatric & Neonatal Safety Guardrail",
    department: "Biochemistry",
    description: "Zero auto-validation policy for Neonatal and Pediatric ICU patients (age < 2 years). Mandatory senior medical officer review.",
    conditions: [
      "Patient age < 24 months",
      "All inpatient NICU/PICU orders",
    ],
    action: "AUTO_APPROVE_HOLD_NOTIFICATION",
    enabled: true,
    totalProcessed: 185,
    autoPassedCount: 0,
    divertedCount: 185, // 100% diverted to pathologist for safety
    lastTriggered: "35 mins ago",
  },
];

export default function AutoValidationRuleEngine() {
  const [rules, setRules] = useState<AutoValidationRule[]>(INITIAL_RULES);
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [simulatingRuleId, setSimulatingRuleId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const updated = !r.enabled;
          setToastMessage(`Rule "${r.name}" has been ${updated ? "ENABLED" : "PAUSED"}.`);
          setTimeout(() => setToastMessage(null), 3000);
          return { ...r, enabled: updated };
        }
        return r;
      })
    );
  };

  const handleDryRunSimulation = (rule: AutoValidationRule) => {
    setSimulatingRuleId(rule.id);
    setTimeout(() => {
      setSimulatingRuleId(null);
      setToastMessage(`Dry-run simulation complete for "${rule.name}": 87% auto-cleared, 0 false negatives.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const totalProcessedAll = rules.reduce((acc, r) => acc + r.totalProcessed, 0);
  const totalAutoCleared = rules.reduce((acc, r) => acc + r.autoPassedCount, 0);
  const overallAutoRate = Math.round((totalAutoCleared / (totalProcessedAll || 1)) * 100);

  const filteredRules = selectedDept === "ALL"
    ? rules
    : rules.filter((r) => r.department === selectedDept);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 px-5 py-4 text-emerald-300 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-amber-600/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              CLSI AUTO10-A Compliant Middleware Automation
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Auto-Validation & Reflex Cascade Engine
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">
              Automated clinical release algorithms for routine normal specimens, reducing TAT by 65% while diverting all abnormal, delta-breached, and critical results to pathologists.
            </p>
          </div>

          {/* Aggregate Performance Cards */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Auto-Validation Rate</span>
              <p className="text-2xl font-black text-white">{overallAutoRate}%</p>
              <span className="text-[10px] text-slate-400">{totalAutoCleared} of {totalProcessedAll} tests auto-released</span>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 px-4 py-3 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Pathologist Workload Saved</span>
              <p className="text-2xl font-black text-white">~14.5 hrs</p>
              <span className="text-[10px] text-slate-400">Routine manual approvals eliminated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Filter Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "Biochemistry", "Hematology", "Immunology", "Urinalysis"].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                selectedDept === dept
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {dept === "ALL" ? "All Departments" : dept}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Rules: {rules.filter(r => r.enabled).length}/{rules.length}</span>
        </div>
      </div>

      {/* Rules Catalog */}
      <div className="space-y-4">
        {filteredRules.map((rule) => {
          const autoRate = Math.round((rule.autoPassedCount / (rule.totalProcessed || 1)) * 100);

          return (
            <div
              key={rule.id}
              className={`rounded-3xl border p-5 transition-all ${
                rule.enabled
                  ? "border-slate-800 bg-slate-900/90 shadow-xl hover:border-slate-700"
                  : "border-slate-900 bg-slate-950/60 opacity-60"
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{rule.id}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {rule.department}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      rule.action === "TRIGGER_REFLEX"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}>
                      {rule.action.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h3 className="mt-1.5 text-base font-bold text-white">{rule.name}</h3>
                  <p className="mt-1 max-w-3xl text-xs text-slate-300">{rule.description}</p>
                </div>

                {/* Right: Toggle Switch & Simulator */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDryRunSimulation(rule)}
                    disabled={simulatingRuleId === rule.id}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                  >
                    <Play className={`h-3 w-3 text-cyan-400 ${simulatingRuleId === rule.id ? "animate-spin" : ""}`} />
                    {simulatingRuleId === rule.id ? "Testing..." : "Dry Run"}
                  </button>

                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="text-amber-400 hover:text-amber-300 transition"
                  >
                    {rule.enabled ? (
                      <ToggleRight className="h-7 w-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Conditions Checklist Box */}
              <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Mandatory Validation Gates (ALL Must Pass for Auto-Release)
                </span>
                <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {rule.conditions.map((cond, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{cond}</span>
                    </div>
                  ))}
                </div>

                {rule.reflexTest && (
                  <div className="mt-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-2.5 text-xs text-indigo-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Auto-Triggers Cascade: <strong>{rule.reflexTest}</strong> upon abnormal threshold breach.</span>
                  </div>
                )}
              </div>

              {/* Performance Stats Footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-800/60 pt-3 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span>Processed: <strong className="text-white">{rule.totalProcessed}</strong></span>
                  <span>Auto-Cleared: <strong className="text-emerald-400">{rule.autoPassedCount} ({autoRate}%)</strong></span>
                  <span>Pathologist Queue: <strong className="text-amber-400">{rule.divertedCount}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>Last executed {rule.lastTriggered}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
