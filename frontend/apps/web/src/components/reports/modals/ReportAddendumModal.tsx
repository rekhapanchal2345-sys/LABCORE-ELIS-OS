"use client";

import React, { useState } from "react";
import { X, MessageSquarePlus, Lock, Eye, EyeOff } from "lucide-react";
import { reportsApi } from "@/lib/api";

interface ReportAddendumModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  onSuccess: () => void;
}

export default function ReportAddendumModal({
  isOpen,
  onClose,
  reportId,
  onSuccess,
}: ReportAddendumModalProps) {
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await reportsApi.createAddendum(reportId, content, isPrivate);
      setContent("");
      setIsPrivate(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create addendum");
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
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Add Report Addendum
              </h3>
              <p className="text-sm text-gray-600">
                Attach doctor notes or additional information
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Addendum Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter your notes or additional information..."
              required
              maxLength={5000}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Maximum 5000 characters
              </span>
              <span className="text-xs text-gray-500">
                {content.length}/5000
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="isPrivate"
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
            >
              <Lock className="h-4 w-4 text-gray-400" />
              <span>Private addendum (visible only to authorized staff)</span>
            </label>
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
              disabled={loading || !content.trim()}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Addendum"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}