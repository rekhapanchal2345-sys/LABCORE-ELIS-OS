"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Plus,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck,
  Search,
  Filter,
  User,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Analyzer } from "@/types";
import { analyzersApi } from "@/lib/api";

interface AutoValidationEngineProps {
  isOpen: boolean;
  onClose: () => void;
  analyzerId?: string;
  analyzers?: Analyzer[];
}

interface ValidationRule {
  id: string;
  name: string;
  department: string;
  parameterCode: string;
  parameterName: string;
  rangeCheck: boolean;
  normalMin?: number;
  normalMax?: number;
  deltaCheck: boolean;
  deltaPercentThreshold?: number;
  criticalPanicAlert: boolean;
  criticalLowThreshold?: number;
  criticalHighThreshold?: number;
  enforceFlagReview: boolean;
  isActive: boolean;
}

interface AuditRecord {
  id: string;
  timestamp: Date;
  barcode: string;
  patientUhid: string;
  patientName: string;
  testName: string;
  resultValue: string;
  decision: "AUTO_APPROVED" | "FLAGGED_FOR_REVIEW" | "MANUALLY_RELEASED";
  reason: string;
  reviewedBy?: string;
}

export default function AutoValidationEngine({
  isOpen,
  onClose,
  analyzerId,
  analyzers = [],
}: AutoValidationEngineProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "audit">("rules");
  const [showAddRule, setShowAddRule] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [rules, setRules] = useState<ValidationRule[]>([
    {
      id: "rule-1",
      name: "Routine Hematology Auto-Release",
      department: "Hematology",
      parameterCode: "WBC",
      parameterName: "White Blood Cell Count",
      rangeCheck: true,
      normalMin: 4.0,
      normalMax: 11.0,
      deltaCheck: true,
      deltaPercentThreshold: 25,
      criticalPanicAlert: true,
      criticalLowThreshold: 1.5,
      criticalHighThreshold: 35.0,
      enforceFlagReview: true,
      isActive: true,
    },
    {
      id: "rule-2",
      name: "Platelet Critical Alert Rule",
      department: "Hematology",
      parameterCode: "PLT",
      parameterName: "Platelet Count",
      rangeCheck: true,
      normalMin: 150,
      normalMax: 450,
      deltaCheck: true,
      deltaPercentThreshold: 30,
      criticalPanicAlert: true,
      criticalLowThreshold: 20,
      criticalHighThreshold: 800,
      enforceFlagReview: true,
      isActive: true,
    },
    {
      id: "rule-3",
      name: "Serum Potassium Critical Guard",
      department: "Biochemistry",
      parameterCode: "K",
      parameterName: "Potassium (K+)",
      rangeCheck: true,
      normalMin: 3.5,
      normalMax: 5.1,
      deltaCheck: true,
      deltaPercentThreshold: 15,
      criticalPanicAlert: true,
      criticalLowThreshold: 2.8,
      criticalHighThreshold: 6.2,
      enforceFlagReview: true,
      isActive: true,
    },
    {
      id: "rule-4",
      name: "Fasting Blood Glucose Range Check",
      department: "Biochemistry",
      parameterCode: "GLU",
      parameterName: "Fasting Glucose",
      rangeCheck: true,
      normalMin: 70,
      normalMax: 100,
      deltaCheck: false,
      criticalPanicAlert: true,
      criticalLowThreshold: 45,
      criticalHighThreshold: 450,
      enforceFlagReview: true,
      isActive: true,
    },
  ]);

  const [auditLog, setAuditLog] = useState<AuditRecord[]>([
    {
      id: "aud-1",
      timestamp: new Date(Date.now() - 6 * 60 * 1000),
      barcode: "SMP-89021",
      patientUhid: "UHID-2026-001",
      patientName: "John Doe",
      testName: "White Blood Cell Count (7.4 10^3/µL)",
      resultValue: "7.4",
      decision: "AUTO_APPROVED",
      reason: "Within normal biological range (4.0 - 11.0); No delta check exception.",
    },
    {
      id: "aud-2",
      timestamp: new Date(Date.now() - 14 * 60 * 1000),
      barcode: "SMP-89022",
      patientUhid: "UHID-2026-002",
      patientName: "Jane Smith",
      testName: "Fasting Blood Glucose (285 mg/dL)",
      resultValue: "285",
      decision: "FLAGGED_FOR_REVIEW",
      reason: "Value exceeds normal reference interval (70-100 mg/dL). Held for technician review.",
    },
    {
      id: "aud-3",
      timestamp: new Date(Date.now() - 28 * 60 * 1000),
      barcode: "SMP-89020",
      patientUhid: "UHID-2026-000",
      patientName: "Sunita Rao",
      testName: "Platelet Count (19 10^3/µL)",
      resultValue: "19",
      decision: "MANUALLY_RELEASED",
      reason: "Critical value panic alert verified with repeated slide smear examination.",
      reviewedBy: "Dr. A. Kulkarni (Senior Pathologist)",
    },
  ]);

  // Form for new rule
  const [newRule, setNewRule] = useState({
    name: "",
    department: "Hematology",
    parameterCode: "",
    parameterName: "",
    normalMin: 0,
    normalMax: 100,
    deltaCheck: true,
    deltaPercentThreshold: 20,
    criticalPanicAlert: true,
    criticalLowThreshold: 10,
    criticalHighThreshold: 300,
    enforceFlagReview: true,
  });

  if (!isOpen) return null;

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.parameterCode) return;
    const created: ValidationRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      department: newRule.department,
      parameterCode: newRule.parameterCode.toUpperCase(),
      parameterName: newRule.parameterName || newRule.parameterCode,
      rangeCheck: true,
      normalMin: newRule.normalMin,
      normalMax: newRule.normalMax,
      deltaCheck: newRule.deltaCheck,
      deltaPercentThreshold: newRule.deltaPercentThreshold,
      criticalPanicAlert: newRule.criticalPanicAlert,
      criticalLowThreshold: newRule.criticalLowThreshold,
      criticalHighThreshold: newRule.criticalHighThreshold,
      enforceFlagReview: newRule.enforceFlagReview,
      isActive: true,
    };
    setRules([...rules, created]);
    setShowAddRule(false);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Rules-Based Auto-Validation Engine</h3>
              <p className="text-xs text-gray-500">
                Automated clinical verification: Reference range, delta checks, & critical panic alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 py-2.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab("rules")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === "rules"
                  ? "bg-white text-emerald-700 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:bg-white/60"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Active Validation Rules ({rules.filter((r) => r.isActive).length})
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === "audit"
                  ? "bg-white text-emerald-700 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:bg-white/60"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Auto-Approval Audit Trail ({auditLog.length})
            </button>
          </div>

          {activeTab === "rules" && (
            <button
              onClick={() => setShowAddRule(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Validation Rule
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === "rules" && !showAddRule && (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border transition-all ${
                    rule.isActive ? "bg-white border-gray-200 hover:border-emerald-300" : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{rule.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          {rule.parameterCode}
                        </span>
                        <span className="text-xs text-gray-400">• {rule.department}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{rule.parameterName}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                          rule.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        {rule.isActive ? "Active Rule" : "Paused"}
                      </button>
                    </div>
                  </div>

                  {/* Rules summary tokens */}
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-gray-400 block text-[10px] font-semibold">1. NORMAL RANGE</span>
                      <span className="font-mono font-bold text-gray-800">
                        {rule.normalMin} - {rule.normalMax}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-gray-400 block text-[10px] font-semibold">2. DELTA CHECK</span>
                      <span className="font-mono font-bold text-gray-800">
                        {rule.deltaCheck ? `≤ ${rule.deltaPercentThreshold}% variance` : "Disabled"}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-gray-400 block text-[10px] font-semibold">3. CRITICAL PANIC ALERT</span>
                      <span className="font-mono font-bold text-rose-700">
                        &lt; {rule.criticalLowThreshold} or &gt; {rule.criticalHighThreshold}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Rule Sub-form */}
          {activeTab === "rules" && showAddRule && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h4 className="font-bold text-gray-900 text-sm">Configure Auto-Validation Rule</h4>
                <button
                  onClick={() => setShowAddRule(false)}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rule Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Pediatric Bilirubin Auto-Check"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                  <select
                    value={newRule.department}
                    onChange={(e) => setNewRule({ ...newRule, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Coagulation">Coagulation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Parameter Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. TBIL"
                    value={newRule.parameterCode}
                    onChange={(e) => setNewRule({ ...newRule, parameterCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Parameter Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Total Bilirubin"
                    value={newRule.parameterName}
                    onChange={(e) => setNewRule({ ...newRule, parameterName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Normal Range Minimum</label>
                  <input
                    type="number"
                    value={newRule.normalMin}
                    onChange={(e) => setNewRule({ ...newRule, normalMin: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Normal Range Maximum</label>
                  <input
                    type="number"
                    value={newRule.normalMax}
                    onChange={(e) => setNewRule({ ...newRule, normalMax: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Critical Panic Low Cutoff</label>
                  <input
                    type="number"
                    value={newRule.criticalLowThreshold}
                    onChange={(e) => setNewRule({ ...newRule, criticalLowThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Critical Panic High Cutoff</label>
                  <input
                    type="number"
                    value={newRule.criticalHighThreshold}
                    onChange={(e) => setNewRule({ ...newRule, criticalHighThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddRule(false)}
                  className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRule}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Save & Enable Rule
                </button>
              </div>
            </div>
          )}

          {/* AUDIT TRAIL TAB */}
          {activeTab === "audit" && (
            <div className="space-y-3">
              {auditLog.map((rec) => (
                <div key={rec.id} className="p-3.5 bg-white border border-gray-200 rounded-xl text-xs space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {rec.barcode}
                      </span>
                      <span className="font-semibold text-gray-900">{rec.patientName} ({rec.patientUhid})</span>
                    </div>

                    <span className="text-[11px] font-mono text-gray-400">
                      {rec.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <p className="font-medium text-gray-800">{rec.testName}</p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      {rec.decision === "AUTO_APPROVED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Auto-Approved
                        </span>
                      )}
                      {rec.decision === "FLAGGED_FOR_REVIEW" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Flagged for Review
                        </span>
                      )}
                      {rec.decision === "MANUALLY_RELEASED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          <User className="w-3 h-3" /> {rec.reviewedBy}
                        </span>
                      )}
                      <span className="text-gray-500 text-[11px]">• {rec.reason}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Rules execute in real-time on all incoming raw result packets.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-semibold hover:bg-gray-900 transition-colors"
          >
            Close Engine
          </button>
        </div>
      </div>
    </div>
  );
}
