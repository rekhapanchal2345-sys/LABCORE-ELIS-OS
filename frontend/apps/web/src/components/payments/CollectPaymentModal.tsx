"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Plus,
  Wallet,
  QrCode,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ArrowLeft,
  Percent,
  Receipt,
  Minus,
  Check,
  Banknote,
  Phone,
  Hash,
  ShieldCheck,
  ClipboardList,
  TestTube,
  Activity,
  BadgeCheck,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  User,
} from "lucide-react";
import { paymentApi, advancesApi } from "@/lib/api";

export type PaymentMethod = "CASH" | "CARD" | "UPI" | "NET_BANKING" | "CHEQUE" | "OTHER";

function fmtINR(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(v);
}

const METHOD_META: Record<
  PaymentMethod,
  { label: string; icon: string; color: string; bg: string; border: string; placeholder: string }
> = {
  CASH: { label: "Cash", icon: "💵", color: "text-emerald-800", bg: "bg-emerald-50", border: "border-emerald-300", placeholder: "Cash denominations accepted" },
  UPI: { label: "UPI / QR", icon: "📱", color: "text-violet-800", bg: "bg-violet-50", border: "border-violet-300", placeholder: "UPI Transaction UTR (e.g. UTR323456789012)" },
  CARD: { label: "Card (POS)", icon: "💳", color: "text-sky-800", bg: "bg-sky-50", border: "border-sky-300", placeholder: "Card Approval Code / RRN (e.g. 441293)" },
  NET_BANKING: { label: "Net Banking", icon: "🏦", color: "text-amber-800", bg: "bg-amber-50", border: "border-amber-300", placeholder: "NEFT/RTGS UTR or Bank Reference" },
  CHEQUE: { label: "Cheque", icon: "🧾", color: "text-slate-800", bg: "bg-slate-50", border: "border-slate-300", placeholder: "Cheque No. / Bank Name / Branch" },
  OTHER: { label: "Other", icon: "🔄", color: "text-rose-800", bg: "bg-rose-50", border: "border-rose-300", placeholder: "Reference / Narration" },
};

const CASH_DENOMS = [2000, 500, 200, 100, 50, 20, 10, 5, 1] as const;
type DenomMap = Record<number, number>;
function denomTotal(d: DenomMap) {
  return Object.entries(d).reduce((s, [k, v]) => s + Number(k) * v, 0);
}

const WAIVER_REASONS = [
  "BPL / Below Poverty Line patient",
  "Government Employee / Defence",
  "Hospital Staff / Family benefit",
  "Clinical referral package discount",
  "Repeat Patient Loyalty waiver",
  "Clinician discretion waiver",
  "Insurance company negotiated rate",
  "Camp / Outreach patient",
];

const REFERRAL_SOURCES = [
  "OPD / Walk-in",
  "Emergency (Casualty)",
  "IPD Admission",
  "Corporate Tie-up",
  "Health Camp",
  "Doctor Referral (External)",
  "Doctor Referral (Internal)",
  "Insurance Panel",
  "Online Appointment",
  "CGHS / ECHS",
  "Ayushman / PM-JAY",
];

type Step = 0 | 1 | 2 | 3;

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
  patients: any[];
  initialOrderId?: string;
  initialAmount?: string;
  onPaymentSuccess: (paymentData: any) => void;
  showNotification: (message: string, type?: "success" | "error" | "info") => void;
}

export default function CollectPaymentModal({
  isOpen,
  onClose,
  orders,
  patients,
  initialOrderId,
  initialAmount,
  onPaymentSuccess,
  showNotification,
}: CollectPaymentModalProps) {
  const [step, setStep] = useState<Step>(0);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId || "");
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
  const [amount, setAmount] = useState<string>(initialAmount || "");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [counterLabel, setCounterLabel] = useState("Counter 01 – OPD Billing");
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitRows, setSplitRows] = useState<
    Array<{ method: PaymentMethod; amount: string; transactionId: string }>
  >([
    { method: "CASH", amount: "", transactionId: "" },
    { method: "UPI", amount: "", transactionId: "" },
  ]);
  const [showDenomCalc, setShowDenomCalc] = useState(false);
  const [denomMap, setDenomMap] = useState<DenomMap>({});
  const [cashTendered, setCashTendered] = useState("");
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState<string>("");
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [patientWalletBalance, setPatientWalletBalance] = useState(0);
  const [useWalletCredit, setUseWalletCredit] = useState(false);
  const [walletDeductionAmount, setWalletDeductionAmount] = useState(0);
  const [hasDiscountWaiver, setHasDiscountWaiver] = useState(false);
  const [waiverAmount, setWaiverAmount] = useState<string>("");
  const [waiverReason, setWaiverReason] = useState("");
  const [waiverApprovedBy, setWaiverApprovedBy] = useState("");
  const [waiverType, setWaiverType] = useState<"FLAT" | "PERCENT">("FLAT");
  const [referralSource, setReferralSource] = useState("OPD / Walk-in");
  const [referralDoctorName, setReferralDoctorName] = useState("");
  const [receiptType, setReceiptType] = useState<"80MM" | "A4">("80MM");
  const [submitting, setSubmitting] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [showAllTests, setShowAllTests] = useState(false);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId);
  }, [selectedOrderId, orders]);

  const patientName = selectedOrder?.patient
    ? `${selectedOrder.patient.firstName || ""} ${selectedOrder.patient.lastName || ""}`.trim()
    : "—";
  const grandTotal = Number(selectedOrder?.grandTotal || selectedOrder?.invoice?.grandTotal || 0);
  const paidAmount = Number(selectedOrder?.paidAmount || selectedOrder?.invoice?.paidAmount || 0);
  const dueAmount = Number(selectedOrder?.dueAmount || Math.max(0, grandTotal - paidAmount) || 0);
  const testsList: any[] = selectedOrder?.items || [];

  const effectiveWaiver = useMemo(() => {
    if (!hasDiscountWaiver || !waiverAmount) return 0;
    const w = Number(waiverAmount);
    if (waiverType === "PERCENT") return Math.round((grandTotal * w) / 100);
    return w;
  }, [hasDiscountWaiver, waiverAmount, waiverType, grandTotal]);

  const netPayable = useMemo(() => {
    const base = dueAmount > 0 ? dueAmount : grandTotal;
    return Math.max(0, base - walletDeductionAmount - effectiveWaiver);
  }, [dueAmount, grandTotal, walletDeductionAmount, effectiveWaiver]);

  const gstBase = Math.round((netPayable / 1.18) * 100) / 100;
  const cgst = Math.round(((netPayable - gstBase) / 2) * 100) / 100;
  const sgst = cgst;
  const cashChange = Math.max(0, (Number(cashTendered) || 0) - Number(amount || netPayable));
  const totalSplitSum = splitRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const splitBalance = Math.max(0, netPayable - totalSplitSum);

  const filteredOrders = useMemo(() => {
    const q = orderSearchQuery.trim().toLowerCase();
    if (!q) return orders.slice(0, 12);
    return orders.filter((o) => {
      const pn = `${o.patient?.firstName || ""} ${o.patient?.lastName || ""}`.toLowerCase();
      return (
        (o.orderNumber || "").toLowerCase().includes(q) ||
        pn.includes(q) ||
        (o.patient?.uhid || "").toLowerCase().includes(q) ||
        (o.patient?.phone || "").toLowerCase().includes(q) ||
        (o.invoice?.invoiceNumber || "").toLowerCase().includes(q)
      );
    }).slice(0, 15);
  }, [orders, orderSearchQuery]);

  useEffect(() => {
    if (initialOrderId) {
      setSelectedOrderId(initialOrderId);
      const found = orders.find((o) => o.id === initialOrderId || o.orderNumber === initialOrderId);
      if (found) handleSelectOrder(found);
    }
    if (initialAmount) setAmount(initialAmount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId, initialAmount]);

  useEffect(() => {
    if (!isOpen || method !== "UPI" || !selectedOrderId) {
      setUpiQrCodeUrl("");
      setUpiConfirmed(false);
      return;
    }
    const amt = Number(amount || netPayable);
    if (amt <= 0) { setUpiQrCodeUrl(""); return; }
    const upiUrl = `upi://pay?pa=labcore@icici&pn=LabCore%20Diagnostics&am=${amt}&cu=INR&tn=ORD-${selectedOrderId.slice(-6)}`;
    import("qrcode")
      .then((QRCode) => QRCode.toDataURL(upiUrl, { width: 160, margin: 1, color: { dark: "#3730a3", light: "#ffffff" } }))
      .then((url) => setUpiQrCodeUrl(url))
      .catch(() => setUpiQrCodeUrl(""));
  }, [isOpen, method, amount, netPayable, selectedOrderId]);

  useEffect(() => {
    if (!isOpen) {
      setStep(0); setOrderSearchQuery(""); setSelectedOrderId(initialOrderId || "");
      setAmount(initialAmount || ""); setMethod("CASH"); setTransactionId(""); setRemarks("");
      setIsSplitMode(false);
      setSplitRows([{ method: "CASH", amount: "", transactionId: "" }, { method: "UPI", amount: "", transactionId: "" }]);
      setUseWalletCredit(false); setWalletDeductionAmount(0); setPatientWalletBalance(0);
      setHasDiscountWaiver(false); setWaiverAmount(""); setWaiverReason(""); setWaiverApprovedBy("");
      setUpiConfirmed(false); setDenomMap({}); setCashTendered(""); setShowDenomCalc(false); setShowAllTests(false);
    }
  }, [isOpen, initialOrderId, initialAmount]);

  useEffect(() => {
    if (selectedOrderId && !isSplitMode) setAmount(String(netPayable || ""));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netPayable]);

  const handleSelectOrder = useCallback((order: any) => {
    setSelectedOrderId(order.id);
    setIsOrderDropdownOpen(false);
    setOrderSearchQuery("");
    const gt = Number(order.grandTotal || order.invoice?.grandTotal || 0);
    const paid = Number(order.paidAmount || order.invoice?.paidAmount || 0);
    const due = Number(order.dueAmount || Math.max(0, gt - paid));
    setAmount(String(due > 0 ? due : gt || ""));
    setUseWalletCredit(false); setWalletDeductionAmount(0);
    if (order.patient?.id) {
      advancesApi.getWallet(order.patient.id)
        .then((res: any) => setPatientWalletBalance(typeof res?.data?.balance === "number" ? res.data.balance : 0))
        .catch(() => setPatientWalletBalance(0));
    } else { setPatientWalletBalance(0); }
  }, []);

  const handleToggleWallet = () => {
    const next = !useWalletCredit;
    setUseWalletCredit(next);
    if (next) {
      const base = dueAmount > 0 ? dueAmount : grandTotal;
      const deduct = Math.min(base, patientWalletBalance);
      setWalletDeductionAmount(deduct);
      showNotification(`Wallet credit of ${fmtINR(deduct)} applied!`, "info");
    } else { setWalletDeductionAmount(0); }
  };

  const handleSubmit = async () => {
    if (!selectedOrderId) { showNotification("Please select a patient order first.", "error"); return; }
    try {
      setSubmitting(true);
      const fullRemarks = [
        remarks,
        walletDeductionAmount > 0 ? `Wallet Offset: ${fmtINR(walletDeductionAmount)}` : "",
        effectiveWaiver > 0 ? `Waiver: ${fmtINR(effectiveWaiver)} – ${waiverReason} (Auth: ${waiverApprovedBy || "HOD"})` : "",
        referralSource ? `Source: ${referralSource}` : "",
        referralDoctorName ? `Ref Dr: ${referralDoctorName}` : "",
        `Counter: ${counterLabel}`,
      ].filter(Boolean).join(" | ");

      if (isSplitMode) {
        const validSplits = splitRows.filter((r) => Number(r.amount) > 0);
        if (validSplits.length === 0) { showNotification("Add at least one split payment row.", "error"); setSubmitting(false); return; }
        const res = await paymentApi.createSplit({ orderId: selectedOrderId, payments: validSplits.map((s) => ({ amount: Number(s.amount), method: s.method, transactionId: s.transactionId.trim() || undefined, remarks: fullRemarks || undefined })) });
        if (res?.success || res?.data) { showNotification("Split payment collected & receipt ready!", "success"); onPaymentSuccess(Array.isArray(res.data) ? res.data[0] : res.data); onClose(); }
        else { showNotification(res?.message || "Split payment failed.", "error"); }
      } else {
        const finalAmount = Number(amount);
        if (!finalAmount || finalAmount <= 0) { showNotification("Enter a valid payment amount.", "error"); setSubmitting(false); return; }
        const res = await paymentApi.create({ orderId: selectedOrderId, amount: finalAmount, method, transactionId: transactionId.trim() || undefined, remarks: fullRemarks || undefined });
        if (res?.success || res?.data) { showNotification(`Payment of ${fmtINR(finalAmount)} recorded! ${receiptType} receipt generating...`, "success"); onPaymentSuccess(res.data); onClose(); }
        else { showNotification(res?.message || "Payment collection failed.", "error"); }
      }
    } catch (err: any) { showNotification(err?.message || "Failed to collect payment.", "error"); }
    finally { setSubmitting(false); }
  };

  if (!isOpen) return null;

  const STEPS = [
    { label: "Patient", icon: <User className="h-3.5 w-3.5" /> },
    { label: "Tests", icon: <TestTube className="h-3.5 w-3.5" /> },
    { label: "Payment", icon: <CreditCard className="h-3.5 w-3.5" /> },
    { label: "Confirm", icon: <BadgeCheck className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-2 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[96vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">

        {/* ── GRADIENT HEADER ── */}
        <div className="shrink-0 bg-gradient-to-r from-[#0f2d52] via-[#1e3a6e] to-[#1a4480] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Collect Payment</h2>
                <p className="text-[11px] text-blue-200">Hospital · Lab · Clinic — Enterprise Billing Suite</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-blue-200 hover:bg-white/10 hover:text-white transition">
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Step Pills */}
          <div className="mt-4 flex items-center gap-0">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <button
                  type="button"
                  onClick={() => { if (i < step && selectedOrderId) setStep(i as Step); }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                    step === i ? "bg-white text-[#0f2d52] shadow-md" : i < step ? "bg-white/20 text-white hover:bg-white/30" : "bg-white/10 text-blue-300 cursor-not-allowed"
                  }`}
                >
                  {i < step ? <Check className="h-3 w-3 text-emerald-400" /> : s.icon}
                  {s.label}
                </button>
                {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-1 ${i < step ? "bg-white/50" : "bg-white/15"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ═══ STEP 0: PATIENT & ORDER ═══ */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="relative">
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                  Search Patient / Order / Invoice *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onFocus={() => setIsOrderDropdownOpen(true)}
                    onChange={(e) => { setOrderSearchQuery(e.target.value); setIsOrderDropdownOpen(true); }}
                    placeholder={selectedOrder ? `${selectedOrder.orderNumber} · ${patientName}` : "Search by Name, UHID, Phone, Order # or Invoice #..."}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                {isOrderDropdownOpen && (
                  <div className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    {filteredOrders.length > 0 ? filteredOrders.map((o) => {
                      const pn = o.patient ? `${o.patient.firstName || ""} ${o.patient.lastName || ""}`.trim() : "Patient";
                      const gt = Number(o.grandTotal || o.invoice?.grandTotal || 0);
                      const due = Number(o.dueAmount || Math.max(0, gt - Number(o.paidAmount || 0)));
                      const initials = pn.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
                      return (
                        <div key={o.id} onClick={() => { handleSelectOrder(o); setIsOrderDropdownOpen(false); }} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-blue-50 transition border-b border-slate-50 last:border-0">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">{initials || "PT"}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{pn}</span>
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{o.orderNumber}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">UHID: {o.patient?.uhid || "—"} · {o.patient?.phone || "No phone"}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-xs text-slate-800">{fmtINR(gt)}</div>
                            <div className={`text-[10px] font-bold ${due > 0 ? "text-rose-600" : "text-emerald-600"}`}>{due > 0 ? `Due: ${fmtINR(due)}` : "Fully Paid"}</div>
                          </div>
                        </div>
                      );
                    }) : <div className="p-5 text-center text-xs text-slate-400">No matching orders found.</div>}
                  </div>
                )}
              </div>

              {selectedOrder && (
                <div className="rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/30 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                      {patientName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "PT"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-slate-900 text-sm">{patientName}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedOrder.patient?.uhid && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                            <Hash className="h-2.5 w-2.5" />{selectedOrder.patient.uhid}
                          </span>
                        )}
                        {selectedOrder.patient?.phone && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                            <Phone className="h-2.5 w-2.5" />{selectedOrder.patient.phone}
                          </span>
                        )}
                        {selectedOrder.patient?.age && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                            <User className="h-2.5 w-2.5" />{selectedOrder.patient.age}y / {selectedOrder.patient.gender || "—"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-500 font-medium">Total / Due</div>
                      <div className="font-mono font-bold text-slate-900 text-sm">{fmtINR(grandTotal)}</div>
                      <div className={`font-mono font-bold text-xs ${dueAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {dueAmount > 0 ? `Due: ${fmtINR(dueAmount)}` : "✓ Paid"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1 border-t border-blue-100/70">
                    <span className="text-slate-500">Order:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedOrder.orderNumber || "—"}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">Invoice:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedOrder.invoice?.invoiceNumber || "Auto-assigned"}</span>
                    {selectedOrder.doctor?.fullName && (<><span className="text-slate-300">·</span><span className="text-slate-500">Ref:</span><span className="font-bold text-violet-700">{selectedOrder.doctor.fullName}</span></>)}
                  </div>
                </div>
              )}

              {selectedOrder && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Patient Source / Referral</label>
                    <select value={referralSource} onChange={(e) => setReferralSource(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-blue-400">
                      {REFERRAL_SOURCES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Billing Counter</label>
                    <select value={counterLabel} onChange={(e) => setCounterLabel(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-blue-400">
                      {["Counter 01 – OPD Billing", "Counter 02 – Emergency", "Counter 03 – IPD Billing", "Counter 04 – Lab Reception", "Counter 05 – Pharmacy", "Online / Remote"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {(referralSource.includes("Doctor") || referralSource.includes("Referral")) && selectedOrder && (
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Referring Clinician Name</label>
                  <input type="text" value={referralDoctorName} onChange={(e) => setReferralDoctorName(e.target.value)} placeholder="Dr. Ramesh Mehta / MBBS MD Medicine" className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 1: TESTS & INVOICE ═══ */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-700" />
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Diagnostic Investigations</span>
                    <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">{testsList.length} item{testsList.length !== 1 ? "s" : ""}</span>
                  </div>
                  {testsList.length > 4 && (
                    <button type="button" onClick={() => setShowAllTests(!showAllTests)} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      {showAllTests ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {showAllTests ? "Collapse" : `Show all ${testsList.length}`}
                    </button>
                  )}
                </div>
                <div className="divide-y divide-slate-100">
                  {(showAllTests ? testsList : testsList.slice(0, 4)).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/80">
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px] flex items-center justify-center border border-blue-100">{idx + 1}</span>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{item.test?.testName || item.testName || "Diagnostic Test"}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.test?.testCode || "—"} · {item.test?.sampleType || "Serum"}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-slate-900">{fmtINR(Number(item.price || item.finalPrice || 0))}</div>
                        {item.discountAmount > 0 && <div className="text-[10px] text-emerald-600 font-semibold">-{fmtINR(item.discountAmount)}</div>}
                      </div>
                    </div>
                  ))}
                  {testsList.length === 0 && <div className="px-4 py-6 text-center text-xs text-slate-400">No itemized tests linked. Will show as consolidated invoice.</div>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 space-y-2.5">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Invoice Summary</div>
                {[["Gross Total (MRP)", fmtINR(grandTotal), ""], ...(paidAmount > 0 ? [["Previously Paid", `-${fmtINR(paidAmount)}`, "text-emerald-700"]] : []), ["Outstanding Due", dueAmount > 0 ? fmtINR(dueAmount) : "₹0 – Fully Settled", dueAmount > 0 ? "text-rose-600" : "text-emerald-600"]].map(([label, val, cls]) => (
                  <div key={label} className="flex justify-between text-xs text-slate-600">
                    <span>{label}</span>
                    <span className={`font-mono font-bold ${cls}`}>{val}</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-2 space-y-1">
                  {[["Taxable Turnover (excl. GST)", fmtINR(gstBase)], ["CGST 9%", fmtINR(cgst)], ["SGST 9%", fmtINR(sgst)]].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-[10px] text-slate-500"><span>{l}</span><span className="font-mono">{v}</span></div>
                  ))}
                </div>
              </div>

              {/* Concession / Waiver */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-900">Concession / Authorized Waiver</span>
                  </div>
                  <button type="button" onClick={() => { setHasDiscountWaiver(!hasDiscountWaiver); setWaiverAmount(""); }} className={`rounded-xl px-3 py-1 text-[11px] font-bold transition ${hasDiscountWaiver ? "bg-amber-600 text-white" : "bg-white text-amber-800 ring-1 ring-amber-300 hover:bg-amber-100"}`}>
                    {hasDiscountWaiver ? "Enabled ✓" : "Add Waiver"}
                  </button>
                </div>
                {hasDiscountWaiver && (
                  <div className="space-y-3 pt-1 border-t border-amber-200/60">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="flex rounded-xl overflow-hidden border border-amber-200">
                        {(["FLAT", "PERCENT"] as const).map((t) => (
                          <button key={t} type="button" onClick={() => { setWaiverType(t); setWaiverAmount(""); }} className={`flex-1 py-2 text-[11px] font-bold transition ${waiverType === t ? "bg-amber-600 text-white" : "bg-white text-amber-800 hover:bg-amber-50"}`}>
                            {t === "FLAT" ? "₹ Flat" : "% Percent"}
                          </button>
                        ))}
                      </div>
                      <input type="number" step="0.01" value={waiverAmount} onChange={(e) => setWaiverAmount(e.target.value)} placeholder={waiverType === "FLAT" ? "Amount (₹)" : "Percent (%)"} className="rounded-xl border border-amber-200 p-2.5 text-xs font-mono font-bold outline-none focus:border-amber-400" />
                      <input type="text" value={waiverApprovedBy} onChange={(e) => setWaiverApprovedBy(e.target.value)} placeholder="Authorized by (Dr. / HOD)" className="rounded-xl border border-amber-200 p-2.5 text-xs outline-none focus:border-amber-400" />
                    </div>
                    <select value={waiverReason} onChange={(e) => setWaiverReason(e.target.value)} className="w-full rounded-xl border border-amber-200 bg-white p-2.5 text-xs font-semibold outline-none">
                      <option value="">Select waiver reason...</option>
                      {WAIVER_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {effectiveWaiver > 0 && (
                      <div className="flex items-center justify-between rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold">
                        <span className="text-amber-900">Approved Waiver:</span>
                        <span className="font-mono text-amber-800 text-sm">-{fmtINR(effectiveWaiver)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wallet Banner */}
              {patientWalletBalance > 0 && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs"><Wallet className="h-4 w-4 text-emerald-600" />Patient Advance Credit: {fmtINR(patientWalletBalance)}</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">Pre-deposited advance — deduct to settle this bill.</div>
                  </div>
                  <button type="button" onClick={handleToggleWallet} className={`rounded-xl px-3.5 py-1.5 text-[11px] font-bold shadow-sm transition ${useWalletCredit ? "bg-emerald-700 text-white" : "bg-white text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-100"}`}>
                    {useWalletCredit ? `✓ Applied (${fmtINR(walletDeductionAmount)})` : "Apply Wallet"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 2: PAYMENT MODE ═══ */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Net Payable Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-[#0f2d52] to-[#1e3a6e] p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Net Payable Now</div>
                  <div className="text-3xl font-black text-white font-mono mt-0.5">{fmtINR(netPayable)}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {walletDeductionAmount > 0 && <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full px-2 py-0.5">Wallet -{fmtINR(walletDeductionAmount)}</span>}
                    {effectiveWaiver > 0 && <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full px-2 py-0.5">Waiver -{fmtINR(effectiveWaiver)}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-blue-300 font-bold">Invoice Total</div>
                  <div className="font-mono font-bold text-blue-100">{fmtINR(grandTotal)}</div>
                  <div className="text-[10px] text-blue-300 mt-1">GST incl. 18%</div>
                </div>
              </div>

              {/* Single/Split Toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <div><div className="text-xs font-bold text-slate-800">Split Payment</div><div className="text-[10px] text-slate-500">Collect across multiple tender modes</div></div>
                <button type="button" onClick={() => setIsSplitMode(!isSplitMode)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${isSplitMode ? "bg-blue-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"}`}>
                  {isSplitMode ? "Split ON" : "Single Mode"}
                </button>
              </div>

              {!isSplitMode ? (
                <div className="space-y-4">
                  {/* Mode Pill Selector */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Payment Mode *</label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {(Object.keys(METHOD_META) as PaymentMethod[]).map((m) => {
                        const meta = METHOD_META[m];
                        return (
                          <button key={m} type="button" onClick={() => setMethod(m)} className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-3 px-2 text-center transition ${method === m ? `${meta.border} ${meta.bg} ${meta.color} shadow-md` : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"}`}>
                            <span className="text-xl leading-none">{meta.icon}</span>
                            <span className="text-[10px] font-bold leading-tight">{meta.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Amount to Collect (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-2xl border-2 border-slate-200 bg-white pl-8 pr-4 py-3 text-2xl font-black font-mono text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                    </div>
                  </div>

                  {/* UPI QR */}
                  {method === "UPI" && (
                    <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 p-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {upiQrCodeUrl ? (
                          <div className="relative shrink-0">
                            <img src={upiQrCodeUrl} alt="UPI QR" className="h-28 w-28 rounded-2xl border-2 border-white bg-white p-1.5 shadow-lg" />
                            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shadow"><span className="h-2 w-2 rounded-full bg-white animate-ping" /></span>
                          </div>
                        ) : (
                          <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 flex items-center justify-center shrink-0"><QrCode className="h-10 w-10 text-violet-300" /></div>
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="text-xs font-bold text-violet-900">{upiQrCodeUrl ? "✅ Dynamic QR Active" : "Enter amount to generate QR"}</div>
                          <div className="text-[11px] text-slate-600">Scan with <strong>GPay · PhonePe · Paytm · CRED · BHIM</strong></div>
                          <div className="font-mono text-[10px] text-slate-500">Merchant: <strong>labcore@icici</strong> · Amount: <strong className="text-violet-800">{fmtINR(Number(amount || 0))}</strong></div>
                          <button type="button" onClick={() => { const utr = `UPI${Date.now().toString().slice(-12)}`; setTransactionId(utr); setUpiConfirmed(true); showNotification(`UPI payment confirmed! UTR: ${utr}`, "success"); }} className="rounded-xl bg-violet-700 text-white px-3 py-1.5 text-[11px] font-bold hover:bg-violet-600 active:scale-95 transition">
                            {upiConfirmed ? "✓ Confirmed" : "Simulate Scan & Paid"}
                          </button>
                          {upiConfirmed && (
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                              <CheckCircle2 className="h-3.5 w-3.5" />UTR: <span className="font-mono">{transactionId}</span>
                              <button type="button" onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(transactionId); setCopiedUtr(true); setTimeout(() => setCopiedUtr(false), 2000); }} className="ml-1">
                                {copiedUtr ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CARD Info */}
                  {method === "CARD" && (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3.5 flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-0.5">
                        <div className="font-bold text-sky-900">POS Terminal Guidelines</div>
                        <div className="text-slate-600">Swipe / Tap / Insert card on <strong>PineLabs / Innoviti POS</strong>. Enter Approval Code / RRN below.</div>
                        <div className="text-[10px] text-slate-400 font-mono">Terminal ID: PLAB-COUNTER-01 · MID: 8924701</div>
                      </div>
                    </div>
                  )}

                  {/* CHEQUE Info */}
                  {method === "CHEQUE" && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 flex items-start gap-3">
                      <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-0.5 text-slate-600">
                        <div className="font-bold text-slate-800">Cheque Collection Policy</div>
                        <div>Subject to <strong>3–5 banking day clearance</strong>. Receipt issued as "Payment Under Clearance". Enter Cheque No., Bank, and Branch below.</div>
                      </div>
                    </div>
                  )}

                  {/* Reference input for non-cash */}
                  {method !== "CASH" && (
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">{METHOD_META[method].label} Reference / UTR *</label>
                      <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder={METHOD_META[method].placeholder} className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                  )}

                  {/* Cash Denomination Calculator */}
                  {method === "CASH" && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 overflow-hidden">
                      <button type="button" onClick={() => setShowDenomCalc(!showDenomCalc)} className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-emerald-900 hover:bg-emerald-100/40 transition">
                        <span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-emerald-600" />Cash Denomination Calculator</span>
                        {showDenomCalc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {showDenomCalc && (
                        <div className="px-4 pb-4 space-y-3 border-t border-emerald-200/60">
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {CASH_DENOMS.map((denom) => (
                              <div key={denom} className="flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-white px-2.5 py-1.5">
                                <span className="text-[11px] font-bold text-emerald-800 w-10 shrink-0">₹{denom}</span>
                                <div className="flex items-center gap-1">
                                  <button type="button" onClick={() => setDenomMap((p) => ({ ...p, [denom]: Math.max(0, (p[denom] || 0) - 1) }))} className="h-5 w-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><Minus className="h-3 w-3 text-slate-600" /></button>
                                  <input type="number" min="0" value={denomMap[denom] || ""} onChange={(e) => setDenomMap((p) => ({ ...p, [denom]: Number(e.target.value) }))} className="w-8 text-center text-xs font-bold font-mono outline-none border-b border-emerald-200 bg-transparent" />
                                  <button type="button" onClick={() => setDenomMap((p) => ({ ...p, [denom]: (p[denom] || 0) + 1 }))} className="h-5 w-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><Plus className="h-3 w-3 text-slate-600" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <div><span className="text-[11px] text-slate-500">Total Tendered: </span><span className="font-mono font-black text-emerald-800 text-sm">{fmtINR(denomTotal(denomMap))}</span></div>
                            <button type="button" onClick={() => { const t = denomTotal(denomMap); setCashTendered(String(t)); }} className="rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-[11px] font-bold hover:bg-emerald-500 transition">Apply as Tendered</button>
                          </div>
                          {cashTendered && (
                            <div className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-bold ${cashChange > 0 ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"}`}>
                              <span className="text-slate-700">Change to Return:</span>
                              <span className={`font-mono text-sm ${cashChange > 0 ? "text-amber-700" : "text-emerald-700"}`}>{fmtINR(cashChange)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* SPLIT MODE */
                <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-blue-600" />Split Tender Rows</span>
                    <button type="button" onClick={() => setSplitRows([...splitRows, { method: "CARD", amount: "", transactionId: "" }])} className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold"><Plus className="h-3.5 w-3.5" />Add Row</button>
                  </div>
                  {splitRows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
                      <span className="text-base">{METHOD_META[row.method]?.icon}</span>
                      <select value={row.method} onChange={(e) => { const u = [...splitRows]; u[idx].method = e.target.value as PaymentMethod; setSplitRows(u); }} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-[11px] font-bold outline-none">
                        {(Object.keys(METHOD_META) as PaymentMethod[]).map((m) => <option key={m} value={m}>{METHOD_META[m].label}</option>)}
                      </select>
                      <input type="number" step="0.01" placeholder="₹ Amount" value={row.amount} onChange={(e) => { const u = [...splitRows]; u[idx].amount = e.target.value; setSplitRows(u); }} className="rounded-lg border border-slate-200 p-1.5 text-sm font-mono font-bold text-slate-900 w-full outline-none" />
                      {splitRows.length > 1 && <button type="button" onClick={() => setSplitRows(splitRows.filter((_, i) => i !== idx))} className="p-1 text-rose-400 hover:text-rose-600"><X className="h-4 w-4" /></button>}
                    </div>
                  ))}
                  <div className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-bold ${splitBalance > 0 ? "bg-rose-50 border border-rose-200" : "bg-emerald-50 border border-emerald-200"}`}>
                    <span className="text-slate-700">{splitBalance > 0 ? "Remaining to Allocate:" : "✓ Fully Allocated:"}</span>
                    <span className={`font-mono text-sm ${splitBalance > 0 ? "text-rose-600" : "text-emerald-700"}`}>{splitBalance > 0 ? fmtINR(splitBalance) : fmtINR(totalSplitSum)}</span>
                  </div>
                </div>
              )}

              {/* Remarks & Receipt Type */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Cashier Narration / Notes (Optional)</label>
                <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Collected at OPD Front Desk · Attendant present" className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Receipt Format</label>
                <div className="flex gap-2">
                  {(["80MM", "A4"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setReceiptType(t)} className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${receiptType === t ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                      {t === "80MM" ? "🖨️ 80mm Thermal Slip" : "📄 A4 Tax Invoice"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: SUMMARY & CONFIRM ═══ */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 p-4 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-200" />
                  <span className="font-black text-base">Confirm & Issue Receipt</span>
                </div>
                <div className="text-xs text-emerald-100">Review all details before confirming. This will record the payment, update the patient ledger, and generate a {receiptType === "80MM" ? "80mm thermal" : "A4"} receipt.</div>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                {[
                  ["Patient", patientName],
                  ["UHID", selectedOrder?.patient?.uhid || "—"],
                  ["Order #", selectedOrder?.orderNumber || "—"],
                  ["Invoice #", selectedOrder?.invoice?.invoiceNumber || "Auto-assigned"],
                  ["Tests", testsList.length > 0 ? testsList.map((i: any) => i.test?.testName || i.testName || "Test").slice(0, 3).join(", ") + (testsList.length > 3 ? ` +${testsList.length - 3} more` : "") : "Consolidated"],
                  ["Gross Total", fmtINR(grandTotal)],
                  ...(walletDeductionAmount > 0 ? [["Wallet Offset", `-${fmtINR(walletDeductionAmount)}`]] : []),
                  ...(effectiveWaiver > 0 ? [["Waiver / Concession", `-${fmtINR(effectiveWaiver)} (${waiverReason || "Authorized"})`]] : []),
                  ["Net Payable", fmtINR(netPayable)],
                  ["Payment Mode", isSplitMode ? `Split (${splitRows.filter(r => Number(r.amount) > 0).map(r => METHOD_META[r.method].label).join(" + ")})` : `${METHOD_META[method].icon} ${METHOD_META[method].label}`],
                  ...(transactionId ? [["Reference / UTR", transactionId]] : []),
                  ["Counter", counterLabel],
                  ["Referral Source", referralSource],
                  ...(referralDoctorName ? [["Referring Dr.", referralDoctorName]] : []),
                  ["Receipt Format", receiptType === "80MM" ? "80mm Thermal Slip" : "A4 Tax Invoice"],
                  ...(remarks ? [["Narration", remarks]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between px-4 py-2.5 hover:bg-slate-50/60">
                    <span className="text-slate-500 font-medium w-36 shrink-0">{k}:</span>
                    <span className="font-bold text-slate-900 text-right max-w-[260px]">{v}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-3.5 text-xs">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 mb-2">GST Tax Register</div>
                <div className="space-y-1.5">
                  {[["Taxable Value", fmtINR(gstBase)], ["CGST @ 9%", fmtINR(cgst)], ["SGST @ 9%", fmtINR(sgst)]].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-slate-600"><span>{l}</span><span className="font-mono">{v}</span></div>
                  ))}
                  <div className="flex justify-between font-black text-blue-900 border-t border-blue-200 pt-1.5"><span>Total (incl. GST)</span><span className="font-mono">{fmtINR(netPayable)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── STICKY FOOTER ── */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm">
              <ArrowLeft className="h-4 w-4" />Back
            </button>
          ) : (
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Cancel</button>
          )}

          <div className="flex items-center gap-3">
            {step === 0 && !selectedOrderId && (
              <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Select a patient order first</span>
            )}
            {step === 2 && !isSplitMode && Number(amount) <= 0 && (
              <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />Enter a valid amount</span>
            )}
            {step < 3 ? (
              <button type="button" disabled={step === 0 && !selectedOrderId} onClick={() => setStep((s) => (s + 1) as Step)} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:from-blue-600 hover:to-indigo-600 active:scale-95 disabled:opacity-40 transition">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" disabled={submitting} onClick={handleSubmit} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-2.5 text-sm font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-600 active:scale-95 disabled:opacity-50 transition">
                {submitting ? <><RefreshCw className="h-4 w-4 animate-spin" />Processing...</> : <><BadgeCheck className="h-4 w-4" />Confirm & Issue Receipt</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectPaymentModalDuplicate({
  isOpen,
  onClose,
  orders,
  patients,
  initialOrderId,
  initialAmount,
  onPaymentSuccess,
  showNotification,
}: CollectPaymentModalProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId || "");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
  
  const [amount, setAmount] = useState<string>(initialAmount || "");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  
  // Split mode
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitRows, setSplitRows] = useState<
    Array<{ method: PaymentMethod; amount: string; transactionId: string }>
  >([
    { method: "CASH", amount: "", transactionId: "" },
    { method: "UPI", amount: "", transactionId: "" },
  ]);

  // Dynamic UPI QR
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState<string>("");

  // Patient Wallet
  const [patientWalletBalance, setPatientWalletBalance] = useState<number>(0);
  const [useWalletCredit, setUseWalletCredit] = useState(false);
  const [walletDeductionAmount, setWalletDeductionAmount] = useState<number>(0);

  // Discount waiver
  const [hasDiscountWaiver, setHasDiscountWaiver] = useState(false);
  const [waiverAmount, setWaiverAmount] = useState<string>("");
  const [waiverReason, setWaiverReason] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Find currently selected order
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find(
      (o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId
    );
  }, [selectedOrderId, orders]);

  // Initial props update
  useEffect(() => {
    if (initialOrderId) {
      setSelectedOrderId(initialOrderId);
      const found = orders.find((o) => o.id === initialOrderId || o.orderNumber === initialOrderId);
      if (found) {
        handleSelectOrder(found);
      }
    }
    if (initialAmount) {
      setAmount(initialAmount);
    }
  }, [initialOrderId, initialAmount, orders]);

  // Filter orders by search
  const filteredOrders = useMemo(() => {
    const q = orderSearchQuery.trim().toLowerCase();
    if (!q) return orders.slice(0, 15);
    return orders
      .filter((o) => {
        const orderNum = (o.orderNumber || "").toLowerCase();
        const pName = `${o.patient?.firstName || ""} ${o.patient?.lastName || ""}`.toLowerCase();
        const uhid = (o.patient?.uhid || "").toLowerCase();
        const phone = (o.patient?.phone || "").toLowerCase();
        const invoiceNum = (o.invoice?.invoiceNumber || "").toLowerCase();
        return (
          orderNum.includes(q) ||
          pName.includes(q) ||
          uhid.includes(q) ||
          phone.includes(q) ||
          invoiceNum.includes(q)
        );
      })
      .slice(0, 20);
  }, [orders, orderSearchQuery]);

  // Select an order
  const handleSelectOrder = (order: any) => {
    setSelectedOrderId(order.id);
    setIsOrderDropdownOpen(false);
    setOrderSearchQuery("");

    const grandTotal = Number(order.grandTotal || order.invoice?.grandTotal || 0);
    const paid = Number(order.paidAmount || order.invoice?.paidAmount || 0);
    const due = Number(order.dueAmount || Math.max(0, grandTotal - paid));
    const remainingToCollect = due > 0 ? due : grandTotal;

    setAmount(String(remainingToCollect || ""));
    setUseWalletCredit(false);
    setWalletDeductionAmount(0);

    // Fetch live wallet balance for this patient
    if (order.patient?.id) {
      advancesApi
        .getWallet(order.patient.id)
        .then((res: any) => {
          if (res?.data && typeof res.data.balance === "number") {
            setPatientWalletBalance(res.data.balance);
          } else {
            setPatientWalletBalance(0);
          }
        })
        .catch(() => {
          setPatientWalletBalance(0);
        });
    } else {
      setPatientWalletBalance(0);
    }
  };

  // Generate UPI QR Code on amount or order changes
  useEffect(() => {
    if (isOpen && method === "UPI" && Number(amount) > 0 && selectedOrderId) {
      const upiUrl = `upi://pay?pa=labcore@icici&pn=LabCore%20Diagnostics&am=${amount}&cu=INR&tn=ORD-${selectedOrderId.slice(-6)}`;
      QRCode.toDataURL(upiUrl, {
        width: 150,
        margin: 1,
        color: { dark: "#0f2d52", light: "#ffffff" },
      })
        .then((url) => setUpiQrCodeUrl(url))
        .catch(() => setUpiQrCodeUrl(""));
    } else {
      setUpiQrCodeUrl("");
    }
  }, [isOpen, method, amount, selectedOrderId]);

  // Toggle Wallet Offset
  const handleToggleWallet = () => {
    const nextState = !useWalletCredit;
    setUseWalletCredit(nextState);

    if (nextState) {
      const currentDue = Number(
        selectedOrder?.dueAmount || selectedOrder?.grandTotal || amount
      );
      const deduct = Math.min(currentDue, patientWalletBalance);
      setWalletDeductionAmount(deduct);
      const remainingAfterWallet = Math.max(0, currentDue - deduct);
      setAmount(String(remainingAfterWallet));
      setRemarks(`Wallet credit offset applied: ₹${deduct}`);
      showNotification(`Applied ₹${deduct} from Patient Advance Wallet`, "info");
    } else {
      setWalletDeductionAmount(0);
      const currentDue = Number(
        selectedOrder?.dueAmount || selectedOrder?.grandTotal || amount
      );
      setAmount(String(currentDue));
      setRemarks("");
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrderId) {
      alert("Please select an Order to collect payment for.");
      return;
    }

    try {
      setSubmitting(true);

      if (isSplitMode) {
        const validSplits = splitRows.filter((r) => Number(r.amount) > 0);
        if (validSplits.length === 0) {
          alert("Please enter at least one split payment row with a valid amount.");
          setSubmitting(false);
          return;
        }

        const payload = {
          orderId: selectedOrderId,
          payments: validSplits.map((s) => ({
            amount: Number(s.amount),
            method: s.method,
            transactionId: s.transactionId.trim() || undefined,
            remarks: remarks || undefined,
          })),
        };

        const res = await paymentApi.createSplit(payload);
        if (res?.success || res?.data) {
          showNotification("Split payment collected successfully!", "success");
          onPaymentSuccess(Array.isArray(res.data) ? res.data[0] : res.data);
          onClose();
        } else {
          alert(res?.message || "Split payment failed.");
        }
      } else {
        const paymentAmt = Number(amount);
        if (!paymentAmt || paymentAmt <= 0) {
          alert("Please enter a valid positive payment amount.");
          setSubmitting(false);
          return;
        }

        const payload = {
          orderId: selectedOrderId,
          amount: paymentAmt,
          method,
          transactionId: transactionId.trim() || undefined,
          remarks: [
            remarks,
            walletDeductionAmount > 0 ? `Wallet Offset: ₹${walletDeductionAmount}` : "",
            hasDiscountWaiver && Number(waiverAmount) > 0 ? `Waiver: ₹${waiverAmount} (${waiverReason})` : "",
          ]
            .filter(Boolean)
            .join(" | ") || undefined,
        };

        const res = await paymentApi.create(payload);
        if (res?.success || res?.data) {
          showNotification(`Payment of ₹${paymentAmt.toLocaleString("en-IN")} recorded successfully!`, "success");
          onPaymentSuccess(res.data);
          onClose();
        } else {
          alert(res?.message || "Payment collection failed.");
        }
      }
    } catch (err: any) {
      console.error("Payment submission error:", err);
      alert(err.message || "Failed to collect payment. Please verify inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalSplitSum = splitRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Collect Payment</h3>
              <p className="text-xs text-slate-500">Record cashier payment, POS card swipe, or dynamic UPI QR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Order Search & Selector */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Patient Order / Invoice *
            </label>
            <div className="relative">
              <input
                type="text"
                value={orderSearchQuery}
                onFocus={() => setIsOrderDropdownOpen(true)}
                onChange={(e) => {
                  setOrderSearchQuery(e.target.value);
                  setIsOrderDropdownOpen(true);
                }}
                placeholder={
                  selectedOrder
                    ? `${selectedOrder.orderNumber} - ${selectedOrder.patient?.firstName || "Patient"} ${selectedOrder.patient?.lastName || ""}`
                    : "Search by Patient Name, UHID, Phone, or Order #..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Dropdown Options */}
            {isOrderDropdownOpen && (
              <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => {
                    const pName = o.patient
                      ? `${o.patient.firstName || ""} ${o.patient.lastName || ""}`.trim()
                      : "Patient";
                    const grandTotal = Number(o.grandTotal || o.invoice?.grandTotal || 0);
                    const due = Number(o.dueAmount || Math.max(0, grandTotal - Number(o.paidAmount || 0)));

                    return (
                      <div
                        key={o.id}
                        onClick={() => handleSelectOrder(o)}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-xs transition hover:bg-blue-50"
                      >
                        <div>
                          <div className="font-bold text-slate-900">
                            {o.orderNumber} • <span className="text-blue-700">{pName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            UHID: {o.patient?.uhid || "—"} • Phone: {o.patient?.phone || "No phone"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">₹{grandTotal}</div>
                          <div className="text-[11px] font-semibold text-rose-600">
                            Due: ₹{due}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching orders found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Order Summary Card */}
          {selectedOrder && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Patient Details:</span>
                <span className="font-bold text-slate-900">
                  {selectedOrder.patient?.firstName} {selectedOrder.patient?.lastName} ({selectedOrder.patient?.uhid || "No UHID"})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Invoice Number:</span>
                <span className="font-mono text-slate-700 font-semibold">
                  {selectedOrder.invoice?.invoiceNumber || "Auto-assigned"}
                </span>
              </div>
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="flex items-center justify-between border-t border-blue-200/50 pt-1.5">
                  <span className="text-slate-500 font-medium">Tests Ordered:</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[280px]">
                    {selectedOrder.items.map((i: any) => i.test?.testName || i.testName || "Test").join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-blue-200/60 pt-2 font-bold">
                <span className="text-blue-950">Outstanding Due Balance:</span>
                <span className="font-mono text-base text-rose-600">
                  ₹{Number(selectedOrder.dueAmount || selectedOrder.invoice?.grandTotal || amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* Patient Advance Wallet Credit Offset Banner */}
          {patientWalletBalance > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs">
              <div>
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-emerald-700" />
                  Patient Advance Credit: ₹{patientWalletBalance.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Pre-paid deposit available. Deduct directly to settle this invoice.
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleWallet}
                className={`rounded-xl px-3.5 py-1.5 font-bold transition text-xs shadow-sm ${
                  useWalletCredit
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-100"
                }`}
              >
                {useWalletCredit ? "Wallet Applied ✓" : "Apply Wallet Credit"}
              </button>
            </div>
          )}

          {/* Single vs Split Mode Switch */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-2 text-xs">
            <span className="font-semibold text-slate-800 pl-2">Split payment across multiple modes?</span>
            <button
              type="button"
              onClick={() => setIsSplitMode(!isSplitMode)}
              className={`rounded-xl px-3.5 py-1.5 font-bold transition text-xs ${
                isSplitMode ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {isSplitMode ? "Split Payment ON" : "Single Mode (Default)"}
            </button>
          </div>

          {/* Single Mode Form */}
          {!isSplitMode ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Amount to Collect (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-lg font-mono font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="CASH">💵 Cash (Till Register)</option>
                    <option value="UPI">📱 UPI / Dynamic QR Code</option>
                    <option value="CARD">💳 Debit / Credit Card (POS)</option>
                    <option value="NET_BANKING">🏦 Net Banking / NEFT</option>
                    <option value="CHEQUE">🧾 Cheque</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Interactive UPI QR */}
              {method === "UPI" && upiQrCodeUrl && (
                <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={upiQrCodeUrl}
                      alt="Counter Dynamic UPI QR"
                      className="h-24 w-24 rounded-xl border-2 border-white bg-white p-1 shadow-md"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        Dynamic UPI QR Ready
                      </div>
                      <p className="text-xs text-slate-600">
                        Scan with <strong>GPay, PhonePe, Paytm, CRED or BHIM</strong>
                      </p>
                      <p className="text-xs font-mono font-bold text-blue-900">
                        Amount: ₹{Number(amount || 0).toLocaleString("en-IN")}
                      </p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Merchant: labcore@icici
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const mockUtr = `UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
                      setTransactionId(mockUtr);
                      showNotification(`UPI Payment confirmed! Auto-filled UTR: ${mockUtr}`, "success");
                    }}
                    className="rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-800 shadow-sm hover:bg-blue-100 active:scale-95 transition"
                  >
                    Simulate Scan & Paid
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Transaction / Card Auth / Bank UTR # (Optional)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. UPI-99881122 or Card Approval #4412"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          ) : (
            /* Split Mode Rows */
            <div className="space-y-3 rounded-2xl border border-slate-200 p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Split Rows</span>
                <button
                  type="button"
                  onClick={() =>
                    setSplitRows([
                      ...splitRows,
                      { method: "CARD", amount: "", transactionId: "" },
                    ])
                  }
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  + Add Split Mode
                </button>
              </div>

              {splitRows.map((row, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={row.method}
                    onChange={(e) => {
                      const updated = [...splitRows];
                      updated[index].method = e.target.value as PaymentMethod;
                      setSplitRows(updated);
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold w-36 outline-none"
                  >
                    <option value="CASH">💵 Cash</option>
                    <option value="UPI">📱 UPI</option>
                    <option value="CARD">💳 Card</option>
                    <option value="NET_BANKING">🏦 Net Banking</option>
                    <option value="CHEQUE">🧾 Cheque</option>
                  </select>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(e) => {
                      const updated = [...splitRows];
                      updated[index].amount = e.target.value;
                      setSplitRows(updated);
                    }}
                    className="rounded-xl border border-slate-200 p-2 text-xs font-mono font-bold text-slate-900 w-32 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Ref / UTR"
                    value={row.transactionId}
                    onChange={(e) => {
                      const updated = [...splitRows];
                      updated[index].transactionId = e.target.value;
                      setSplitRows(updated);
                    }}
                    className="flex-1 rounded-xl border border-slate-200 p-2 text-xs font-mono outline-none"
                  />

                  {splitRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSplitRows(splitRows.filter((_, i) => i !== index))}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500">Split Total Sum:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  ₹{totalSplitSum.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* Discount / Authorized Waiver Option */}
          <div className="rounded-2xl border border-slate-200 p-3 text-xs bg-white">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-amber-600" />
                Apply Special Concession / Manager Waiver?
              </span>
              <button
                type="button"
                onClick={() => setHasDiscountWaiver(!hasDiscountWaiver)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  hasDiscountWaiver ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {hasDiscountWaiver ? "Enabled" : "Add Waiver"}
              </button>
            </div>

            {hasDiscountWaiver && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 pt-2 border-t border-slate-100">
                <input
                  type="number"
                  placeholder="Waiver Amount (₹)"
                  value={waiverAmount}
                  onChange={(e) => setWaiverAmount(e.target.value)}
                  className="rounded-xl border border-slate-200 p-2 text-xs font-mono font-bold outline-none"
                />
                <input
                  type="text"
                  placeholder="Reason / Approved by Dr."
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                  className="rounded-xl border border-slate-200 p-2 text-xs outline-none"
                />
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Cashier Notes (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Collected at OPD Front Desk, Counter 01"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition"
            >
              {submitting ? "Processing..." : "Confirm & Issue Receipt"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
