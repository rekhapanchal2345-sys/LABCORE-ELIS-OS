"use client";

import React, {
  FormEvent,
  useMemo,
  useState,
} from "react";

export interface OrderFormData {
  patientId: string;
  doctorId: string;
  priority: string;
  notes: string;
  discount: string;
  tests: string[];
}

interface TestOption {
  id: string | number;
  name: string;
  code?: string;
  price?: number;
}

interface PatientOption {
  id: string | number;
  name: string;
  patientId?: string;
}

interface DoctorOption {
  id: string | number;
  name: string;
}

interface OrderFormProps {
  patients?: PatientOption[];
  doctors?: DoctorOption[];
  tests?: TestOption[];
  initialData?: Partial<OrderFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (
    data: OrderFormData
  ) => Promise<void> | void;
  onCancel?: () => void;
}

const defaultForm: OrderFormData = {
  patientId: "",
  doctorId: "",
  priority: "NORMAL",
  notes: "",
  discount: "0",
  tests: [],
};

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function OrderForm({
  patients = [],
  doctors = [],
  tests = [],
  initialData,
  loading = false,
  submitLabel = "Create Order",
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const [form, setForm] =
    useState<OrderFormData>({
      ...defaultForm,
      ...initialData,
      tests: initialData?.tests || [],
    });

  const [testSearch, setTestSearch] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const selectedTests = useMemo(() => {
    return tests.filter((test) =>
      form.tests.includes(String(test.id))
    );
  }, [tests, form.tests]);

  const subtotal = useMemo(() => {
    return selectedTests.reduce(
      (total, test) =>
        total + Number(test.price || 0),
      0
    );
  }, [selectedTests]);

  const discount = Math.max(
    0,
    Number(form.discount) || 0
  );

  const total = Math.max(
    0,
    subtotal - discount
  );

  const filteredTests = tests.filter((test) => {
    const query = testSearch
      .trim()
      .toLowerCase();

    if (!query) return true;

    return (
      test.name
        .toLowerCase()
        .includes(query) ||
      test.code
        ?.toLowerCase()
        .includes(query)
    );
  });

  function updateField(
    field: keyof OrderFormData,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function toggleTest(
    testId: string | number
  ) {
    const id = String(testId);

    setForm((previous) => {
      const exists =
        previous.tests.includes(id);

      return {
        ...previous,
        tests: exists
          ? previous.tests.filter(
              (item) => item !== id
            )
          : [...previous.tests, id],
      };
    });
  }

  function removeTest(testId: string | number) {
    const id = String(testId);

    setForm((previous) => ({
      ...previous,
      tests: previous.tests.filter(
        (item) => item !== id
      ),
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);

    if (!form.patientId) {
      setError("Please select a patient.");
      return;
    }

    if (!form.tests.length) {
      setError(
        "Please select at least one laboratory test."
      );
      return;
    }

    if (discount > subtotal) {
      setError(
        "Discount cannot be greater than the subtotal."
      );
      return;
    }

    try {
      await onSubmit(form);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create order."
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-400 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Patient & Doctor */}

      <section className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-lg shadow-purple-500/20">
        <div className="border-b border-purple-500/30 px-5 py-4">
          <h2 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Order Information
          </h2>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Patient *
            </label>

            <select
              value={form.patientId}
              onChange={(e) =>
                updateField(
                  "patientId",
                  e.target.value
                )
              }
              disabled={loading}
              className={inputClass}
            >
              <option value="">
                Select patient
              </option>

              {patients.map((patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.name}
                  {patient.patientId
                    ? ` — ${patient.patientId}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Referring Doctor
            </label>

            <select
              value={form.doctorId}
              onChange={(e) =>
                updateField(
                  "doctorId",
                  e.target.value
                )
              }
              disabled={loading}
              className={inputClass}
            >
              <option value="">
                Select doctor
              </option>

              {doctors.map((doctor) => (
                <option
                  key={doctor.id}
                  value={doctor.id}
                >
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Priority
            </label>

            <select
              value={form.priority}
              onChange={(e) =>
                updateField(
                  "priority",
                  e.target.value
                )
              }
              disabled={loading}
              className={inputClass}
            >
              <option value="NORMAL">
                Normal
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="URGENT">
                Urgent
              </option>

              <option value="STAT">
                STAT
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* Test Selection */}

      <section className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-lg shadow-purple-500/20">
        <div className="border-b border-purple-500/30 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                Select Laboratory Tests
              </h2>

              <p className="mt-1 text-xs text-purple-300/70">
                Select all tests required for this order.
              </p>
            </div>

            <input
              value={testSearch}
              onChange={(e) =>
                setTestSearch(e.target.value)
              }
              placeholder="Search tests..."
              disabled={loading}
              className="rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2 text-sm text-purple-100 outline-none placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-5">
          {filteredTests.length === 0 ? (
            <div className="py-8 text-center text-sm text-purple-300/70">
              No tests available.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredTests.map((test) => {
                const selected =
                  form.tests.includes(
                    String(test.id)
                  );

                return (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() =>
                      toggleTest(test.id)
                    }
                    disabled={loading}
                    className={`flex items-center justify-between rounded-lg border p-4 text-left transition ${
                      selected
                        ? "border-purple-500 bg-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                        : "border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                          selected
                            ? "border-purple-400 bg-purple-500 text-white"
                            : "border-purple-500/30"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-purple-200">
                          {test.name}
                        </p>

                        {test.code && (
                          <p className="mt-1 text-xs text-purple-300/70">
                            {test.code}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="ml-3 shrink-0 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      {formatCurrency(
                        Number(test.price || 0)
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Selected Tests & Billing */}

      <section className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-lg shadow-purple-500/20">
        <div className="border-b border-purple-500/30 px-5 py-4">
          <h2 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Order Summary
          </h2>
        </div>

        <div className="p-5">
          {selectedTests.length === 0 ? (
            <div className="rounded-lg bg-purple-500/10 p-5 text-center text-sm text-purple-300/70 border border-purple-500/20">
              No tests selected.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-500/5 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-purple-200">
                      {test.name}
                    </p>

                    {test.code && (
                      <p className="text-xs text-purple-300/70">
                        {test.code}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      {formatCurrency(
                        Number(test.price || 0)
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeTest(test.id)
                      }
                      disabled={loading}
                      className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 ml-auto max-w-sm space-y-3 border-t border-purple-500/20 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-purple-300/70">
                Subtotal
              </span>

              <span className="font-medium text-purple-200">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="discount"
                className="text-sm text-purple-300/70"
              >
                Discount
              </label>

              <input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={form.discount}
                onChange={(e) =>
                  updateField(
                    "discount",
                    e.target.value
                  )
                }
                disabled={loading}
                className="w-32 rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2 text-right text-sm text-purple-100 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm"
              />
            </div>

            <div className="flex justify-between border-t border-purple-500/20 pt-3">
              <span className="font-semibold text-purple-200">
                Total
              </span>

              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}

      <section className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-lg shadow-purple-500/20">
        <div className="border-b border-purple-500/30 px-5 py-4">
          <h2 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Notes
          </h2>
        </div>

        <div className="p-5">
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) =>
              updateField(
                "notes",
                e.target.value
              )
            }
            placeholder="Add clinical or operational notes..."
            disabled={loading}
            className={`${inputClass} resize-none`}
          />
        </div>
      </section>

      {/* Actions */}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-purple-500/30 bg-black/40 px-5 py-2.5 text-sm font-medium text-purple-300 hover:bg-purple-500/20 hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-50 backdrop-blur-sm transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-purple-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-purple-500/30 border border-purple-400/30 transition-colors"
        >
          {loading
            ? "Saving..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}