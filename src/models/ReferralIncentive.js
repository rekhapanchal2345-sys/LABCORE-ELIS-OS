const mongoose = require('mongoose');

/**
 * Referral Incentive & Commission Accounting Schema
 * Handles hospital/lab partner commissions, department-wise incentive calculation,
 * TDS deduction, and monthly payout settlement ledgers.
 */
const referralIncentiveSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true // e.g. "REF-TXN-2026-00431"
  },
  doctor: {
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    clinicName: { type: String },
    phone: { type: String },
    panNumber: { type: String },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String }
    }
  },
  billDetails: {
    billId: { type: String, required: true },
    billNumber: { type: String, required: true },
    patientUhid: { type: String, required: true },
    patientName: { type: String, required: true },
    billDate: { type: Date, default: Date.now },
    totalBillAmount: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    netPayableAmount: { type: Number, required: true }
  },
  testBreakdown: [{
    testCode: { type: String, required: true },
    testName: { type: String, required: true },
    department: { type: String },
    testPrice: { type: Number, required: true },
    commissionPercentage: { type: Number, default: 15 },
    commissionAmount: { type: Number, required: true }
  }],
  totalGrossCommission: {
    type: Number,
    required: true
  },
  tdsPercentage: {
    type: Number,
    default: 10 // 10% standard TDS
  },
  tdsAmount: {
    type: Number,
    default: 0
  },
  netCommissionPayable: {
    type: Number,
    required: true
  },
  payoutStatus: {
    type: String,
    enum: ['Pending Approval', 'Approved for Payout', 'Paid & Settled', 'On Hold / Disputed'],
    default: 'Pending Approval',
    index: true
  },
  settlementDetails: {
    payoutBatchId: { type: String },
    paymentMode: { type: String, enum: ['NEFT / IMPS / RTGS', 'UPI Transfer', 'Cheque', 'Cash'], default: 'NEFT / IMPS / RTGS' },
    paymentReferenceNumber: { type: String }, // Bank UTR No.
    settledAt: { type: Date },
    settledByAdmin: { type: String },
    remarks: { type: String }
  }
}, {
  timestamps: true
});

module.exports = referralIncentiveSchema;
