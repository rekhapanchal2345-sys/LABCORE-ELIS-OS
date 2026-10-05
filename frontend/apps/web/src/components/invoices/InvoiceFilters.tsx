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
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-slate-950/80 space-y-4">
      {/* Top row: Quick presets and active filter indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mr-1">
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
            const isSelected =
              isAll ||
              (preset.id === "today" &&
                filters.dateFrom === new Date().toISOString().split("T")[0] &&
                filters.dateTo === new Date().toISOString().split("T")[0]);

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setQuickDate(preset.id as any)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 font-bold"
                    : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
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
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 transition-colors"
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
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Smart Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={filters.search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              placeholder="Invoice #, patient name, UHID, phone, order ID..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2 pl-10 pr-9 text-xs text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            />
            {filters.search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handlePaymentStatusChange(e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
          >
            <option value="" className="bg-slate-900 text-slate-200">All Statuses</option>
            <option value="PAID" className="bg-slate-900 text-slate-200">Fully Paid</option>
            <option value="PARTIAL" className="bg-slate-900 text-slate-200">Partially Paid</option>
            <option value="PENDING" className="bg-slate-900 text-slate-200">Unpaid / Due</option>
            <option value="REFUNDED" className="bg-slate-900 text-slate-200">Refunded</option>
          </select>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Payment Mode
          </label>
          <select
            value={filters.paymentMode || ""}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handlePaymentModeChange(e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
          >
            <option value="" className="bg-slate-900 text-slate-200">All Payment Modes</option>
            <option value="CASH" className="bg-slate-900 text-slate-200">Cash Counter</option>
            <option value="UPI" className="bg-slate-900 text-slate-200">UPI (GPay / PhonePe)</option>
            <option value="CARD" className="bg-slate-900 text-slate-200">Credit / Debit Card</option>
            <option value="NET_BANKING" className="bg-slate-900 text-slate-200">Net Banking</option>
            <option value="CHEQUE" className="bg-slate-900 text-slate-200">Cheque / DD</option>
          </select>
        </div>

        {/* Referring Doctor (B2B) */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Referring Doctor (B2B)
          </label>
          <select
            value={filters.doctorId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handleDoctorChange(e.target.value)
            }
            disabled={loadingDoctors}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50"
          >
            <option value="" className="bg-slate-900 text-slate-200">All Referring Doctors</option>
            {doctors.map((doctor) => {
              const cleaned = (doctor.fullName || "")
                .replace(/^(dr\.?|dr\b)\s+/i, "")
                .replace(/^(dr\.?|dr\b)\s+/i, "")
                .trim();
              const doctorLabel = cleaned ? `Dr. ${cleaned}` : doctor.fullName;
              return (
                <option key={doctor.id} value={doctor.id} className="bg-slate-900 text-slate-200">
                  {doctorLabel}{" "}
                  {doctor.specialization ? `(${doctor.specialization})` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Date Pickers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-1">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleDateFromChange(e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleDateToChange(e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
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