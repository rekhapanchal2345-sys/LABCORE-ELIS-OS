"use client";

import React, { useState } from "react";
import { X, Link2, Clock, Copy, Check, Shield } from "lucide-react";
import { reportsApi } from "@/lib/api";

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportReferenceId: string;
  onSuccess: () => void;
}

export default function ShareLinkModal({
  isOpen,
  onClose,
  reportId,
  reportReferenceId,
  onSuccess,
}: ShareLinkModalProps) {
  const [expiresIn, setExpiresIn] = useState(3600); // Default 1 hour
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const expirationOptions = [
    { value: 300, label: "5 minutes" },
    { value: 1800, label: "30 minutes" },
    { value: 3600, label: "1 hour" },
    { value: 7200, label: "2 hours" },
    { value: 86400, label: "24 hours" },
  ];

  const handleGenerateLink = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await reportsApi.generateShareLink(reportId, expiresIn);
      setGeneratedLink(response.data.url);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy link");
    }
  };

  const handleReset = () => {
    setGeneratedLink("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm premium-modal-backdrop">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl premium-modal-content premium-glass">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-cyan-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Generate Shareable Link
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
                Secure & Expiring Link
              </p>
              <p className="text-xs text-cyan-700 mt-1">
                Links are HIPAA compliant with automatic expiration and access tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {!generatedLink ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Link Expiration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {expirationOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setExpiresIn(option.value)}
                      className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                        expiresIn === option.value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
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
                  type="button"
                  onClick={handleGenerateLink}
                  disabled={loading}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate Link"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                <p className="text-sm font-semibold text-green-800">
                  Shareable link generated successfully!
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Generate Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-700 hover:to-cyan-700 transition-all"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}