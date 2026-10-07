"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { orderApi, paymentsApi } from "@/lib/api";
import {
  StatusBadge,
  PriorityBadge,
  PaymentProgressBar,
  TATIndicator,
  ToastContainer,
  useToast,
  OrderStatusType,
  OrderCommunicationHubModal,
  QuickAssignDoctorModal,
  QuickCollectSampleModal,
  AddPaymentModal,
  CancelOrderModal,
} from "@/components/orders/orders-ui";
import {
  ArrowLeft,
  Printer,
  FileText,
  FlaskConical,
  Clock,
  User,
  Stethoscope,
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Share2,
  Mail,
  MessageSquare,
  DollarSign,
  Receipt,
  ScanLine,
  UserRound,
  ShieldCheck,
  Building2,
  Phone,
  Flame,
  MessageCircle,
  Activity,
  ArrowRight,
  Loader2
} from "lucide-react";

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

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const { toasts, showToast, removeToast } = useToast();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);

  // Modals
  const [modalType, setModalType] = useState<"assignDoctor" | "collectSample" | "addPayment" | "cancelOrder" | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getById(orderId);
      if (response && (response.success || response.data)) {
        setOrder(response.data?.order || response.data);
      } else {
        setError(response?.message || "Order not found");
      }
    } catch (err: any) {
      console.error("Error loading order:", err);
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderStatusType) => {
    if (!order) return;
    setUpdating(true);
    try {
      await orderApi.update(order.id, { orderStatus: newStatus });
      setOrder({ ...order, orderStatus: newStatus });
      showToast(`Order status updated to ${newStatus}`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update order status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const isStat = order?.priority === "STAT" || order?.priority === "URGENT";
  const isPaid = order?.paymentStatus === "PAID";
  const isPartial = order?.paymentStatus === "PARTIAL";

  return (
    <ProtectedRoute>
      <DashboardLayout title={`Order ${order?.orderNumber || orderId}`}>
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <div className="space-y-6 pb-12">
          {/* Header Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <Link
                href="/orders"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 shadow-md transition-all hover:bg-slate-800 hover:text-white hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white">
                    {order?.orderNumber || "Clinical Requisition"}
                  </h1>
                  {isStat && (
                    <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-md flex items-center gap-1">
                      <Flame className="h-3 w-3 fill-white" /> {order.priority}
                    </span>
                  )}
                  {order?.orderStatus && (
                    <StatusBadge status={order.orderStatus as any} />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                  <ScanLine className="h-3.5 w-3.5 text-cyan-400" /> Barcode: {order?.barcode || "—"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => window.open(`/orders/${orderId}/barcode`, "_blank")}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-cyan-500/40 bg-cyan-950/40 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 transition-all"
              >
                <Printer className="h-4 w-4" /> Barcode Labels
              </button>
              <button
                onClick={() => window.open(`/orders/${orderId}/invoice`, "_blank")}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-indigo-500/40 bg-indigo-950/40 px-4 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900/50 transition-all"
              >
                <Receipt className="h-4 w-4" /> Tax Invoice
              </button>
              <button
                onClick={() => setShowCommunicationModal(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition-all"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Receipt
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-72 flex-col items-center justify-center space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
              <p className="text-sm font-bold text-slate-300">Retrieving patient requisition dossier...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-500/40 bg-rose-950/30 p-8 text-center shadow-2xl">
              <h3 className="text-lg font-black text-rose-200">Requisition Not Found</h3>
              <p className="mt-2 text-xs text-rose-300/80">{error}</p>
              <button
                onClick={() => router.push("/orders")}
                className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-black text-slate-950 shadow-lg"
              >
                Return to Orders
              </button>
            </div>
          ) : order ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left 2 Cols: Main Dossier */}
              <div className="space-y-6 lg:col-span-2">
                {/* Patient Demographics & Doctor */}
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                      <UserRound className="h-4 w-4" /> Patient &amp; Requisition Profile
                    </div>
                    <Link
                      href={`/patients/${order.patient?.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-cyan-300"
                    >
                      Patient Record <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500">Patient Full Name</p>
                      <p className="text-base font-black text-slate-100 mt-0.5">
                        {order.patient?.firstName} {order.patient?.lastName}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {order.patient?.gender} · {order.patient?.age || "—"} Years · Phone: {order.patient?.phone || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500">UHID / Patient ID</p>
                      <p className="font-mono text-base font-black text-cyan-300 mt-0.5">
                        {order.patient?.uhid}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Booked: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="sm:col-span-2 border-t border-slate-800/80 pt-3">
                      <p className="text-[10px] font-bold uppercase text-slate-500">Referring Clinician</p>
                      <div className="mt-1 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-200">
                            Dr. {order.doctor?.fullName || "Self / Walk-in Registration"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {order.doctor?.specialization || "General Medicine"} · {order.doctor?.clinicName || "Central OPD"}
                          </p>
                        </div>
                        <button
                          onClick={() => setModalType("assignDoctor")}
                          className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-slate-700"
                        >
                          Change Doctor
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ordered Test Panels & Container Requirements */}
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                      <FlaskConical className="h-4 w-4" /> Ordered Test Panels &amp; Specimen Tubes ({order.items?.length || 0})
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Total: ₹{order.grandTotal}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {order.items?.map((item: any, idx: number) => {
                      const tube = getContainerStyle(item.test?.sampleContainer);
                      return (
                        <div
                          key={item.id || idx}
                          className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-2.5 transition-all hover:border-slate-700"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-100 text-sm">{item.test?.testName}</h4>
                                <span className="font-mono text-[10px] font-bold bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-md">
                                  {item.test?.testCode}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {item.test?.processingDepartment || "Core Laboratory"} · Specimen: {item.test?.sampleType}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="font-mono font-bold text-sm text-slate-100">
                                ₹{item.finalPrice || item.price}
                              </span>
                              {item.test?.tatHours && (
                                <p className="text-[10px] text-slate-500 font-mono">TAT: {item.test.tatHours}h</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                            <div
                              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold shadow-sm"
                              style={{
                                borderColor: `${tube.capColor}55`,
                                backgroundColor: `${tube.capColor}15`,
                                color: tube.capColor,
                              }}
                            >
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tube.capColor }} />
                              <span>{item.test?.sampleContainer || "Standard Specimen Tube"}</span>
                            </div>

                            <span className="text-[10px] text-slate-400">
                              {item.test?.sampleType === "BLOOD" ? "Room Temperature · Invert Gently" : "Standard SOP"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Financial Ledger & Workflow Stage */}
              <div className="space-y-6">
                {/* Financial Ledger Card */}
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-emerald-400">
                      <CreditCard className="h-4 w-4" /> Billing Ledger
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      isPaid ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                      isPartial ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                      "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="space-y-2.5 border-b border-slate-800 pb-4">
                    <div className="flex justify-between text-slate-400">
                      <span>Tests Subtotal</span>
                      <span className="font-mono font-bold text-slate-200">₹{order.grandTotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Discounts</span>
                      <span className="font-mono font-bold text-emerald-400">₹0.00</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>GST / Tax</span>
                      <span className="font-mono font-bold text-slate-200">₹0.00</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-base font-black text-white">
                    <span>Grand Total</span>
                    <span className="font-mono text-cyan-300">₹{order.grandTotal}</span>
                  </div>

                  <div className="flex justify-between font-bold text-emerald-400">
                    <span>Amount Paid</span>
                    <span className="font-mono">₹{order.paidAmount}</span>
                  </div>

                  <div className="flex justify-between font-bold text-rose-400">
                    <span>Balance Due</span>
                    <span className="font-mono">₹{order.dueAmount}</span>
                  </div>

                  {order.dueAmount > 0 && (
                    <button
                      onClick={() => setModalType("addPayment")}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3.5 text-xs font-black text-white shadow-xl shadow-emerald-950/50 hover:from-emerald-400 hover:to-teal-500 transition-all mt-3"
                    >
                      <DollarSign className="h-4 w-4" /> Settle Balance of ₹{order.dueAmount}
                    </button>
                  )}
                </div>

                {/* Workflow Operational Action Box */}
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Clinical Workflow Action
                  </h3>

                  {!order.sampleCollected ? (
                    <button
                      onClick={() => setModalType("collectSample")}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-4 text-sm font-black text-white shadow-xl hover:from-purple-400 hover:to-indigo-500 transition-all"
                    >
                      <FlaskConical className="h-4 w-4" />
                      <span>Phlebotomy Sample Draw</span>
                    </button>
                  ) : order.orderStatus === "SAMPLE_COLLECTED" ? (
                    <button
                      onClick={() => handleStatusChange("PROCESSING")}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-sm font-black text-slate-950 shadow-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
                    >
                      <span>Load on Diagnostic Analyzer</span>
                    </button>
                  ) : order.orderStatus === "PROCESSING" ? (
                    <button
                      onClick={() => handleStatusChange("COMPLETED")}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-sm font-black text-white shadow-xl hover:from-emerald-400 hover:to-teal-500 transition-all"
                    >
                      <span>Pathology Validation &amp; Sign-off</span>
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
                      <ShieldCheck className="h-5 w-5" /> Requisition Completed &amp; Verified
                    </div>
                  )}

                  {order.orderStatus !== "CANCELLED" && order.orderStatus !== "COMPLETED" && (
                    <button
                      onClick={() => setModalType("cancelOrder")}
                      className="w-full rounded-2xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition-colors"
                    >
                      Cancel Requisition
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Communication Modal */}
        <OrderCommunicationHubModal
          order={order}
          isOpen={showCommunicationModal}
          onClose={() => setShowCommunicationModal(false)}
        />

        {/* Assign Doctor Modal */}
        {modalType === "assignDoctor" && order && (
          <QuickAssignDoctorModal
            order={order}
            doctors={[]}
            isOpen={true}
            onClose={() => setModalType(null)}
            onAssigned={async (doctorId) => {
              await orderApi.update(order.id, { doctorId });
              showToast("Referring doctor updated", "success");
              setModalType(null);
              await fetchOrder();
            }}
          />
        )}

        {/* Collect Sample Modal */}
        {modalType === "collectSample" && order && (
          <QuickCollectSampleModal
            order={order}
            isOpen={true}
            onClose={() => setModalType(null)}
            onCollected={async (data) => {
              await orderApi.collectSample(order.id, {
                barcode: data.barcode,
                notes: data.notes,
              });
              showToast("Specimen collected and tube barcode assigned", "success");
              setModalType(null);
              await fetchOrder();
            }}
          />
        )}

        {/* Add Payment Modal */}
        {modalType === "addPayment" && order && (
          <AddPaymentModal
            order={order}
            isOpen={true}
            onClose={() => setModalType(null)}
            onPaymentAdded={async (data) => {
              await paymentsApi.create({
                orderId: order.id,
                amount: data.amount,
                method: data.method,
                remarks: data.remarks,
              });
              showToast(`Payment of ₹${data.amount} recorded`, "success");
              setModalType(null);
              await fetchOrder();
            }}
          />
        )}

        {/* Cancel Order Modal */}
        {modalType === "cancelOrder" && order && (
          <CancelOrderModal
            order={order}
            isOpen={true}
            onClose={() => setModalType(null)}
            onCancelled={async (reason) => {
              await orderApi.cancel(order.id, { reason });
              showToast(`Order #${order.orderNumber} cancelled`, "warning");
              setModalType(null);
              await fetchOrder();
            }}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
