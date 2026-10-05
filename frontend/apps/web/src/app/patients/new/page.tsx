"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PixelPerfectPatientRegistration from "@/components/patients/PixelPerfectPatientRegistration";
import { clearAuthSession } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-storage";

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePixelPerfectSubmit = async (formData: any) => {
    setLoading(true);
    setError("");

    try {
      // Robust phone sanitization: strips ALL non-digit chars, then strips country prefix
      const cleanPhone = (phone: string) => {
        if (!phone) return '';
        let digits = phone.replace(/\D/g, ''); // remove ALL non-digits (brackets, dashes, spaces, +)
        if (digits.length === 12 && digits.startsWith('91')) {
          digits = digits.slice(2); // strip +91 country code
        } else if (digits.length === 11 && digits.startsWith('0')) {
          digits = digits.slice(1); // strip leading 0
        }
        return digits;
      };

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const endpoint = `${apiBase}/api/patients`;

      if (!formData.firstName?.trim()) {
        throw new Error('First name is required');
      }
      if (!formData.lastName?.trim()) {
        throw new Error('Last name is required');
      }
      if (!formData.dateOfBirth) {
        throw new Error('Date of birth is required');
      }
      if (!formData.gender) {
        throw new Error('Gender is required');
      }

      const requestData: Record<string, any> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: String(formData.gender).toUpperCase(),
        dateOfBirth: formData.dateOfBirth,
      };

      if (formData.middleName?.trim()) requestData.middleName = formData.middleName.trim();
      
      const phoneCleaned = cleanPhone(formData.phone);
      if (phoneCleaned) requestData.phone = phoneCleaned;

      if (formData.email?.trim()) requestData.email = formData.email.trim();
      if (formData.address?.trim()) requestData.address = formData.address.trim();
      if (formData.city?.trim()) requestData.city = formData.city.trim();
      if (formData.state?.trim()) requestData.state = formData.state.trim();
      // Strip non-digits from postal code so backend 6-digit PIN validation passes
      const postalCodeDigits = formData.postalCode ? formData.postalCode.replace(/\D/g, '') : '';
      if (postalCodeDigits) requestData.postalCode = postalCodeDigits;
      if (formData.country?.trim()) requestData.country = formData.country.trim();

      // Only pass valid blood group (non-empty)
      if (formData.bloodGroup && formData.bloodGroup.trim() !== '') {
        requestData.bloodGroup = formData.bloodGroup;
      }

      if (formData.maritalStatus) requestData.maritalStatus = formData.maritalStatus;
      if (formData.nationality?.trim()) requestData.nationality = formData.nationality.trim();
      requestData.patientType = formData.patientType || 'GENERAL';

      if (formData.emergencyContactName?.trim()) {
        requestData.emergencyContactName = formData.emergencyContactName.trim();
      }
      const ecPhoneCleaned = cleanPhone(formData.emergencyContactPhone);
      if (ecPhoneCleaned) {
        requestData.emergencyContactPhone = ecPhoneCleaned;
      }
      if (formData.emergencyContactRelationship?.trim()) {
        requestData.emergencyContactRelationship = formData.emergencyContactRelationship.trim();
      }
      if (formData.emergencyContactAddress?.trim()) {
        requestData.emergencyContactAddress = formData.emergencyContactAddress.trim();
      }

      // Convert allergies text to array
      if (typeof formData.allergies === 'string' && formData.allergies.trim()) {
        requestData.allergies = formData.allergies.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
      } else if (Array.isArray(formData.allergies)) {
        requestData.allergies = formData.allergies;
      }

      // Map medicalConditions to chronicDiseases array and pass medicalConditions
      if (typeof formData.medicalConditions === 'string' && formData.medicalConditions.trim()) {
        const conds = formData.medicalConditions.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
        requestData.chronicDiseases = conds;
        requestData.medicalConditions = conds;
      } else if (Array.isArray(formData.medicalConditions)) {
        requestData.chronicDiseases = formData.medicalConditions;
        requestData.medicalConditions = formData.medicalConditions;
      }

      // Map currentMedications to array of objects
      if (typeof formData.currentMedications === 'string' && formData.currentMedications.trim()) {
        requestData.currentMedications = formData.currentMedications
          .split(/[\n,]+/)
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((name: string) => ({ name }));
      } else if (Array.isArray(formData.currentMedications)) {
        requestData.currentMedications = formData.currentMedications;
      }

      if (formData.insuranceProvider?.trim()) requestData.insuranceProvider = formData.insuranceProvider.trim();
      if (formData.insuranceNumber?.trim()) requestData.insuranceNumber = formData.insuranceNumber.trim();
      if (formData.insuranceGroupNumber?.trim()) requestData.insuranceGroupNumber = formData.insuranceGroupNumber.trim();
      if (formData.insuranceExpiryDate) requestData.insuranceExpiryDate = formData.insuranceExpiryDate;

      if (formData.additionalInformation?.trim()) {
        requestData.notes = formData.additionalInformation.trim();
        requestData.additionalInformation = formData.additionalInformation.trim();
      }

      if (formData.preferredLanguage) requestData.preferredLanguage = formData.preferredLanguage;
      if (formData.preferredCommunicationMethod) requestData.preferredCommunicationMethod = formData.preferredCommunicationMethod;
      
      // Map notificationPreferences checkboxes to communicationPreference object
      // Use exact boolean values from user selection — never default to true
      const notifs = Array.isArray(formData.notificationPreferences) ? formData.notificationPreferences : [];
      requestData.notificationPreferences = notifs;
      requestData.communicationPreference = {
        sms: notifs.includes('SMS'),
        email: notifs.includes('Email'),
        whatsapp: notifs.includes('WhatsApp'),
        call: notifs.includes('Phone Call'),
      };

      // Privacy consent: map to individual consent fields & DPDP Act 2023 versioned record
      const consent = Boolean(formData.privacyConsent);
      requestData.consentForTreatment = consent;
      requestData.consentForDataSharing = consent;
      requestData.consentForMarketing = false; // never default marketing consent to true
      requestData.privacyConsent = consent;
      requestData.dpdpConsent = {
        version: "DPDP-v1.0-2024",
        timestamp: new Date().toISOString(),
        clinicalDiagnostics: consent,
        digitalCommunication: formData.dpdpDigitalCommConsent !== false,
        abhaRecordExchange: Boolean(formData.dpdpAbhaExchangeConsent),
      };

      // Get auth token
      const token = getAccessToken();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Patient creation error:', errorData);

        if (response.status === 401) {
          clearAuthSession();
          const returnUrl = encodeURIComponent(
            window.location.pathname + window.location.search
          );
          router.replace(`/login?returnUrl=${returnUrl}`);
          throw new Error('Your session has expired. Please login again.');
        }

        // Handle validation errors
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, fieldError]: [string, any]) => {
              if (fieldError && fieldError._errors) {
                return `${field}: ${fieldError._errors.join(', ')}`;
              }
              if (typeof fieldError === 'string') return `${field}: ${fieldError}`;
              return null;
            })
            .filter(Boolean)
            .join('; ');
          throw new Error(errorMessages || errorData.message || 'Failed to create patient');
        }

        throw new Error(errorData.message || 'Failed to create patient');
      }

      const result = await response.json();
      const newPatientId = result.data?.id || result.id;
      
      if (window.confirm("Patient registered successfully!\n\nWould you like to book a new order for this patient now?\nClick OK to Create Order, Cancel to view Patient Profile.")) {
        router.push(`/orders/new?patientId=${newPatientId}`);
      } else {
        router.push(newPatientId ? `/patients/${newPatientId}` : '/patients');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create patient');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN", "BRANCH_ADMIN", "FRONT_DESK", "LAB_TECH", "DOCTOR", "PATHOLOGIST"]}>
      <DashboardLayout title="Add New Patient">
        <div className="min-h-screen bg-gray-50">
          {/* Breadcrumbs */}
          <div className="max-w-7xl mx-auto px-4 pt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/patients" className="hover:text-indigo-600 transition-colors">Patients</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">New Patient Registration</span>
          </div>

          {error && (
            <div className="max-w-7xl mx-auto px-4 pt-4">
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <Suspense
            fallback={
              <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            }
          >
            <PixelPerfectPatientRegistration
              onSubmit={handlePixelPerfectSubmit}
              onCancel={() => router.push('/patients')}
              loading={loading}
            />
          </Suspense>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

