// Test file to verify PixelPerfectInvoice component with sample data
// This can be used to manually test the component

import React from 'react';
import PixelPerfectInvoice from './PixelPerfectInvoice';

const sampleInvoiceData = {
  id: "test-invoice-1",
  invoiceNumber: "INV-20250103-001",
  invoiceDate: new Date().toISOString(),
  invoiceTime: new Date().toISOString(),
  paymentMode: "CASH",
  transactionId: "TXN-123456789",
  patientName: "Priya Sharma",
  patientId: "UHID-2025-001",
  age: "34",
  gender: "Female",
  phone: "+91 98765 43210",
  address: "21, Shantinagar Society, Nr. Sunrise Park, Ahmedabad, Gujarat - 380016",
  collectedBy: "Rajesh Kumar",
  collectionDate: new Date().toISOString(),
  collectionTime: "10:30 AM",
  sampleType: "Blood",
  refDoctor: "Dr. Hemant Shah",
  labBranch: "Main Laboratory",
  verifyCode: "2025001",
  items: [
    {
      id: "1",
      testName: "Complete Blood Count (CBC)",
      method: "Automated",
      result: "6.2",
      unit: "10³/μL",
      referenceRange: "4.0 - 10.0",
      status: "NORMAL" as const,
      amount: 350.00,
    },
    {
      id: "2",
      testName: "Urine Routine Examination",
      method: "Strip Method",
      result: "Normal",
      unit: "-",
      referenceRange: "NORMAL",
      status: "NORMAL" as const,
      amount: 150.00,
    },
    {
      id: "3",
      testName: "Blood Glucose Fasting",
      method: "Hexokinase",
      result: "98",
      unit: "mg/dL",
      referenceRange: "70 - 100",
      status: "NORMAL" as const,
      amount: 130.00,
    }
  ],
  subtotal: 630.00,
  discount: 0,
  taxableAmount: 630.00,
  cgstPercent: 9,
  cgstAmount: 28.35,
  sgstPercent: 9,
  sgstAmount: 28.35,
  igstPercent: 0,
  igstAmount: 0,
  totalTax: 56.70,
  grandTotal: 686.70,
  amountPaid: 686.70,
  paymentDate: new Date().toISOString(),
  paymentStatus: "PAID" as const,
  bankName: "HDFC Bank",
  accountName: "LabCore Diagnostics Pvt. Ltd.",
  accountNumber: "50200012345678",
  ifscCode: "HDFC0001234",
  whatsappNumber: "+91 98765 43210",
  verifiedBy: "Dr. Anjali Sharma",
  verifierQualification: "MD Pathology",
  verifierRegNo: "MC-5678",
  labManager: "Rajesh Kumar",
  companyName: "LabCore Diagnostics Pvt. Ltd.",
};

const sampleLabInfo = {
  name: "LabCore Diagnostics Pvt. Ltd.",
  address: "123 Health Avenue, Medical District, Ahmedabad, Gujarat - 380016, India",
  phone: "+91 98765 43210",
  email: "info@labcore.in",
  website: "www.labcore.in",
  nablAccredited: "MC-5678",
  isoCertified: "ISO 15189:2022",
  hipaaCompliant: "Patient Data Protected",
};

export function TestPixelPerfectInvoice() {
  const [showInvoice, setShowInvoice] = React.useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pixel Perfect Invoice Test</h1>
      <button
        onClick={() => setShowInvoice(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Show Sample Invoice
      </button>

      {showInvoice && (
        <PixelPerfectInvoice
          invoice={sampleInvoiceData}
          labInfo={sampleLabInfo}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}

export default TestPixelPerfectInvoice;