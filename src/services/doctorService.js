/**
 * Comprehensive Doctor & ELIS Service Engine
 * Stores and manages Doctors, Prescriptions, Report Approvals (with Delta & Panic checks),
 * Referral Commissions, and Patient EMR Trends.
 */

// In-Memory Seeded Store for Real-World Lab & Hospital Operations
let doctors = [
  {
    id: "DOC-001",
    doctorCode: "DR-PATH-01",
    title: "Dr.",
    fullName: "Rohit Deshmukh",
    gender: "Male",
    specialization: "Chief Pathologist & Lab Director",
    department: "Pathology & Laboratory Medicine",
    qualification: "MBBS, MD (Pathology), FICP (AIIMS New Delhi)",
    medicalCouncilRegNo: "MCI-48920/2012",
    doctorType: "Pathologist Signatory",
    contact: {
      phone: "+91 98234 56789",
      email: "dr.rohit.path@labcore.health",
      clinicAddress: "Apex Diagnostic & Research Center, Floor 2",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    digitalSignature: {
      signatureImageUrl: "https://signaturely.com/wp-content/uploads/2020/04/sample-signature.png",
      sealImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Official_Seal_of_Medical_Council.png",
      isAuthorizedSignatory: true,
      allowedLabSections: ["All"]
    },
    opdSettings: {
      consultationFee: 800,
      followUpFee: 500,
      followUpValidityDays: 10,
      slotDurationMinutes: 15,
      availability: [
        { dayOfWeek: "Monday", startTime: "08:30", endTime: "16:00", maxTokens: 40, roomNo: "Lab Path-1" },
        { dayOfWeek: "Tuesday", startTime: "08:30", endTime: "16:00", maxTokens: 40, roomNo: "Lab Path-1" },
        { dayOfWeek: "Wednesday", startTime: "08:30", endTime: "16:00", maxTokens: 40, roomNo: "Lab Path-1" },
        { dayOfWeek: "Thursday", startTime: "08:30", endTime: "16:00", maxTokens: 40, roomNo: "Lab Path-1" },
        { dayOfWeek: "Friday", startTime: "08:30", endTime: "16:00", maxTokens: 40, roomNo: "Lab Path-1" },
        { dayOfWeek: "Saturday", startTime: "08:30", endTime: "13:00", maxTokens: 25, roomNo: "Lab Path-1" }
      ]
    },
    referralCommission: {
      isEligible: false,
      defaultPercentage: 0,
      departmentWiseRates: [],
      bankDetails: {
        accountHolderName: "Dr. Rohit Deshmukh",
        accountNumber: "50200049283921",
        ifscCode: "HDFC0000128",
        bankName: "HDFC Bank",
        panNumber: "ABCPD9021E",
        tdsPercentage: 10
      }
    },
    status: "Active",
    metrics: {
      totalPatientsReferred: 0,
      totalReportsApproved: 3420,
      totalCommissionEarned: 0,
      rating: 4.9
    }
  },
  {
    id: "DOC-002",
    doctorCode: "DR-CARD-02",
    title: "Dr.",
    fullName: "Aarav Kulkarni",
    gender: "Male",
    specialization: "Senior Interventional Cardiologist",
    department: "Cardiology",
    qualification: "MBBS, MD (Med), DM (Cardiology), FACC",
    medicalCouncilRegNo: "MMC-76124/2015",
    doctorType: "External Referring Doctor",
    contact: {
      phone: "+91 97112 34567",
      email: "dr.aarav.cardio@heartcare.org",
      clinicAddress: "Heart & Vascular Clinic, Sector 18",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001"
    },
    digitalSignature: {
      signatureImageUrl: "https://signaturely.com/wp-content/uploads/2020/04/sample-signature.png",
      sealImageUrl: "",
      isAuthorizedSignatory: false,
      allowedLabSections: []
    },
    opdSettings: {
      consultationFee: 1200,
      followUpFee: 800,
      followUpValidityDays: 14,
      slotDurationMinutes: 20,
      availability: [
        { dayOfWeek: "Monday", startTime: "10:00", endTime: "15:00", maxTokens: 20, roomNo: "OPD-302" },
        { dayOfWeek: "Wednesday", startTime: "10:00", endTime: "15:00", maxTokens: 20, roomNo: "OPD-302" },
        { dayOfWeek: "Friday", startTime: "10:00", endTime: "15:00", maxTokens: 20, roomNo: "OPD-302" }
      ]
    },
    referralCommission: {
      isEligible: true,
      defaultPercentage: 18,
      departmentWiseRates: [
        { department: "Biochemistry", percentage: 20, fixedAmountPerTest: 0 },
        { department: "Cardiology Lab", percentage: 25, fixedAmountPerTest: 0 },
        { department: "Radiology & Imaging", percentage: 15, fixedAmountPerTest: 0 }
      ],
      bankDetails: {
        accountHolderName: "Dr. Aarav Kulkarni Heart Clinic",
        accountNumber: "91802003847291",
        ifscCode: "UTIB0000412",
        bankName: "Axis Bank",
        panNumber: "AARPK7721F",
        tdsPercentage: 10
      }
    },
    status: "Active",
    metrics: {
      totalPatientsReferred: 284,
      totalReportsApproved: 0,
      totalCommissionEarned: 148200,
      rating: 4.8
    }
  },
  {
    id: "DOC-003",
    doctorCode: "DR-MED-03",
    title: "Dr.",
    fullName: "Priyanka Sen",
    gender: "Female",
    specialization: "Consultant Physician & Diabetologist",
    department: "General Medicine",
    qualification: "MBBS, MD (General Medicine), C.Diab",
    medicalCouncilRegNo: "WBMC-99214/2017",
    doctorType: "In-House Consultant",
    contact: {
      phone: "+91 98301 98765",
      email: "dr.priyanka.sen@labcore.health",
      clinicAddress: "Room 104, OPD Block, LabCore Central",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700029"
    },
    digitalSignature: {
      signatureImageUrl: "https://signaturely.com/wp-content/uploads/2020/04/sample-signature.png",
      sealImageUrl: "",
      isAuthorizedSignatory: false,
      allowedLabSections: []
    },
    opdSettings: {
      consultationFee: 700,
      followUpFee: 400,
      followUpValidityDays: 7,
      slotDurationMinutes: 15,
      availability: [
        { dayOfWeek: "Monday", startTime: "09:00", endTime: "14:00", maxTokens: 30, roomNo: "OPD-104" },
        { dayOfWeek: "Tuesday", startTime: "09:00", endTime: "14:00", maxTokens: 30, roomNo: "OPD-104" },
        { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "14:00", maxTokens: 30, roomNo: "OPD-104" },
        { dayOfWeek: "Thursday", startTime: "09:00", endTime: "14:00", maxTokens: 30, roomNo: "OPD-104" },
        { dayOfWeek: "Friday", startTime: "09:00", endTime: "14:00", maxTokens: 30, roomNo: "OPD-104" },
        { dayOfWeek: "Saturday", startTime: "09:00", endTime: "13:00", maxTokens: 20, roomNo: "OPD-104" }
      ]
    },
    referralCommission: {
      isEligible: true,
      defaultPercentage: 15,
      departmentWiseRates: [
        { department: "Biochemistry", percentage: 15, fixedAmountPerTest: 0 },
        { department: "Hematology", percentage: 15, fixedAmountPerTest: 0 },
        { department: "Serology & Immunology", percentage: 15, fixedAmountPerTest: 0 }
      ],
      bankDetails: {
        accountHolderName: "Dr. Priyanka Sen",
        accountNumber: "309102938475",
        ifscCode: "SBIN0001890",
        bankName: "State Bank of India",
        panNumber: "PYSEN1029K",
        tdsPercentage: 10
      }
    },
    status: "Active",
    metrics: {
      totalPatientsReferred: 195,
      totalReportsApproved: 0,
      totalCommissionEarned: 89400,
      rating: 4.9
    }
  }
];

// Seeded Pending/Verified Reports for Pathologist Verification Station
let labReports = [
  {
    reportId: "REP-2026-9042",
    accessionNumber: "LC-ACC-88301",
    uhid: "UHID-10892",
    patientName: "Vikram Malhotra",
    patientAge: 58,
    patientGender: "Male",
    referredByDoctor: { doctorId: "DOC-002", doctorName: "Dr. Aarav Kulkarni" },
    department: "Biochemistry & Cardiac Lab",
    testPanelName: "Emergency Cardiac & Renal Risk Panel",
    sampleCollectionTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    analyzerProcessedTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: "Panic Value Flagged - Immediate Action Required",
    parameters: [
      {
        paramCode: "TROP_I",
        paramName: "Troponin I (High Sensitivity)",
        observedValue: "1.84",
        numericValue: 1.84,
        unit: "ng/mL",
        normalReferenceRange: { min: 0.00, max: 0.04, displayRange: "0.00 - 0.04" },
        panicReferenceRange: { criticalLow: null, criticalHigh: 0.50 },
        flag: "CRITICAL_PANIC_HIGH",
        deltaCheck: {
          hasPreviousResult: true,
          previousValue: 0.02,
          previousDate: "2026-08-15",
          percentageChange: 9100,
          isDeltaAlert: true,
          deltaComment: "Severe acute surge. Strongly indicative of Acute Coronary Syndrome / Myocardial Infarction."
        },
        methodology: "Chemiluminescent Microparticle Immunoassay (CMIA)"
      },
      {
        paramCode: "K_PLUS",
        paramName: "Serum Potassium (K+)",
        observedValue: "6.4",
        numericValue: 6.4,
        unit: "mEq/L",
        normalReferenceRange: { min: 3.5, max: 5.1, displayRange: "3.5 - 5.1" },
        panicReferenceRange: { criticalLow: 2.8, criticalHigh: 6.0 },
        flag: "CRITICAL_PANIC_HIGH",
        deltaCheck: {
          hasPreviousResult: true,
          previousValue: 4.8,
          previousDate: "2026-08-15",
          percentageChange: 33.3,
          isDeltaAlert: true,
          deltaComment: "Significant elevation. High risk of cardiac arrhythmia."
        },
        methodology: "Ion Selective Electrode (ISE)"
      },
      {
        paramCode: "CREAT",
        paramName: "Serum Creatinine",
        observedValue: "2.3",
        numericValue: 2.3,
        unit: "mg/dL",
        normalReferenceRange: { min: 0.7, max: 1.3, displayRange: "0.7 - 1.3" },
        panicReferenceRange: { criticalLow: null, criticalHigh: 4.0 },
        flag: "HIGH",
        deltaCheck: {
          hasPreviousResult: true,
          previousValue: 1.4,
          previousDate: "2026-08-15",
          percentageChange: 64.2,
          isDeltaAlert: true,
          deltaComment: "Elevated from baseline 1.4 mg/dL."
        },
        methodology: "Modified Jaffé Kinetic"
      }
    ],
    panicAlertAudit: {
      isPanicReport: true,
      alertTriggeredAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      alertChannels: ["Dashboard Banner", "SMS", "WhatsApp"],
      notifiedDoctorName: "Dr. Aarav Kulkarni (Cardiologist)",
      acknowledgedBy: "ER Duty Medical Officer",
      acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      actionTaken: "Patient shifted to ICCU for urgent telemetry & ECG monitoring"
    },
    signOff: {
      signedByDoctorId: null,
      signedByDoctorName: null,
      designation: null,
      signatureImageUrl: null,
      signedAt: null,
      doctorRemarks: ""
    }
  },
  {
    reportId: "REP-2026-9043",
    accessionNumber: "LC-ACC-88302",
    uhid: "UHID-10744",
    patientName: "Meera Rajesh Sharma",
    patientAge: 46,
    patientGender: "Female",
    referredByDoctor: { doctorId: "DOC-003", doctorName: "Dr. Priyanka Sen" },
    department: "Biochemistry",
    testPanelName: "Comprehensive Diabetic & Lipid Profile",
    sampleCollectionTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    analyzerProcessedTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: "Pending Pathologist Review",
    parameters: [
      {
        paramCode: "FBS",
        paramName: "Fasting Blood Glucose",
        observedValue: "182",
        numericValue: 182,
        unit: "mg/dL",
        normalReferenceRange: { min: 70, max: 100, displayRange: "70 - 100" },
        panicReferenceRange: { criticalLow: 45, criticalHigh: 400 },
        flag: "HIGH",
        deltaCheck: {
          hasPreviousResult: true,
          previousValue: 154,
          previousDate: "2026-06-10",
          percentageChange: 18.1,
          isDeltaAlert: false,
          deltaComment: "Consistent diabetic state."
        },
        methodology: "Hexokinase / G6PD"
      },
      {
        paramCode: "HBA1C",
        paramName: "Glycated Hemoglobin (HbA1c)",
        observedValue: "8.6",
        numericValue: 8.6,
        unit: "%",
        normalReferenceRange: { min: 4.0, max: 5.6, displayRange: "< 5.7 (Normal), 5.7-6.4 (Prediabetic)" },
        panicReferenceRange: { criticalLow: null, criticalHigh: 14.0 },
        flag: "HIGH",
        deltaCheck: {
          hasPreviousResult: true,
          previousValue: 7.9,
          previousDate: "2026-06-10",
          percentageChange: 8.8,
          isDeltaAlert: false,
          deltaComment: "Suboptimal glycemic control."
        },
        methodology: "HPLC (Bio-Rad D-10)"
      },
      {
        paramCode: "TRIGLY",
        paramName: "Serum Triglycerides",
        observedValue: "245",
        numericValue: 245,
        unit: "mg/dL",
        normalReferenceRange: { min: 50, max: 150, displayRange: "< 150 Desirable" },
        panicReferenceRange: { criticalLow: null, criticalHigh: 1000 },
        flag: "HIGH",
        deltaCheck: {
          hasPreviousResult: true,
          previousValue: 210,
          previousDate: "2026-06-10",
          percentageChange: 16.6,
          isDeltaAlert: false,
          deltaComment: "Elevated dyslipidemia."
        },
        methodology: "GPO-PAP Enzymatic"
      }
    ],
    panicAlertAudit: {
      isPanicReport: false
    },
    signOff: {
      signedByDoctorId: null,
      signedByDoctorName: null,
      designation: null,
      signatureImageUrl: null,
      signedAt: null,
      doctorRemarks: ""
    }
  },
  {
    reportId: "REP-2026-9040",
    accessionNumber: "LC-ACC-88295",
    uhid: "UHID-10512",
    patientName: "Sunita Verma",
    patientAge: 34,
    patientGender: "Female",
    referredByDoctor: { doctorId: "DOC-003", doctorName: "Dr. Priyanka Sen" },
    department: "Hematology",
    testPanelName: "Complete Blood Count (CBC) with ESR",
    sampleCollectionTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    analyzerProcessedTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: "Approved & Signed by Pathologist",
    parameters: [
      {
        paramCode: "HB",
        paramName: "Hemoglobin",
        observedValue: "12.8",
        numericValue: 12.8,
        unit: "g/dL",
        normalReferenceRange: { min: 12.0, max: 15.5, displayRange: "12.0 - 15.5" },
        panicReferenceRange: { criticalLow: 6.0, criticalHigh: 20.0 },
        flag: "NORMAL",
        deltaCheck: { hasPreviousResult: true, previousValue: 12.4, previousDate: "2026-04-12", percentageChange: 3.2, isDeltaAlert: false },
        methodology: "SLS Hemoglobin Method"
      },
      {
        paramCode: "TLC",
        paramName: "Total Leukocyte Count (WBC)",
        observedValue: "7,800",
        numericValue: 7800,
        unit: "/cumm",
        normalReferenceRange: { min: 4000, max: 11000, displayRange: "4,000 - 11,000" },
        panicReferenceRange: { criticalLow: 2000, criticalHigh: 30000 },
        flag: "NORMAL",
        deltaCheck: { hasPreviousResult: true, previousValue: 8100, previousDate: "2026-04-12", percentageChange: -3.7, isDeltaAlert: false },
        methodology: "Flow Cytometry (Semiconductor Laser)"
      },
      {
        paramCode: "PLT",
        paramName: "Platelet Count",
        observedValue: "240,000",
        numericValue: 240000,
        unit: "/cumm",
        normalReferenceRange: { min: 150000, max: 450000, displayRange: "150,000 - 450,000" },
        panicReferenceRange: { criticalLow: 20000, criticalHigh: 1000000 },
        flag: "NORMAL",
        deltaCheck: { hasPreviousResult: true, previousValue: 235000, previousDate: "2026-04-12", percentageChange: 2.1, isDeltaAlert: false },
        methodology: "Impedance with Hydrodynamic Focusing"
      }
    ],
    panicAlertAudit: {
      isPanicReport: false
    },
    signOff: {
      signedByDoctorId: "DOC-001",
      signedByDoctorName: "Dr. Rohit Deshmukh",
      designation: "Chief Pathologist (MBBS, MD Path)",
      signatureImageUrl: "https://signaturely.com/wp-content/uploads/2020/04/sample-signature.png",
      signedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      doctorRemarks: "Hematological parameters within normal reference ranges.",
      signOffToken: "AUTH-SHA256-88F9A1B498C017"
    }
  }
];

// Seeded Digital Prescriptions (CPOE)
let prescriptions = [
  {
    prescriptionNumber: "RX-2026-0894",
    barcode: "8904018274012",
    doctor: {
      doctorId: "DOC-003",
      doctorName: "Dr. Priyanka Sen",
      specialization: "Consultant Physician & Diabetologist",
      councilRegNo: "WBMC-99214/2017",
      department: "General Medicine"
    },
    patient: {
      patientId: "PAT-001",
      uhid: "UHID-10744",
      fullName: "Meera Rajesh Sharma",
      age: 46,
      gender: "Female",
      contact: "+91 98920 11223",
      bloodGroup: "B +ve"
    },
    visitType: "OPD Consultation",
    vitals: {
      bloodPressure: "134/88 mmHg",
      pulseRate: 76,
      temperature: 98.4,
      spo2: 99,
      weightKg: 68,
      heightCm: 160,
      bmi: 26.5,
      bloodGlucoseRandom: 182
    },
    clinicalSummary: {
      chiefComplaints: [
        { symptom: "Increased thirst (Polydipsia) & lethargy", duration: "3 weeks", severity: "Moderate" },
        { symptom: "Mild tingling in feet", duration: "1 month", severity: "Mild" }
      ],
      clinicalHistory: "Known Type-2 Diabetes for 4 years on Metformin 500mg BD.",
      allergies: ["Penicillin / Amoxicillin"],
      provisionalDiagnosis: "Uncontrolled Type 2 Diabetes Mellitus with Peripheral Neuropathy",
      icd10Codes: [
        { code: "E11.40", description: "Type 2 diabetes mellitus with diabetic neuropathy, unspecified" },
        { code: "E78.5", description: "Hyperlipidemia, unspecified" }
      ]
    },
    labOrders: [
      {
        testCode: "HBA1C",
        testName: "Glycated Hemoglobin (HbA1c) & Fasting Plasma Glucose",
        department: "Biochemistry",
        urgency: "Routine",
        specialInstructions: "10-12 hours fasting required",
        status: "Processing in Lab",
        sampleAccessionNumber: "LC-ACC-88302",
        orderDate: new Date().toISOString()
      },
      {
        testCode: "LIPID",
        testName: "Lipid Profile Comprehensive",
        department: "Biochemistry",
        urgency: "Routine",
        specialInstructions: "Overnight fasting sample",
        status: "Processing in Lab",
        sampleAccessionNumber: "LC-ACC-88302",
        orderDate: new Date().toISOString()
      },
      {
        testCode: "URINE_MICRAL",
        testName: "Urine Microalbumin / Creatinine Ratio",
        department: "Biochemistry",
        urgency: "Routine",
        specialInstructions: "First morning mid-stream urine sample",
        status: "Prescribed",
        orderDate: new Date().toISOString()
      }
    ],
    medications: [
      {
        drugName: "Tab. Metformin + Sitagliptin (500mg/50mg)",
        dosage: "1 Tablet",
        frequency: "1-0-1 (Twice Daily)",
        duration: "30 Days",
        route: "Oral",
        instructions: "Take with or immediately after major meals"
      },
      {
        drugName: "Tab. Methylcobalamin + Alpha Lipoic Acid",
        dosage: "1 Capsule",
        frequency: "0-0-1 (Once Nightly)",
        duration: "30 Days",
        route: "Oral",
        instructions: "For peripheral nerve regeneration"
      },
      {
        drugName: "Tab. Atorvastatin 10mg",
        dosage: "1 Tablet",
        frequency: "0-0-1 (At Bedtime)",
        duration: "30 Days",
        route: "Oral",
        instructions: "Take post dinner"
      }
    ],
    adviceAndLifestyle: "Low glycemic diet, 30 mins brisk walking daily, foot care inspection daily.",
    followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "Active",
    digitalSignVerified: {
      isSigned: true,
      signedAt: new Date().toISOString(),
      signatureToken: "RX-SIGN-SHA256-99214PS"
    }
  }
];

// Seeded Referral Ledger / Incentive Transactions
let referralLedger = [
  {
    transactionId: "REF-TXN-2026-00431",
    doctor: {
      doctorId: "DOC-002",
      doctorName: "Dr. Aarav Kulkarni",
      clinicName: "Heart & Vascular Clinic",
      phone: "+91 97112 34567",
      panNumber: "AARPK7721F"
    },
    billDetails: {
      billId: "BILL-8921",
      billNumber: "INV-2026-8921",
      patientUhid: "UHID-10892",
      patientName: "Vikram Malhotra",
      billDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      totalBillAmount: 4800,
      discountApplied: 0,
      netPayableAmount: 4800
    },
    testBreakdown: [
      { testCode: "TROP_I", testName: "Troponin I Quantitative High-Sensitivity", department: "Cardiology Lab", testPrice: 1800, commissionPercentage: 25, commissionAmount: 450 },
      { testCode: "K_PLUS", testName: "Serum Electrolytes (Na+, K+, Cl-)", department: "Biochemistry", testPrice: 650, commissionPercentage: 20, commissionAmount: 130 },
      { testCode: "CREAT", testName: "Renal Function Panel (KFT)", department: "Biochemistry", testPrice: 850, commissionPercentage: 20, commissionAmount: 170 },
      { testCode: "ECHO", testName: "2D Echocardiography with Color Doppler", department: "Radiology & Imaging", testPrice: 1500, commissionPercentage: 15, commissionAmount: 225 }
    ],
    totalGrossCommission: 975,
    tdsPercentage: 10,
    tdsAmount: 97.5,
    netCommissionPayable: 877.5,
    payoutStatus: "Pending Approval"
  },
  {
    transactionId: "REF-TXN-2026-00428",
    doctor: {
      doctorId: "DOC-003",
      doctorName: "Dr. Priyanka Sen",
      clinicName: "Dr. Sen Diabetes & Internal Med",
      phone: "+91 98301 98765",
      panNumber: "PYSEN1029K"
    },
    billDetails: {
      billId: "BILL-8914",
      billNumber: "INV-2026-8914",
      patientUhid: "UHID-10744",
      patientName: "Meera Rajesh Sharma",
      billDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      totalBillAmount: 2400,
      discountApplied: 0,
      netPayableAmount: 2400
    },
    testBreakdown: [
      { testCode: "HBA1C", testName: "HbA1c Glycated Hemoglobin", department: "Biochemistry", testPrice: 600, commissionPercentage: 15, commissionAmount: 90 },
      { testCode: "LIPID", testName: "Lipid Profile Comprehensive", department: "Biochemistry", testPrice: 900, commissionPercentage: 15, commissionAmount: 135 },
      { testCode: "URINE_MICRAL", testName: "Urine Microalbumin", department: "Biochemistry", testPrice: 900, commissionPercentage: 15, commissionAmount: 135 }
    ],
    totalGrossCommission: 360,
    tdsPercentage: 10,
    tdsAmount: 36.0,
    netCommissionPayable: 324.0,
    payoutStatus: "Approved for Payout"
  },
  {
    transactionId: "REF-TXN-2026-00410",
    doctor: {
      doctorId: "DOC-002",
      doctorName: "Dr. Aarav Kulkarni",
      clinicName: "Heart & Vascular Clinic",
      phone: "+91 97112 34567",
      panNumber: "AARPK7721F"
    },
    billDetails: {
      billId: "BILL-8870",
      billNumber: "INV-2026-8870",
      patientUhid: "UHID-10219",
      patientName: "Anil Kapoor",
      billDate: "2026-09-28T11:00:00Z",
      totalBillAmount: 8500,
      discountApplied: 500,
      netPayableAmount: 8000
    },
    testBreakdown: [
      { testCode: "CT_CORONARY", testName: "CT Coronary Angiography", department: "Radiology & Imaging", testPrice: 8000, commissionPercentage: 15, commissionAmount: 1200 }
    ],
    totalGrossCommission: 1200,
    tdsPercentage: 10,
    tdsAmount: 120,
    netCommissionPayable: 1080,
    payoutStatus: "Paid & Settled",
    settlementDetails: {
      payoutBatchId: "BATCH-SEP-2026-04",
      paymentMode: "NEFT / IMPS / RTGS",
      paymentReferenceNumber: "UTR-HDFC982148201",
      settledAt: "2026-09-30T17:30:00Z",
      settledByAdmin: "Accountant / Finance Manager",
      remarks: "Monthly settlement credited to Axis Bank A/C ending in 7291"
    }
  }
];

// Seeded Patient EMR with Longitudinal Historical Lab Trends
let patientEMRs = [
  {
    uhid: "UHID-10744",
    patientName: "Meera Rajesh Sharma",
    age: 46,
    gender: "Female",
    bloodGroup: "B +ve",
    contact: {
      phone: "+91 98920 11223",
      email: "meera.sharma@example.com",
      emergencyContact: "+91 98920 11220 (Spouse)"
    },
    chronicConditions: [
      { condition: "Type-2 Diabetes Mellitus", diagnosedSince: "2022", status: "Active" },
      { condition: "Dyslipidemia", diagnosedSince: "2023", status: "Active" }
    ],
    allergies: ["Penicillin / Amoxicillin"],
    labHistoryTrends: [
      {
        paramCode: "HBA1C",
        paramName: "Glycated Hemoglobin (HbA1c)",
        unit: "%",
        normalRange: "< 5.7 %",
        records: [
          { testDate: "2025-10-15", value: 7.2, flag: "HIGH", reportId: "REP-2025-1102", doctorRemarks: "Initiated Metformin 500mg" },
          { testDate: "2026-02-18", value: 7.5, flag: "HIGH", reportId: "REP-2026-2481", doctorRemarks: "Diet compliance poor" },
          { testDate: "2026-06-10", value: 7.9, flag: "HIGH", reportId: "REP-2026-5912", doctorRemarks: "Increased dosage to BD" },
          { testDate: "2026-10-04", value: 8.6, flag: "HIGH", reportId: "REP-2026-9043", doctorRemarks: "Added DPP-4 Inhibitor Sitagliptin" }
        ]
      },
      {
        paramCode: "FBS",
        paramName: "Fasting Blood Glucose",
        unit: "mg/dL",
        normalRange: "70 - 100 mg/dL",
        records: [
          { testDate: "2025-10-15", value: 138, flag: "HIGH", reportId: "REP-2025-1102" },
          { testDate: "2026-02-18", value: 145, flag: "HIGH", reportId: "REP-2026-2481" },
          { testDate: "2026-06-10", value: 154, flag: "HIGH", reportId: "REP-2026-5912" },
          { testDate: "2026-10-04", value: 182, flag: "HIGH", reportId: "REP-2026-9043" }
        ]
      },
      {
        paramCode: "TRIGLY",
        paramName: "Serum Triglycerides",
        unit: "mg/dL",
        normalRange: "< 150 mg/dL",
        records: [
          { testDate: "2025-10-15", value: 180, flag: "HIGH", reportId: "REP-2025-1102" },
          { testDate: "2026-02-18", value: 195, flag: "HIGH", reportId: "REP-2026-2481" },
          { testDate: "2026-06-10", value: 210, flag: "HIGH", reportId: "REP-2026-5912" },
          { testDate: "2026-10-04", value: 245, flag: "HIGH", reportId: "REP-2026-9043" }
        ]
      },
      {
        paramCode: "CREAT",
        paramName: "Serum Creatinine",
        unit: "mg/dL",
        normalRange: "0.6 - 1.1 mg/dL",
        records: [
          { testDate: "2025-10-15", value: 0.8, flag: "NORMAL", reportId: "REP-2025-1102" },
          { testDate: "2026-02-18", value: 0.85, flag: "NORMAL", reportId: "REP-2026-2481" },
          { testDate: "2026-06-10", value: 0.9, flag: "NORMAL", reportId: "REP-2026-5912" },
          { testDate: "2026-10-04", value: 0.95, flag: "NORMAL", reportId: "REP-2026-9043" }
        ]
      }
    ],
    visitTimeline: [
      {
        visitDate: "2026-10-04",
        visitType: "OPD Consultation",
        attendingDoctor: "Dr. Priyanka Sen",
        diagnosis: "Type 2 Diabetes Mellitus Uncontrolled + Neuropathy",
        prescriptionId: "RX-2026-0894",
        reportIds: ["REP-2026-9043"]
      },
      {
        visitDate: "2026-06-10",
        visitType: "Follow-Up",
        attendingDoctor: "Dr. Priyanka Sen",
        diagnosis: "Type 2 Diabetes Mellitus",
        prescriptionId: "RX-2026-0412",
        reportIds: ["REP-2026-5912"]
      }
    ]
  }
];

module.exports = {
  // Doctor operations
  getAllDoctors: () => doctors,
  getDoctorById: (id) => doctors.find(d => d.id === id || d.doctorCode === id),
  addDoctor: (docData) => {
    const newDoc = {
      id: `DOC-${String(doctors.length + 1).padStart(3, '0')}`,
      doctorCode: docData.doctorCode || `DR-${Date.now().toString().slice(-4)}`,
      status: "Active",
      metrics: { totalPatientsReferred: 0, totalReportsApproved: 0, totalCommissionEarned: 0, rating: 5.0 },
      ...docData
    };
    doctors.unshift(newDoc);
    return newDoc;
  },
  updateDoctor: (id, updateData) => {
    const index = doctors.findIndex(d => d.id === id || d.doctorCode === id);
    if (index === -1) return null;
    doctors[index] = { ...doctors[index], ...updateData };
    return doctors[index];
  },

  // Lab Verification Operations
  getPendingReports: () => labReports,
  getReportById: (reportId) => labReports.find(r => r.reportId === reportId),
  signOffReport: (reportId, signOffData) => {
    const report = labReports.find(r => r.reportId === reportId);
    if (!report) return null;
    report.status = "Approved & Signed by Pathologist";
    report.signOff = {
      signedByDoctorId: signOffData.doctorId || "DOC-001",
      signedByDoctorName: signOffData.doctorName || "Dr. Rohit Deshmukh",
      designation: signOffData.designation || "Chief Pathologist (MBBS, MD Path)",
      medicalRegNo: signOffData.medicalRegNo || "MCI-48920/2012",
      signatureImageUrl: "https://signaturely.com/wp-content/uploads/2020/04/sample-signature.png",
      signedAt: new Date().toISOString(),
      doctorRemarks: signOffData.doctorRemarks || "Results clinically correlated.",
      signOffToken: `SIGN-SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
    };
    return report;
  },
  triggerReTest: (reportId, reason, doctorName) => {
    const report = labReports.find(r => r.reportId === reportId);
    if (!report) return null;
    report.status = "Sent for Re-testing / Sample Redraw";
    report.reRunDetails = {
      isReRunOrdered: true,
      reRunReason: reason,
      reRunOrderedBy: doctorName || "Pathologist On Duty",
      reRunDate: new Date().toISOString()
    };
    return report;
  },

  // Prescription / CPOE Operations
  getAllPrescriptions: () => prescriptions,
  getPrescriptionByNumber: (rxNo) => prescriptions.find(p => p.prescriptionNumber === rxNo),
  createPrescription: (rxData) => {
    const rxNumber = `RX-${new Date().getFullYear()}-${String(prescriptions.length + 895).padStart(4, '0')}`;
    const newRx = {
      prescriptionNumber: rxNumber,
      barcode: `890${Date.now().toString().slice(-10)}`,
      createdAt: new Date().toISOString(),
      status: "Active",
      digitalSignVerified: {
        isSigned: true,
        signedAt: new Date().toISOString(),
        signatureToken: `RX-SIGN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      },
      ...rxData
    };
    prescriptions.unshift(newRx);
    return newRx;
  },

  // Referral Ledger Operations
  getReferralLedger: () => referralLedger,
  getDoctorIncentiveSummary: (doctorId) => {
    const doctorTxns = referralLedger.filter(t => t.doctor.doctorId === doctorId);
    const totalGross = doctorTxns.reduce((sum, t) => sum + t.totalGrossCommission, 0);
    const totalNet = doctorTxns.reduce((sum, t) => sum + t.netCommissionPayable, 0);
    const totalTds = doctorTxns.reduce((sum, t) => sum + t.tdsAmount, 0);
    const pendingPayout = doctorTxns.filter(t => t.payoutStatus !== 'Paid & Settled')
                                   .reduce((sum, t) => sum + t.netCommissionPayable, 0);
    const settledPayout = doctorTxns.filter(t => t.payoutStatus === 'Paid & Settled')
                                   .reduce((sum, t) => sum + t.netCommissionPayable, 0);
    return { doctorTxns, totalGross, totalTds, totalNet, pendingPayout, settledPayout };
  },
  approveReferralPayout: (transactionId, settlementInfo) => {
    const txn = referralLedger.find(t => t.transactionId === transactionId);
    if (!txn) return null;
    txn.payoutStatus = "Paid & Settled";
    txn.settlementDetails = {
      payoutBatchId: settlementInfo.payoutBatchId || `BATCH-${Date.now().toString().slice(-6)}`,
      paymentMode: settlementInfo.paymentMode || "NEFT / IMPS / RTGS",
      paymentReferenceNumber: settlementInfo.paymentReferenceNumber || `UTR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      settledAt: new Date().toISOString(),
      settledByAdmin: settlementInfo.settledByAdmin || "Finance Lead",
      remarks: settlementInfo.remarks || "Direct Bank Transfer successfully processed."
    };
    return txn;
  },

  // Patient EMR Trends
  getPatientEMR: (uhid) => patientEMRs.find(p => p.uhid === uhid) || null,
  getAllPatientEMRs: () => patientEMRs
};
