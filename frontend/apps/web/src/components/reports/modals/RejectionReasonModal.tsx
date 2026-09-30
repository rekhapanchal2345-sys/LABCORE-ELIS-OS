"use client";

import React, { useState } from "react";
import { X, XCircle, AlertTriangle } from "lucide-react";
import { reportsApi } from "@/lib/api";

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportReferenceId: string;
  onSuccess: () => void;
}

export default function RejectionReasonModal({
  isOpen,
  onClose,
  reportId,
  reportReferenceId,
  onSuccess,
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await reportsApi.inlineReject(reportId, reason);
      setReason("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to reject report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm premium-modal-backdrop">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl premium-modal-content premium-glass">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2 text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Reject Report
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
                This action requires audit trail
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Rejection reason will be logged for compliance and quality assurance purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
              placeholder="Provide detailed reason for rejection..."
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
              className="rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 text-sm font-medium text-white hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Rejecting..." : "Reject Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}