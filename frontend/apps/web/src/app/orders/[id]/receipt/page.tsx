"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { orderApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OrderCommunicationHubModal } from "@/components/orders/orders-ui";
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Receipt,
  FileText,
  Copy,
  QrCode,
  Building2,
  Stethoscope,
  AlertTriangle,
  Loader2,
  FileDown,
  MessageSquare,
  Zap,
  FlaskConical,
  BadgeCheck,
  CreditCard,
  Tag,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────
interface OrderData {
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
    address?: string;
    bloodGroup?: string;
    email?: string;
    age?: number;
  };
  doctor?: {
    id: string;
    doctorCode: string;
    fullName: string;
    specialization: string;
    clinicName?: string;
    phone?: string;
    email?: string;
    regNo?: string;
  };
  items: Array<{
    id: string;
    test: {
      id: string;
      testCode: string;
      testName: string;
      sampleType: string;
      tatHours?: number;
      department?: string;
      category?: { department?: string; name?: string };
    };
    price: number;
    discount?: number;
    finalPrice: number;
  }>;
  orderStatus: string;
  paymentStatus: string;
  paymentMode?: string;
  priority?: string;
  collectionType?: string;
  createdAt: string;
  sampleCollected: boolean;
  subtotal: number;
  discount: number;
  discountCode?: string;
  gstAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
  homeCollectionAddress?: string;
}

// ─── Helpers ───────────────────────────────────────────────────
function numberToWords(num: number): string {
  if (isNaN(num) || num === 0) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "");
  }
  return `${inWords(Math.floor(num))} Rupees Only`;
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function ThermalRow({ label, value, bold, mono }: { label: string; value?: string | null; bold?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between text-[10px]">
      <span className="text-slate-500 shrink-0 mr-2">{label}:</span>
      <span className={`text-right ${bold ? "font-bold text-slate-900" : "text-slate-700"} ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function OrderReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const receiptRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [printFormat, setPrintFormat] = useState<"A4" | "THERMAL">("A4");
  const [copied, setCopied] = useState(false);
  const [showCommHub, setShowCommHub] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderApi.getById(orderId);
        if (response.success && response.data) {
          const data = response.data?.order || response.data;
          setOrder(data);
          const verificationUrl = `${window.location.origin}/verify-report?order=${data.orderNumber}&uhid=${data.patient?.uhid}`;
          const qr = await QRCode.toDataURL(verificationUrl, {
            width: 180, margin: 1,
            color: { dark: "#0f172a", light: "#ffffff" },
          });
          setQrCodeUrl(qr);
        } else {
          setError("Failed to load order data");
        }
      } catch (err: any) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const ratio = pdfW / canvas.width;
      const totalPages = Math.ceil((canvas.height * ratio) / pdfH);
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -i * pdfH, pdfW, canvas.height * ratio);
      }
      pdf.save(`LabCore_Receipt_${order?.orderNumber || orderId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF failed. Use Print → Save as PDF instead.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-950 dark:to-slate-900">
          <div className="text-center space-y-4">
            <div className="relative inline-flex">
              <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl">
                <FileText className="h-8 w-8" />
              </div>
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-400 animate-ping" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Preparing Tax Invoice…</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Error state ──
  if (error || !order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 text-center shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Receipt Not Found</h2>
            <p className="text-xs text-slate-500">{error || "Requested invoice could not be located."}</p>
            <button onClick={() => router.back()} className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md">
              Return to Orders
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Computed financials ──
  const subtotal = Number(order.subtotal) || (order.items || []).reduce((s, i) => s + (Number(i.price) || 0), 0);
  const discount = Number(order.discount) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const gst = Number(order.gstAmount) || Math.round(taxable * 0.18);
  const grandTotal = Number(order.grandTotal) || taxable + gst;
  const paid = Number(order.paidAmount) || 0;
  const due = Math.max(0, grandTotal - paid);
  const isPaid = paid >= grandTotal || order.paymentStatus === "PAID";
  const isStat = order.priority === "STAT";

  return (
    <ProtectedRoute>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white; }
          .print-area { box-shadow: none !important; border-radius: 0 !important; border: none !important; }
        }
        @page { size: A4; margin: 10mm; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 py-6 px-4 print:p-0 print:bg-white">

        {/* ══════════════════════════════════════════════════════
            CONTROL BAR  (hidden on print)
        ══════════════════════════════════════════════════════ */}
        <div className="no-print max-w-5xl mx-auto mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 pl-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
            {/* Left: Back + Format Switcher */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href={`/orders/${order.id}`}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Order #{order.orderNumber}</span>
              </Link>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-0.5">
                {(["A4", "THERMAL"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setPrintFormat(f)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      printFormat === f
                        ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {f === "A4" ? <FileText className="h-3 w-3" /> : <Receipt className="h-3 w-3" />}
                    {f === "A4" ? "A4 Tax Invoice" : "80mm Thermal"}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button" onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-all"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
              <button
                type="button" onClick={handleDownloadPDF} disabled={pdfLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-800 rounded-xl hover:bg-violet-100 transition-all shadow-xs disabled:opacity-60"
              >
                {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                <span>{pdfLoading ? "Generating…" : "Download PDF"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCommHub(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp / Email</span>
              </button>
              <button
                type="button" onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap px-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${isPaid ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"}`}>
              {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {isPaid ? "Payment Complete" : `Balance Due: ${fmt(due)}`}
            </span>
            {isStat && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 animate-pulse">
                <Zap className="h-3 w-3" /> STAT Priority
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              <FlaskConical className="h-3 w-3" />
              {(order.items || []).length} Test{(order.items || []).length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <BadgeCheck className="h-3 w-3 text-blue-500" /> NABL Accredited
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            A4 PREMIUM INVOICE
        ══════════════════════════════════════════════════════ */}
        {printFormat === "A4" && (
          <div
            ref={receiptRef}
            className="print-area max-w-5xl mx-auto bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 print:shadow-none print:rounded-none print:border-none print:max-w-none overflow-hidden"
          >
            {/* ── DARK GRADIENT HEADER ── */}
            <div className="relative bg-gradient-to-r from-[#050e1f] via-[#0a1a35] to-[#071527] text-white overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-blue-500/10 blur-2xl" />
              <div className="absolute -bottom-10 left-10 h-36 w-36 rounded-full bg-indigo-400/10 blur-xl" />
              <div className="absolute top-6 right-48 h-20 w-20 rounded-full bg-cyan-400/10 blur-lg" />

              <div className="relative z-10 px-10 py-8 flex flex-col sm:flex-row justify-between items-start gap-6">
                {/* Lab Branding */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 font-black text-2xl flex items-center justify-center shadow-xl border-2 border-white/20 shrink-0">
                      LC
                    </div>
                    <div>
                      <h1 className="text-xl font-black tracking-tight uppercase">
                        LabCore Diagnostics &amp; Pathology
                      </h1>
                      <p className="text-[11px] text-blue-300 font-semibold mt-0.5">
                        Enterprise Laboratory Information System &nbsp;•&nbsp; NABL / ISO 15189:2022 Accredited
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-blue-200/80 space-y-0.5 pl-1">
                    <p className="flex items-center gap-1.5"><Building2 className="h-3 w-3 shrink-0 text-blue-400" /> 1204 Healthcare Tower, Medicity Park, Mumbai 400001</p>
                    <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0 text-blue-400" /> +91-22-1234-5678 &nbsp;|&nbsp; 1800-200-5222 (24×7)</p>
                    <p className="flex items-center gap-1.5"><Mail className="h-3 w-3 shrink-0 text-blue-400" /> reports@labcore.com &nbsp;|&nbsp; portal.labcore.com</p>
                    <p className="font-mono font-semibold text-blue-100">GSTIN: 27AABCL1234M1Z8 &nbsp;|&nbsp; Estb. Reg: MH-BOM-LAB-2024-998</p>
                  </div>
                </div>

                {/* Invoice stamp + Paid badge + QR */}
                <div className="text-right flex flex-col items-end gap-3 shrink-0">
                  <div className="space-y-1">
                    <span className="inline-block px-4 py-1.5 rounded-xl text-[11px] font-black bg-white text-slate-900 tracking-widest uppercase shadow-lg">
                      Tax Invoice / Receipt
                    </span>
                    <p className="text-xl font-black font-mono tracking-wide"># {order.orderNumber}</p>
                    <p className="text-[11px] text-blue-300 font-mono">{fmtDateTime(order.createdAt)}</p>
                    {isStat && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-600 text-white animate-pulse">
                        <Zap className="h-3 w-3" /> STAT / EMERGENCY
                      </span>
                    )}
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black border-2 ${isPaid ? "bg-emerald-500/20 border-emerald-400 text-emerald-300" : "bg-amber-500/20 border-amber-400 text-amber-300"}`}>
                    {isPaid ? "✓ PAID IN FULL" : `⚠ DUE: ${fmt(due)}`}
                  </div>
                  {qrCodeUrl && (
                    <div className="bg-white p-2 rounded-xl shadow-lg">
                      <img src={qrCodeUrl} alt="Verification QR" className="h-20 w-20" />
                      <p className="text-[9px] text-slate-500 text-center mt-0.5 font-mono">Scan to verify</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom curve into white body */}
              <div className="h-5 bg-white" style={{ borderRadius: "60px 60px 0 0", marginTop: "-1px" }} />
            </div>

            {/* ── WHITE BODY ── */}
            <div className="px-10 pb-10 space-y-6 bg-white">

              {/* Patient + Doctor Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Patient */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/80 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Stethoscope className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Patient Information</span>
                  </div>
                  <p className="text-base font-black text-slate-900">{order.patient?.firstName} {order.patient?.lastName}</p>
                  <div className="text-[11px] text-slate-600 space-y-1 mt-2">
                    {[
                      ["UHID", order.patient?.uhid, true, true],
                      ["Gender", order.patient?.gender, false, false],
                      ["Blood Grp", order.patient?.bloodGroup, true, false],
                      ["Phone", order.patient?.phone, false, true],
                      ["Address", order.patient?.address, false, false],
                    ].filter(([, v]) => !!v).map(([label, value, bold, mono]) => (
                      <div key={label as string} className="flex items-start gap-2">
                        <span className="font-bold text-slate-400 w-16 shrink-0">{label as string}</span>
                        <span className={`${bold ? "font-bold text-slate-900" : ""} ${mono ? "font-mono" : ""} ${label === "Blood Grp" ? "text-rose-600 font-bold" : ""}`}>
                          {value as string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor / Requisition */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50/80 border border-violet-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-700">Clinical Requisition</span>
                  </div>
                  <p className="text-base font-black text-slate-900">{order.doctor?.fullName || "Self / Walk-in"}</p>
                  <div className="text-[11px] text-slate-600 space-y-1 mt-2">
                    {[
                      ["Speciality", order.doctor?.specialization || "Direct Requisition"],
                      ["Clinic", order.doctor?.clinicName],
                      ["Reg. No.", order.doctor?.regNo],
                      ["Barcode", order.barcode],
                      ["Priority", order.priority || "ROUTINE"],
                      ["Collection", order.collectionType === "HOME_COLLECTION" ? "🏠 Home Visit" : "🏥 Walk-in Lab"],
                    ].filter(([, v]) => !!v).map(([label, value]) => (
                      <div key={label as string} className="flex items-start gap-2">
                        <span className="font-bold text-slate-400 w-20 shrink-0">{label as string}</span>
                        <span className={`${label === "Barcode" ? "font-mono font-bold text-slate-900" : ""} ${label === "Priority" && isStat ? "font-black text-rose-600" : ""}`}>
                          {value as string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Itemized Test Table */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <FlaskConical className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Diagnostic Investigation Itemization</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="py-3 px-4 w-8 font-bold">#</th>
                        <th className="py-3 px-4 font-bold">Investigation / Test Name</th>
                        <th className="py-3 px-3 font-bold">Specimen</th>
                        <th className="py-3 px-3 font-bold text-center font-mono">HSN</th>
                        <th className="py-3 px-3 font-bold text-right font-mono">MRP</th>
                        <th className="py-3 px-3 font-bold text-right font-mono">Discount</th>
                        <th className="py-3 px-4 font-bold text-right font-mono">Net Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item, idx) => {
                        const itemPrice = Number(item.price) || 0;
                        const itemDiscount = Number(item.discount) || 0;
                        const netPrice = Number(item.finalPrice) || itemPrice - itemDiscount;
                        const dept = item.test?.category?.department || item.test?.department || item.test?.category?.name;
                        return (
                          <tr key={item.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                            <td className="py-3 px-4 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{item.test?.testName}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.test?.testCode}{dept ? ` • ${dept}` : ""}</p>
                            </td>
                            <td className="py-3 px-3 text-slate-600">{item.test?.sampleType || "Blood"}</td>
                            <td className="py-3 px-3 font-mono text-center text-slate-400">999312</td>
                            <td className="py-3 px-3 font-mono text-right text-slate-600">{fmt(itemPrice)}</td>
                            <td className="py-3 px-3 font-mono text-right text-emerald-700">
                              {itemDiscount > 0 ? `-${fmt(itemDiscount)}` : "—"}
                            </td>
                            <td className="py-3 px-4 font-mono font-black text-right text-slate-900">{fmt(netPrice)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-4">
                {/* Left 3: Amount in words + GST + Notes */}
                <div className="md:col-span-3 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Amount in Words</p>
                    <p className="text-sm font-bold text-slate-900 italic">{numberToWords(grandTotal)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2.5">GST Tax Component Breakup</p>
                    <div className="text-[11px] space-y-1.5 text-slate-700">
                      <div className="flex justify-between"><span>Taxable Healthcare Value</span><span className="font-mono font-bold">{fmt(taxable)}</span></div>
                      <div className="flex justify-between text-slate-500"><span>CGST @ 9.0%</span><span className="font-mono">{fmt(gst / 2)}</span></div>
                      <div className="flex justify-between text-slate-500"><span>SGST @ 9.0%</span><span className="font-mono">{fmt(gst / 2)}</span></div>
                      <div className="flex justify-between font-bold border-t border-blue-200 pt-1.5 text-blue-800"><span>Total GST (18%)</span><span className="font-mono">{fmt(gst)}</span></div>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Lab / Staff Notes</p>
                      <p className="text-xs text-amber-900">{order.notes}</p>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 space-y-0.5 px-1">
                    <p className="font-bold text-slate-600">Report Delivery Instructions:</p>
                    <p>• Routine results published within 24–48 hours of sample accession.</p>
                    <p>• Download digitally signed report via QR code or at portal.labcore.com</p>
                    <p>• Present this receipt for physical report collection at lab counter.</p>
                  </div>
                </div>

                {/* Right 2: Billing Ledger */}
                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 text-white px-4 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-widest">Billing Ledger</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="flex justify-between px-4 py-2.5 text-[11px] text-slate-600">
                        <span>Gross Subtotal</span><span className="font-mono font-semibold">{fmt(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between px-4 py-2.5 text-[11px] text-emerald-700 font-semibold">
                          <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Concession {order.discountCode ? `(${order.discountCode})` : ""}</span>
                          <span className="font-mono">-{fmt(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between px-4 py-2.5 text-[11px] text-slate-600">
                        <span>Net Taxable</span><span className="font-mono font-semibold">{fmt(taxable)}</span>
                      </div>
                      <div className="flex justify-between px-4 py-2.5 text-[11px] text-slate-600">
                        <span>Total GST (18%)</span><span className="font-mono font-semibold">{fmt(gst)}</span>
                      </div>
                      <div className="flex justify-between px-4 py-3 text-sm font-black text-slate-900 bg-slate-50">
                        <span>Grand Total</span><span className="font-mono">{fmt(grandTotal)}</span>
                      </div>
                      <div className="flex justify-between px-4 py-2.5 text-[11px] font-semibold text-emerald-700">
                        <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> Amount Paid</span>
                        <span className="font-mono">{fmt(paid)}</span>
                      </div>
                      {order.paymentMode && (
                        <div className="flex justify-between px-4 py-1.5 text-[10px] text-slate-400">
                          <span>Payment Mode</span><span className="font-bold text-slate-600">{order.paymentMode}</span>
                        </div>
                      )}
                    </div>
                    <div className={`px-4 py-3 font-black text-sm flex justify-between items-center ${isPaid ? "bg-emerald-600" : "bg-rose-600"} text-white`}>
                      <span>{isPaid ? "✓ PAID IN FULL" : "⚠ BALANCE DUE"}</span>
                      <span className="font-mono text-lg">{isPaid ? fmt(grandTotal) : fmt(due)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accreditation Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-100">
                {["NABL Accredited", "ISO 15189:2022", "CAP Certified", "HIPAA Compliant", "CLIA Approved"].map((b) => (
                  <span key={b} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <BadgeCheck className="h-3 w-3 text-blue-600" /> {b}
                  </span>
                ))}
              </div>

              {/* Signature Footer */}
              <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-300 flex justify-between items-end">
                <div>
                  <p className="text-[11px] font-bold text-slate-800">LabCore ELIS Enterprise • Computer Generated Document</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">No manual signature required. System-authenticated receipt.</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">Invoice ID: {order.id} • Generated: {fmtDateTime(new Date().toISOString())}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-10 w-44 border-b-2 border-slate-400 ml-auto" />
                  <p className="text-[11px] font-bold text-slate-800">Authorized Cashier / Officer</p>
                  <p className="text-[10px] text-slate-400">For LabCore Diagnostics Pvt. Ltd.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            THERMAL 80mm POS SLIP
        ══════════════════════════════════════════════════════ */}
        {printFormat === "THERMAL" && (
          <>
            <p className="no-print text-center text-[11px] font-bold text-slate-500 mb-3">📄 80mm Thermal Slip Preview</p>
            <div
              ref={receiptRef}
              className="print-area max-w-[340px] mx-auto bg-white text-slate-900 font-mono text-[11px] leading-snug border border-slate-300 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none print:max-w-none"
            >
              {/* Thermal Header */}
              <div className="bg-slate-900 text-white text-center py-4 px-3 space-y-0.5">
                <h2 className="text-sm font-black uppercase tracking-widest">LABCORE DIAGNOSTICS</h2>
                <p className="text-[9px] text-slate-300">1204 Healthcare Tower, Mumbai 400001</p>
                <p className="text-[9px] text-slate-300">GSTIN: 27AABCL1234M1Z8 • +91-22-1234-5678</p>
                <div className="mt-1.5 inline-block px-3 py-1 rounded-lg bg-white text-slate-900 text-[10px] font-black uppercase tracking-wide">
                  *** CASH / BILL RECEIPT ***
                </div>
              </div>

              {/* Order Meta */}
              <div className="py-2.5 px-4 border-b border-dashed border-slate-300 space-y-1">
                <ThermalRow label="Receipt No" value={order.orderNumber} bold />
                <ThermalRow label="Date/Time" value={fmtDateTime(order.createdAt)} />
                <ThermalRow label="Patient" value={`${order.patient?.firstName} ${order.patient?.lastName}`} bold />
                <ThermalRow label="UHID" value={order.patient?.uhid} mono />
                <ThermalRow label="Phone" value={order.patient?.phone} mono />
                <ThermalRow label="Doctor" value={order.doctor?.fullName || "Self / Walk-in"} />
                <ThermalRow label="Priority" value={order.priority || "ROUTINE"} bold />
                <ThermalRow label="Barcode" value={order.barcode} mono />
              </div>

              {/* Test Items */}
              <div className="py-2.5 px-4 border-b border-dashed border-slate-300">
                <div className="flex justify-between font-black pb-1.5 text-[10px] border-b border-slate-200 mb-1">
                  <span>INVESTIGATION</span><span>AMOUNT</span>
                </div>
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between py-0.5">
                    <div className="flex-1 pr-2">
                      <p className="truncate text-[10px] font-bold">{item.test?.testName}</p>
                      <p className="text-[9px] text-slate-400">{item.test?.testCode}</p>
                    </div>
                    <span className="font-mono shrink-0">₹{(Number(item.finalPrice) || Number(item.price) || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-2.5 px-4 border-b border-dashed border-slate-300 space-y-0.5">
                <ThermalRow label="Subtotal" value={fmt(subtotal)} mono />
                {discount > 0 && <ThermalRow label="Concession" value={`-${fmt(discount)}`} mono />}
                <ThermalRow label="GST (18%)" value={fmt(gst)} mono />
                <div className="flex justify-between pt-1.5 font-black text-sm border-t border-slate-300 mt-1">
                  <span>NET TOTAL</span><span className="font-mono">{fmt(grandTotal)}</span>
                </div>
                <ThermalRow label="Paid" value={fmt(paid)} mono />
                <div className={`flex justify-between font-black pt-1 ${due > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                  <span>{due > 0 ? "BALANCE DUE" : "PAID IN FULL"}</span>
                  <span className="font-mono">{due > 0 ? fmt(due) : "✓ NIL"}</span>
                </div>
              </div>

              {/* Amount in Words */}
              <div className="py-2 px-4 border-b border-dashed border-slate-300">
                <p className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Amount in Words</p>
                <p className="text-[10px] italic">{numberToWords(grandTotal)}</p>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="py-3 text-center">
                  <div className="inline-block p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <img src={qrCodeUrl} alt="Verify QR" className="h-24 w-24 mx-auto" />
                  </div>
                  <p className="text-[9px] mt-1.5 text-slate-400">Scan for digital report &amp; verification</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center pb-4 px-4 text-[9px] text-slate-400 space-y-0.5 border-t border-dashed border-slate-300 pt-2.5">
                <p className="font-bold text-slate-700">Thank You for Choosing LabCore!</p>
                <p>Reports: portal.labcore.com</p>
                <p>NABL Accredited • ISO 15189:2022</p>
                <p className="font-mono text-[8px] text-slate-300 pt-1">{order.id}</p>
              </div>
            </div>
          </>
        )}

        {/* Communication Hub */}
        {showCommHub && order && (
          <OrderCommunicationHubModal
            isOpen={showCommHub}
            onClose={() => setShowCommHub(false)}
            order={order}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}