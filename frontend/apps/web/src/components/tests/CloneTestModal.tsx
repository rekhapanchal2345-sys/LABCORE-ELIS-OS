"use client";

import React, { useState } from "react";
import { testApi } from "@/lib/api";
import { Copy, AlertCircle, CheckCircle2, X } from "lucide-react";

interface CloneTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: any | null;
  onSuccess: (newTest: any) => void;
}

export default function CloneTestModal({
  isOpen,
  onClose,
  test,
  onSuccess,
}: CloneTestModalProps) {
  const [newCode, setNewCode] = useState("");
  const [suffix, setSuffix] = useState("(Copy)");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (test) {
      const code = test.testCode || test.code || "TEST";
      setNewCode(`${code}_V2`);
      setSuffix("(Copy)");
      setError(null);
    }
  }, [test]);

  if (!isOpen || !test) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      setError("Please specify a unique investigation code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await testApi.cloneTest(test.id, {
        testCode: newCode.trim().toUpperCase(),
        suffix: suffix.trim() || undefined,
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        throw new Error(res.message || "Failed to clone investigation");
      }
    } catch (err: any) {
      console.error("Clone error:", err);
      setError(err?.message || "Failed to clone test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Copy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Clone Diagnostic Investigation
              </h3>
              <p className="text-xs text-slate-500">
                Duplicate test profile, analytes &amp; reference ranges
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Source Investigation:
            </span>
            <p className="text-xs font-bold text-slate-900">
              {test.testName || test.name}
            </p>
            <span className="text-[11px] font-mono font-semibold text-blue-600">
              Code: {test.testCode || test.code}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              New Investigation Code *
            </label>
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="e.g. CBC_PEDIATRIC or LFT_FAST"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Name Suffix (Appended to title)
            </label>
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="e.g. (Pediatric) or (Rapid STAT)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Note: The cloned test will copy all {test.parameters?.length || 0} analyte parameters and age/gender reference ranges. Cloned tests start inactive for pathologist verification.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Cloning..." : "Create Clone Copy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
