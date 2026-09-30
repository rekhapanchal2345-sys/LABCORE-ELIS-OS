"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Activity, Clock3, AlertTriangle, Printer, Loader2, 
  MapPin, ShieldCheck, UserCheck, FlaskConical, ScanLine, 
  History, Calendar, Hash, Droplet, UserRound, ArrowRight
} from "lucide-react";
import { sampleApi } from "@/lib/api";

interface SampleDetailsProps {
  sample: any;
  onRefresh?: () => void;
}

export default function SampleDetails({
  sample,
  onRefresh
}: SampleDetailsProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: 'collect' | 'receive' | 'process' | 'complete', data: any = {}) => {
    try {
      setUpdating(true);
      setError(null);
      if (action === 'collect') await sampleApi.collect(sample.id, data);
      if (action === 'receive') await sampleApi.receive(sample.id, data);
      if (action === 'process') await sampleApi.process(sample.id, data.location || "Processing Lab");
      if (action === 'complete') await sampleApi.complete(sample.id, data.location || "Processing Lab");
      
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${action} sample.`);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "PROCESSING": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "RECEIVED": return "bg-teal-500/20 text-teal-400 border-teal-500/50";
      case "COLLECTED": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/50";
      case "PENDING": return "bg-amber-500/20 text-amber-400 border-amber-500/50";
      case "REJECTED": return "bg-rose-500/20 text-rose-400 border-rose-500/50";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/50";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "STAT": return "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
      case "URGENT": return "bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/50";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString('en-US', { 
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const workflowSteps = [
    { key: "PENDING", label: "Pending", icon: Clock3 },
    { key: "COLLECTED", label: "Collected", icon: Droplet },
    { key: "RECEIVED", label: "Received", icon: MapPin },
    { key: "PROCESSING", label: "Processing", icon: Activity },
    { key: "COMPLETED", label: "Completed", icon: ShieldCheck },
  ];

  const currentStepIndex = workflowSteps.findIndex(s => s.key === sample.status);
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : (sample.status === "REJECTED" ? -1 : 0);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-400">
          <AlertTriangle className="mr-2 inline h-4 w-4" /> {error}
        </div>
      )}

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-300 ring-1 ring-indigo-400/50 shadow-xl backdrop-blur-md">
              <FlaskConical className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-white">{sample.sampleNumber || `SMP-${sample.id}`}</h1>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur-md ${getStatusColor(sample.status)}`}>
                  {sample.status}
                </span>
                {sample.priority && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur-md ${getPriorityColor(sample.priority)}`}>
                    {sample.priority}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><Hash className="h-4 w-4 text-indigo-400" /> ID: {sample.id}</span>
                <span className="flex items-center gap-1.5"><ScanLine className="h-4 w-4 text-cyan-400" /> Barcode: {sample.barcode || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.open(`/samples/${sample.id}/label`, '_blank')}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-400/20 hover:shadow-lg hover:shadow-cyan-900/40 backdrop-blur-sm"
            >
              <Printer className="h-4 w-4" /> Print Label
            </button>
            <button
              onClick={() => window.open(`/samples/${sample.id}/collection-sheet`, '_blank')}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-2.5 text-xs font-bold text-violet-300 transition-all hover:bg-violet-400/20 hover:shadow-lg hover:shadow-violet-900/40 backdrop-blur-sm"
            >
              <Printer className="h-4 w-4" /> Collection Sheet
            </button>
          </div>
        </div>

        {/* Chain of Custody Tracker */}
        <div className="relative mt-10 rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
          <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Activity className="h-4 w-4 text-indigo-400" /> Lifecycle Tracker
          </h3>
          <div className="relative flex justify-between">
            <div className="absolute left-6 right-6 top-5 h-1 -translate-y-1/2 bg-slate-800 rounded-full" />
            <div 
              className="absolute left-6 top-5 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000" 
              style={{ width: `${Math.max(0, activeStep) * 25}%` }} 
            />
            
            {workflowSteps.map((step, idx) => {
              const isActive = idx <= activeStep;
              const isCurrent = idx === activeStep;
              const Icon = step.icon;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${isActive ? "border-cyan-400 bg-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "border-slate-700 bg-slate-900"}`}>
                    <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-600"}`} />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isCurrent ? "text-cyan-300" : isActive ? "text-slate-300" : "text-slate-600"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Specimen Info */}
        <div className="rounded-3xl border border-indigo-200/60 bg-white p-6 shadow-xl shadow-indigo-100/50">
          <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-800">
            <FlaskConical className="h-5 w-5 text-indigo-600" /> Specimen Details
          </h2>
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Test Required</p>
              <p className="mt-1 font-semibold text-slate-900">{sample.test?.testName || "Unknown Test"}</p>
              <p className="text-xs font-medium text-slate-500">{sample.test?.testCode}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Specimen Type</p>
              <p className="mt-1 font-semibold text-slate-900">{sample.sampleType || sample.test?.sampleType || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Container</p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                <Droplet className="h-3 w-3" /> {sample.test?.sampleContainer || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Patient & Order Info */}
        <div className="rounded-3xl border border-violet-200/60 bg-white p-6 shadow-xl shadow-violet-100/50">
          <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-800">
            <UserRound className="h-5 w-5 text-violet-600" /> Patient & Order
          </h2>
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Patient</p>
              <p className="mt-1 font-semibold text-slate-900">
                {sample.order?.patient ? `${sample.order.patient.firstName} ${sample.order.patient.lastName}` : "—"}
              </p>
              <p className="text-xs font-medium text-slate-500">
                UHID: {sample.order?.patient?.uhid || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Information</p>
              <p className="mt-1 font-semibold text-slate-900">{sample.order?.orderNumber || "—"}</p>
            </div>
            <div className="flex gap-2">
               {sample.order?.patient?.id && (
                <Link href={`/patients/${sample.order.patient.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                  View Patient
                </Link>
               )}
               {sample.order?.id && (
                <Link href={`/orders/${sample.order.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                  View Order
                </Link>
               )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="rounded-3xl border border-cyan-200/60 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-white shadow-xl shadow-cyan-900/20">
          <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-cyan-400">
            <Activity className="h-5 w-5" /> Operational Workflow
          </h2>
          
          <div className="space-y-3">
            {sample.status === "PENDING" && (
              <button
                onClick={() => handleAction('collect', { 
                  barcode: sample.barcode || `AUTO-${sample.id.slice(0, 8)}`,
                  collectionType: "WALK_IN",
                  priority: "ROUTINE",
                  location: "Phlebotomy Desk"
                })}
                disabled={updating}
                className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-4 font-bold shadow-lg shadow-cyan-500/30 transition-all hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50"
              >
                <span className="flex items-center gap-2"><Droplet className="h-5 w-5" /> Mark as Collected</span>
                {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
              </button>
            )}
            
            {sample.status === "COLLECTED" && (
              <button
                onClick={() => handleAction('receive', { notes: "Received via manual action", location: "Lab Reception" })}
                disabled={updating}
                className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 font-bold shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50"
              >
                <span className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Receive Specimen</span>
                {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
              </button>
            )}

            {sample.status === "RECEIVED" && (
              <button
                onClick={() => handleAction('process', { location: "Main Processing Lab" })}
                disabled={updating}
                className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4 font-bold shadow-lg shadow-blue-500/30 transition-all hover:from-blue-400 hover:to-indigo-400 disabled:opacity-50"
              >
                <span className="flex items-center gap-2"><Activity className="h-5 w-5" /> Start Processing</span>
                {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
              </button>
            )}

            {sample.status === "PROCESSING" && (
              <button
                onClick={() => handleAction('complete', { location: "Main Processing Lab" })}
                disabled={updating}
                className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-4 font-bold shadow-lg shadow-violet-500/30 transition-all hover:from-violet-400 hover:to-purple-400 disabled:opacity-50"
              >
                <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Complete Processing</span>
                {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
              </button>
            )}

            {sample.status === "COMPLETED" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center text-emerald-400">
                <ShieldCheck className="mx-auto mb-2 h-8 w-8" />
                <p className="font-bold">Processing Complete</p>
                <p className="mt-1 text-xs text-emerald-400/80">Ready for results entry and validation.</p>
              </div>
            )}

            {sample.status === "REJECTED" && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-center text-rose-400">
                <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
                <p className="font-bold">Sample Rejected</p>
                <p className="mt-1 text-xs text-rose-400/80">Reason: {sample.rejectionReason || "Unknown"}</p>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Created</span>
              <span>{formatDate(sample.createdAt)}</span>
            </div>
            {sample.collectedAt && (
              <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Collected</span>
                <span>{formatDate(sample.collectedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}