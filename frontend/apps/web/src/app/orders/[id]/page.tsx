"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { orderApi } from "@/lib/api";
import {
  StatusBadge,
  PriorityBadge,
  PaymentProgressBar,
  TATIndicator,
  ToastContainer,
  useToast,
  OrderStatusType,
  OrderCommunicationHubModal,
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
} from "lucide-react";

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`, "info");
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Order Details">
          <div className="py-20 text-center max-w-sm mx-auto space-y-3">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">
              Loading laboratory order requisition...
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !order) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Order Details">
          <div className="py-16 text-center max-w-sm mx-auto space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Order Not Found</h3>
            <p className="text-xs text-slate-500">{error || "The requested order could not be located."}</p>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Orders
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title={`Order #${order.orderNumber}`}>
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          {/* Back button & Action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to All Orders</span>
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowCommunicationModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>WhatsApp & Email Hub</span>
              </button>

              <a
                href={`/orders/${order.id}/barcode`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 hover:bg-purple-100 transition-colors shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Tube Barcodes
              </a>

              <a
                href={`/orders/${order.id}/receipt`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                Print Receipt
              </a>
            </div>
          </div>

          {/* Workflow Action Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wide">Workflow:</span>
            
            <Link
              href={`/samples/collect?orderId=${order.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              <FlaskConical className="h-3.5 w-3.5" />
              Collect Sample
            </Link>

            <Link
              href={`/results?orderId=${order.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Enter Results
            </Link>

            <Link
              href={`/reports/order/${order.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              View Report
            </Link>

            <Link
              href={`/invoices?orderId=${order.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
            >
              <Receipt className="h-3.5 w-3.5" />
              View Invoice
            </Link>

            <Link
              href={`/payments?orderId=${order.id}&amount=${order.dueAmount || 0}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Record Payment
            </Link>

            <Link
              href={`/patients/${order.patient?.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors ml-auto"
            >
              <User className="h-3.5 w-3.5" />
              Patient Profile
            </Link>
          </div>

          {/* Main Hero Card */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 md:p-8 space-y-6">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    Order {order.orderNumber}
                  </h1>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(order.orderNumber, "Order number")}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="Copy Order Number"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <PriorityBadge priority={order.priority} />
                </div>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                  <span>Tube Barcode: {order.barcode}</span>
                  <span>•</span>
                  <span>Registered: {new Date(order.createdAt).toLocaleString("en-IN")}</span>
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Current Status:</span>
                <StatusBadge
                  status={order.orderStatus}
                  isUpdating={updating}
                  interactive={true}
                  onChange={handleStatusChange}
                />
              </div>
            </div>

            {/* Demographics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Patient Demographics */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  Patient Demographics
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {order.patient?.firstName} {order.patient?.lastName}
                </p>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p className="font-mono">UHID: {order.patient?.uhid}</p>
                  <p>Gender: {order.patient?.gender} • Phone: {order.patient?.phone}</p>
                  {order.patient?.address && <p>Address: {order.patient.address}</p>}
                </div>
              </div>

              {/* Referring Doctor */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                  Referring Physician
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {order.doctor?.fullName || "Self / Walk-in"}
                </p>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>{order.doctor?.specialization || "Direct Patient Consultation"}</p>
                  {order.doctor?.clinicName && <p>Clinic: {order.doctor.clinicName}</p>}
                </div>
              </div>

              {/* Turnaround & Scheduling */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  Processing Turnaround (TAT)
                </span>
                <TATIndicator
                  createdAt={order.createdAt}
                  tests={order.items}
                  orderStatus={order.orderStatus}
                />
                <p className="text-xs text-slate-500">
                  Collection: {order.collectionType === "HOME_COLLECTION" ? "Home Visit" : "Walk-in Center"}
                </p>
              </div>
            </div>

            {/* Patient Notification & Communications Center */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      Digital Patient Communications & Dispatch
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/70 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                      Active Channel
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-0.5">
                    WhatsApp: <span className="font-mono font-semibold">{order.patient?.phone || "No phone registered"}</span> • Email: <span className="font-semibold">{order.patient?.email || "No email on file"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCommunicationModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp Alert</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCommunicationModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Send Email</span>
                </button>
              </div>
            </div>

            {/* Prescribed Tests Table */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-blue-600" />
                Prescribed Tests ({order.items?.length || 0})
              </h3>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5 font-bold text-slate-500 uppercase">Test Name & Code</th>
                      <th className="px-4 py-2.5 font-bold text-slate-500 uppercase">Sample Tube</th>
                      <th className="px-4 py-2.5 font-bold text-slate-500 uppercase">Turnaround</th>
                      <th className="px-4 py-2.5 font-bold text-slate-500 uppercase text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(order.items || []).map((item: any, idx: number) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {item.test?.testName}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {item.test?.testCode}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {item.test?.sampleType || "Blood"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {item.test?.tatDisplay || `${item.test?.tatHours || 24} hours`}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-right text-slate-900 dark:text-white">
                          ₹{item.finalPrice || item.price || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Payment Status: {order.paymentStatus}
                </span>
                <p className="text-2xl font-black font-mono">
                  Total: ₹{Number(order.grandTotal || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-300">
                  Paid: ₹{Number(order.paidAmount || 0).toLocaleString("en-IN")} • Due: ₹{Number(order.dueAmount || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="w-full md:w-56">
                <PaymentProgressBar
                  paidAmount={order.paidAmount}
                  grandTotal={order.grandTotal}
                  paymentStatus={order.paymentStatus}
                />
              </div>
            </div>
          </div>

          <OrderCommunicationHubModal
            isOpen={showCommunicationModal}
            onClose={() => setShowCommunicationModal(false)}
            order={order}
            onSuccess={({ channel, recipient }) => {
              showToast(`Notification dispatched via ${channel} to ${recipient}!`, "success");
            }}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
