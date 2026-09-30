"use client";

import React, { ChangeEvent, useState, useEffect } from "react";
import { doctorApi } from "@/lib/api";
import {
  Search,
  RotateCcw,
  Calendar,
  Filter,
  User,
  CreditCard,
  X,
  Sparkles,
} from "lucide-react";

interface Doctor {
  id: string;
  doctorCode: string;
  fullName: string;
  specialization?: string;
}

interface InvoiceFiltersProps {
  filters: {
    search: string;
    paymentStatus: string;
    paymentMode: string;
    doctorId: string;
    dateFrom: string;
    dateTo: string;
  };
  onFilterChange: (filters: {
    search: string;
    paymentStatus: string;
    paymentMode: string;
    doctorId: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
}

export default function InvoiceFilters({
  filters,
  onFilterChange,
}: InvoiceFiltersProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.paymentStatus) ||
    Boolean(filters.paymentMode) ||
    Boolean(filters.doctorId) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await doctorApi.getAll();
      if (response.success && response.data) {
        const doctorsData = Array.isArray(response.data)
          ? response.data
          : response.data.doctors || [];
        setDoctors(doctorsData);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handlePaymentStatusChange = (value: string) => {
    onFilterChange({ ...filters, paymentStatus: value });
  };

  const handlePaymentModeChange = (value: string) => {
    onFilterChange({ ...filters, paymentMode: value });
  };

  const handleDoctorChange = (value: string) => {
    onFilterChange({ ...filters, doctorId: value });
  };

  const handleDateFromChange = (value: string) => {
    onFilterChange({ ...filters, dateFrom: value });
  };

  const handleDateToChange = (value: string) => {
    onFilterChange({ ...filters, dateTo: value });
  };

  const handleReset = () => {
    onFilterChange({
      search: "",
      paymentStatus: "",
      paymentMode: "",
      doctorId: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Quick Date Preset Buttons
  const setQuickDate = (type: "all" | "today" | "yesterday" | "7days" | "month") => {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    if (type === "all") {
      onFilterChange({ ...filters, dateFrom: "", dateTo: "" });
    } else if (type === "today") {
      const d = fmt(today);
      onFilterChange({ ...filters, dateFrom: d, dateTo: d });
    } else if (type === "yesterday") {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      const d = fmt(y);
      onFilterChange({ ...filters, dateFrom: d, dateTo: d });
    } else if (type === "7days") {
      const past = new Date(today);
      past.setDate(today.getDate() - 7);
      onFilterChange({ ...filters, dateFrom: fmt(past), dateTo: fmt(today) });
    } else if (type === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      onFilterChange({ ...filters, dateFrom: fmt(firstDay), dateTo: fmt(today) });
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
      {/* Top row: Quick presets and active filter indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mr-1">
            Date Presets:
          </span>
          {[
            { id: "all", label: "All Dates" },
            { id: "today", label: "Today" },
            { id: "yesterday", label: "Yesterday" },
            { id: "7days", label: "Last 7 Days" },
            { id: "month", label: "This Month" },
          ].map((preset) => {
            const isAll = preset.id === "all" && !filters.dateFrom && !filters.dateTo;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setQuickDate(preset.id as any)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  isAll
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Main Filter Inputs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Smart Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={filters.search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              placeholder="Invoice #, patient name, UHID, phone, order ID..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handlePaymentStatusChange(e.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="PENDING">Unpaid / Due</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Payment Mode
          </label>
          <select
            value={filters.paymentMode || ""}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handlePaymentModeChange(e.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          >
            <option value="">All Payment Modes</option>
            <option value="CASH">Cash Counter</option>
            <option value="UPI">UPI (GPay / PhonePe)</option>
            <option value="CARD">Credit / Debit Card</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="CHEQUE">Cheque / DD</option>
          </select>
        </div>

        {/* Referring Doctor (B2B) */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Referring Doctor (B2B)
          </label>
          <select
            value={filters.doctorId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handleDoctorChange(e.target.value)
            }
            disabled={loadingDoctors}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition-all"
          >
            <option value="">All Referring Doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.fullName}{" "}
                {doctor.specialization ? `(${doctor.specialization})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Pickers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-1">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleDateFromChange(e.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleDateToChange(e.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div className="lg:col-span-2 flex items-end">
          <p className="text-[11px] text-slate-400">
            Real-time multi-counter filtering by invoice number, patient name, UHID, doctor referral, payment mode, or settlement status.
          </p>
        </div>
      </div>
    </section>
  );
}