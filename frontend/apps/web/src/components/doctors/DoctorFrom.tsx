"use client";

import React, {
  FormEvent,
  useState,
} from "react";

export interface DoctorFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  specialization: string;
  qualification: string;
  registrationNumber: string;
  phone: string;
  email: string;
  signatureUrl?: string;
  // New LIMS-specific fields
  doctorType?: "REFERRING_DOCTOR" | "INTERNAL_PATHOLOGIST" | "CONSULTANT_PATHOLOGIST";
  clinicName?: string;
  clinicAddress?: string;
  whatsappNumber?: string;
  reportDeliveryEmail?: boolean;
  reportDeliveryWhatsApp?: boolean;
  reportDeliveryHardCopy?: boolean;
  reportDeliveryPortal?: boolean;
  enablePortalAccess?: boolean;
  commissionRate?: number;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankAccountHolderName?: string;
}

interface DoctorFormProps {
  initialData?: Partial<DoctorFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (
    data: DoctorFormData
  ) => Promise<void> | void;
  onCancel?: () => void;
}

const defaultForm: DoctorFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  specialization: "",
  qualification: "",
  registrationNumber: "",
  phone: "",
  email: "",
  signatureUrl: "",
  // New LIMS-specific fields
  doctorType: "REFERRING_DOCTOR",
  clinicName: "",
  clinicAddress: "",
  whatsappNumber: "",
  reportDeliveryEmail: false,
  reportDeliveryWhatsApp: false,
  reportDeliveryHardCopy: false,
  reportDeliveryPortal: false,
  enablePortalAccess: false,
  commissionRate: 0,
  bankAccountNumber: "",
  bankIfscCode: "",
  bankAccountHolderName: "",
};

export default function DoctorForm({
  initialData,
  loading = false,
  submitLabel = "Save Doctor",
  onSubmit,
  onCancel,
}: DoctorFormProps) {
  const [form, setForm] =
    useState<DoctorFormData>({
      ...defaultForm,
      ...initialData,
    });

  const [error, setError] =
    useState<string | null>(null);

  function updateField(
    field: keyof DoctorFormData,
    value: string | boolean | number
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

    if (!form.specialization.trim()) {
      setError("Specialization is required.");
      return;
    }

    if (!form.qualification.trim()) {
      setError("Qualification is required.");
      return;
    }

    if (!form.registrationNumber.trim()) {
      setError("Registration number is required.");
      return;
    }

    // Clean registration number by removing spaces and special characters
    const cleanedRegistrationNumber = form.registrationNumber.replace(/\s/g, '').replace(/[^\w]/g, '');

    if (!form.phone || !form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      // Clean phone numbers by removing spaces
      const cleanedPhone = form.phone.replace(/\s/g, '');
      if (cleanedPhone.length < 10) {
        setError("Phone number must be at least 10 digits.");
        return;
      }

      const cleanedForm = {
        ...form,
        phone: cleanedPhone,
        whatsappNumber: form.whatsappNumber?.replace(/\s/g, '') || '',
        registrationNumber: cleanedRegistrationNumber,
        email: form.email?.trim() || '', // Ensure email is empty string if not provided
      };
      await onSubmit(cleanedForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save doctor."
      );
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100 shadow-sm hover:border-gray-300";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 px-6 py-4 text-sm text-red-700 shadow-lg">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Personal Information */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
              <p className="text-sm text-gray-500">Basic details about the doctor</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              First Name *
            </label>

            <input
              value={form.firstName}
              onChange={(e) =>
                updateField("firstName", e.target.value)
              }
              placeholder="First name"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Middle Name
            </label>

            <input
              value={form.middleName}
              onChange={(e) =>
                updateField("middleName", e.target.value)
              }
              placeholder="Middle name"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Last Name *
            </label>

            <input
              value={form.lastName}
              onChange={(e) =>
                updateField("lastName", e.target.value)
              }
              placeholder="Last name"
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Professional Information */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Professional Information</h2>
              <p className="text-sm text-gray-500">Medical credentials and specialization</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Doctor Type *
            </label>

            <select
              value={form.doctorType}
              onChange={(e) =>
                updateField(
                  "doctorType",
                  e.target.value
                )
              }
              disabled={loading}
              className={inputClass}
            >
              <option value="REFERRING_DOCTOR">Referring Doctor</option>
              <option value="INTERNAL_PATHOLOGIST">Internal Pathologist</option>
              <option value="CONSULTANT_PATHOLOGIST">Consultant Pathologist</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Specialization *
            </label>

            <input
              value={form.specialization}
              onChange={(e) =>
                updateField(
                  "specialization",
                  e.target.value
                )
              }
              placeholder="e.g. Pathology"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Qualification *
            </label>

            <input
              value={form.qualification}
              onChange={(e) =>
                updateField(
                  "qualification",
                  e.target.value
                )
              }
              placeholder="e.g. MBBS, MD"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Registration Number *
            </label>

            <input
              value={form.registrationNumber}
              onChange={(e) =>
                updateField(
                  "registrationNumber",
                  e.target.value
                )
              }
              placeholder="Medical registration number"
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
              <p className="text-sm text-gray-500">Phone, email and communication details</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Phone *
            </label>

            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                updateField("phone", e.target.value)
              }
              placeholder="Phone number"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                updateField("email", e.target.value)
              }
              placeholder="doctor@example.com (for automated report dispatch)"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              WhatsApp Number (Optional)
            </label>

            <input
              type="tel"
              value={form.whatsappNumber}
              onChange={(e) =>
                updateField("whatsappNumber", e.target.value)
              }
              placeholder="WhatsApp number for PDF report notifications"
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Affiliation & Clinic Details */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1h4m4 4h2m-2 0h-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Affiliation & Clinic Details</h2>
              <p className="text-sm text-gray-500">Clinic or hospital information</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Clinic / Hospital Name
            </label>

            <input
              value={form.clinicName}
              onChange={(e) =>
                updateField("clinicName", e.target.value)
              }
              placeholder="Clinic or hospital name"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Clinic / Hospital Address
            </label>

            <input
              value={form.clinicAddress}
              onChange={(e) =>
                updateField("clinicAddress", e.target.value)
              }
              placeholder="Address for report delivery"
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Communication & Digital Preferences */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Communication & Digital Preferences</h2>
              <p className="text-sm text-gray-500">Report delivery and portal access settings</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Report Delivery Mode
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.reportDeliveryEmail}
                  onChange={(e) =>
                    updateField("reportDeliveryEmail", e.target.checked)
                  }
                  disabled={loading}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Email</span>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.reportDeliveryWhatsApp}
                  onChange={(e) =>
                    updateField("reportDeliveryWhatsApp", e.target.checked)
                  }
                  disabled={loading}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.reportDeliveryHardCopy}
                  onChange={(e) =>
                    updateField("reportDeliveryHardCopy", e.target.checked)
                  }
                  disabled={loading}
                  className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Hard Copy</span>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.reportDeliveryPortal}
                  onChange={(e) =>
                    updateField("reportDeliveryPortal", e.target.checked)
                  }
                  disabled={loading}
                  className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Portal</span>
                </div>
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enablePortalAccess}
                onChange={(e) =>
                  updateField("enablePortalAccess", e.target.checked)
                }
                disabled={loading}
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">
                  Enable Doctor Portal Access (Auto-generate credentials)
                </span>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Financial / Referral Setup */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Financial / Referral Setup</h2>
              <p className="text-sm text-gray-500">Commission and bank account details</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Referral Commission / Incentive (%)
            </label>

            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.commissionRate}
              onChange={(e) =>
                updateField("commissionRate", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Bank Account Number
            </label>

            <input
              value={form.bankAccountNumber}
              onChange={(e) =>
                updateField("bankAccountNumber", e.target.value)
              }
              placeholder="Bank account number"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              IFSC Code
            </label>

            <input
              value={form.bankIfscCode}
              onChange={(e) =>
                updateField("bankIfscCode", e.target.value)
              }
              placeholder="Bank IFSC code"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Account Holder Name
            </label>

            <input
              value={form.bankAccountHolderName}
              onChange={(e) =>
                updateField("bankAccountHolderName", e.target.value)
              }
              placeholder="Account holder name"
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Digital Signature */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Digital Signature</h2>
              <p className="text-sm text-gray-500">Upload signature for report approval</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Doctor Signature (for report approval/printing)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      updateField("signatureUrl", reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                disabled={loading}
                className="hidden"
                id="signature-upload"
              />
              {form.signatureUrl ? (
                <div className="relative">
                  <img 
                    src={form.signatureUrl} 
                    alt="Signature" 
                    className="h-32 border border-gray-300 rounded-xl object-contain bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => updateField("signatureUrl", "")}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="signature-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-4 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
        >
          {loading ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}