"use client";

import React, { FormEvent, useState } from "react";

export interface TestCategoryFormData {
  name: string;
  code: string;
  description: string;
  department: string;
  displayOrder: number;
  active: boolean;
}

interface TestCategoryFormProps {
  initialValues?: Partial<TestCategoryFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit?: (
    data: TestCategoryFormData
  ) => void | Promise<void>;
  onCancel?: () => void;
}

const defaults: TestCategoryFormData = {
  name: "",
  code: "",
  description: "",
  department: "",
  displayOrder: 0,
  active: true,
};

export default function TestCategoryForm({
  initialValues,
  loading = false,
  submitLabel = "Save Category",
  onSubmit,
  onCancel,
}: TestCategoryFormProps) {
  const [form, setForm] = useState<TestCategoryFormData>({
    ...defaults,
    ...initialValues,
  });

  const [error, setError] = useState("");

  const update = <K extends keyof TestCategoryFormData>(
    field: K,
    value: TestCategoryFormData[K]
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
      setError("Category name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Category code is required.");
      return;
    }

    try {
      await onSubmit?.(form);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category."
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
          Test Category
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Create and configure a laboratory test category.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className={label}>
              Category Name{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              placeholder="e.g. Hematology"
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Category Code{" "}
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
              placeholder="e.g. HEM"
              className={input}
              disabled={loading}
            />
          </div>

          <div>
            <label className={label}>
              Department
            </label>

            <input
              value={form.department}
              onChange={(e) =>
                update("department", e.target.value)
              }
              placeholder="Laboratory department"
              className={input}
              disabled={loading}
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
              placeholder="Category description..."
              className={`${input} resize-none`}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
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
                Active category
              </span>
            </label>
          </div>
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