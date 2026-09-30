"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth-storage";

interface StepConfig {
  id: number;
  title: string;
  description: string;
}

interface PatientFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;

  // Contact Information
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  // Identification
  nationalId: string;

  // Medical & Insurance
  fastingStatus: string;
  referringDoctor: string;
  insuranceProvider: string;
  insuranceNumber: string;
  insuranceCoverageType: string;
  insuranceCoPayAmount: string;
  clinicalNotes: string;

  // Report Delivery
  reportDeliveryWhatsApp: boolean;
  reportDeliveryEmail: boolean;
  reportDeliveryPrinted: boolean;
  reportDeliveryPortal: boolean;

  // Additional Medical Information
  vaccinationHistory: string;
  lastVisitDate: string;
  disabilityStatus: string;

  // Legal & Consent Information
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
  organDonorStatus: string;
  consentForResearch: boolean;
  consentForDataSharing: boolean;
}

const steps: StepConfig[] = [
  {
    id: 1,
    title: "Personal Information",
    description: "Basic patient details"
  },
  {
    id: 2,
    title: "Contact Information",
    description: "Address and contact details"
  },
  {
    id: 3,
    title: "Emergency Contact",
    description: "Emergency contact details"
  },
  {
    id: 4,
    title: "Identification & Insurance",
    description: "ID and insurance information"
  },
  {
    id: 5,
    title: "Insurance Information",
    description: "Insurance coverage details"
  },
  {
    id: 6,
    title: "Clinical Notes",
    description: "Medical notes and observations"
  },
  {
    id: 7,
    title: "Additional Medical Information",
    description: "Medical history and vaccinations"
  },
  {
    id: 8,
    title: "Report Delivery",
    description: "Report delivery preferences"
  },
  {
    id: 9,
    title: "Legal & Consent Information",
    description: "Legal contacts and consents"
  }
];

interface MultiStepPatientFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export default function MultiStepPatientForm({ onSubmit, loading = false }: MultiStepPatientFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PatientFormData>({
    // Personal Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",

    // Contact Information
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",

    // Identification
    nationalId: "",

    // Medical & Insurance
    fastingStatus: "NOT_APPLICABLE",
    referringDoctor: "",
    insuranceProvider: "",
    insuranceNumber: "",
    insuranceCoverageType: "",
    insuranceCoPayAmount: "",
    clinicalNotes: "",

    // Report Delivery
    reportDeliveryWhatsApp: false,
    reportDeliveryEmail: false,
    reportDeliveryPrinted: false,
    reportDeliveryPortal: false,

    // Additional Medical Information
    vaccinationHistory: "",
    lastVisitDate: "",
    disabilityStatus: "",

    // Legal & Consent Information
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinRelationship: "",
    organDonorStatus: "",
    consentForResearch: false,
    consentForDataSharing: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateField = (field: keyof PatientFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) errors.firstName = "First name is required";
        if (!formData.lastName.trim()) errors.lastName = "Last name is required";
        if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
        if (!formData.gender) errors.gender = "Gender is required";
        break;
      case 2: // Contact Information
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Invalid email format";
        }
        if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
          errors.phone = "Invalid phone number format";
        }
        break;
      case 3: // Emergency Contact
        if (formData.emergencyContactPhone && !/^[0-9+\-\s()]{10,}$/.test(formData.emergencyContactPhone)) {
          errors.emergencyContactPhone = "Invalid emergency contact phone format";
        }
        break;
      // Other steps are optional, so no validation required
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }

    try {
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        bloodGroup: formData.bloodGroup,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelationship: formData.emergencyContactRelationship,
        nationalId: formData.nationalId,
        fastingStatus: formData.fastingStatus,
        doctorId: formData.referringDoctor,
        insuranceProvider: formData.insuranceProvider || undefined,
        insuranceNumber: formData.insuranceNumber || undefined,
        clinicalNotes: formData.clinicalNotes || undefined,
      };

      // Get auth token
      const token = getAccessToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create patient and order');
      }

      const result = await response.json();
      await onSubmit(result);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
                    validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
                    validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    updateField('dateOfBirth', e.target.value);
                    // Calculate age
                    if (e.target.value && isMounted) {
                      const birthDate = new Date(e.target.value);
                      const today = new Date();
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      setCalculatedAge(age);
                    } else {
                      setCalculatedAge(null);
                    }
                  }}
                  className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
                    validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.dateOfBirth && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.dateOfBirth}</p>
                )}
                {isMounted && calculatedAge !== null && (
                  <p className="mt-1 text-xs text-gray-500">Calculated Age: {calculatedAge} years</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
                    validationErrors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {validationErrors.gender && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.gender}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => updateField('bloodGroup', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Blood Group</option>
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

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Age (Calculated)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={calculatedAge !== null ? `${calculatedAge} Years` : ''}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="patient@example.com"
                  className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Street address, building, apartment"
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
                  onChange={(e) => updateField('city', e.target.value)}
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
                  onChange={(e) => updateField('state', e.target.value)}
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
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Emergency Contact</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => updateField('emergencyContactName', e.target.value)}
                    placeholder="Full name of emergency contact"
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
                    onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                    placeholder="+91 9876543210"
                    className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
                      validationErrors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.emergencyContactPhone && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.emergencyContactPhone}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => updateField('emergencyContactRelationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Identification & Insurance</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  National ID / Aadhaar / Voter ID
                </label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => updateField('nationalId', e.target.value)}
                  placeholder="National ID number (optional)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fasting Status
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="fastingStatus"
                      value="YES"
                      checked={formData.fastingStatus === "YES"}
                      onChange={(e) => updateField('fastingStatus', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="fastingStatus"
                      value="NO"
                      checked={formData.fastingStatus === "NO"}
                      onChange={(e) => updateField('fastingStatus', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="fastingStatus"
                      value="NOT_APPLICABLE"
                      checked={formData.fastingStatus === "NOT_APPLICABLE"}
                      onChange={(e) => updateField('fastingStatus', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">N/A</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Referring Doctor
                </label>
                <input
                  type="text"
                  value={formData.referringDoctor}
                  onChange={(e) => updateField('referringDoctor', e.target.value)}
                  placeholder="Dr. Name or ID"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Insurance Provider <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={(e) => updateField('insuranceProvider', e.target.value)}
                  placeholder="Insurance company name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Insurance Number/Policy ID <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.insuranceNumber}
                  onChange={(e) => updateField('insuranceNumber', e.target.value)}
                  placeholder="Policy number or ID"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Insurance Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Insurance Coverage Type
                </label>
                <input
                  type="text"
                  value={formData.insuranceCoverageType}
                  onChange={(e) => updateField('insuranceCoverageType', e.target.value)}
                  placeholder="e.g., Individual, Family, Corporate"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Co-pay Amount
                </label>
                <input
                  type="number"
                  value={formData.insuranceCoPayAmount}
                  onChange={(e) => updateField('insuranceCoPayAmount', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Clinical Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Patient Notes / Clinical Notes
                </label>
                <textarea
                  value={formData.clinicalNotes}
                  onChange={(e) => updateField('clinicalNotes', e.target.value)}
                  placeholder="Enter any clinical notes, medical history, or additional observations..."
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Additional Medical Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Vaccination History
                </label>
                <textarea
                  value={formData.vaccinationHistory}
                  onChange={(e) => updateField('vaccinationHistory', e.target.value)}
                  placeholder="List of vaccinations with dates..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Last Visit Date
                </label>
                <input
                  type="date"
                  value={formData.lastVisitDate}
                  onChange={(e) => updateField('lastVisitDate', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Disability Status
                </label>
                <textarea
                  value={formData.disabilityStatus}
                  onChange={(e) => updateField('disabilityStatus', e.target.value)}
                  placeholder="Any disabilities or special requirements..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Report Delivery</h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reportDeliveryWhatsApp}
                    onChange={(e) => updateField('reportDeliveryWhatsApp', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">WhatsApp</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reportDeliveryEmail}
                    onChange={(e) => updateField('reportDeliveryEmail', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reportDeliveryPrinted}
                    onChange={(e) => updateField('reportDeliveryPrinted', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Printed Copy</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reportDeliveryPortal}
                    onChange={(e) => updateField('reportDeliveryPortal', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Patient Portal</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Legal & Consent Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Next of Kin Name
                  </label>
                  <input
                    type="text"
                    value={formData.nextOfKinName}
                    onChange={(e) => updateField('nextOfKinName', e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Next of Kin Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.nextOfKinPhone}
                    onChange={(e) => updateField('nextOfKinPhone', e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Next of Kin Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.nextOfKinRelationship}
                    onChange={(e) => updateField('nextOfKinRelationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Organ Donor Status
                  </label>
                  <select
                    value={formData.organDonorStatus}
                    onChange={(e) => updateField('organDonorStatus', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select status</option>
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="consentForResearch"
                    checked={formData.consentForResearch}
                    onChange={(e) => updateField('consentForResearch', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="consentForResearch" className="ml-2 text-sm text-gray-700">
                    I consent to participate in medical research studies
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="consentForDataSharing"
                    checked={formData.consentForDataSharing}
                    onChange={(e) => updateField('consentForDataSharing', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="consentForDataSharing" className="ml-2 text-sm text-gray-700">
                    I consent to share my medical data with healthcare providers
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className="mt-2 text-xs text-center">
                  <div className="font-medium text-gray-900">{step.title}</div>
                  <div className="text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit}>
          {getStepContent()}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Previous
              </button>
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-blue-400 font-medium"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-blue-400 font-medium"
              >
                {loading ? "Creating Patient..." : "Create Patient"}
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push('/patients')}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
