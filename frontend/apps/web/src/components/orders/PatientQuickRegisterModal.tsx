"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, UserPlus, AlertCircle, ExternalLink } from "lucide-react";
import { patientApi } from "@/lib/api";

export function PatientQuickRegisterModal({
  isOpen,
  onClose,
  onPatientCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: any) => void;
}) {
  const initialFormState = {
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "MALE",
    age: "",
    phone: "",
    email: "",
    address: "",
    bloodGroup: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form whenever modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setFormData(initialFormState);
    setError("");
    onClose();
  };

  const handleFirstNameChange = (val: string) => {
    // Smart auto-split: if user types or pastes full 3-part or 2-part name in First Name
    const tokens = val.trim().split(/\s+/);
    if (tokens.length >= 3 && !formData.middleName && !formData.lastName) {
      setFormData({
        ...formData,
        firstName: tokens[0],
        middleName: tokens.slice(1, -1).join(" "),
        lastName: tokens[tokens.length - 1],
      });
      return;
    }
    if (tokens.length === 2 && !formData.lastName) {
      setFormData({
        ...formData,
        firstName: tokens[0],
        lastName: tokens[1],
      });
      return;
    }
    setFormData({ ...formData, firstName: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First and Last Name are required");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    setLoading(true);

    try {
      // If age was entered, compute approximate dateOfBirth
      let dateOfBirth: string | undefined = undefined;
      if (formData.age && !isNaN(Number(formData.age))) {
        const d = new Date();
        d.setFullYear(d.getFullYear() - Number(formData.age));
        dateOfBirth = d.toISOString().split("T")[0];
      }

      const cleanPhone = formData.phone.trim().replace(/[\s\-\(\)\+]/g, '');

      const payload: any = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || undefined,
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        age: formData.age ? Number(formData.age) : undefined,
        phone: cleanPhone,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        dateOfBirth,
        bloodGroup: formData.bloodGroup || undefined,
      };

      const response = await patientApi.create(payload);

      if (response && (response.success || response.data || response.id)) {
        const createdPatient = response.data?.patient || response.data || response;
        setFormData(initialFormState);
        onPatientCreated(createdPatient);
        handleCloseModal();
      } else {
        setError(response?.message || "Failed to create patient");
      }
    } catch (err: any) {
      console.error("Patient registration error:", err);
      setError(err.message || "Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Quick Patient Registration
              </h3>
              <p className="text-xs text-slate-500">
                Instantly register and select a new patient for this order
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/patients/new"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              title="Open full patient registration with clinical consent, emergency contact, and detailed insurance"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Full Form</span>
            </Link>
            <button
              onClick={handleCloseModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleFirstNameChange(e.target.value)}
                placeholder="e.g. Panchal"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                placeholder="e.g. Mayurkumar"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Ashokkumar"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age (Years) *
              </label>
              <input
                type="number"
                min={0}
                max={130}
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 45"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unknown</option>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Residential Address (Optional)
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Flat 302, Green Valley Apartments, Sector 14"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/patients/new"
              className="text-xs text-slate-500 hover:text-blue-600 font-medium underline flex items-center gap-1"
            >
              Need full clinical form?
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                {loading ? "Registering..." : "Register & Select Patient"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
