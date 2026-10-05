const mongoose = require('mongoose');

/**
 * Report Verification & Authorization Schema
 * Core engine for Pathologist / Radiologist Sign-Off, Delta Checks, and Critical/Panic Value Alerts
 */
const reportVerificationSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true // e.g., "REP-2026-9042"
  },
  accessionNumber: {
    type: String,
    required: true,
    index: true // Barcode on Sample Tube
  },
  uhid: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientAge: {
    type: Number,
    required: true
  },
  patientGender: {
    type: String,
    required: true
  },
  referredByDoctor: {
    doctorId: { type: String },
    doctorName: { type: String, required: true }
  },
  department: {
    type: String,
    required: true // 'Biochemistry', 'Hematology', 'Microbiology', 'Radiology', etc.
  },
  testPanelName: {
    type: String,
    required: true // e.g. "Complete Blood Count (CBC)", "Liver Function Test (LFT)", "Cardiac Markers"
  },
  sampleCollectionTime: {
    type: Date,
    default: Date.now
  },
  analyzerProcessedTime: {
    type: Date,
    default: Date.now
  },
  // Individual Parameter Results with Delta Check and Panic Flagging
  parameters: [{
    paramCode: { type: String, required: true },
    paramName: { type: String, required: true }, // e.g., "Hemoglobin", "Serum Potassium", "Troponin I"
    observedValue: { type: String, required: true },
    numericValue: { type: Number }, // For automated calculations & range checks
    unit: { type: String }, // e.g., "g/dL", "mEq/L", "mg/dL"
    normalReferenceRange: {
      min: { type: Number },
      max: { type: Number },
      displayRange: { type: String } // e.g., "13.0 - 17.0"
    },
    panicReferenceRange: {
      criticalLow: { type: Number },
      criticalHigh: { type: Number }
    },
    flag: {
      type: String,
      enum: ['NORMAL', 'LOW', 'HIGH', 'CRITICAL_PANIC_LOW', 'CRITICAL_PANIC_HIGH', 'ABNORMAL'],
      default: 'NORMAL'
    },
    // Delta Check against previous visit of the same patient
    deltaCheck: {
      hasPreviousResult: { type: Boolean, default: false },
      previousValue: { type: Number },
      previousDate: { type: Date },
      percentageChange: { type: Number }, // e.g. +35%
      isDeltaAlert: { type: Boolean, default: false }, // Flagged if sudden unexplained surge/drop
      deltaComment: { type: String }
    },
    methodology: { type: String } // e.g., "Photometry", "Automated Flow Cytometry", "CLIA"
  }],
  // Overall Report Status
  status: {
    type: String,
    enum: [
      'Pending Pathologist Review',
      'Panic Value Flagged - Immediate Action Required',
      'Approved & Signed by Pathologist',
      'Sent for Re-testing / Sample Redraw',
      'Preliminary Released',
      'Archived'
    ],
    default: 'Pending Pathologist Review',
    index: true
  },
  // Panic Value Immediate Notification Dispatch Log
  panicAlertAudit: {
    isPanicReport: { type: Boolean, default: false },
    alertTriggeredAt: { type: Date },
    alertChannels: [{ type: String, enum: ['Dashboard Banner', 'SMS', 'WhatsApp', 'Phone Call Log'] }],
    notifiedDoctorName: { type: String },
    acknowledgedBy: { type: String },
    acknowledgedAt: { type: Date },
    actionTaken: { type: String }
  },
  // Pathologist Digital Sign-Off Block
  signOff: {
    signedByDoctorId: { type: String },
    signedByDoctorName: { type: String },
    designation: { type: String }, // "MD, Senior Consultant Pathologist"
    medicalRegNo: { type: String },
    signatureImageUrl: { type: String },
    sealImageUrl: { type: String },
    signedAt: { type: Date },
    doctorRemarks: { type: String }, // e.g. "Suggest peripheral blood smear examination to rule out microcytic hypochromic anemia."
    signOffToken: { type: String } // Cryptographic hash verifying report integrity
  },
  reRunDetails: {
    isReRunOrdered: { type: Boolean, default: false },
    reRunReason: { type: String },
    reRunOrderedBy: { type: String },
    reRunDate: { type: Date }
  }
}, {
  timestamps: true
});

module.exports = reportVerificationSchema;
