const mongoose = require('mongoose');

/**
 * Prescription & CPOE (Computerized Physician Order Entry) Schema
 * Enables Doctors to prescribe medications, order lab tests/radiology panels with ICD-10 codes,
 * record clinical notes, vitals, and generate barcode-enabled digital Rx slips.
 */
const prescriptionSchema = new mongoose.Schema({
  prescriptionNumber: {
    type: String,
    required: true,
    unique: true,
    index: true // e.g. "RX-2026-0894"
  },
  barcode: {
    type: String,
    required: true
  },
  doctor: {
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    specialization: { type: String },
    councilRegNo: { type: String },
    department: { type: String }
  },
  patient: {
    patientId: { type: String, required: true, index: true },
    uhid: { type: String, required: true }, // Unique Hospital/Lab ID
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    contact: { type: String },
    bloodGroup: { type: String }
  },
  visitType: {
    type: String,
    enum: ['OPD Consultation', 'IPD Ward Order', 'Emergency / Triage', 'Tele-Consultation', 'Lab Referral Only'],
    default: 'OPD Consultation'
  },
  vitals: {
    bloodPressure: { type: String }, // e.g., "120/80 mmHg"
    pulseRate: { type: Number },      // bpm
    temperature: { type: Number },    // in °F
    spo2: { type: Number },           // %
    weightKg: { type: Number },
    heightCm: { type: Number },
    bmi: { type: Number },
    bloodGlucoseRandom: { type: Number } // mg/dL
  },
  clinicalSummary: {
    chiefComplaints: [{
      symptom: { type: String, required: true },
      duration: { type: String }, // e.g., "3 days", "2 weeks"
      severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'] }
    }],
    clinicalHistory: { type: String }, // Past medical/surgical history
    allergies: [{ type: String }],
    provisionalDiagnosis: { type: String },
    icd10Codes: [{
      code: { type: String }, // e.g. "E11.9"
      description: { type: String } // e.g. "Type 2 diabetes mellitus without complications"
    }]
  },
  // Lab Tests & Diagnostic Panels Ordered by Doctor (Direct ELIS Integration)
  labOrders: [{
    testCode: { type: String, required: true }, // e.g., "CBC", "LFT", "LIPID", "HBA1C", "TROP_I"
    testName: { type: String, required: true },
    department: { type: String, default: 'Pathology & Laboratory Medicine' },
    urgency: { type: String, enum: ['Routine', 'Urgent / Priority', 'STAT / Emergency'], default: 'Routine' },
    specialInstructions: { type: String }, // e.g., "Fasting 12 Hours required", "Serum Sample"
    status: {
      type: String,
      enum: ['Prescribed', 'Sample Collected', 'Processing in Lab', 'Results Ready', 'Verified by Pathologist', 'Cancelled'],
      default: 'Prescribed'
    },
    sampleAccessionNumber: { type: String }, // Barcode on sample tube
    orderDate: { type: Date, default: Date.now }
  }],
  // Medications & Dosage regimen
  medications: [{
    drugName: { type: String, required: true },
    dosage: { type: String, required: true }, // e.g., "500 mg", "10 ml"
    frequency: { type: String, required: true }, // e.g., "1-0-1 (Twice daily after food)"
    duration: { type: String, required: true }, // e.g., "5 days", "1 month"
    route: { type: String, enum: ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhalation'], default: 'Oral' },
    instructions: { type: String } // e.g., "Take before breakfast"
  }],
  adviceAndLifestyle: { type: String },
  followUpDate: { type: Date },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  digitalSignVerified: {
    isSigned: { type: Boolean, default: true },
    signedAt: { type: Date, default: Date.now },
    signatureToken: { type: String }
  }
}, {
  timestamps: true
});

module.exports = prescriptionSchema;
