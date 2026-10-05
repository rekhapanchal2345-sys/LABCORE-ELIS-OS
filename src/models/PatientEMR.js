const mongoose = require('mongoose');

/**
 * Patient Longitudinal EMR & Diagnostic Trends Schema
 * Tracks cumulative lab values over time (e.g. HbA1c, Serum Creatinine, Liver Enzymes, Lipid Profile)
 * allowing doctors to view longitudinal health trends and disease progression graphs.
 */
const patientEMRSchema = new mongoose.Schema({
  uhid: {
    type: String,
    required: true,
    unique: true,
    index: true // e.g. "LC-UHID-98214"
  },
  patientName: {
    type: String,
    required: true
  },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String },
  contact: {
    phone: { type: String, required: true },
    email: { type: String },
    emergencyContact: { type: String }
  },
  chronicConditions: [{
    condition: { type: String }, // e.g. "Type-2 Diabetes Mellitus", "Hypertension", "Chronic Kidney Disease Stage 3"
    diagnosedSince: { type: String },
    status: { type: String, enum: ['Active', 'Controlled', 'Under Investigation', 'Resolved'], default: 'Active' }
  }],
  allergies: [{ type: String }],
  // Longitudinal lab test value series for plotting trend lines
  labHistoryTrends: [{
    paramCode: { type: String, required: true }, // e.g. "HBA1C", "SERUM_CREATININE", "HEMOGLOBIN", "CHOLESTEROL_TOTAL", "SGPT"
    paramName: { type: String, required: true },
    unit: { type: String },
    normalRange: { type: String },
    records: [{
      testDate: { type: Date, required: true },
      value: { type: Number, required: true },
      observedValueText: { type: String },
      flag: { type: String, enum: ['NORMAL', 'LOW', 'HIGH', 'CRITICAL'] },
      reportId: { type: String },
      doctorRemarks: { type: String }
    }]
  }],
  visitTimeline: [{
    visitDate: { type: Date, default: Date.now },
    visitType: { type: String, enum: ['OPD Consultation', 'Lab Investigation', 'Follow-Up', 'Emergency'] },
    attendingDoctor: { type: String },
    diagnosis: { type: String },
    prescriptionId: { type: String },
    reportIds: [{ type: String }]
  }]
}, {
  timestamps: true
});

module.exports = patientEMRSchema;
