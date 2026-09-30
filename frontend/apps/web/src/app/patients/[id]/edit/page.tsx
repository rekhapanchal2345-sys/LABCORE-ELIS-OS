"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { patientApi } from "@/lib/api";

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState({
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
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await patientApi.getById(id);
      const patient = response.data as any;
      
      // Convert blood group from database format to display format
      const formatBloodGroupForDisplay = (bg: string) => {
        if (!bg) return "";
        // If already in database format, return as is since we changed dropdown to use DB format
        if (bg.includes('_')) return bg;
        const bloodGroupMap: { [key: string]: string } = {
          'A_POSITIVE': 'A+',
          'A_NEGATIVE': 'A-',
          'B_POSITIVE': 'B+',
          'B_NEGATIVE': 'B-',
          'AB_POSITIVE': 'AB+',
          'AB_NEGATIVE': 'AB-',
          'O_POSITIVE': 'O+',
          'O_NEGATIVE': 'O-'
        };
        return bloodGroupMap[bg] || bg;
      };

      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        city: patient.city || "",
        state: patient.state || "",
        postalCode: patient.postalCode || "",
        bloodGroup: formatBloodGroupForDisplay(patient.bloodGroup || ""),
        emergencyContactName: patient.emergencyContactName || "",
        emergencyContactPhone: patient.emergencyContactPhone || "",
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Convert blood group format if needed
      const formatBloodGroup = (bg: string) => {
        if (!bg) return null;
        // If already in database format, return as is
        if (bg.includes('_')) return bg;
        // Convert from display format to database format
        const bloodGroupMap: { [key: string]: string } = {
          'A+': 'A_POSITIVE',
          'A-': 'A_NEGATIVE', 
          'B+': 'B_POSITIVE',
          'B-': 'B_NEGATIVE',
          'AB+': 'AB_POSITIVE',
          'AB-': 'AB_NEGATIVE',
          'O+': 'O_POSITIVE',
          'O-': 'O_NEGATIVE'
        };
        return bloodGroupMap[bg] || bg;
      };

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender.toUpperCase(),
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        postalCode: formData.postalCode || null,
        bloodGroup: formatBloodGroup(formData.bloodGroup),
        emergencyContactName: formData.emergencyContactName || null,
        emergencyContactPhone: formData.emergencyContactPhone || null,
      };

      console.log('Updating patient with data:', updateData);
      
      await patientApi.update(id, updateData);

      alert("Patient updated successfully!");
      router.push(`/patients/${id}`);
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update patient');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Patient">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading patient details...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Patient">
      <div className="max-w-2xl">
        <div className="mb-6">
          <Link
            href={`/patients/${id}`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to Patient Details
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            Edit Patient
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodGroup: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A_POSITIVE">A+</option>
                  <option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option>
                  <option value="B_NEGATIVE">B-</option>
                  <option value="AB_POSITIVE">AB+</option>
                  <option value="AB_NEGATIVE">AB-</option>
                  <option value="O_POSITIVE">O+</option>
                  <option value="O_NEGATIVE">O-</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContactName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContactPhone: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                {submitting ? "Updating..." : "Update Patient"}
              </button>
              <Link
                href={`/patients/${id}`}
                className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}