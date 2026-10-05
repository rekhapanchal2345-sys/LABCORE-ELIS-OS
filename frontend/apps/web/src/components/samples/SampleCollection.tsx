"use client";

import React, {
  FormEvent,
  useState,
} from "react";
import { 
  ShieldCheck, 
  Fingerprint, 
  Barcode, 
  UserCheck
} from "lucide-react";

export interface SampleCollectionData {
  orderId: string;
  specimenType: string;
  collectionSite: string;
  collectedBy: string;
  collectedAt: string;
  containerType: string;
  volume: string;
  notes: string;
  biometricVerified?: boolean;
  barcodeVerified?: boolean;
  patientVerified?: boolean;
}

interface SampleCollectionProps {
  orderId?: string;
  patientName?: string;
  orderNumber?: string;
  collectedByOptions?: Array<{
    id: string;
    name: string;
  }>;
  loading?: boolean;
  onSubmit?: (
    data: SampleCollectionData
  ) => void | Promise<void>;
  onCancel?: () => void;
}

const getCurrentDateTime = () => {
  const date = new Date();

  const offset =
    date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
};

export default function SampleCollection({
  orderId = "",
  patientName,
  orderNumber,
  collectedByOptions = [],
  loading = false,
  onSubmit,
  onCancel,
}: SampleCollectionProps) {
  const [form, setForm] =
    useState<SampleCollectionData>({
      orderId,
      specimenType: "",
      collectionSite: "",
      collectedBy: "",
      collectedAt: getCurrentDateTime(),
      containerType: "",
      volume: "",
      notes: "",
      biometricVerified: false,
      barcodeVerified: false,
      patientVerified: false,
    });

  const [error, setError] = useState("");

  const update = (
    field: keyof SampleCollectionData,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  };

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.orderId.trim()) {
      setError("Order is required.");
      return;
    }

    if (!form.specimenType.trim()) {
      setError("Specimen type is required.");
      return;
    }

    if (!form.collectedBy.trim()) {
      setError("Collector is required.");
      return;
    }

    if (!form.collectedAt) {
      setError("Collection date and time are required.");
      return;
    }

    try {
      await onSubmit?.(form);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to record sample collection."
      );
    }
  };

  const input =
    "w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors disabled:opacity-50";

  const label =
    "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";

  return (
    <form
      onSubmit={submit}
      className="space-y-6 text-white"
    >
      {/* Dark Obsidian Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Sample Collection
                <span className="rounded-full bg-violet-500/20 border border-violet-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-300">
                  ⭐ Verified
                </span>
              </h2>
              <p className="text-sm text-slate-400">Advanced sample collection with identity verification</p>
            </div>
          </div>
        </div>

        {/* Dark Verification Status */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold text-violet-300">Patient Verification</span>
            </div>
            <div className="text-sm font-bold text-slate-200">
              {form.patientVerified ? '✓ Verified' : 'Pending'}
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Barcode className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">Barcode Verification</span>
            </div>
            <div className="text-sm font-bold text-slate-200">
              {form.barcodeVerified ? '✓ Verified' : 'Pending'}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Fingerprint className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Biometric Verification</span>
            </div>
            <div className="text-sm font-bold text-slate-200">
              {form.biometricVerified ? '✓ Verified' : 'Pending'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 px-4 py-3 text-sm font-medium text-rose-300">
          {error}
        </div>
      )}

      {(patientName || orderNumber) && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Collection For
          </p>

          <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
            {patientName && (
              <div>
                <p className="text-xs text-slate-400">
                  Patient
                </p>
                <p className="font-semibold text-slate-100">
                  {patientName}
                </p>
              </div>
            )}

            {orderNumber && (
              <div>
                <p className="text-xs text-slate-400">
                  Order
                </p>
                <p className="font-semibold text-cyan-300">
                  {orderNumber}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <h2 className="font-bold text-white text-base">
          Specimen Details
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Record the details of the specimen collection.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className={label}>
              Order ID{" "}
              <span className="text-rose-400">*</span>
            </label>

            <input
              value={form.orderId}
              onChange={(e) =>
                update(
                  "orderId",
                  e.target.value
                )
              }
              placeholder="Order ID"
              className={input}
              disabled={loading || !!orderId}
            />
          </div>

          <div>
            <label className={label}>
              Specimen Type{" "}
              <span className="text-rose-400">*</span>
            </label>

            <input
              value={form.specimenType}
              onChange={(e) =>
                update(
                  "specimenType",
                  e.target.value
                )
              }
              placeholder="Blood / Urine / Serum"
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Collection Site
            </label>

            <input
              value={form.collectionSite}
              onChange={(e) =>
                update(
                  "collectionSite",
                  e.target.value
                )
              }
              placeholder="e.g. Left arm"
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Collected By{" "}
              <span className="text-rose-400">*</span>
            </label>

            {collectedByOptions.length > 0 ? (
              <select
                value={form.collectedBy}
                onChange={(e) =>
                  update(
                    "collectedBy",
                    e.target.value
                  )
                }
                className={input}
                disabled={loading}
              >
                <option value="">
                  Select collector
                </option>

                {collectedByOptions.map(
                  (person) => (
                    <option
                      key={person.id}
                      value={person.id}
                    >
                      {person.name}
                    </option>
                  )
                )}
              </select>
            ) : (
              <input
                value={form.collectedBy}
                onChange={(e) =>
                  update(
                    "collectedBy",
                    e.target.value
                  )
                }
                placeholder="Collector name / ID"
                className={input}
                disabled={loading}
              />
            )}
          </div>

          <div>
            <label className={label}>
              Collection Date & Time{" "}
              <span className="text-rose-400">*</span>
            </label>

            <input
              type="datetime-local"
              value={form.collectedAt}
              onChange={(e) =>
                update(
                  "collectedAt",
                  e.target.value
                )
              }
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Container Type
            </label>

            <input
              value={form.containerType}
              onChange={(e) =>
                update(
                  "containerType",
                  e.target.value
                )
              }
              placeholder="EDTA / Plain / Citrate"
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Volume
            </label>

            <input
              value={form.volume}
              onChange={(e) =>
                update(
                  "volume",
                  e.target.value
                )
              }
              placeholder="e.g. 5 mL"
              className={input}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className={label}>
              Notes
            </label>

            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) =>
                update("notes", e.target.value)
              }
              placeholder="Collection notes..."
              className={`${input} resize-none`}
              disabled={loading}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Record Collection"}
        </button>
      </div>
    </form>
  );
}