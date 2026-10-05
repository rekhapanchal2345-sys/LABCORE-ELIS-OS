"use client";

import React, { FormEvent, useState } from "react";
import type { PatientFormData } from "../../types";

interface PatientFormProps {
  initialData?: Partial<PatientFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (
    data: PatientFormData
  ) => Promise<void> | void;
  onCancel?: () => void;
}

const defaultForm: PatientFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  bloodGroup: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  referringDoctorId: "",
};

export default function PatientForm({
  initialData,
  loading = false,
  submitLabel = "Save Patient",
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const [form, setForm] =
    useState<PatientFormData>({
      ...defaultForm,
      ...initialData,
    });

  const [error, setError] =
    useState<string | null>(null);

  function updateField(
    field: keyof PatientFormData,
    value: string
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

    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!form.gender) {
      setError("Gender is required.");
      return;
    }

    try {
      // Clean phone numbers by removing spaces and + symbol, convert gender to uppercase
      const cleanedForm = {
        ...form,
        phone: form.phone?.replace(/\s/g, '').replace('+', '') || '',
        emergencyContactPhone: form.emergencyContactPhone?.replace(/\s/g, '').replace('+', '') || '',
        email: form.email?.trim() || '',
        gender: form.gender?.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER' || 'MALE',
      };
      await onSubmit(cleanedForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save patient."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-400 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Personal Information */}

      <section className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-lg shadow-purple-500/20">
        <div className="border-b border-purple-500/30 px-5 py-4">
          <h2 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Personal Information
          </h2>

          <p className="mt-1 text-xs text-purple-300/70">
            Basic patient identification details
          </p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          {/* First Name */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              First Name
              <span className="ml-1 text-red-400">*</span>
            </label>

            <input
              type="text"
              value={form.firstName}
              onChange={(event) =>
                updateField(
                  "firstName",
                  event.target.value
                )
              }
              placeholder="Enter first name"
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>

          {/* Last Name */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Last Name
              <span className="ml-1 text-red-400">*</span>
            </label>

            <input
              type="text"
              value={form.lastName}
              onChange={(event) =>
                updateField(
                  "lastName",
                  event.target.value
                )
              }
              placeholder="Enter last name"
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>

          {/* Date of Birth */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Date of Birth
            </label>

            <input
              type="date"
              value={form.dateOfBirth || ""}
              onChange={(event) =>
                updateField(
                  "dateOfBirth",
                  event.target.value
                )
              }
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>

          {/* Gender */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Gender
              <span className="ml-1 text-red-400">*</span>
            </label>

            <select
              value={form.gender}
              onChange={(event) =>
                updateField(
                  "gender",
                  event.target.value
                )
              }
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            >
              <option value="">
                Select gender
              </option>

              <option value="MALE">
                Male
              </option>

              <option value="FEMALE">
                Female
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </div>

          {/* Blood Group */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Blood Group
            </label>

            <select
              value={form.bloodGroup || ""}
              onChange={(event) =>
                updateField(
                  "bloodGroup",
                  event.target.value
                )
              }
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            >
              <option value="">
                Select blood group
              </option>

              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </section>

      {/* Contact Information */}

      <section className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-lg shadow-purple-500/20">
        <div className="border-b border-purple-500/30 px-5 py-4">
          <h2 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Contact Information
          </h2>

          <p className="mt-1 text-xs text-purple-300/70">
            Patient contact and address details
          </p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          {/* Phone */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Phone
            </label>

            <input
              type="tel"
              value={form.phone || ""}
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value
                )
              }
              placeholder="Enter phone number"
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>

          {/* Email */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Email
            </label>

            <input
              type="email"
              value={form.email || ""}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value
                )
              }
              placeholder="patient@example.com"
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>

          {/* Address */}

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Address
            </label>

            <textarea
              value={form.address || ""}
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value
                )
              }
              placeholder="Enter full address"
              rows={3}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>

          {/* City */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              City
            </label>

            <input
              type="text"
              value={form.city || ""}
              onChange={(event) =>
                updateField(
                  "city",
                  event.target.value
                )
              }
              placeholder="Enter city"
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>

          {/* State */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              State
            </label>

            <input
              type="text"
              value={form.state || ""}
              onChange={(event) =>
                updateField(
                  "state",
                  event.target.value
                )
              }
              placeholder="Enter state"
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>

          {/* Postal Code */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Postal Code
            </label>

            <input
              type="text"
              value={form.postalCode || ""}
              onChange={(event) =>
                updateField(
                  "postalCode",
                  event.target.value
                )
              }
              placeholder="Enter postal code"
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>
        </div>
      </section>

      {/* Emergency Contact */}

      <section className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-lg shadow-purple-500/20">
        <div className="border-b border-purple-500/30 px-5 py-4">
          <h2 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Emergency Contact
          </h2>

          <p className="mt-1 text-xs text-purple-300/70">
            Optional emergency contact information
          </p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Contact Name
            </label>

            <input
              type="text"
              value={
                form.emergencyContactName ||
                ""
              }
              onChange={(event) =>
                updateField(
                  "emergencyContactName",
                  event.target.value
                )
              }
              placeholder="Emergency contact name"
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-purple-300">
              Contact Phone
            </label>

            <input
              type="tel"
              value={
                form.emergencyContactPhone ||
                ""
              }
              onChange={(event) =>
                updateField(
                  "emergencyContactPhone",
                  event.target.value
                )
              }
              placeholder="Emergency contact phone"
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
            />
          </div>
        </div>
      </section>

      {/* Doctor */}

      <section className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-xl shadow-lg shadow-purple-500/20">
        <div className="border-b border-purple-500/30 px-5 py-4">
          <h2 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Referring Doctor
          </h2>

          <p className="mt-1 text-xs text-purple-300/70">
            Optional doctor reference
          </p>
        </div>

        <div className="p-5">
          <label className="mb-1.5 block text-sm font-medium text-purple-300">
            Doctor ID
          </label>

          <input
            type="text"
            value={
              form.referringDoctorId ||
              ""
            }
            onChange={(event) =>
              updateField(
                "referringDoctorId",
                event.target.value
              )
            }
            placeholder="Enter referring doctor ID"
            disabled={loading}
            className="w-full rounded-lg border border-purple-500/30 bg-black/50 px-3 py-2.5 text-sm text-purple-100 outline-none transition placeholder:text-purple-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm disabled:bg-purple-500/10"
          />
        </div>
      </section>

      {/* Actions */}

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-purple-500/30 bg-black/40 px-5 py-2.5 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20 hover:border-cyan-500/50 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-purple-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-purple-500/30 border border-purple-400/30"
        >
          {loading
            ? "Saving..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}