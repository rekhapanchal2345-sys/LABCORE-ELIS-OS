"use client";

import React, { FormEvent, useState } from "react";

export interface ReferenceRangeFormData {
  parameterId: string;
  gender: "ALL" | "MALE" | "FEMALE";
  ageMin: number | "";
  ageMax: number | "";
  ageUnit: "YEARS" | "MONTHS" | "DAYS";
  lowValue: number | "";
  highValue: number | "";
  criticalLow: number | "";
  criticalHigh: number | "";
  unit: string;
  interpretation: string;
  active: boolean;
}

interface ReferenceRangeFormProps {
  parameters?: Array<{
    id: string;
    name: string;
    unit?: string;
  }>;
  initialValues?: Partial<ReferenceRangeFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit?: (
    data: ReferenceRangeFormData
  ) => void | Promise<void>;
  onCancel?: () => void;
}

const defaults: ReferenceRangeFormData = {
  parameterId: "",
  gender: "ALL",
  ageMin: "",
  ageMax: "",
  ageUnit: "YEARS",
  lowValue: "",
  highValue: "",
  criticalLow: "",
  criticalHigh: "",
  unit: "",
  interpretation: "",
  active: true,
};

export default function ReferenceRangeForm({
  parameters = [],
  initialValues,
  loading = false,
  submitLabel = "Save Reference Range",
  onSubmit,
  onCancel,
}: ReferenceRangeFormProps) {
  const [form, setForm] = useState<ReferenceRangeFormData>({
    ...defaults,
    ...initialValues,
  });

  const [error, setError] = useState("");

  const update = <K extends keyof ReferenceRangeFormData>(
    field: K,
    value: ReferenceRangeFormData[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.parameterId) {
      setError("Please select a parameter.");
      return;
    }

    if (
      form.lowValue !== "" &&
      form.highValue !== "" &&
      Number(form.lowValue) > Number(form.highValue)
    ) {
      setError(
        "Low value cannot be greater than high value."
      );
      return;
    }

    try {
      await onSubmit?.(form);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save reference range."
      );
    }
  };

  const input =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100";

  const label =
    "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">
          Reference Range
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Define normal and critical values for a test
          parameter.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={label}>
              Parameter{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              value={form.parameterId}
              onChange={(e) =>
                update(
                  "parameterId",
                  e.target.value
                )
              }
              className={input}
              disabled={loading}
            >
              <option value="">
                Select parameter
              </option>

              {parameters.map((parameter) => (
                <option
                  key={parameter.id}
                  value={parameter.id}
                >
                  {parameter.name}
                  {parameter.unit
                    ? ` (${parameter.unit})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>
              Gender
            </label>

            <select
              value={form.gender}
              onChange={(e) =>
                update(
                  "gender",
                  e.target.value as ReferenceRangeFormData["gender"]
                )
              }
              className={input}
              disabled={loading}
            >
              <option value="ALL">All</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label className={label}>
              Age Unit
            </label>

            <select
              value={form.ageUnit}
              onChange={(e) =>
                update(
                  "ageUnit",
                  e.target.value as ReferenceRangeFormData["ageUnit"]
                )
              }
              className={input}
              disabled={loading}
            >
              <option value="YEARS">Years</option>
              <option value="MONTHS">Months</option>
              <option value="DAYS">Days</option>
            </select>
          </div>

          <div>
            <label className={label}>
              Minimum Age
            </label>

            <input
              type="number"
              min={0}
              value={form.ageMin}
              onChange={(e) =>
                update(
                  "ageMin",
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
              }
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Maximum Age
            </label>

            <input
              type="number"
              min={0}
              value={form.ageMax}
              onChange={(e) =>
                update(
                  "ageMax",
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
              }
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Normal Low
            </label>

            <input
              type="number"
              step="any"
              value={form.lowValue}
              onChange={(e) =>
                update(
                  "lowValue",
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
              }
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Normal High
            </label>

            <input
              type="number"
              step="any"
              value={form.highValue}
              onChange={(e) =>
                update(
                  "highValue",
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
              }
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Critical Low
            </label>

            <input
              type="number"
              step="any"
              value={form.criticalLow}
              onChange={(e) =>
                update(
                  "criticalLow",
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
              }
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Critical High
            </label>

            <input
              type="number"
              step="any"
              value={form.criticalHigh}
              onChange={(e) =>
                update(
                  "criticalHigh",
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
              }
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Unit
            </label>

            <input
              value={form.unit}
              onChange={(e) =>
                update("unit", e.target.value)
              }
              placeholder="mg/dL"
              className={input}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className={label}>
              Interpretation / Notes
            </label>

            <textarea
              rows={3}
              value={form.interpretation}
              onChange={(e) =>
                update(
                  "interpretation",
                  e.target.value
                )
              }
              placeholder="Additional interpretation..."
              className={`${input} resize-none`}
              disabled={loading}
            />
          </div>

          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                update("active", e.target.checked)
              }
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300"
            />

            <span className="text-sm font-medium text-gray-700">
              Active reference range
            </span>
          </label>
        </div>
      </div>

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
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}