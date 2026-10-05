const mongoose = require('mongoose');

/**
 * Doctor Schema - Lab & Hospital Management System
 * Supports In-house Pathologists, Radiologists, Consultants, and External Referring Doctors
 */
const doctorSchema = new mongoose.Schema({
  doctorCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    enum: ['Dr.', 'Prof. Dr.', 'Assoc. Prof. Dr.'],
    default: 'Dr.'
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true // e.g., 'Pathologist (MD Path)', 'Radiologist (MD Radio)', 'General Physician (MD Med)', 'Cardiologist'
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Pathology & Laboratory Medicine',
      'Radiology & Imaging',
      'General Medicine',
      'Cardiology',
      'Pediatrics',
      'Orthopedics',
      'Gynecology & Obstetrics',
      'Oncology',
      'Neurology',
      'Dermatology',
      'ENT & Ophthalmology',
      'Nephrology',
      'Other'
    ]
  },
  qualification: {
    type: String,
    required: true // e.g., 'MBBS, MD (Pathology), FICP'
  },
  medicalCouncilRegNo: {
    type: String,
    required: true,
    unique: true,
    trim: true // State / National Medical Council Registration Number
  },
  doctorType: {
    type: String,
    enum: ['In-House Consultant', 'Pathologist Signatory', 'Radiologist Signatory', 'External Referring Doctor', 'Visiting Specialist'],
    required: true,
    default: 'In-House Consultant'
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    clinicAddress: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true }
  },
  // Digital Sign-off credentials for Lab & Radiology Reports
  digitalSignature: {
    signatureImageUrl: { type: String, default: '' }, // Base64 or Cloud URL
    sealImageUrl: { type: String, default: '' },
    isAuthorizedSignatory: { type: Boolean, default: false },
    signOffPinHash: { type: String }, // For 2FA/PIN based quick multi-report approval
    allowedLabSections: [{
      type: String,
      enum: ['Biochemistry', 'Hematology', 'Microbiology', 'Histopathology', 'Serology & Immunology', 'Molecular Biology', 'Radiology (X-Ray/USG/CT/MRI)', 'All']
    }]
  },
  // OPD Consultation Settings
  opdSettings: {
    consultationFee: { type: Number, default: 500 },
    followUpFee: { type: Number, default: 300 },
    followUpValidityDays: { type: Number, default: 7 },
    slotDurationMinutes: { type: Number, default: 15 },
    availability: [{
      dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      startTime: { type: String }, // "09:00"
      endTime: { type: String },   // "14:00"
      maxTokens: { type: Number, default: 30 },
      roomNo: { type: String, default: 'OPD-1' }
    }]
  },
  // Referral & Incentive Commission Structure
  referralCommission: {
    isEligible: { type: Boolean, default: true },
    defaultPercentage: { type: Number, default: 15 }, // default 15%
    departmentWiseRates: [{
      department: { type: String },
      percentage: { type: Number, default: 15 },
      fixedAmountPerTest: { type: Number, default: 0 }
    }],
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      panNumber: { type: String },
      tdsPercentage: { type: Number, default: 10 } // Standard TDS 10% on professional fees
    }
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Suspended', 'Inactive'],
    default: 'Active'
  },
  metrics: {
    totalPatientsReferred: { type: Number, default: 0 },
    totalReportsApproved: { type: Number, default: 0 },
    totalCommissionEarned: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 }
  }
}, {
  timestamps: true
});

module.exports = doctorSchema;
