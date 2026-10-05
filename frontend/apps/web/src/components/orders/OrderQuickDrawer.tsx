"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  UserRound,
  FileText,
  Clock,
  Clock3,
  Calendar,
  CreditCard,
  Printer,
  Share2,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  ScanLine,
  Building2,
  ExternalLink,
  DollarSign,
  Phone,
  ShieldCheck,
  Stethoscope,
  Activity,
  ArrowRight,
  Flame,
  MessageCircle,
  Copy,
  Receipt
} from "lucide-react";

export interface DrawerOrder {
  id: string;
  orderNumber: string;
  barcode: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    uhid: string;
    phone: string;
    gender: string;
    dateOfBirth?: string;
    age?: number;
    email?: string;
    address?: string;
  };
  doctor?: {
    id: string;
    doctorCode: string;
    fullName: string;
    specialization: string;
    clinicName?: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    test: {
      id: string;
      testCode: string;
      testName: string;
      sampleType: string;
      sampleContainer?: string;
      tatHours?: number;
      processingDepartment?: string;
    };
    price: number;
    finalPrice: number;
  }>;
  samples?: Array<{
    id: string;
    sampleNumber: string;
    barcode: string;
    sampleType: string;
    status: string;
    collectedAt?: string;
  }>;
  orderStatus: string;
  paymentStatus: string;
  priority?: string;
  collectionType?: string;
  createdAt: string;
  sampleCollected: boolean;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
}

interface OrderQuickDrawerProps {
  order: DrawerOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onCollectSample: (order: DrawerOrder) => void;
  onAddPayment: (order: DrawerOrder) => void;
  onAssignDoctor: (order: DrawerOrder) => void;
  onCancelOrder: (order: DrawerOrder) => void;
  onWhatsApp: (order: DrawerOrder) => void;
  onPrintBarcode: (order: DrawerOrder) => void;
  onPrintInvoice: (order: DrawerOrder) => void;
}

const TUBE_CONTAINER_COLORS: Record<string, { bg: string; text: string; border: string; capColor: string; name: string }> = {
  "EDTA Tube": { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/40", capColor: "#8B5CF6", name: "Lavender EDTA" },
  "Lavender Top": { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/40", capColor: "#8B5CF6", name: "Lavender EDTA" },
  "Serum Separator Tube": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/40", capColor: "#F59E0B", name: "Gold SST Gel" },
  "SST": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/40", capColor: "#F59E0B", name: "Gold SST Gel" },
  "Red Top": { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/40", capColor: "#EF4444", name: "Red Plain" },
  "Sodium Citrate": { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/40", capColor: "#0284C7", name: "Light Blue Citrate" },
  "Light Blue": { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/40", capColor: "#0284C7", name: "Light Blue Citrate" },
  "Lithium Heparin": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/40", capColor: "#10B981", name: "Green Heparin" },
  "Green Top": { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/40", capColor: "#10B981", name: "Green Heparin" },
  "Fluoride Tube": { bg: "bg-slate-500/10", text: "text-slate-300", border: "border-slate-500/40", capColor: "#64748B", name: "Grey Fluoride" },
  "Grey Top": { bg: "bg-slate-500/10", text: "text-slate-300", border: "border-slate-500/40", capColor: "#64748B", name: "Grey Fluoride" },
  "Sterile Container": { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/40", capColor: "#EAB308", name: "Urine Sterile Cup" },
};

function getContainerStyle(containerName?: string) {
  if (!containerName) return { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/40", capColor: "#06B6D4", name: "Standard Specimen" };
  for (const [key, val] of Object.entries(TUBE_CONTAINER_COLORS)) {
    if (containerName.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/40", capColor: "#06B6D4", name: containerName };
}

export default function OrderQuickDrawer({
  order,
  isOpen,
  onClose,
  onCollectSample,
  onAddPayment,
  onAssignDoctor,
  onCancelOrder,
  onWhatsApp,
  onPrintBarcode,
  onPrintInvoice,
}: OrderQuickDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tests" | "billing" | "timeline">("overview");

  if (!isOpen || !order) return null;

  const isStat = order.priority === "STAT" || order.priority === "URGENT";
  const isPaid = order.paymentStatus === "PAID";
  const isPartial = order.paymentStatus === "PARTIAL";

  const workflowSteps = [
    { key: "REGISTERED", label: "Registered" },
    { key: "SAMPLE_COLLECTED", label: "Sample Drawn" },
    { key: "PROCESSING", label: "In-Analyzer" },
    { key: "COMPLETED", label: "Validated & Complete" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "REGISTERED": return 0;
      case "SAMPLE_COLLECTED": return 1;
      case "PROCESSING": return 2;
      case "COMPLETED": return 3;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(order.orderStatus);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-md transition-all duration-300">
      <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-slate-800 bg-slate-950 text-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-0.5 font-mono text-[11px] font-bold text-cyan-300">
                  {order.orderNumber}
                </span>
                {isStat && (
                  <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-lg shadow-rose-900/50 flex items-center gap-1">
                    <Flame className="h-3 w-3 fill-white" /> {order.priority}
                  </span>
                )}
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${
                  order.orderStatus === "COMPLETED" ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300" :
                  order.orderStatus === "PROCESSING" ? "border-blue-500/40 bg-blue-500/20 text-blue-300" :
                  order.orderStatus === "SAMPLE_COLLECTED" ? "border-purple-500/40 bg-purple-500/20 text-purple-300" :
                  order.orderStatus === "CANCELLED" ? "border-rose-500/40 bg-rose-500/20 text-rose-300" :
                  "border-amber-500/40 bg-amber-500/20 text-amber-300"
                }`}>
                  {order.orderStatus.replace("_", " ")}
                </span>
              </div>

              <h2 className="text-xl font-black text-white flex items-center gap-2">
                {order.patient.firstName} {order.patient.lastName}
                <span className="text-xs font-mono font-normal text-slate-400">({order.patient.uhid})</span>
              </h2>
              <p className="font-mono text-xs text-slate-400 flex items-center gap-2">
                <ScanLine className="h-3.5 w-3.5 text-cyan-400" /> Barcode: {order.barcode} · {order.items.length} Test Panel(s)
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Lifecycle Progress Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
              <span>Requisition Milestone</span>
              <span className="text-cyan-300">{workflowSteps[currentStep]?.label || order.orderStatus}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {workflowSteps.map((step, idx) => (
                <div
                  key={step.key}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx <= currentStep
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_#06B6D4]"
                      : "bg-slate-800"
                  }`}
                  title={step.label}
                />
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-t border-slate-800/80 pt-4 mt-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`rounded-xl px-4 py-2 transition-all ${
                activeTab === "overview"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("tests")}
              className={`rounded-xl px-4 py-2 transition-all ${
                activeTab === "tests"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              Test Panels ({order.items.length})
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`rounded-xl px-4 py-2 transition-all ${
                activeTab === "billing"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              Billing &amp; Ledger
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`rounded-xl px-4 py-2 transition-all ${
                activeTab === "timeline"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              Audit Trail
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Patient Profile Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                    <UserRound className="h-4 w-4" /> Patient Demographics
                  </div>
                  <Link
                    href={`/patients/${order.patient.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-cyan-300"
                  >
                    Patient Profile <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Full Name</p>
                    <p className="font-bold text-slate-100 text-sm mt-0.5">
                      {order.patient.firstName} {order.patient.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">UHID / Medical Record #</p>
                    <p className="font-mono font-bold text-cyan-300 text-sm mt-0.5">{order.patient.uhid}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Phone &amp; Contact</p>
                    <p className="font-semibold text-slate-300 mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-500" /> {order.patient.phone || "No phone recorded"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Age &amp; Gender</p>
                    <p className="font-semibold text-slate-300 mt-0.5">
                      {order.patient.age || "—"} Years · {order.patient.gender}
                    </p>
                  </div>
                </div>
              </div>

              {/* Referring Clinician */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
                    <Stethoscope className="h-4 w-4" /> Referring Clinician / Hospital Ward
                  </div>
                  <button
                    onClick={() => onAssignDoctor(order)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    {order.doctor ? "Change Doctor" : "Assign Doctor"}
                  </button>
                </div>
                {order.doctor ? (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">Doctor Name</p>
                      <p className="font-bold text-slate-100 text-sm mt-0.5">{order.doctor.fullName}</p>
                      <p className="text-[11px] text-slate-400">{order.doctor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">Doctor Code / Clinic</p>
                      <p className="font-mono font-bold text-violet-300 mt-0.5">{order.doctor.doctorCode}</p>
                      <p className="text-[11px] text-slate-400">{order.doctor.clinicName || "Central OPD"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-800 p-3 text-center text-xs text-slate-500">
                    Self / Walk-in Requisition (No referring doctor assigned)
                  </div>
                )}
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Phlebotomy Draw Status</span>
                  <p className="font-bold text-sm text-slate-200">
                    {order.sampleCollected ? "Samples Collected" : "Pending Phlebotomy Draw"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {order.collectionType === "HOME_COLLECTION" ? "Home Sample Collection" : "Walk-in Lab Phlebotomy"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Financial Clearance</span>
                  <p className={`font-bold text-sm ${isPaid ? "text-emerald-400" : isPartial ? "text-amber-400" : "text-rose-400"}`}>
                    ₹{order.paidAmount} / ₹{order.grandTotal} ({order.paymentStatus})
                  </p>
                  {order.dueAmount > 0 && (
                    <p className="text-[11px] text-rose-400 font-bold">₹{order.dueAmount} Balance Due</p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => onPrintBarcode(order)}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-cyan-500/40 bg-cyan-950/40 p-3 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 transition-colors"
                >
                  <Printer className="h-4 w-4" /> Barcode Labels
                </button>
                <button
                  onClick={() => onPrintInvoice(order)}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-indigo-500/40 bg-indigo-950/40 p-3 text-xs font-bold text-indigo-300 hover:bg-indigo-900/50 transition-colors"
                >
                  <Receipt className="h-4 w-4" /> Receipt / Invoice
                </button>
                <button
                  onClick={() => onWhatsApp(order)}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </button>
              </div>
            </>
          )}

          {activeTab === "tests" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Prescribed Test Panels &amp; Specimen Containers
              </h3>
              {order.items.map((item, idx) => {
                const tube = getContainerStyle(item.test.sampleContainer);
                return (
                  <div
                    key={item.id || idx}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5 transition-all hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-100 text-sm">{item.test.testName}</h4>
                          <span className="font-mono text-[10px] font-bold bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-md">
                            {item.test.testCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.test.processingDepartment || "Central Core Laboratory"} · Matrix: {item.test.sampleType}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-100">₹{item.finalPrice || item.price}</span>
                        {item.test.tatHours && (
                          <p className="text-[10px] text-slate-500 font-mono">TAT: {item.test.tatHours}h</p>
                        )}
                      </div>
                    </div>

                    {/* Container Badge */}
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                      <div
                        className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold shadow-sm"
                        style={{
                          borderColor: `${tube.capColor}55`,
                          backgroundColor: `${tube.capColor}15`,
                          color: tube.capColor,
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full shadow-inner"
                          style={{ backgroundColor: tube.capColor }}
                        />
                        <span>{item.test.sampleContainer || "Standard Specimen Tube"}</span>
                      </div>

                      <span className="text-[10px] text-slate-400">
                        {item.test.sampleType === "BLOOD" ? "Room Temp · Invert 8-10x" : "Standard Handling"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <h3 className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Financial Breakdown &amp; Payment Ledger
                </h3>

                <div className="space-y-2 border-b border-slate-800 pb-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Tests Subtotal ({order.items.length} panels)</span>
                    <span className="font-mono font-bold text-slate-200">₹{order.grandTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Discount Applied</span>
                    <span className="font-mono font-bold text-emerald-400">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST / Healthcare Tax (0%)</span>
                    <span className="font-mono font-bold text-slate-200">₹0.00</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm font-bold text-white pt-1">
                  <span>Grand Total</span>
                  <span className="font-mono text-base text-cyan-300">₹{order.grandTotal}</span>
                </div>

                <div className="flex justify-between text-xs font-bold text-emerald-400">
                  <span>Amount Paid</span>
                  <span className="font-mono">₹{order.paidAmount}</span>
                </div>

                <div className="flex justify-between text-xs font-bold text-rose-400">
                  <span>Balance Due</span>
                  <span className="font-mono">₹{order.dueAmount}</span>
                </div>
              </div>

              {order.dueAmount > 0 && (
                <button
                  onClick={() => onAddPayment(order)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3.5 text-sm font-black text-white shadow-xl shadow-emerald-950/40 hover:from-emerald-400 hover:to-teal-500 transition-all"
                >
                  <DollarSign className="h-4 w-4" /> Record Payment / Settle ₹{order.dueAmount}
                </button>
              )}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Order Lifecycle History
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 text-xs">
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
                  <p className="font-bold text-slate-200">Requisition Order Registered</p>
                  <p className="text-[10px] text-slate-500">Order #{order.orderNumber} initiated in LIS</p>
                  <span className="text-[9px] font-mono text-slate-400">{new Date(order.createdAt).toLocaleString()}</span>
                </div>

                {order.sampleCollected && (
                  <div className="relative">
                    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-purple-400 shadow-[0_0_8px_#A855F7]" />
                    <p className="font-bold text-slate-200">Specimen Phlebotomy Draw Completed</p>
                    <p className="text-[10px] text-slate-500">Sample barcode #{order.barcode} labeled</p>
                  </div>
                )}

                {order.orderStatus === "PROCESSING" && (
                  <div className="relative">
                    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-blue-400 shadow-[0_0_8px_#3B82F6]" />
                    <p className="font-bold text-slate-200">Diagnostic Analyzer Run in Progress</p>
                    <p className="text-[10px] text-slate-500">Loaded on central laboratory analyzers</p>
                  </div>
                )}

                {order.orderStatus === "COMPLETED" && (
                  <div className="relative">
                    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                    <p className="font-bold text-slate-200">Test Completed &amp; Pathology Signed</p>
                    <p className="text-[10px] text-slate-500">Final diagnostic report ready for delivery</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="border-t border-slate-800 bg-slate-950 p-5 flex items-center justify-between gap-3">
          <button
            onClick={() => onCancelOrder(order)}
            className="rounded-2xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs font-bold text-rose-300 hover:bg-rose-900/50 transition-colors"
          >
            Cancel Requisition
          </button>

          {!order.sampleCollected ? (
            <button
              onClick={() => onCollectSample(order)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <FlaskConical className="h-4 w-4" />
              <span>Phlebotomy Sample Draw</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={`/orders/${order.id}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-indigo-950/40 hover:from-indigo-400 hover:to-purple-500 transition-all"
            >
              <span>Full Order Dossier</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
