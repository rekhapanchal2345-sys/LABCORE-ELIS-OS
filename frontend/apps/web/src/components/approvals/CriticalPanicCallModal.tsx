"use client";

import React, { useState, useEffect } from "react";
import { approvalApi } from "@/lib/api";

interface CriticalPanicCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: string;
  orderNumber?: string;
  patientName?: string;
  doctorName?: string;
  doctorPhone?: string;
  criticalParameters: Array<{ name: string; value: string; unit?: string }>;
  onSuccess: () => void;
}

export default function CriticalPanicCallModal({
  isOpen,
  onClose,
  resultId,
  orderNumber,
  patientName,
  doctorName = "",
  doctorPhone = "",
  criticalParameters,
  onSuccess,
}: CriticalPanicCallModalProps) {
  const [notifiedPerson, setNotifiedPerson] = useState(doctorName);
  const [notifiedContact, setNotifiedContact] = useState(doctorPhone);
  const [notificationMode, setNotificationMode] = useState("PHONE");
  const [notificationTime, setNotificationTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [readBackConfirmed, setReadBackConfirmed] = useState(true);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (doctorName) setNotifiedPerson(doctorName);
    if (doctorPhone) setNotifiedContact(doctorPhone);
  }, [doctorName, doctorPhone]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifiedPerson.trim()) {
      setError("Please specify the recipient doctor/provider's name");
      return;
    }
    if (!readBackConfirmed) {
      setError("Verbal read-back confirmation is required per ISO 15189 lab standards");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await approvalApi.recordCriticalAck(resultId, {
        notifiedPerson: notifiedPerson.trim(),
        notifiedPersonContact: notifiedContact.trim(),
        notificationMode,
        notificationTime: new Date(notificationTime).toISOString(),
        notes: clinicalNotes.trim(),
        readBackConfirmed,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to record critical value call log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Red Urgency Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl font-bold backdrop-blur-sm">
                🚨
              </div>
              <div>
                <h3 className="text-lg font-bold">Critical / Panic Value Verbal Call Log</h3>
                <p className="text-xs text-red-100">
                  ISO 15189 / NABL Standard: Mandatory Verbal Notification
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Critical Values Summary */}
        <div className="bg-red-50/80 px-6 py-3 border-b border-red-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient: </span>
            <span className="text-sm font-bold text-gray-900">{patientName || "—"}</span>
            <span className="text-xs text-gray-400 mx-2">•</span>
            <span className="text-xs text-gray-600">Order: {orderNumber || "—"}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {criticalParameters.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm"
              >
                <span>{p.name}:</span>
                <span className="underline">{p.value} {p.unit}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Notified Doctor / Provider Name *
              </label>
              <input
                type="text"
                required
                value={notifiedPerson}
                onChange={(e) => setNotifiedPerson(e.target.value)}
                placeholder="e.g. Dr. Rajesh Sharma (Attending Physician)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Doctor Phone / Extension
              </label>
              <input
                type="text"
                value={notifiedContact}
                onChange={(e) => setNotifiedContact(e.target.value)}
                placeholder="e.g. +91 98765 43210 / Ext 402"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Communication Mode
              </label>
              <select
                value={notificationMode}
                onChange={(e) => setNotificationMode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              >
                <option value="PHONE">Direct Phone Call</option>
                <option value="HOSPITAL_INTERCOM">Hospital Intercom / Code Call</option>
                <option value="WHATSAPP_EMERGENCY">WhatsApp Critical Alert</option>
                <option value="IN_PERSON">In-Person Handover</option>
                <option value="DUTY_NURSE_PHONE">ICU / Duty Nurse Call</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Call Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Pathologist Guidance / Call Remarks
            </label>
            <textarea
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g. Communicated hyperkalemia 7.2 mmol/L. Advised immediate ECG and clinical intervention."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
            />
          </div>

          {/* Read Back Checkbox */}
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={readBackConfirmed}
                onChange={(e) => setReadBackConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-amber-400 text-red-600 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-bold text-amber-900">
                  Verbal Read-Back Verification Completed
                </span>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  I certify that the recipient verbally repeated the patient identity and critical test value back to verify zero transcription or acoustic error.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !readBackConfirmed}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving Call Log...
                </>
              ) : (
                <>
                  <span>✓ Save & Authorize Approval</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
