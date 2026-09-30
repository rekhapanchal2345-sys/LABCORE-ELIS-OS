"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth-storage";
import { 
  User, MapPin, Phone, Mail, Shield, Clock, Heart, 
  CheckCircle, AlertCircle, Info, ChevronRight, ChevronLeft
} from "lucide-react";

// =======================================================
// CSS VARIABLES - EXACT COLORS FROM DESIGN
// =======================================================

const formStyles = `
  :root {
    --color-primary: #2563EB;
    --color-primary-dark: #1E40AF;
    --color-primary-light: #3B82F6;
    --color-secondary: #64748B;
    --color-success: #10B981;
    --color-warning: #F59E0B;
    --color-danger: #EF4444;
    --color-background: #FFFFFF;
    --color-surface: #F8FAFC;
    --color-border: #E2E8F0;
    --color-text-primary: #1E293B;
    --color-text-secondary: #64748B;
    --color-text-muted: #94A3B8;
    --color-tab-active: #2563EB;
    --color-tab-inactive: #64748B;
    --color-tab-bg: #F1F5F9;
    --color-feature-bg: #EFF6FF;
    --color-feature-icon: #3B82F6;
  }

  .patient-registration-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--color-background);
    color: var(--color-text-primary);
    line-height: 1.5;
    min-height: 100vh;
  }

  .registration-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
  }

  .form-header {
    margin-bottom: 32px;
  }

  .form-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }

  .form-subtitle {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  /* Main Layout */
  .form-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 32px;
    min-height: calc(100vh - 200px);
  }

  /* Sidebar Navigation */
  .sidebar {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 24px;
    height: fit-content;
    position: sticky;
    top: 24px;
  }

  .sidebar-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: transparent;
    text-align: left;
    width: 100%;
  }

  .sidebar-item:hover {
    background: var(--color-surface);
    color: var(--color-text-primary);
  }

  .sidebar-item.active {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .sidebar-item svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .sidebar-item .step-number {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }

  .sidebar-item:not(.active) .step-number {
    background: var(--color-surface);
    color: var(--color-text-secondary);
  }

  /* Form Content Area */
  .form-content {
    display: flex;
    flex-direction: column;
  }

  /* Form Section */
  .form-section {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .section-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
  }

  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 4px;
  }

  .section-description {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  /* Form Grid */
  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .form-grid-two-columns {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
  }

  .form-field.full-width {
    grid-column: 1 / -1;
  }

  .field-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .field-required {
    color: var(--color-danger);
  }

  .field-optional {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 400;
    margin-left: auto;
  }

  .field-input {
    padding: 12px 16px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 14px;
    color: var(--color-text-primary);
    background: var(--color-background);
    transition: all 0.2s ease;
    outline: none;
  }

  .field-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .field-input::placeholder {
    color: var(--color-text-muted);
  }

  .field-select {
    padding: 12px 16px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 14px;
    color: var(--color-text-primary);
    background: var(--color-background);
    transition: all 0.2s ease;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    padding-right: 40px;
  }

  .field-select:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .field-textarea {
    padding: 12px 16px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 14px;
    color: var(--color-text-primary);
    background: var(--color-background);
    transition: all 0.2s ease;
    outline: none;
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }

  .field-textarea:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .field-error {
    border-color: var(--color-danger) !important;
  }

  .field-error-message {
    font-size: 12px;
    color: var(--color-danger);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Form Actions */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--color-border);
  }

  .btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-secondary {
    background: var(--color-surface);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover {
    background: var(--color-border);
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-primary-dark);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Feature Highlights */
  .feature-highlights {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 32px;
  }

  .feature-card {
    background: var(--color-feature-bg);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    transition: all 0.2s ease;
  }

  .feature-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  .feature-icon {
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    color: var(--color-feature-icon);
  }

  .feature-icon svg {
    width: 20px;
    height: 20px;
  }

  .feature-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 4px;
  }

  .feature-description {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .form-layout {
      grid-template-columns: 1fr;
    }
    
    .sidebar {
      position: relative;
      top: 0;
      margin-bottom: 24px;
    }
    
    .sidebar-nav {
      flex-direction: row;
      flex-wrap: wrap;
    }
    
    .sidebar-item {
      flex: 1 1 calc(50% - 2px);
      min-width: 140px;
      justify-content: center;
    }
    
    .form-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .feature-highlights {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .form-grid-two-columns {
      grid-template-columns: 1fr;
    }
    
    .sidebar-item {
      flex: 1 1 100%;
    }
    
    .feature-highlights {
      grid-template-columns: 1fr;
    }
    
    .form-actions {
      flex-direction: column-reverse;
    }
    
    .btn {
      width: 100%;
      justify-content: center;
    }
  }
`;

// =======================================================
// TYPES
// =======================================================

interface PatientFormData {
  // Basic Information
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  maritalStatus: string;
  nationality: string;
  patientType: string;
  additionalInformation: string;

  // Contact & Address
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  emergencyContactAddress: string;

  // Medical & Insurance
  allergies: string;
  medicalConditions: string;
  currentMedications: string;
  insuranceProvider: string;
  insuranceNumber: string;
  insuranceGroupNumber: string;
  insuranceExpiryDate: string;

  // Preferences
  preferredLanguage: string;
  preferredCommunicationMethod: string;
  notificationPreferences: string[];
  privacyConsent: boolean;
}

interface PixelPerfectPatientRegistrationProps {
  onSubmit?: (data: PatientFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

// =======================================================
// STEP CONFIGURATION
// =======================================================

const steps = [
  { id: 1, title: 'Basic Information', icon: User },
  { id: 2, title: 'Contact & Address', icon: MapPin },
  { id: 3, title: 'Emergency Contact', icon: Phone },
  { id: 4, title: 'Medical & Insurance', icon: Heart },
  { id: 5, title: 'Preferences', icon: Shield },
];

// =======================================================
// MAIN COMPONENT
// =======================================================

export default function PixelPerfectPatientRegistration({
  onSubmit,
  onCancel,
  loading = false,
}: PixelPerfectPatientRegistrationProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PatientFormData>({
    // Basic Information
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    maritalStatus: '',
    nationality: '',
    patientType: '',
    additionalInformation: '',

    // Contact & Address
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',

    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    emergencyContactAddress: '',

    // Medical & Insurance
    allergies: '',
    medicalConditions: '',
    currentMedications: '',
    insuranceProvider: '',
    insuranceNumber: '',
    insuranceGroupNumber: '',
    insuranceExpiryDate: '',

    // Preferences
    preferredLanguage: 'ENGLISH',
    preferredCommunicationMethod: 'EMAIL',
    notificationPreferences: [],
    privacyConsent: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState<{ isDuplicate: boolean; existingPatient?: any } | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const DRAFT_KEY = "patient_registration_form_draft";

  const cleanPhoneDigits = (phone: string): string => {
    if (!phone) return '';
    let digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return digits;
  };

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.formData && (parsed.formData.firstName || parsed.formData.phone || parsed.formData.lastName)) {
            setHasRestoredDraft(true);
          }
        }
      } catch (e) {
        console.warn('Failed to parse draft from localStorage:', e);
      }
    }
  }, []);

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed.formData }));
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        setHasRestoredDraft(false);
      }
    } catch (e) {
      console.error('Error restoring draft:', e);
    }
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasRestoredDraft(false);
    } catch (e) {
      console.error('Error discarding draft:', e);
    }
  };

  // Auto-save form progress to localStorage
  useEffect(() => {
    if (!isMounted) return;
    try {
      if (formData.firstName || formData.lastName || formData.phone || formData.email) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, currentStep }));
      }
    } catch (e) {
      console.warn('LocalStorage draft save error:', e);
    }
  }, [formData, currentStep, isMounted]);

  // Debounced duplicate patient checking on phone / email change
  useEffect(() => {
    const phoneDigits = cleanPhoneDigits(formData.phone);
    const emailVal = formData.email?.trim();

    if (phoneDigits.length < 10 && (!emailVal || !emailVal.includes('@'))) {
      setDuplicateAlert(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingDuplicate(true);
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const params = new URLSearchParams();
        if (phoneDigits.length >= 10) params.append('phone', phoneDigits);
        if (emailVal && emailVal.includes('@')) params.append('email', emailVal);

        const token = getAccessToken();

        const res = await fetch(`${apiBase}/api/patients/check-duplicate?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const result = await res.json();
          if (result.data?.isDuplicate) {
            setDuplicateAlert(result.data);
          } else {
            setDuplicateAlert(null);
          }
        }
      } catch (err) {
        console.warn('Duplicate check failed:', err);
      } finally {
        setCheckingDuplicate(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.phone, formData.email]);

  const updateField = (field: keyof PatientFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = (): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length > 100) {
      errors.firstName = 'First name cannot exceed 100 characters';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 100) {
      errors.lastName = 'Last name cannot exceed 100 characters';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      } else if (dob.getFullYear() < 1900) {
        errors.dateOfBirth = 'Date of birth must be valid (year 1900 or later)';
      }
    }
    if (!formData.gender) errors.gender = 'Gender is required';
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const validateStep2 = (): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (formData.phone) {
      const cleanP = cleanPhoneDigits(formData.phone);
      if (cleanP.length < 10) {
        errors.phone = 'Phone number must contain at least 10 digits';
      }
    }
    if (formData.postalCode) {
      const cleanPIN = formData.postalCode.replace(/\D/g, '');
      if (cleanPIN.length > 0 && cleanPIN.length !== 6) {
        errors.postalCode = 'PIN code must be exactly 6 digits';
      }
    }
    if (formData.address && formData.address.length > 500) {
      errors.address = 'Address cannot exceed 500 characters';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const validateStep3 = (): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (formData.emergencyContactPhone) {
      const cleanEC = cleanPhoneDigits(formData.emergencyContactPhone);
      if (cleanEC.length < 10) {
        errors.emergencyContactPhone = 'Emergency contact phone must contain at least 10 digits';
      }
    }
    if (formData.emergencyContactAddress && formData.emergencyContactAddress.length > 500) {
      errors.emergencyContactAddress = 'Emergency contact address cannot exceed 500 characters';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const validateCurrentStep = (): boolean => {
    let result = { isValid: true, errors: {} as Record<string, string> };

    switch (currentStep) {
      case 1:
        result = validateStep1();
        break;
      case 2:
        result = validateStep2();
        break;
      case 3:
        result = validateStep3();
        break;
    }

    setValidationErrors(result.errors);
    return result.isValid;
  };

  const handleStepClick = (targetStep: number) => {
    // If navigating forward, sequentially validate all prior steps
    if (targetStep > currentStep) {
      for (let s = 1; s < targetStep; s++) {
        if (s === 1) {
          const step1Result = validateStep1();
          if (!step1Result.isValid) {
            setValidationErrors(step1Result.errors);
            setCurrentStep(1);
            return;
          }
        }
        if (s === 2) {
          const step2Result = validateStep2();
          if (!step2Result.isValid) {
            setValidationErrors(step2Result.errors);
            setCurrentStep(2);
            return;
          }
        }
        if (s === 3) {
          const step3Result = validateStep3();
          if (!step3Result.isValid) {
            setValidationErrors(step3Result.errors);
            setCurrentStep(3);
            return;
          }
        }
      }
    }
    setValidationErrors({});
    setCurrentStep(targetStep);
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
    
    // Always validate Step 1 before allowing submit
    const step1Result = validateStep1();
    if (!step1Result.isValid) {
      setValidationErrors(step1Result.errors);
      setCurrentStep(1);
      return;
    }

    const step2Result = validateStep2();
    if (!step2Result.isValid) {
      setValidationErrors(step2Result.errors);
      setCurrentStep(2);
      return;
    }

    const step3Result = validateStep3();
    if (!step3Result.isValid) {
      setValidationErrors(step3Result.errors);
      setCurrentStep(3);
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        console.log('Form submitted:', formData);
        alert('Patient registered successfully!');
        router.push('/patients');
      }
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Basic Information</h2>
              <p className="section-description">Enter the patient's basic demographic information</p>
            </div>
            
            <div className="form-grid">
              <div className="form-field">
                <label className="field-label">
                  First Name <span className="field-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="Enter first name"
                  maxLength={100}
                  className={`field-input ${validationErrors.firstName ? 'field-error' : ''}`}
                />
                {validationErrors.firstName && (
                  <div className="field-error-message">
                    <AlertCircle size={12} />
                    {validationErrors.firstName}
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => updateField('middleName', e.target.value)}
                  placeholder="Enter middle name"
                  maxLength={100}
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  Last Name <span className="field-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Enter last name"
                  maxLength={100}
                  className={`field-input ${validationErrors.lastName ? 'field-error' : ''}`}
                />
                {validationErrors.lastName && (
                  <div className="field-error-message">
                    <AlertCircle size={12} />
                    {validationErrors.lastName}
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  Date of Birth <span className="field-required">*</span>
                </label>
                <input
                  type="date"
                  max={new Date().toLocaleDateString('en-CA')}
                  min="1900-01-01"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className={`field-input ${validationErrors.dateOfBirth ? 'field-error' : ''}`}
                />
                {validationErrors.dateOfBirth && (
                  <div className="field-error-message">
                    <AlertCircle size={12} />
                    {validationErrors.dateOfBirth}
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  Gender <span className="field-required">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className={`field-select ${validationErrors.gender ? 'field-error' : ''}`}
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {validationErrors.gender && (
                  <div className="field-error-message">
                    <AlertCircle size={12} />
                    {validationErrors.gender}
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => updateField('bloodGroup', e.target.value)}
                  className="field-select"
                >
                  <option value="">Select blood group</option>
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

              <div className="form-field">
                <label className="field-label">
                  Marital Status
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value)}
                  className="field-select"
                >
                  <option value="">Select marital status</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => updateField('nationality', e.target.value)}
                  placeholder="Enter nationality"
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  Patient Type
                </label>
                <select
                  value={formData.patientType}
                  onChange={(e) => updateField('patientType', e.target.value)}
                  className="field-select"
                >
                  <option value="">Select patient type</option>
                  <option value="GENERAL">General</option>
                  <option value="VIP">VIP</option>
                  <option value="STAFF">Staff</option>
                  <option value="SENIOR_CITIZEN">Senior Citizen</option>
                  <option value="CHILD">Child</option>
                  <option value="INPATIENT">Inpatient</option>
                  <option value="OUTPATIENT">Outpatient</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>

              <div className="form-field full-width">
                <label className="field-label">
                  Additional Information
                  <span className="field-optional">Optional</span>
                </label>
                <textarea
                  value={formData.additionalInformation}
                  onChange={(e) => updateField('additionalInformation', e.target.value)}
                  placeholder="Enter any additional information about the patient"
                  className="field-textarea"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Contact & Address</h2>
              <p className="section-description">Enter the patient's contact information and address</p>
            </div>
            
            <div className="form-grid-two-columns">
              <div className="form-field">
                <label className="field-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="10-digit number, e.g. 9876543210"
                  maxLength={15}
                  className={`field-input ${validationErrors.phone ? 'field-error' : ''}`}
                />
                {validationErrors.phone && (
                  <div className="field-error-message">
                    <AlertCircle size={12} />
                    {validationErrors.phone}
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="patient@example.com"
                  maxLength={255}
                  className={`field-input ${validationErrors.email ? 'field-error' : ''}`}
                />
                {validationErrors.email && (
                  <div className="field-error-message">
                    <AlertCircle size={12} />
                    {validationErrors.email}
                  </div>
                )}
              </div>

              <div className="form-field full-width">
                <label className="field-label">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Enter full address"
                  maxLength={500}
                  className="field-textarea"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Enter city"
                  maxLength={100}
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="Enter state"
                  maxLength={100}
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, '');
                    updateField('postalCode', onlyDigits);
                  }}
                  placeholder="6-digit PIN code, e.g. 380001"
                  maxLength={6}
                  className={`field-input ${validationErrors.postalCode ? 'field-error' : ''}`}
                />
                {validationErrors.postalCode ? (
                  <div className="field-error-message">
                    <AlertCircle size={12} />
                    {validationErrors.postalCode}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Must be exactly 6 digits</div>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="Enter country"
                  maxLength={100}
                  className="field-input"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Emergency Contact</h2>
              <p className="section-description">Enter emergency contact information</p>
            </div>
            
            <div className="form-grid-two-columns">
              <div className="form-field">
                <label className="field-label">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => updateField('emergencyContactName', e.target.value)}
                  placeholder="Enter emergency contact name"
                  maxLength={100}
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                  placeholder="10-digit number, e.g. 9876543210"
                  maxLength={15}
                  className={`field-input ${validationErrors.emergencyContactPhone ? 'field-error' : ''}`}
                />
                {validationErrors.emergencyContactPhone && (
                  <div className="field-error-message">
                    <AlertCircle size={12} />
                    {validationErrors.emergencyContactPhone}
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  Relationship
                </label>
                <select
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => updateField('emergencyContactRelationship', e.target.value)}
                  className="field-select"
                >
                  <option value="">Select relationship</option>
                  <option value="SPOUSE">Spouse</option>
                  <option value="FATHER">Father</option>
                  <option value="MOTHER">Mother</option>
                  <option value="SON">Son</option>
                  <option value="DAUGHTER">Daughter</option>
                  <option value="BROTHER">Brother</option>
                  <option value="SISTER">Sister</option>
                  <option value="FRIEND">Friend</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">
                  Emergency Contact Address
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactAddress}
                  onChange={(e) => updateField('emergencyContactAddress', e.target.value)}
                  placeholder="Enter emergency contact address"
                  maxLength={500}
                  className="field-input"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Medical & Insurance</h2>
              <p className="section-description">Enter medical history and insurance information</p>
            </div>
            
            <div className="form-grid-two-columns">
              <div className="form-field full-width">
                <label className="field-label">
                  Allergies
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => updateField('allergies', e.target.value)}
                  placeholder="List any known allergies, separated by commas (e.g., Peanut allergy, Penicillin)"
                  className="field-textarea"
                />
              </div>

              <div className="form-field full-width">
                <label className="field-label">
                  Medical Conditions
                </label>
                <textarea
                  value={formData.medicalConditions}
                  onChange={(e) => updateField('medicalConditions', e.target.value)}
                  placeholder="List any existing medical conditions (e.g., Diabetes, Hypertension)"
                  className="field-textarea"
                />
              </div>

              <div className="form-field full-width">
                <label className="field-label">
                  Current Medications
                </label>
                <textarea
                  value={formData.currentMedications}
                  onChange={(e) => updateField('currentMedications', e.target.value)}
                  placeholder="List current medications, separated by commas (e.g., Metformin 500mg, Paracetamol)"
                  className="field-textarea"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={(e) => updateField('insuranceProvider', e.target.value)}
                  placeholder="Enter insurance provider"
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  Insurance Number
                </label>
                <input
                  type="text"
                  value={formData.insuranceNumber}
                  onChange={(e) => updateField('insuranceNumber', e.target.value)}
                  placeholder="Enter insurance number"
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  Insurance Group Number
                </label>
                <input
                  type="text"
                  value={formData.insuranceGroupNumber}
                  onChange={(e) => updateField('insuranceGroupNumber', e.target.value)}
                  placeholder="Enter group number"
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  Insurance Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.insuranceExpiryDate}
                  onChange={(e) => updateField('insuranceExpiryDate', e.target.value)}
                  className="field-input"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Preferences</h2>
              <p className="section-description">Set patient communication and privacy preferences</p>
            </div>
            
            <div className="form-grid-two-columns">
              <div className="form-field">
                <label className="field-label">
                  Preferred Language
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => updateField('preferredLanguage', e.target.value)}
                  className="field-select"
                >
                  <option value="">Select language</option>
                  <option value="ENGLISH">English</option>
                  <option value="HINDI">Hindi</option>
                  <option value="BENGALI">Bengali</option>
                  <option value="TAMIL">Tamil</option>
                  <option value="TELUGU">Telugu</option>
                  <option value="MARATHI">Marathi</option>
                  <option value="GUJARATI">Gujarati</option>
                  <option value="KANNADA">Kannada</option>
                  <option value="MALAYALAM">Malayalam</option>
                  <option value="PUNJABI">Punjabi</option>
                  <option value="SPANISH">Spanish</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">
                  Preferred Communication Method
                </label>
                <select
                  value={formData.preferredCommunicationMethod}
                  onChange={(e) => updateField('preferredCommunicationMethod', e.target.value)}
                  className="field-select"
                >
                  <option value="">Select method</option>
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Phone</option>
                  <option value="SMS">SMS</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>

              <div className="form-field full-width">
                <label className="field-label">
                  Notification Preferences
                </label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {['Email', 'SMS', 'WhatsApp', 'Phone Call'].map((pref) => (
                    <label key={pref} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notificationPreferences.includes(pref)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateField('notificationPreferences', [...formData.notificationPreferences, pref]);
                          } else {
                            updateField('notificationPreferences', formData.notificationPreferences.filter(p => p !== pref));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{pref}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field full-width">
                <div style={{ border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px 16px', backgroundColor: '#fffbeb' }}>
                  <p style={{ fontSize: '12px', color: '#92400e', fontWeight: 600, marginBottom: '8px' }}>
                    ⚠️ Informed Consent — Legal Record
                  </p>
                  <label className="flex items-start cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      checked={formData.privacyConsent}
                      onChange={(e) => updateField('privacyConsent', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <span className="text-sm" style={{ color: '#374151' }}>
                      The patient has been informed of and explicitly consents to the collection, processing and storage of their personal and health data in accordance with the privacy policy and applicable data protection regulations (HIPAA / DPDP Act). <span style={{ color: '#dc2626', fontWeight: 600 }}>*</span>
                    </span>
                  </label>
                  {!formData.privacyConsent && (
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>This checkbox must be checked to register the patient.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <style>{formStyles}</style>
      <div className="patient-registration-page">
        <div className="registration-container">
          <div className="form-header">
            <h1 className="form-title">Patient Registration</h1>
            <p className="form-subtitle">Add a new patient to the system</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-layout">
              {/* Sidebar Navigation */}
              <div className="sidebar">
                <div className="sidebar-title">Registration Steps</div>
                <div className="sidebar-nav">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        className={`sidebar-item ${currentStep === step.id ? 'active' : ''}`}
                        onClick={() => handleStepClick(step.id)}
                      >
                        <span className="step-number">{step.id}</span>
                        <Icon />
                        {step.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Content */}
              <div className="form-content">
                {hasRestoredDraft && (
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', itemsCenter: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#1e40af' }}>
                        You have un-submitted patient registration form progress saved from a previous session.
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={restoreDraft}
                        style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Resume Draft
                      </button>
                      <button
                        type="button"
                        onClick={discardDraft}
                        style={{ backgroundColor: 'white', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}

                {duplicateAlert?.isDuplicate && (
                  <div style={{ backgroundColor: '#fffbe3', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#92400e' }}>Existing Patient Found: </strong>
                        <span style={{ fontSize: '13px', color: '#78350f' }}>
                          {duplicateAlert.existingPatient?.firstName} {duplicateAlert.existingPatient?.lastName} (UHID: {duplicateAlert.existingPatient?.uhid}, Phone: {duplicateAlert.existingPatient?.phone || 'N/A'})
                        </span>
                      </div>
                    </div>
                    {duplicateAlert.existingPatient?.id && (
                      <button
                        type="button"
                        onClick={() => router.push(`/patients/${duplicateAlert.existingPatient.id}`)}
                        style={{ backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        View Existing Profile
                      </button>
                    )}
                  </div>
                )}

                {getStepContent()}

                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      if (onCancel) {
                        onCancel();
                      } else {
                        router.push('/patients');
                      }
                    }}
                    disabled={loading}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>

                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={loading}
                      className="btn btn-secondary"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                  )}
                  
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      Save & Continue
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !formData.privacyConsent}
                      className="btn btn-primary"
                    >
                      {loading ? 'Submitting...' : 'Complete Registration'}
                      <CheckCircle size={16} />
                    </button>
                  )}
                </div>

                {/* Feature Highlights */}
                <div className="feature-highlights">
                  <div className="feature-card">
                    <div className="feature-icon">
                      <Clock />
                    </div>
                    <h3 className="feature-title">Quick Registration</h3>
                    <p className="feature-description">Register patients in minutes with our streamlined process</p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">
                      <Shield />
                    </div>
                    <h3 className="feature-title">Secure & Safe</h3>
                    <p className="feature-description">Your data is protected with enterprise-grade security</p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">
                      <CheckCircle />
                    </div>
                    <h3 className="feature-title">HIPAA Compliant</h3>
                    <p className="feature-description">Fully compliant with healthcare data regulations</p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">
                      <Phone />
                    </div>
                    <h3 className="feature-title">24/7 Support</h3>
                    <p className="feature-description">Round-the-clock assistance for all your needs</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}