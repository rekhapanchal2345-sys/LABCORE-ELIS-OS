"use client";

import React, { useState } from "react";
import { X, Edit3, AlertTriangle } from "lucide-react";
import { reportsApi } from "@/lib/api";

interface ReportAmendmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportReferenceId: string;
  onSuccess: () => void;
}

export default function ReportAmendmentModal({
  isOpen,
  onClose,
  reportId,
  reportReferenceId,
  onSuccess,
}: ReportAmendmentModalProps) {
  const [reason, setReason] = useState("");
  const [amendmentType, setAmendmentType] = useState("CORRECTION");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amendmentTypes = [
    { value: "CORRECTION", label: "Data Correction" },
    { value: "CLARIFICATION", label: "Clarification" },
    { value: "UPDATE", label: "Information Update" },
    { value: "OTHER", label: "Other" },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Real amendment API — bumps version, resets workflow, logs audit trail
      await reportsApi.amendReport(reportId, amendmentType, reason);

      setReason("");
      setAmendmentType("CORRECTION");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create amendment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm premium-modal-backdrop">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl premium-modal-content premium-glass">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-cyan-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Edit / Amend Report
              </h3>
              <p className="text-sm text-gray-600">
                {reportReferenceId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="mx-6 mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Audit Trail Required
              </p>
              <p className="text-xs text-amber-700 mt-1">
                All amendments will be logged with version control and audit trail for compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amendment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {amendmentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAmendmentType(type.value)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                    amendmentType === type.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Amendment Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Provide detailed reason for the amendment..."
              required
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Maximum 1000 characters
              </span>
              <span className="text-xs text-gray-500">
                {reason.length}/1000
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Amending..." : "Create Amendment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}