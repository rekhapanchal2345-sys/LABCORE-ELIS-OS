"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Beaker,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  FlaskConical,
  Gauge,
  Layers3,
  Microscope,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TestTube2,
  Timer,
  Waves,
} from "lucide-react";
import type { Analyzer } from "@/types";

interface HematologyWorkbenchProps {
  analyzers: Analyzer[];
  onOpenMappings?: () => void;
}

const instrumentFamilies = [
  {
    name: "Sysmex XN-Series",
    shortName: "XN",
    vendor: "Sysmex",
    focus: "High-throughput 5-part differential",
    accent: "from-cyan-500 to-blue-600",
    badge: "Premium",
  },
  {
    name: "Sysmex XQ-Series",
    shortName: "XQ",
    vendor: "Sysmex",
    focus: "Compact 3-part differential",
    accent: "from-blue-500 to-indigo-600",
    badge: "Compact",
  },
  {
    name: "Beckman Coulter DxH Series",
    shortName: "DxH",
    vendor: "Beckman Coulter",
    focus: "Integrated hematology workflow",
    accent: "from-violet-500 to-fuchsia-600",
    badge: "Integrated",
  },
  {
    name: "Mindray BC-Series",
    shortName: "BC",
    vendor: "Mindray",
    focus: "Scalable CBC and differential",
    accent: "from-emerald-500 to-teal-600",
    badge: "Scalable",
  },
  {
    name: "HORIBA Yumizen",
    shortName: "YZ",
    vendor: "HORIBA",
    focus: "Reliable routine cell analysis",
    accent: "from-amber-500 to-orange-600",
    badge: "Routine",
  },
  {
    name: "Abbott CELL-DYN",
    shortName: "CD",
    vendor: "Abbott",
    focus: "Clinical hematology platform",
    accent: "from-rose-500 to-red-600",
    badge: "Clinical",
  },
  {
    name: "Siemens ADVIA",
    shortName: "AD",
    vendor: "Siemens",
    focus: "Advanced morphology and CBC",
    accent: "from-slate-500 to-slate-700",
    badge: "Advanced",
  },
];

const testGroups = [
  {
    label: "Core CBC",
    icon: TestTube2,
    tests: ["CBC", "Hb", "RBC", "WBC", "Platelets"],
    tone: "blue",
  },
  {
    label: "RBC indices",
    icon: CircleDot,
    tests: ["MCV", "MCH", "MCHC", "RDW"],
    tone: "violet",
  },
  {
    label: "Differential",
    icon: Layers3,
    tests: ["Neutrophils", "Lymphocytes", "Monocytes", "Eosinophils", "Basophils"],
    tone: "emerald",
  },
  {
    label: "Advanced flags",
    icon: Waves,
    tests: ["NRBC", "IG", "Reticulocytes", "Immature Platelet", "Morphology"],
    tone: "amber",
  },
];

const toneStyles: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50/70 text-blue-700",
  violet: "border-violet-200 bg-violet-50/70 text-violet-700",
  emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
  amber: "border-amber-200 bg-amber-50/70 text-amber-700",
};

export default function HematologyWorkbench({
  analyzers,
  onOpenMappings,
}: HematologyWorkbenchProps) {
  const [selectedFamily, setSelectedFamily] = useState("Sysmex XN-Series");
  const [activePanel, setActivePanel] = useState<"overview" | "tests">("overview");

  const hematologyAnalyzers = useMemo(
    () =>
      analyzers.filter((analyzer) => {
        const text = `${analyzer.name || ""} ${analyzer.manufacturer || ""} ${
          analyzer.model || ""
        } ${analyzer.analyzerType || ""}`.toLowerCase();
        return [
          "sysmex",
          "beckman",
          "mindray",
          "horiba",
          "cell-dyn",
          "cell dyn",
          "advia",
          "hemat",
        ].some((term) => text.includes(term));
      }),
    [analyzers]
  );

  const online = hematologyAnalyzers.filter(
    (analyzer) => analyzer.status === "ONLINE"
  ).length;
  const selected = instrumentFamilies.find(
    (family) => family.name === selectedFamily
  ) || instrumentFamilies[0];
  const selectedFleet = hematologyAnalyzers.filter((analyzer) => {
    const text = `${analyzer.name || ""} ${analyzer.manufacturer || ""} ${
      analyzer.model || ""
    }`.toLowerCase();
    return text.includes(selected.vendor.toLowerCase()) ||
      text.includes(selected.shortName.toLowerCase());
  });
  const selectedOnline = selectedFleet.filter(
    (analyzer) => analyzer.status === "ONLINE"
  ).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_80%_0%,#1d4ed8_0%,transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_60%,#172554_100%)] px-5 py-6 text-white sm:px-7">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              <Microscope className="h-4 w-4" />
              Hematology Intelligence Suite
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              CBC & Hematology Operations
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Unified control for high-throughput CBC instruments, parameter
              mapping, morphology flags, and quality-first result release.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Fleet", hematologyAnalyzers.length || "—"],
              ["Online", online || "—"],
              ["Parameters", "24+"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="min-w-[76px] rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center backdrop-blur"
              >
                <div className="text-lg font-bold">{value}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-400">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {[
            ["overview", "Fleet overview"],
            ["tests", "CBC parameter library"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivePanel(key as "overview" | "tests")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                activePanel === key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-emerald-300 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Interface quality monitoring enabled
          </span>
        </div>
      </div>

      {activePanel === "overview" ? (
        <div className="p-5 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Supported instrument ecosystem</h3>
              <p className="mt-1 text-xs text-slate-500">
                Select a family to view its workflow profile and integration readiness.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenMappings}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Configure mappings
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {instrumentFamilies.map((family) => {
              const active = family.name === selectedFamily;
              const familyCount = hematologyAnalyzers.filter((analyzer) => {
                const text = `${analyzer.name || ""} ${analyzer.manufacturer || ""} ${
                  analyzer.model || ""
                }`.toLowerCase();
                return text.includes(family.vendor.toLowerCase()) ||
                  text.includes(family.shortName.toLowerCase());
              }).length;
              return (
                <button
                  type="button"
                  key={family.name}
                  onClick={() => setSelectedFamily(family.name)}
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-blue-400 bg-blue-50/60 shadow-md shadow-blue-100"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  }`}
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${family.accent} text-xs font-black text-white shadow-lg ring-4 ring-white ${active ? "ring-blue-100" : ""}`}>
                    {family.shortName}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{family.name}</h4>
                      <p className="mt-1 text-[11px] leading-4 text-slate-500">{family.focus}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${active ? "text-blue-600" : "text-slate-300"}`} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {family.badge}
                    </span>
                    <span className={`text-[10px] font-bold ${familyCount ? "text-emerald-600" : "text-slate-400"}`}>
                      {familyCount ? `${familyCount} configured` : "Ready to configure"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-200/40 blur-2xl" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                    Selected platform
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{selected.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{selected.focus}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-2 shadow-sm ring-1 ring-blue-100">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="relative mt-5 flex items-center gap-3 rounded-xl border border-white/80 bg-white/70 p-3">
                <div className="flex -space-x-2">
                  {selectedFleet.slice(0, 3).map((analyzer) => (
                    <span
                      key={String(analyzer.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-bold text-white"
                      title={analyzer.name}
                    >
                      {(analyzer.name || selected.shortName).slice(0, 2).toUpperCase()}
                    </span>
                  ))}
                  {selectedFleet.length === 0 && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-xs font-bold text-white">
                      {selected.shortName}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFleet.length ? `${selectedFleet.length} ${selected.vendor} interface${selectedFleet.length > 1 ? "s" : ""}` : "Platform profile ready"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {selectedFleet.length ? `${selectedOnline} online • mapping health monitored` : "Add an analyzer to activate live telemetry"}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {[
                  ["Protocol", "ASTM / HL7"],
                  ["Workflow", "Bidirectional"],
                  ["QC gate", "Westgard-ready"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white bg-white p-3">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
                    <div className="mt-1 text-xs font-bold text-slate-800">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="font-bold">Release safety controls</h3>
              </div>
              <div className="mt-4 space-y-3">
                {["Delta check", "Critical value hold", "Reference range validation", "Morphology flag review"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">CBC parameter library</h3>
              <p className="mt-1 text-xs text-slate-500">
                Standardized mapping catalog for hematology result ingestion and validation.
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 sm:flex">
              <Beaker className="h-4 w-4 text-blue-500" />
              Auto-map suggestions ready
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {testGroups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.label} className={`rounded-xl border p-4 ${toneStyles[group.tone]}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <h4 className="text-sm font-bold">{group.label}</h4>
                    <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold">{group.tests.length}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.tests.map((test) => (
                      <span key={test} className="rounded-lg border border-white/80 bg-white/75 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm">
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2 text-white"><FlaskConical className="h-4 w-4" /></div>
              <div>
                <p className="text-xs font-bold text-slate-900">Premium hematology mapping workflow</p>
                <p className="mt-1 text-[11px] text-slate-500">Normalize units, flags, reference ranges, and analyzer codes before release.</p>
              </div>
            </div>
            <button type="button" onClick={onOpenMappings} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700">
              Open mapping studio <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-4">
        {[
          [Gauge, "Throughput", "High capacity"],
          [Timer, "TAT monitor", "Real-time"],
          [Activity, "Flag engine", "Multi-rule"],
          [CheckCircle2, "QC status", "Ready"],
        ].map(([Icon, label, value]) => (
          <div key={label as string} className="flex items-center gap-2 bg-white px-4 py-3">
            <Icon className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{label as string}</p>
              <p className="text-xs font-bold text-slate-700">{value as string}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
