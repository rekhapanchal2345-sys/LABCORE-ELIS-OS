"use client";

import React, {
  FormEvent,
  useState,
} from "react";
import { 
  ShieldCheck, 
  Fingerprint, 
  Barcode, 
  UserCheck, 
  Activity,
  Lock,
  Sparkles
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
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100";

  const label =
    "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <form
      onSubmit={submit}
      className="space-y-6"
    >
      {/* Premium Header */}
      <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                Sample Collection
                <span className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  ⭐ Premium
                </span>
              </h2>
              <p className="text-sm text-slate-600">Advanced sample collection with biometric verification</p>
            </div>
          </div>
        </div>

        {/* Premium Verification Status */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold text-violet-900">Patient Verification</span>
            </div>
            <div className="text-sm font-black text-slate-900">
              {form.patientVerified ? '✓ Verified' : 'Pending'}
            </div>
          </div>
          <div className="rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Barcode className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-bold text-cyan-900">Barcode Verification</span>
            </div>
            <div className="text-sm font-black text-slate-900">
              {form.barcodeVerified ? '✓ Verified' : 'Pending'}
            </div>
          </div>
          <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Fingerprint className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900">Biometric Verification</span>
            </div>
            <div className="text-sm font-black text-slate-900">
              {form.biometricVerified ? '✓ Verified' : 'Pending'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {(patientName || orderNumber) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase text-gray-500">
            Collection For
          </p>

          <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
            {patientName && (
              <div>
                <p className="text-xs text-gray-500">
                  Patient
                </p>
                <p className="font-medium text-gray-900">
                  {patientName}
                </p>
              </div>
            )}

            {orderNumber && (
              <div>
                <p className="text-xs text-gray-500">
                  Order
                </p>
                <p className="font-medium text-gray-900">
                  {orderNumber}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">
          Sample Collection
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Record the details of the specimen collection.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className={label}>
              Order ID{" "}
              <span className="text-red-500">*</span>
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
              <span className="text-red-500">*</span>
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
              <span className="text-red-500">*</span>
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
              <span className="text-red-500">*</span>
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
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Record Collection"}
        </button>
      </div>
    </form>
  );
}