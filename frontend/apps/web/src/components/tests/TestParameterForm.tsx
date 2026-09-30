"use client";

import React, { FormEvent, useState } from "react";

export interface TestParameterFormData {
  name: string;
  code: string;
  description: string;
  dataType:
    | "NUMERIC"
    | "TEXT"
    | "BOOLEAN"
    | "OPTION";
  unit: string;
  displayOrder: number;
  required: boolean;
  active: boolean;
}

interface TestParameterFormProps {
  initialValues?: Partial<TestParameterFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit?: (
    data: TestParameterFormData
  ) => void | Promise<void>;
  onCancel?: () => void;
}

const defaults: TestParameterFormData = {
  name: "",
  code: "",
  description: "",
  dataType: "NUMERIC",
  unit: "",
  displayOrder: 0,
  required: true,
  active: true,
};

export default function TestParameterForm({
  initialValues,
  loading = false,
  submitLabel = "Save Parameter",
  onSubmit,
  onCancel,
}: TestParameterFormProps) {
  const [form, setForm] = useState<TestParameterFormData>({
    ...defaults,
    ...initialValues,
  });

  const [error, setError] = useState("");

  const update = <K extends keyof TestParameterFormData>(
    field: K,
    value: TestParameterFormData[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Parameter name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Parameter code is required.");
      return;
    }

    try {
      await onSubmit?.(form);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save parameter."
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
          Test Parameter
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Define a parameter that will be reported for
          the laboratory test.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className={label}>
              Parameter Name{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              placeholder="e.g. Hemoglobin"
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Parameter Code{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              value={form.code}
              onChange={(e) =>
                update(
                  "code",
                  e.target.value.toUpperCase()
                )
              }
              placeholder="e.g. HB"
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Data Type
            </label>

            <select
              value={form.dataType}
              onChange={(e) =>
                update(
                  "dataType",
                  e.target.value as TestParameterFormData["dataType"]
                )
              }
              className={input}
              disabled={loading}
            >
              <option value="NUMERIC">
                Numeric
              </option>
              <option value="TEXT">
                Text
              </option>
              <option value="BOOLEAN">
                Boolean
              </option>
              <option value="OPTION">
                Option
              </option>
            </select>
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
              placeholder="g/dL"
              className={input}
              disabled={
                loading ||
                form.dataType !== "NUMERIC"
              }
            />
          </div>

          <div>
            <label className={label}>
              Display Order
            </label>

            <input
              type="number"
              min={0}
              value={form.displayOrder}
              onChange={(e) =>
                update(
                  "displayOrder",
                  Number(e.target.value)
                )
              }
              className={input}
              disabled={loading}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 pb-2">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) =>
                  update(
                    "required",
                    e.target.checked
                  )
                }
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300"
              />

              <span className="text-sm font-medium text-gray-700">
                Required parameter
              </span>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className={label}>
              Description
            </label>

            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                update(
                  "description",
                  e.target.value
                )
              }
              placeholder="Parameter description..."
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
              Active parameter
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