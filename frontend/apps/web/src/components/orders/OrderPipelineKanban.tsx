"use client";

import React from "react";
import {
  Clock,
  FlaskConical,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  UserRound,
  ScanLine,
  Flame,
  CreditCard,
  Printer,
  ArrowRight,
  MessageCircle,
  FileText
} from "lucide-react";
import { DrawerOrder } from "./OrderQuickDrawer";

interface OrderPipelineKanbanProps {
  orders: DrawerOrder[];
  onSelectOrder: (order: DrawerOrder) => void;
  onAdvanceStatus: (order: DrawerOrder, nextStatus: string) => void;
  onPrintBarcode: (order: DrawerOrder) => void;
  onWhatsApp: (order: DrawerOrder) => void;
  updatingOrderId: string | null;
}

export default function OrderPipelineKanban({
  orders,
  onSelectOrder,
  onAdvanceStatus,
  onPrintBarcode,
  onWhatsApp,
  updatingOrderId,
}: OrderPipelineKanbanProps) {
  const STAGES = [
    {
      id: "REGISTERED",
      title: "1. Registered Orders",
      sub: "Requisitions booked, awaiting draw",
      badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-300",
      accent: "from-amber-500/20 via-amber-500/5 to-transparent",
      icon: Clock,
      nextAction: "Collect Sample",
      nextStatus: "SAMPLE_COLLECTED",
    },
    {
      id: "SAMPLE_COLLECTED",
      title: "2. Sample Drawn",
      sub: "Specimen labeled & in-transit",
      badgeClass: "border-purple-500/40 bg-purple-500/10 text-purple-300",
      accent: "from-purple-500/20 via-purple-500/5 to-transparent",
      icon: FlaskConical,
      nextAction: "Send to Analyzer",
      nextStatus: "PROCESSING",
    },
    {
      id: "PROCESSING",
      title: "3. In-Analyzer Run",
      sub: "Diagnostic testing active",
      badgeClass: "border-blue-500/40 bg-blue-500/10 text-blue-300",
      accent: "from-blue-500/20 via-blue-500/5 to-transparent",
      icon: Activity,
      nextAction: "Complete & Validate",
      nextStatus: "COMPLETED",
    },
    {
      id: "COMPLETED",
      title: "4. Completed & Signed",
      sub: "Pathology verified, ready for report",
      badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
      accent: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      icon: CheckCircle2,
      nextAction: null,
      nextStatus: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {STAGES.map((stage) => {
        const stageOrders = orders.filter((o) => o.orderStatus === stage.id);
        const Icon = stage.icon;

        return (
          <div
            key={stage.id}
            className="flex flex-col rounded-3xl border border-slate-800/90 bg-slate-950/90 shadow-2xl backdrop-blur-xl"
          >
            {/* Column Header */}
            <div className={`rounded-t-3xl border-b border-slate-800/80 bg-gradient-to-b ${stage.accent} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-300" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                    {stage.title}
                  </h3>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-black shadow-sm ${stage.badgeClass}`}>
                  {stageOrders.length}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 font-medium">{stage.sub}</p>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 space-y-3 p-3 min-h-[500px] max-h-[75vh] overflow-y-auto custom-scrollbar">
              {stageOrders.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800/70 p-4 text-center text-slate-600">
                  <FileText className="h-6 w-6 stroke-[1.5] text-slate-700 mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No requisitions in this stage</p>
                </div>
              ) : (
                stageOrders.map((order) => {
                  const isStat = order.priority === "STAT" || order.priority === "URGENT";
                  const isPaid = order.paymentStatus === "PAID";
                  const isUpdating = updatingOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                        isStat
                          ? "border-rose-500/60 bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 shadow-lg shadow-rose-950/20"
                          : "border-slate-800/90 bg-slate-900/80 hover:border-slate-700"
                      }`}
                    >
                      {/* STAT Alert Header */}
                      {isStat && (
                        <div className="flex items-center justify-between bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 fill-white" /> {order.priority} PRIORITY
                          </span>
                          <span>EMERGENCY</span>
                        </div>
                      )}

                      <div className="p-3.5 space-y-3">
                        {/* Order Number & Patient */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <button
                              onClick={() => onSelectOrder(order)}
                              className="text-left font-mono text-xs font-black text-white hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                            >
                              {order.orderNumber}
                              <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            <p className="font-mono text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <ScanLine className="h-3 w-3 text-cyan-400/80" /> {order.barcode}
                            </p>
                          </div>

                          {/* Payment Pill */}
                          <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold ${
                            isPaid ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" :
                            order.paymentStatus === "PARTIAL" ? "border-amber-500/40 bg-amber-500/10 text-amber-300" :
                            "border-rose-500/40 bg-rose-500/10 text-rose-300"
                          }`}>
                            ₹{order.paidAmount}/{order.grandTotal}
                          </span>
                        </div>

                        {/* Patient Demographics */}
                        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 space-y-1">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                            <UserRound className="h-3.5 w-3.5 text-cyan-400" />
                            {order.patient.firstName} {order.patient.lastName}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>UHID: <span className="font-mono text-slate-300 font-semibold">{order.patient.uhid}</span></span>
                            <span>{order.patient.age || "—"}y · {order.patient.gender}</span>
                          </div>
                        </div>

                        {/* Test Panels Summary */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Ordered Tests ({order.items.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {order.items.slice(0, 3).map((item, i) => (
                              <span
                                key={i}
                                className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300 truncate max-w-[120px]"
                              >
                                {item.test.testCode || item.test.testName}
                              </span>
                            ))}
                            {order.items.length > 3 && (
                              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400 font-bold">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Doctor / Origin */}
                        <p className="text-[10px] text-slate-500 truncate">
                          Dr. {order.doctor?.fullName || "Self / Walk-in"}
                        </p>

                        {/* Bottom Actions */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                          {stage.nextAction && stage.nextStatus && (
                            <button
                              onClick={() => onAdvanceStatus(order, stage.nextStatus!)}
                              disabled={isUpdating}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-[11px] font-black text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all"
                            >
                              <span>{stage.nextAction}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onPrintBarcode(order)}
                            className="rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-[11px] font-bold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200 transition-colors"
                            title="Print Barcode Labels"
                          >
                            🏷️
                          </button>
                          <button
                            onClick={() => onWhatsApp(order)}
                            className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-2 text-[11px] font-bold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
                            title="Send WhatsApp Requisition"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
