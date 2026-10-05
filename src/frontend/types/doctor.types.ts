/**
 * Comprehensive TypeScript Interfaces for Doctor & Diagnostic Hospital Module
 */

export type DoctorType = 
  | 'In-House Consultant'
  | 'Pathologist Signatory'
  | 'Radiologist Signatory'
  | 'External Referring Doctor'
  | 'Visiting Specialist';

export type LabSection = 
  | 'Biochemistry'
  | 'Hematology'
  | 'Microbiology'
  | 'Histopathology'
  | 'Serology & Immunology'
  | 'Molecular Biology'
  | 'Radiology (X-Ray/USG/CT/MRI)'
  | 'All';

export type ResultFlag = 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_PANIC_LOW' | 'CRITICAL_PANIC_HIGH' | 'ABNORMAL';

export interface Doctor {
  id: string;
  doctorCode: string;
  title: 'Dr.' | 'Prof. Dr.' | 'Assoc. Prof. Dr.';
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  specialization: string;
  department: string;
  qualification: string;
  medicalCouncilRegNo: string;
  doctorType: DoctorType;
  contact: {
    phone: string;
    email?: string;
    clinicAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  digitalSignature: {
    signatureImageUrl?: string;
    sealImageUrl?: string;
    isAuthorizedSignatory: boolean;
    allowedLabSections: LabSection[];
  };
  opdSettings: {
    consultationFee: number;
    followUpFee: number;
    followUpValidityDays: number;
    slotDurationMinutes: number;
    availability: Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      maxTokens: number;
      roomNo: string;
    }>;
  };
  referralCommission: {
    isEligible: boolean;
    defaultPercentage: number;
    departmentWiseRates?: Array<{
      department: string;
      percentage: number;
      fixedAmountPerTest?: number;
    }>;
    bankDetails?: {
      accountHolderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      panNumber?: string;
      tdsPercentage: number;
    };
  };
  status: 'Active' | 'On Leave' | 'Suspended' | 'Inactive';
  metrics: {
    totalPatientsReferred: number;
    totalReportsApproved: number;
    totalCommissionEarned: number;
    rating: number;
  };
}

export interface LabParameter {
  paramCode: string;
  paramName: string;
  observedValue: string;
  numericValue?: number;
  unit: string;
  normalReferenceRange: {
    min?: number;
    max?: number;
    displayRange: string;
  };
  panicReferenceRange?: {
    criticalLow?: number | null;
    criticalHigh?: number | null;
  };
  flag: ResultFlag;
  deltaCheck?: {
    hasPreviousResult: boolean;
    previousValue?: number;
    previousDate?: string;
    percentageChange?: number;
    isDeltaAlert?: boolean;
    deltaComment?: string;
  };
  methodology?: string;
}

export interface ReportVerificationItem {
  reportId: string;
  accessionNumber: string;
  uhid: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  referredByDoctor: {
    doctorId?: string;
    doctorName: string;
  };
  department: string;
  testPanelName: string;
  sampleCollectionTime: string;
  analyzerProcessedTime: string;
  status: string;
  parameters: LabParameter[];
  panicAlertAudit?: {
    isPanicReport: boolean;
    alertTriggeredAt?: string;
    alertChannels?: string[];
    notifiedDoctorName?: string;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    actionTaken?: string;
  };
  signOff?: {
    signedByDoctorId?: string | null;
    signedByDoctorName?: string | null;
    designation?: string | null;
    signatureImageUrl?: string | null;
    signedAt?: string | null;
    doctorRemarks?: string;
    signOffToken?: string;
  };
  reRunDetails?: {
    isReRunOrdered: boolean;
    reRunReason?: string;
    reRunOrderedBy?: string;
    reRunDate?: string;
  };
}

export interface Prescription {
  prescriptionNumber: string;
  barcode: string;
  doctor: {
    doctorId: string;
    doctorName: string;
    specialization?: string;
    councilRegNo?: string;
    department?: string;
  };
  patient: {
    patientId: string;
    uhid: string;
    fullName: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    contact?: string;
    bloodGroup?: string;
  };
  visitType: string;
  vitals?: {
    bloodPressure?: string;
    pulseRate?: number;
    temperature?: number;
    spo2?: number;
    weightKg?: number;
    heightCm?: number;
    bmi?: number;
    bloodGlucoseRandom?: number;
  };
  clinicalSummary: {
    chiefComplaints?: Array<{
      symptom: string;
      duration?: string;
      severity?: 'Mild' | 'Moderate' | 'Severe';
    }>;
    clinicalHistory?: string;
    allergies?: string[];
    provisionalDiagnosis: string;
    icd10Codes?: Array<{
      code: string;
      description: string;
    }>;
  };
  labOrders: Array<{
    testCode: string;
    testName: string;
    department: string;
    urgency: 'Routine' | 'Urgent / Priority' | 'STAT / Emergency';
    specialInstructions?: string;
    status: string;
    sampleAccessionNumber?: string;
    orderDate?: string;
  }>;
  medications: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route?: string;
    instructions?: string;
  }>;
  adviceAndLifestyle?: string;
  followUpDate?: string;
  status: string;
  digitalSignVerified?: {
    isSigned: boolean;
    signedAt: string;
    signatureToken: string;
  };
}

export interface ReferralTransaction {
  transactionId: string;
  doctor: {
    doctorId: string;
    doctorName: string;
    clinicName?: string;
    phone?: string;
    panNumber?: string;
  };
  billDetails: {
    billId: string;
    billNumber: string;
    patientUhid: string;
    patientName: string;
    billDate: string;
    totalBillAmount: number;
    discountApplied: number;
    netPayableAmount: number;
  };
  testBreakdown: Array<{
    testCode: string;
    testName: string;
    department?: string;
    testPrice: number;
    commissionPercentage: number;
    commissionAmount: number;
  }>;
  totalGrossCommission: number;
  tdsPercentage: number;
  tdsAmount: number;
  netCommissionPayable: number;
  payoutStatus: 'Pending Approval' | 'Approved for Payout' | 'Paid & Settled' | 'On Hold / Disputed';
  settlementDetails?: {
    payoutBatchId?: string;
    paymentMode?: string;
    paymentReferenceNumber?: string;
    settledAt?: string;
    settledByAdmin?: string;
    remarks?: string;
  };
}

export interface PatientEMR {
  uhid: string;
  patientName: string;
  age: number;
  gender: string;
  bloodGroup?: string;
  contact: {
    phone: string;
    email?: string;
    emergencyContact?: string;
  };
  chronicConditions: Array<{
    condition: string;
    diagnosedSince: string;
    status: 'Active' | 'Controlled' | 'Under Investigation' | 'Resolved';
  }>;
  allergies: string[];
  labHistoryTrends: Array<{
    paramCode: string;
    paramName: string;
    unit: string;
    normalRange: string;
    records: Array<{
      testDate: string;
      value: number;
      observedValueText?: string;
      flag: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';
      reportId?: string;
      doctorRemarks?: string;
    }>;
  }>;
  visitTimeline: Array<{
    visitDate: string;
    visitType: string;
    attendingDoctor: string;
    diagnosis: string;
    prescriptionId?: string;
    reportIds?: string[];
  }>;
}
