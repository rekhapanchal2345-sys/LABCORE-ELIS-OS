import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import './PatientRegistrationForm.css';

interface PatientFormData {
  // Step 1: Basic Information
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  patientType?: 'GENERAL' | 'VIP' | 'STAFF' | 'SENIOR_CITIZEN' | 'CHILD';

  // Step 2: Contact Information
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Step 3: Medical Information
  bloodGroup?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  chronicDiseases?: string[];
  fastingStatus?: 'YES' | 'NO' | 'NOT_APPLICABLE';

  // Step 4: Documents & Verification
  aadhaarNumber?: string;
  panNumber?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  photoUrl?: string;

  // Additional
  consentForTreatment: boolean;
  consentForDataSharing: boolean;
  consentForMarketing: boolean;
}

const PatientRegistrationForm: React.FC = () => {
  const { control, watch, handleSubmit, formState: { errors }, reset } = useForm<PatientFormData>({
    mode: 'onChange',
    defaultValues: {
      patientType: 'GENERAL',
      fastingStatus: 'NOT_APPLICABLE',
      consentForTreatment: false,
      consentForDataSharing: false,
      consentForMarketing: false,
    } as Partial<PatientFormData>,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  const formData = watch();

  // Calculate form progress
  useEffect(() => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.keys(formData).filter(key => formData[key as keyof PatientFormData]).length;
    const progress = Math.round((filledFields / totalFields) * 100);
    setFormProgress(progress);
  }, [formData]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(formData).some(key => formData[key as keyof PatientFormData])) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // Check for duplicates
  const checkDuplicate = useCallback(async (phone?: string, email?: string) => {
    if (!phone && !email) return;

    try {
      const response = await axios.get('/api/patients/check-duplicate', {
        params: { phone, email },
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });

      if (response.data.data.isDuplicate) {
        setDuplicateWarning(response.data.data.existingPatient);
      } else {
        setDuplicateWarning(null);
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
    }
  }, []);

  // Debounced duplicate check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.phone || formData.email) {
        checkDuplicate(formData.phone, formData.email);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.phone, formData.email, checkDuplicate]);

  // Save draft
  const saveDraft = async () => {
    try {
      setAutoSaveStatus('Saving...');
      const response = await axios.post(
        '/api/patients/drafts',
        {
          ...formData,
          draftId,
          formStep: currentStep,
          formProgress,
          lastEditedSection: `step-${currentStep}`,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }
      );

      if (response.data.data.isNew) {
        setDraftId(response.data.data.draft.id);
      }

      setAutoSaveStatus('Saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
      setIsDraft(true);
    } catch (error) {
      setAutoSaveStatus('Save failed');
      console.error('Error saving draft:', error);
    }
  };

  // Submit form
  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // If there's a draft, finalize it
      if (draftId) {
        const response = await axios.post(
          `/api/patients/drafts/${draftId}/finalize`,
          data,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
          }
        );
        setSuccessMessage(`Patient registered successfully! UHID: ${response.data.data.patient.uhid}`);
      } else {
        // Create new patient
        const response = await axios.post('/api/patients', data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setSuccessMessage(`Patient registered successfully! UHID: ${response.data.data.uhid}`);
      }

      // Reset form
      reset();
      setCurrentStep(1);
      setDraftId(null);
      setIsDraft(false);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Error registering patient');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
      return `BMI: ${bmi}`;
    }
    return '';
  };

  return (
    <div className="patient-registration-form">
      <div className="form-header">
        <h1>Patient Registration</h1>
        <p>Complete your medical profile</p>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${formProgress}%` }}></div>
          </div>
          <p className="progress-text">{formProgress}% Complete</p>
          {autoSaveStatus && <span className="auto-save-status">{autoSaveStatus}</span>}
        </div>
      </div>

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="warning-box">
          <h4>⚠️ Patient Already Exists</h4>
          <p>
            Patient with this phone/email already registered:
            <strong> UHID: {duplicateWarning.uhid}</strong>
          </p>
          <p>{duplicateWarning.firstName} {duplicateWarning.lastName}</p>
          <button className="btn-secondary">View Existing Patient</button>
        </div>
      )}

      {/* Messages */}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>📋 Basic Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter first name"
                      className={errors.firstName ? 'error' : ''}
                    />
                  )}
                />
                {errors.firstName && <span className="error-text">{errors.firstName.message}</span>}
              </div>

              <div className="form-group">
                <label>Middle Name</label>
                <Controller
                  name="middleName"
                  control={control}
                  render={({ field }) => (
                    <input {...field} type="text" placeholder="Enter middle name" />
                  )}
                />
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter last name"
                      className={errors.lastName ? 'error' : ''}
                    />
                  )}
                />
                {errors.lastName && <span className="error-text">{errors.lastName.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => <input {...field} type="date" />}
                />
              </div>

              <div className="form-group">
                <label>Gender *</label>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: 'Gender is required' }}
                  render={({ field }) => (
                    <select {...field} className={errors.gender ? 'error' : ''}>
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  )}
                />
                {errors.gender && <span className="error-text">{errors.gender.message}</span>}
              </div>

              <div className="form-group">
                <label>Patient Type</label>
                <Controller
                  name="patientType"
                  control={control}
                  render={({ field }) => (
                    <select {...field}>
                      <option value="GENERAL">General</option>
                      <option value="VIP">VIP</option>
                      <option value="STAFF">Staff</option>
                      <option value="SENIOR_CITIZEN">Senior Citizen</option>
                      <option value="CHILD">Child</option>
                    </select>
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>📱 Contact Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: 'Phone number is required',
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone number' },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      placeholder="10-digit phone number"
                      className={errors.phone ? 'error' : ''}
                    />
                  )}
                />
                {errors.phone && <span className="error-text">{errors.phone.message}</span>}
              </div>

              <div className="form-group">
                <label>Alternate Phone</label>
                <Controller
                  name="alternatePhone"
                  control={control}
                  render={({ field }) => (
                    <input {...field} type="tel" placeholder="Alternate phone number" />
                  )}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      placeholder="your.email@example.com"
                      className={errors.email ? 'error' : ''}
                    />
                  )}
                />
                {errors.email && <span className="error-text">{errors.email.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <input {...field} type="text" placeholder="Street address" />
                  )}
                />
              </div>

              <div className="form-group">
                <label>Landmark</label>
                <Controller
                  name="landmark"
                  control={control}
                  render={({ field }) => (
                    <input {...field} type="text" placeholder="Nearby landmark" />
                  )}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => <input {...field} type="text" placeholder="City" />}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => <input {...field} type="text" placeholder="State" />}
                />
              </div>

              <div className="form-group">
                <label>PIN Code</label>
                <Controller
                  name="postalCode"
                  control={control}
                  rules={{
                    pattern: { value: /^\d{6}$/, message: 'Invalid PIN code (6 digits)' },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="6-digit PIN"
                      className={errors.postalCode ? 'error' : ''}
                    />
                  )}
                />
                {errors.postalCode && <span className="error-text">{errors.postalCode.message}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Medical Information */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2>🏥 Medical Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Blood Group</label>
                <Controller
                  name="bloodGroup"
                  control={control}
                  render={({ field }) => (
                    <select {...field}>
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="form-group">
                <label>Height (cm)</label>
                <Controller
                  name="height"
                  control={control}
                  render={({ field }) => (
                    <input {...field} type="number" placeholder="Height in cm" onChange={(e) => {
                      field.onChange(e.target.value ? Number(e.target.value) : undefined);
                    }} />
                  )}
                />
              </div>

              <div className="form-group">
                <label>Weight (kg)</label>
                <Controller
                  name="weight"
                  control={control}
                  render={({ field }) => (
                    <input {...field} type="number" placeholder="Weight in kg" onChange={(e) => {
                      field.onChange(e.target.value ? Number(e.target.value) : undefined);
                    }} />
                  )}
                />
              </div>

              <div className="form-group">
                <label>BMI</label>
                <input type="text" value={calculateBMI()} disabled className="bmi-display" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fasting Status</label>
                <Controller
                  name="fastingStatus"
                  control={control}
                  render={({ field }) => (
                    <select {...field}>
                      <option value="NOT_APPLICABLE">Not Applicable</option>
                      <option value="YES">Yes</option>
                      <option value="NO">No</option>
                    </select>
                  )}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Allergies (comma separated)</label>
              <Controller
                name="allergies"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="e.g., Penicillin, Peanuts, Shellfish"
                    value={(field.value || []).join(', ')}
                    onChange={(e) => field.onChange(e.target.value.split(',').map(a => a.trim()))}
                  />
                )}
              />
            </div>

            <div className="form-group full-width">
              <label>Chronic Diseases (comma separated)</label>
              <Controller
                name="chronicDiseases"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="e.g., Hypertension, Diabetes, Asthma"
                    value={(field.value || []).join(', ')}
                    onChange={(e) => field.onChange(e.target.value.split(',').map(d => d.trim()))}
                  />
                )}
              />
            </div>
          </div>
        )}

        {/* Step 4: Documents & Verification */}
        {currentStep === 4 && (
          <div className="form-step">
            <h2>📄 Documents & Verification</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Aadhaar Number</label>
                <Controller
                  name="aadhaarNumber"
                  control={control}
                  rules={{
                    pattern: { value: /^[2-9]{1}[0-9]{11}$/, message: 'Invalid Aadhaar number (12 digits)' },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="12-digit Aadhaar number"
                      className={errors.aadhaarNumber ? 'error' : ''}
                    />
                  )}
                />
                {errors.aadhaarNumber && <span className="error-text">{errors.aadhaarNumber.message}</span>}
              </div>

              <div className="form-group">
                <label>PAN Number</label>
                <Controller
                  name="panNumber"
                  control={control}
                  rules={{
                    pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format' },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="PAN (e.g., ABCDE1234F)"
                      className={errors.panNumber ? 'error' : ''}
                    />
                  )}
                />
                {errors.panNumber && <span className="error-text">{errors.panNumber.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Insurance Provider</label>
                <Controller
                  name="insuranceProvider"
                  control={control}
                  render={({ field }) => (
                    <input {...field} type="text" placeholder="Insurance company name" />
                  )}
                />
              </div>

              <div className="form-group">
                <label>Insurance Number</label>
                <Controller
                  name="insuranceNumber"
                  control={control}
                  render={({ field }) => (
                    <input {...field} type="text" placeholder="Insurance policy number" />
                  )}
                />
              </div>
            </div>

            {/* Consents */}
            <div className="form-group full-width">
              <label className="checkbox-label">
                <Controller
                  name="consentForTreatment"
                  control={control}
                  render={({ field: { value, ...field } }) => (
                    <input {...field} type="checkbox" checked={value} />
                  )}
                />
                <span>I consent to medical treatment</span>
              </label>
            </div>

            <div className="form-group full-width">
              <label className="checkbox-label">
                <Controller
                  name="consentForDataSharing"
                  control={control}
                  render={({ field: { value, ...field } }) => (
                    <input {...field} type="checkbox" checked={value} />
                  )}
                />
                <span>I consent to share my medical data with healthcare providers</span>
              </label>
            </div>

            <div className="form-group full-width">
              <label className="checkbox-label">
                <Controller
                  name="consentForMarketing"
                  control={control}
                  render={({ field: { value, ...field } }) => (
                    <input {...field} type="checkbox" checked={value} />
                  )}
                />
                <span>I consent to receive marketing communications</span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-secondary"
          >
            ← Previous
          </button>

          {isDraft && (
            <button
              type="button"
              onClick={saveDraft}
              className="btn-tertiary"
            >
              💾 Save as Draft
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="btn-primary"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="btn-success"
            >
              {isLoading ? 'Registering...' : '✓ Complete Registration'}
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`step ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(step)}
            >
              {step < currentStep ? '✓' : step}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default PatientRegistrationForm;
