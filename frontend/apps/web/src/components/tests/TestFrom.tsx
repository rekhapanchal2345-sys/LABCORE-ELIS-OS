"use client";

import React, {
  FormEvent,
  useState,
} from "react";

export interface TestFormData {
  name: string;
  code: string;
  category: string;
  department: string;
  sampleType: string;
  containerType: string;
  methodology: string;
  turnaroundTime: string;
  price: string;
  description: string;
  instructions: string;
  isActive: boolean;
}

interface TestFormProps {
  initialData?: Partial<TestFormData>;
  loading?: boolean;
  submitLabel?: string;
  categories?: string[];
  onSubmit: (
    data: TestFormData
  ) => Promise<void> | void;
  onCancel?: () => void;
}

const defaultForm: TestFormData = {
  name: "",
  code: "",
  category: "",
  department: "",
  sampleType: "",
  containerType: "",
  methodology: "",
  turnaroundTime: "",
  price: "",
  description: "",
  instructions: "",
  isActive: true,
};

export default function TestForm({
  initialData,
  loading = false,
  submitLabel = "Save Test",
  categories = [],
  onSubmit,
  onCancel,
}: TestFormProps) {
  const [form, setForm] =
    useState<TestFormData>({
      ...defaultForm,
      ...initialData,
    });

  const [error, setError] =
    useState<string | null>(null);

  function updateField(
    field: keyof TestFormData,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Test name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Test code is required.");
      return;
    }

    if (!form.category.trim()) {
      setError("Test category is required.");
      return;
    }

    if (!form.sampleType.trim()) {
      setError("Sample type is required.");
      return;
    }

    if (
      form.price !== "" &&
      Number(form.price) < 0
    ) {
      setError("Price cannot be negative.");
      return;
    }

    try {
      await onSubmit(form);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save test."
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic Information */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Test Information
          </h2>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Test Name *
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                updateField("name", e.target.value)
              }
              placeholder="e.g. Complete Blood Count"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Test Code *
            </label>

            <input
              value={form.code}
              onChange={(e) =>
                updateField("code", e.target.value)
              }
              placeholder="e.g. CBC001"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category *
            </label>

            {categories.length > 0 ? (
              <select
                value={form.category}
                onChange={(e) =>
                  updateField(
                    "category",
                    e.target.value
                  )
                }
                disabled={loading}
                className={inputClass}
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={form.category}
                onChange={(e) =>
                  updateField(
                    "category",
                    e.target.value
                  )
                }
                placeholder="e.g. Hematology"
                disabled={loading}
                className={inputClass}
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Department
            </label>

            <input
              value={form.department}
              onChange={(e) =>
                updateField(
                  "department",
                  e.target.value
                )
              }
              placeholder="Laboratory department"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Sample Type *
            </label>

            <input
              value={form.sampleType}
              onChange={(e) =>
                updateField(
                  "sampleType",
                  e.target.value
                )
              }
              placeholder="e.g. Blood"
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Laboratory Configuration */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Laboratory Configuration
          </h2>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Container Type
            </label>

            <input
              value={form.containerType}
              onChange={(e) =>
                updateField(
                  "containerType",
                  e.target.value
                )
              }
              placeholder="e.g. EDTA tube"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Methodology
            </label>

            <input
              value={form.methodology}
              onChange={(e) =>
                updateField(
                  "methodology",
                  e.target.value
                )
              }
              placeholder="e.g. Automated"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Turnaround Time
            </label>

            <input
              value={form.turnaroundTime}
              onChange={(e) =>
                updateField(
                  "turnaroundTime",
                  e.target.value
                )
              }
              placeholder="e.g. 4 hours"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                updateField(
                  "price",
                  e.target.value
                )
              }
              placeholder="0.00"
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Description */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Description & Instructions
          </h2>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                updateField(
                  "description",
                  e.target.value
                )
              }
              placeholder="Describe this laboratory test..."
              disabled={loading}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Patient Instructions
            </label>

            <textarea
              rows={4}
              value={form.instructions}
              onChange={(e) =>
                updateField(
                  "instructions",
                  e.target.value
                )
              }
              placeholder="Fasting or other preparation instructions..."
              disabled={loading}
              className={`${inputClass} resize-none`}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                updateField(
                  "isActive",
                  e.target.checked
                )
              }
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300"
            />

            <span className="text-sm font-medium text-gray-700">
              Test is active
            </span>
          </label>
        </div>
      </section>

      {/* Actions */}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}