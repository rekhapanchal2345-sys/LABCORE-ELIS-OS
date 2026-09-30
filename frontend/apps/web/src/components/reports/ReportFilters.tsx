"use client";

import React, { ChangeEvent } from "react";
import { Search, SlidersHorizontal, RotateCcw, Stethoscope, AlertTriangle, Radio, Timer } from "lucide-react";

interface ReportFiltersProps {
  search: string;
  reportType: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  doctor: string;
  criticalOnly: boolean;
  deliveryChannel: string;
  slaBreach: boolean;
  doctors: Array<{ id: string; name: string }>;

  onSearchChange: (value: string) => void;
  onReportTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDoctorChange: (value: string) => void;
  onCriticalOnlyChange: (value: boolean) => void;
  onDeliveryChannelChange: (value: string) => void;
  onSlaBreachChange: (value: boolean) => void;
  onReset: () => void;
}

export default function ReportFilters({
  search,
  reportType,
  status,
  dateFrom,
  dateTo,
  doctor,
  criticalOnly,
  deliveryChannel,
  slaBreach,
  doctors,
  onSearchChange,
  onReportTypeChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onDoctorChange,
  onCriticalOnlyChange,
  onDeliveryChannelChange,
  onSlaBreachChange,
  onReset,
}: ReportFiltersProps) {
  const hasFilters =
    Boolean(search) ||
    Boolean(reportType) ||
    Boolean(status) ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    Boolean(doctor) || criticalOnly || Boolean(deliveryChannel) || slaBreach;

  return (
    <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-cyan-50/30 p-4 shadow-[0_12px_35px_rgba(30,41,99,0.08)]">
      <div className="mb-4 flex items-center justify-between border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-600 p-2 text-white shadow-lg shadow-indigo-200"><SlidersHorizontal className="h-4 w-4" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Smart filters</p>
            <p className="text-xs text-slate-500">Refine your report worklist</p>
          </div>
        </div>
        <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:block">Report operations</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-8">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-indigo-700">
            Search Reports
          </label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onSearchChange(e.target.value)
              }
              placeholder="Report number, patient..."
              className="h-11 w-full rounded-xl border border-indigo-200 bg-white pl-10 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-violet-700">
            Report Type
          </label>

          <select
            value={reportType}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onReportTypeChange(e.target.value)
            }
            className="h-11 w-full rounded-xl border border-violet-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-violet-100"
          >
            <option value="">All types</option>
            <option value="patient">Patient Report</option>
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="financial">Financial Report</option>
            <option value="test">Test Report</option>
            <option value="custom">Custom Report</option>
          </select>
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-700"><Stethoscope className="h-3 w-3" /> Doctor</label>
          <select value={doctor} onChange={(e) => onDoctorChange(e.target.value)} className="h-11 w-full rounded-xl border border-fuchsia-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-fuchsia-100">
            <option value="">All doctors</option>
            {doctors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sky-700"><Radio className="h-3 w-3" /> Channel</label>
          <select value={deliveryChannel} onChange={(e) => onDeliveryChannelChange(e.target.value)} className="h-11 w-full rounded-xl border border-sky-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-sky-100">
            <option value="">All channels</option><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">Email</option><option value="SMS">SMS</option><option value="PHYSICAL">Physical</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-cyan-700">
            Status
          </label>

          <select
            value={status}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onStatusChange(e.target.value)
            }
            className="h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-cyan-100"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="generated">Generated</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="mt-4 grid gap-3 border-t border-indigo-100 pt-3 md:grid-cols-2">
          <label className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 transition ${criticalOnly ? "border-rose-300 bg-rose-50 text-rose-800 shadow-sm" : "border-slate-200 bg-white text-slate-600"}`}>
            <span className="flex items-center gap-2 text-xs font-black"><AlertTriangle className="h-4 w-4 text-rose-500" /> Critical results only</span>
            <input type="checkbox" checked={criticalOnly} onChange={(e) => onCriticalOnlyChange(e.target.checked)} className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500" />
          </label>
          <label className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 transition ${slaBreach ? "border-orange-300 bg-orange-50 text-orange-800 shadow-sm" : "border-slate-200 bg-white text-slate-600"}`}>
            <span className="flex items-center gap-2 text-xs font-black"><Timer className="h-4 w-4 text-orange-500" /> TAT / SLA breach</span>
            <input type="checkbox" checked={slaBreach} onChange={(e) => onSlaBreachChange(e.target.checked)} className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500" />
          </label>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-amber-700">
            From Date
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onDateFromChange(e.target.value)
            }
            className="h-11 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-amber-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-rose-700">
            To Date
          </label>

          <input
            type="date"
            value={dateTo}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onDateToChange(e.target.value)
            }
            className="h-11 w-full rounded-xl border border-rose-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-rose-100"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-indigo-100 pt-3">
        <p className="text-xs text-slate-500">
          Filter reports by type, status, patient and
          generation date.
        </p>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasFilters}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </button>
      </div>
    </section>
  );
}