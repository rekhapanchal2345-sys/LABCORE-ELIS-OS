"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  User,
  UserPlus,
  Stethoscope,
  FlaskConical,
  Percent,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";
import { patientApi, doctorApi, testApi, orderApi, invoiceApi, paymentsApi } from "@/lib/api";
import { showInvoiceToast } from "./InvoiceToast";

interface TestItem {
  id: string;
  testCode: string;
  testName: string;
  price: number;
  sampleType?: string;
  tatHours?: number;
  department?: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  uhid: string;
  phone: string;
  gender: string;
  email?: string;
  dateOfBirth?: string;
}

interface Doctor {
  id: string;
  fullName: string;
  specialization?: string;
  doctorCode?: string;
}

interface CartItem extends TestItem {
  discount: number;
}

interface QuickPOSBillingProps {
  onSuccess?: (createdInvoice: any) => void;
}

export default function QuickPOSBilling({ onSuccess }: QuickPOSBillingProps) {
  const router = useRouter();

  // Patients & Doctors state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Quick patient modal state
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [quickForm, setQuickForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "MALE",
    age: "",
  });

  // Doctor state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // Tests & Catalog state
  const [tests, setTests] = useState<TestItem[]>([]);
  const [testSearch, setTestSearch] = useState("");
  const [showTestDropdown, setShowTestDropdown] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Billing & Discounts
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [flatDiscount, setFlatDiscount] = useState<number>(0);
  const [discountMode, setDiscountMode] = useState<"percent" | "flat">("percent");
  const [isGstApplicable, setIsGstApplicable] = useState<boolean>(true); // 18% vs 0% healthcare exempt

  // Payment
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [cashTendered, setCashTendered] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial Data Fetching
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [patRes, docRes, testRes] = await Promise.all([
        patientApi.getAll("?limit=50"),
        doctorApi.getAll("?limit=50"),
        testApi.getAll("?limit=100"),
      ]);

      if (patRes.success && patRes.data) {
        const pData = Array.isArray(patRes.data) ? patRes.data : patRes.data.patients || [];
        setPatients(pData);
      }
      if (docRes.success && docRes.data) {
        const dData = Array.isArray(docRes.data) ? docRes.data : docRes.data.doctors || [];
        setDoctors(dData);
      }
      if (testRes.success && testRes.data) {
        const tData = Array.isArray(testRes.data) ? testRes.data : testRes.data.tests || [];
        setTests(
          tData.map((t: any) => ({
            id: t.id,
            testCode: t.testCode || t.code || "T-001",
            testName: t.testName || t.name || "Test",
            price: Number(t.price || 0),
            sampleType: t.sampleType || "Blood",
            tatHours: t.tatHours || 24,
            department: t.department || t.category?.name || "General",
          }))
        );
      }
    } catch (err) {
      console.error("Error loading POS initial data:", err);
    }
  };

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 5);
    const q = patientSearch.toLowerCase();
    return patients.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.uhid && p.uhid.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q))
    );
  }, [patients, patientSearch]);

  // Filtered Tests
  const filteredTests = useMemo(() => {
    if (!testSearch.trim()) return tests.slice(0, 6);
    const q = testSearch.toLowerCase();
    return tests.filter(
      (t) =>
        t.testName.toLowerCase().includes(q) ||
        t.testCode.toLowerCase().includes(q) ||
        (t.department && t.department.toLowerCase().includes(q))
    );
  }, [tests, testSearch]);

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountMode === "percent") {
      return (subtotal * discountPercent) / 100;
    }
    return Math.min(flatDiscount, subtotal);
  }, [subtotal, discountMode, discountPercent, flatDiscount]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstRate = isGstApplicable ? 18 : 0;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const grandTotal = Math.round(taxableAmount + gstAmount);

  const changeDue = useMemo(() => {
    if (typeof cashTendered !== "number") return 0;
    return Math.max(0, cashTendered - grandTotal);
  }, [cashTendered, grandTotal]);

  const handleAddToCart = (test: TestItem) => {
    if (cart.some((c) => c.id === test.id)) {
      showInvoiceToast("info", "Test already added to bill cart");
      return;
    }
    setCart((prev) => [...prev, { ...test, discount: 0 }]);
    setTestSearch("");
    setShowTestDropdown(false);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleQuickRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickForm.firstName || !quickForm.phone) {
      showInvoiceToast("error", "First name and phone number are required");
      return;
    }

    try {
      const payload = {
        firstName: quickForm.firstName,
        lastName: quickForm.lastName || "Patient",
        phone: quickForm.phone,
        gender: quickForm.gender,
      };

      const res = await patientApi.create(payload);
      if (res.success && res.data) {
        const newPatient = res.data;
        setPatients((prev) => [newPatient, ...prev]);
        setSelectedPatient(newPatient);
        setShowQuickRegister(false);
        showInvoiceToast("success", `Patient ${newPatient.firstName} registered successfully`);
      }
    } catch (err) {
      console.error("Failed to register patient:", err);
      showInvoiceToast("error", "Failed to quick register patient");
    }
  };

  // Submit and Create Invoice with Order and Payment
  const handleCheckout = async (autoPrintType: "thermal" | "a4" | "none") => {
    if (!selectedPatient) {
      showInvoiceToast("error", "Please select or register a patient first");
      return;
    }
    if (cart.length === 0) {
      showInvoiceToast("error", "Please select at least one test in the cart");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Order
      const orderPayload = {
        patientId: selectedPatient.id,
        doctorId: selectedDoctorId || undefined,
        items: cart.map((c) => ({
          testId: c.id,
          quantity: 1,
          price: c.price,
          discount: 0,
          finalPrice: c.price,
        })),
        priority: "NORMAL",
        paymentStatus: "PAID",
      };

      const orderRes = await orderApi.create(orderPayload);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || "Failed to create order");
      }

      const createdOrder = orderRes.data;

      // 2. Create Invoice
      const invoicePayload = {
        orderId: createdOrder.id,
        discount: discountAmount,
        gstPercent: gstRate,
      };

      const invoiceRes = await invoiceApi.create(invoicePayload);
      if (!invoiceRes.success || !invoiceRes.data) {
        throw new Error(invoiceRes.message || "Failed to generate invoice");
      }

      const createdInvoice = invoiceRes.data;

      // 3. Record Payment
      await paymentsApi.create({
        orderId: createdOrder.id,
        amount: grandTotal,
        method: paymentMode,
        remarks: `POS Counter Bill: Tendered ₹${cashTendered || grandTotal}`,
      });

      showInvoiceToast(
        "success",
        `Invoice #${createdInvoice.invoiceNumber || ""} billed & settled successfully!`
      );

      // Reset cart
      setCart([]);
      setSelectedPatient(null);
      setPatientSearch("");
      setCashTendered("");

      if (onSuccess) {
        onSuccess(createdInvoice);
      } else {
        router.push(`/invoices/${createdInvoice.id}${autoPrintType !== "none" ? `?print=true` : ""}`);
      }
    } catch (err: any) {
      console.error("POS Checkout error:", err);
      showInvoiceToast("error", err.message || "Checkout failed. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatINR = (amt: number) => {
    return `₹${Number(amt || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* LEFT COLUMN: Patient Selection & Test Cart (7 cols) */}
      <div className="space-y-5 lg:col-span-7">
        {/* Step 1: Patient Selection Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" />
              1. Patient Identification
            </h3>
            <button
              type="button"
              onClick={() => setShowQuickRegister(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              + Quick Register
            </button>
          </div>

          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-xl bg-indigo-50/60 p-3.5 border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white text-sm">
                  {selectedPatient.firstName[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="text-indigo-700 font-semibold">UHID: {selectedPatient.uhid}</span>
                    <span>• {selectedPatient.phone}</span>
                    <span>• {selectedPatient.gender}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
              >
                ✕ Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setShowPatientDropdown(true);
                }}
                onFocus={() => setShowPatientDropdown(true)}
                placeholder="Search patient by name, UHID, or mobile number..."
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />

              {showPatientDropdown && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                  {filteredPatients.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No patient matches found. Click{" "}
                      <button
                        onClick={() => setShowQuickRegister(true)}
                        className="text-indigo-600 font-bold underline"
                      >
                        + Quick Register
                      </button>{" "}
                      to add.
                    </div>
                  ) : (
                    filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPatient(p);
                          setShowPatientDropdown(false);
                        }}
                        className="flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-indigo-50/50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {p.firstName} {p.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            UHID: {p.uhid} • Phone: {p.phone}
                          </div>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {p.gender}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Doctor Selector */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
            <Stethoscope className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Direct Walk-in / Self-Referred</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.fullName} {doc.specialization ? `(${doc.specialization})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Diagnostic Test Search & Cart Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-emerald-600" />
              2. Add Tests & Profiles
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {cart.length} Test{cart.length === 1 ? "" : "s"} Selected
            </span>
          </div>

          {/* Test Autocomplete Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={testSearch}
              onChange={(e) => {
                setTestSearch(e.target.value);
                setShowTestDropdown(true);
              }}
              onFocus={() => setShowTestDropdown(true)}
              placeholder="Search test by name (e.g., CBC, Lipid, Thyroid, HbA1c)..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
            />

            {showTestDropdown && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                {filteredTests.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching diagnostic tests found
                  </div>
                ) : (
                  filteredTests.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleAddToCart(t)}
                      className="flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-emerald-50/50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{t.testName}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-mono text-emerald-700 font-semibold">{t.testCode}</span>
                          <span>• {t.sampleType}</span>
                          <span>• TAT: {t.tatHours}h</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">{formatINR(t.price)}</span>
                        <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          + Add
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Test Cart Table */}
          {cart.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
              <FlaskConical className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">Cart is empty</p>
              <p className="text-[11px] text-slate-400">Search and select tests above to begin billing</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">Test Details</th>
                    <th className="px-3 py-2.5">Sample & TAT</th>
                    <th className="px-3 py-2.5 text-right">Price (₹)</th>
                    <th className="px-3 py-2.5 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cart.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{item.testName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{item.testCode}</div>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-500">
                        {item.sampleType} • {item.tatHours}h
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                        {formatINR(item.price)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Financial Calculator & Checkout (5 cols) */}
      <div className="space-y-5 lg:col-span-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-600" />
              3. Payment & Settlement
            </h3>
            <span className="text-[11px] font-mono text-slate-400">SAC: 999312</span>
          </div>

          {/* Subtotal, Discount & Tax Controls */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tests Subtotal ({cart.length} items)</span>
              <span className="font-bold text-slate-900">{formatINR(subtotal)}</span>
            </div>

            {/* Discount Section */}
            <div className="rounded-xl bg-slate-50 p-3 space-y-2 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Special Discount:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setDiscountMode("percent")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      discountMode === "percent"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountMode("flat")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      discountMode === "flat"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    ₹ Flat
                  </button>
                </div>
              </div>

              {discountMode === "percent" ? (
                <div className="flex items-center gap-1.5">
                  {[0, 5, 10, 15, 20].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setDiscountPercent(rate)}
                      className={`flex-1 rounded-lg py-1 text-center font-bold text-xs transition-colors ${
                        discountPercent === rate
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  value={flatDiscount || ""}
                  onChange={(e) => setFlatDiscount(Number(e.target.value) || 0)}
                  placeholder="Enter flat discount in ₹"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold pt-1">
                  <span>Discount Applied:</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
            </div>

            {/* GST Rate Switcher */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">GST (18% Diagnostic):</span>
                <button
                  type="button"
                  onClick={() => setIsGstApplicable(!isGstApplicable)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isGstApplicable
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isGstApplicable ? "Applicable (18%)" : "Exempt (0%)"}
                </button>
              </div>
              <span className="font-semibold text-slate-800">{formatINR(gstAmount)}</span>
            </div>

            {/* Net Payable Grand Total */}
            <div className="rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                  Net Payable Amount
                </span>
                <p className="text-2xl font-black">{formatINR(grandTotal)}</p>
              </div>
              <div className="text-right text-[11px] text-indigo-200">
                <span>Inclusive of all taxes</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700">Tender Mode:</span>
            <div className="grid grid-cols-3 gap-2">
              {(["CASH", "UPI", "CARD"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-xs font-bold transition-all ${
                    paymentMode === mode
                      ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300"
                      : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {mode === "CASH" && <Banknote className="h-4 w-4" />}
                  {mode === "UPI" && <QrCode className="h-4 w-4" />}
                  {mode === "CARD" && <CreditCard className="h-4 w-4" />}
                  <span>{mode}</span>
                </button>
              ))}
            </div>

            {/* Cash Tender Calculation */}
            {paymentMode === "CASH" && (
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Cash Tendered by Patient:</span>
                  <input
                    type="number"
                    value={cashTendered}
                    placeholder={String(grandTotal)}
                    onChange={(e) =>
                      setCashTendered(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-right font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                {typeof cashTendered === "number" && (
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                    <span className="text-slate-500">Return Change:</span>
                    <span className="font-mono text-emerald-600 text-sm">{formatINR(changeDue)}</span>
                  </div>
                )}
              </div>
            )}

            {/* UPI QR Display */}
            {paymentMode === "UPI" && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center text-xs">
                <QrCode className="mx-auto h-8 w-8 text-indigo-600 mb-1" />
                <p className="font-bold text-indigo-950">Patient BharatQR Code</p>
                <p className="text-[11px] text-indigo-600">
                  Scan via GPay / PhonePe / Paytm for {formatINR(grandTotal)}
                </p>
              </div>
            )}
          </div>

          {/* Action Checkout Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting || cart.length === 0 || !selectedPatient}
              onClick={() => handleCheckout("thermal")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Printer className="h-4 w-4" />
              {isSubmitting ? "Processing..." : `Collect ${formatINR(grandTotal)} & Print Thermal`}
            </button>

            <button
              type="button"
              disabled={isSubmitting || cart.length === 0 || !selectedPatient}
              onClick={() => handleCheckout("a4")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Print Luxury A4 GST Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Quick Patient Registration Modal */}
      {showQuickRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                30-Second Quick Patient Add
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickRegister(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickRegisterSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={quickForm.firstName}
                    onChange={(e) => setQuickForm({ ...quickForm, firstName: e.target.value })}
                    placeholder="Ramesh"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={quickForm.lastName}
                    onChange={(e) => setQuickForm({ ...quickForm, lastName: e.target.value })}
                    placeholder="Patel"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={quickForm.phone}
                  onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                  placeholder="9876543210"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Gender</label>
                  <select
                    value={quickForm.gender}
                    onChange={(e) => setQuickForm({ ...quickForm, gender: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    value={quickForm.age}
                    onChange={(e) => setQuickForm({ ...quickForm, age: e.target.value })}
                    placeholder="35"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition-colors"
                >
                  Save & Select Patient
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickRegister(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
