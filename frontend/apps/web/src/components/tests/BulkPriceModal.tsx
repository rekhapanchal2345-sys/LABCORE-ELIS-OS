"use client";

import React, { useState } from "react";
import { testApi } from "@/lib/api";
import { DollarSign, Percent, AlertCircle, CheckCircle2, X, ArrowUpRight, TrendingUp } from "lucide-react";

interface BulkPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTestIds: string[];
  totalTestsCount: number;
  categories: any[];
  onSuccess: (msg: string) => void;
}

export default function BulkPriceModal({
  isOpen,
  onClose,
  selectedTestIds,
  totalTestsCount,
  categories,
  onSuccess,
}: BulkPriceModalProps) {
  const [scope, setScope] = useState<"SELECTED" | "CATEGORY" | "ALL">(
    selectedTestIds.length > 0 ? "SELECTED" : "ALL"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [adjustmentValue, setAdjustmentValue] = useState<number>(10);
  const [applyToB2b, setApplyToB2b] = useState<boolean>(true);
  const [roundTo, setRoundTo] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        adjustmentType,
        adjustmentValue: Number(adjustmentValue),
        applyToB2bRate: applyToB2b,
        roundTo: Number(roundTo) || undefined,
      };

      if (scope === "SELECTED") {
        if (selectedTestIds.length === 0) {
          throw new Error("No tests selected. Please select tests or choose department/all scope.");
        }
        payload.testIds = selectedTestIds;
      } else if (scope === "CATEGORY") {
        if (!selectedCategory) {
          throw new Error("Please choose a department category to update.");
        }
        payload.categoryId = selectedCategory;
      } else {
        // ALL tests
        payload.sampleType = undefined;
      }

      const res = await testApi.bulkUpdatePrices(payload);
      if (res.success || res.data) {
        const count = res.data?.updated ?? res.data?.matched ?? "catalog";
        onSuccess(`Successfully updated pricing for ${count} tests!`);
        onClose();
      } else {
        throw new Error(res.message || "Failed to update bulk prices");
      }
    } catch (err: any) {
      console.error("Bulk price error:", err);
      setError(err?.message || "Failed to update bulk pricing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Bulk Tariff &amp; Price Revision Studio
              </h3>
              <p className="text-xs text-slate-500">
                Update standard MRP and B2B partner rates across tests
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scope Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Revision Scope Target
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope("SELECTED")}
                disabled={selectedTestIds.length === 0}
                className={`p-3 rounded-2xl border text-xs font-bold transition text-center ${
                  scope === "SELECTED"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                }`}
              >
                Selected ({selectedTestIds.length})
              </button>

              <button
                type="button"
                onClick={() => setScope("CATEGORY")}
                className={`p-3 rounded-2xl border text-xs font-bold transition text-center ${
                  scope === "CATEGORY"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                By Department
              </button>

              <button
                type="button"
                onClick={() => setScope("ALL")}
                className={`p-3 rounded-2xl border text-xs font-bold transition text-center ${
                  scope === "ALL"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                All Tests ({totalTestsCount})
              </button>
            </div>
          </div>

          {scope === "CATEGORY" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Select Department</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Choose Department --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Adjustment Type & Value */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Adjustment Mode</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdjustmentType("PERCENTAGE")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    adjustmentType === "PERCENTAGE" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType("FIXED")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    adjustmentType === "FIXED" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Fixed (₹)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                {adjustmentType === "PERCENTAGE" ? "Percentage (+/- %)" : "Fixed Amount (₹)"}
              </label>
              <input
                type="number"
                step="any"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                placeholder={adjustmentType === "PERCENTAGE" ? "+10 or -5" : "+100"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={applyToB2b}
                onChange={(e) => setApplyToB2b(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Also apply proportionately to B2B / Collection Center Rate</span>
            </label>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pt-1">
              <span>Round Prices To:</span>
              <select
                value={roundTo}
                onChange={(e) => setRoundTo(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800"
              >
                <option value={1}>Exact (₹1)</option>
                <option value={5}>Nearest ₹5</option>
                <option value={10}>Nearest ₹10 (Standard)</option>
                <option value={50}>Nearest ₹50</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Updating..." : "Execute Bulk Revision"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
