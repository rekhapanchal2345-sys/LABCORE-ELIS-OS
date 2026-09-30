"use client";

import React, { useState } from "react";
import { X, LockKeyhole, Eye, EyeOff, Shield } from "lucide-react";
import { downloadPDF, generateReportPDF } from "@/lib/pdf-operations";

interface PasswordProtectModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: any;
  reportReferenceId: string;
}

export default function PasswordProtectModal({
  isOpen,
  onClose,
  report,
  reportReferenceId,
}: PasswordProtectModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Build the selected report first, then apply protection during generation.
      // Passing an empty buffer to pdf-lib would create a broken download.
      const pdfBlob = await generateReportPDF(report, {
        password,
        metadata: {
          title: `Protected report ${reportReferenceId}`,
          subject: "Password-protected laboratory report",
        },
      });
      
      // Download the protected PDF
      downloadPDF(pdfBlob, `protected-report-${reportReferenceId}.pdf`);
      
      setPassword("");
      onClose();
    } catch (err: any) {
      console.error("Password protection error:", err);
      setError(err.message || "Failed to protect PDF");
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
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Password Protect PDF
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

        {/* Security Notice */}
        <div className="mx-6 mt-4 rounded-lg bg-cyan-50 border border-cyan-200 px-4 py-3">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-cyan-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-cyan-800">
                Sensitive Report Protection
              </p>
              <p className="text-xs text-cyan-700 mt-1">
                Password protection ensures only authorized individuals can access sensitive reports (e.g., HIV, genetic testing).
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm pr-12 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                placeholder="Enter password for PDF protection"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 characters required
            </p>
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
              disabled={loading || password.length < 6}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Protecting..." : "Protect & Download"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
