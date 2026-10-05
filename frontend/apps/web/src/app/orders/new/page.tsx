"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { orderApi, patientApi, doctorApi, testApi } from "@/lib/api";
import { PatientQuickRegisterModal } from "@/components/orders/PatientQuickRegisterModal";
import { DoctorQuickAddModal } from "@/components/orders/DoctorQuickAddModal";
import RegisterDoctorWizard from "@/components/doctors/RegisterDoctorWizard";
import {
  StatusBadge,
  PriorityBadge,
  ToastContainer,
  useToast,
  OrderCommunicationHubModal,
} from "@/components/orders/orders-ui";
import {
  User,
  UserCheck,
  Stethoscope,
  FlaskConical,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  DollarSign,
  Printer,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  X,
  PackageCheck,
  Percent,
  Layers,
  Send,
  Share2,
  Receipt,
  Tag,
  Check,
  HeartPulse,
} from "lucide-react";

// Types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  uhid: string;
  phone: string;
  gender: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
}

type PatientIdentityMarkProps = {
  firstName: string;
  lastName: string;
  gender?: string;
  size?: "compact" | "card" | "hero";
};

/**
 * Premium gender-specific patient identity mark with professional medical symbols
 */
function PatientIdentityMark({ firstName, lastName, gender, size = "card" }: PatientIdentityMarkProps) {
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "PT";
  const genderUpper = gender?.toUpperCase() || "";
  const isFemale = genderUpper === "FEMALE";
  const isMale = genderUpper === "MALE";
  const dimensions = size === "hero" ? "h-14 w-14" : size === "card" ? "h-12 w-12" : "h-11 w-11";
  const monogram = size === "hero" ? "text-lg" : size === "card" ? "text-base" : "text-sm";

  // Gender-specific gradient colors
  const gradientColors = isFemale 
    ? "from-pink-600 via-rose-500 to-pink-400 shadow-[0_8px_24px_rgba(219,39,119,0.35)]"
    : isMale
      ? "from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_8px_24px_rgba(37,99,235,0.35)]"
      : "from-indigo-700 via-blue-600 to-cyan-500 shadow-[0_8px_24px_rgba(37,99,235,0.35)]";

  // Gender-specific accent colors
  const accentColor = isFemale ? "text-pink-300" : isMale ? "text-blue-300" : "text-cyan-300";
  const accentBg = isFemale ? "bg-pink-300" : isMale ? "bg-blue-300" : "bg-cyan-300";

  return (
    <div
      className={`relative ${dimensions} shrink-0 overflow-visible rounded-2xl bg-gradient-to-br ${gradientColors} p-[1.5px] ring-1 ring-white/40 backdrop-blur-sm transition-all duration-300 hover:scale-105`}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[14px] bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/15 via-transparent to-indigo-400/15 animate-pulse" />
        <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-r from-cyan-300/30 via-white/25 to-indigo-300/25 blur-[1px]" />
        
        {/* LabCore Logo Badge */}
        <div className="absolute left-1.5 top-1.5 flex items-center gap-0.5">
          <div className={`h-1.5 w-1.5 rounded-full ${accentBg} shadow-[0_0_8px_rgba(255,255,255,0.8)]`} />
          <span className={`text-[6px] font-black tracking-[0.2em] ${accentColor}/90 drop-shadow-sm`}>LC</span>
        </div>
        
        {/* Gender-Specific Medical Symbol */}
        <div className="absolute right-1.5 top-1.5 flex items-center justify-center">
          <div className="relative h-2.5 w-2.5">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              {isFemale ? (
                <svg viewBox="0 0 24 24" className="h-2 w-2 text-white/80" fill="currentColor">
                  <circle cx="12" cy="5" r="3" />
                  <path d="M12 8v11M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : isMale ? (
                <svg viewBox="0 0 24 24" className="h-2 w-2 text-white/80" fill="currentColor">
                  <circle cx="10" cy="14" r="3" />
                  <path d="M12.5 12.5L18 7M15 7h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <Plus className="h-1.5 w-1.5 text-white/60" />
              )}
            </div>
          </div>
        </div>
        
        {/* Heart Rate Pulse */}
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5">
          <div className="flex items-end gap-[1px] h-2">
            <div className={`w-[1px] h-1 ${accentColor}/60`} />
            <div className={`w-[1px] h-2 ${accentColor}/80`} />
            <div className={`w-[1px] h-1 ${accentColor}/60`} />
            <div className={`w-[1px] h-1.5 ${accentColor}/70`} />
            <div className={`w-[1px] h-1 ${accentColor}/50`} />
          </div>
        </div>
        
        <div className="relative flex flex-col items-center">
          <span className={`font-black tracking-tight text-white drop-shadow-lg ${monogram}`}>
            {initials}
          </span>
          {size !== "compact" && (
            <span className="text-[5px] font-medium tracking-widest text-white/60 uppercase mt-0.5">
              {isFemale ? "Female" : isMale ? "Male" : "Patient"}
            </span>
          )}
        </div>
      </div>
      
      {/* Corner Accents */}
      <div className="absolute -top-0.5 -left-0.5 h-2 w-2 border-t-2 border-l-2 border-white/60 rounded-tl-sm" />
      <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 border-b-2 border-r-2 border-white/60 rounded-br-sm" />
    </div>
  );
}

interface Doctor {
  id: string;
  fullName: string;
  doctorCode?: string;
  specialization?: string;
  clinicName?: string;
  phone?: string;
}

interface TestItem {
  id: string;
  testCode: string;
  testName: string;
  price: number;
  sampleType: string;
  sampleContainer?: string;
  tatHours?: number;
  tatDisplay?: string;
  category?: {
    name?: string;
    department?: string;
  };
}

interface TestPackage {
  id: string;
  packageCode: string;
  packageName: string;
  description?: string;
  offerPrice?: number;
  price?: number;
  items?: Array<{
    testId: string;
    test: TestItem;
  }>;
}

// Vacutainer Color & Tube Specification based on Sample & Test Name
function getVacutainerBadge(testName: string = "", sampleType: string = "Blood") {
  const name = testName.toLowerCase();
  const sample = sampleType.toLowerCase();

  if (
    name.includes("cbc") ||
    name.includes("hemogram") ||
    name.includes("hba1c") ||
    name.includes("esr") ||
    name.includes("blood group") ||
    name.includes("peripheral") ||
    name.includes("platelet") ||
    name.includes("edta")
  ) {
    return {
      type: "EDTA",
      colorName: "Lavender",
      dotClass: "bg-purple-600",
      badgeClass: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      label: "Lavender EDTA",
      sampleVol: "2 mL Whole Blood",
    };
  }

  if (
    name.includes("glucose") ||
    name.includes("sugar") ||
    name.includes("fbs") ||
    name.includes("ppbs") ||
    name.includes("rbs") ||
    name.includes("fluoride")
  ) {
    return {
      type: "FLUORIDE",
      colorName: "Grey",
      dotClass: "bg-slate-400",
      badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
      label: "Grey Fluoride",
      sampleVol: "2 mL Fluoride Plasma",
    };
  }

  if (
    name.includes("pt-inr") ||
    name.includes("coagulation") ||
    name.includes("aptt") ||
    name.includes("d-dimer") ||
    name.includes("citrate")
  ) {
    return {
      type: "CITRATE",
      colorName: "Light Blue",
      dotClass: "bg-sky-400",
      badgeClass: "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      label: "Blue Citrate",
      sampleVol: "2.7 mL Citrate Plasma",
    };
  }

  if (sample.includes("urine") || name.includes("urine")) {
    return {
      type: "URINE",
      colorName: "Yellow",
      dotClass: "bg-amber-400",
      badgeClass: "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      label: "Urine Container",
      sampleVol: "30 mL Fresh Urine",
    };
  }

  if (sample.includes("stool") || name.includes("stool")) {
    return {
      type: "STOOL",
      colorName: "Brown",
      dotClass: "bg-amber-800",
      badgeClass: "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300",
      label: "Stool Cup",
      sampleVol: "Clean Specimen",
    };
  }

  // Default Serum / Clot Activator / SST
  return {
    type: "SERUM",
    colorName: "Red / Gold",
    dotClass: "bg-rose-600",
    badgeClass: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    label: "Red / Gold SST",
    sampleVol: "4 mL Clotted Blood",
  };
}

const PRESET_DISCOUNTS = [
  { label: "5% General", value: 5, reason: "Seasonal general wellness promotional discount" },
  { label: "10% Loyalty", value: 10, reason: "Returning registered family member loyalty discount" },
  { label: "15% Senior Citizen", value: 15, reason: "Senior Citizen healthcare concession (>60 yrs)" },
  { label: "20% Staff / Camp", value: 20, reason: "Hospital employee / Diagnostic camp concession" },
  { label: "100% Pathologist Courtesy", value: 100, reason: "Director / Pathologist authorized courtesy exemption" },
];

export default function NewOrderWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramPatientId = searchParams.get("patientId");
  const { toasts, showToast, removeToast } = useToast();

  // Active Wizard Step (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Loading and Error States
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Modals state
  const [showPatientRegisterModal, setShowPatientRegisterModal] = useState(false);
  const [showDoctorAddModal, setShowDoctorAddModal] = useState(false);
  const [createdOrderSummary, setCreatedOrderSummary] = useState<any | null>(null);
  const [showPostCommunicationHub, setShowPostCommunicationHub] = useState(false);

  // Catalog Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [packages, setPackages] = useState<TestPackage[]>([]);

  // Step 1: Patient Selection State
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Step 2: Referring Doctor State
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isSelfReferral, setIsSelfReferral] = useState(false);

  // Step 3: Test Catalog & Package State
  const [testSearch, setTestSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [activeCatalogTab, setActiveCatalogTab] = useState<"TESTS" | "PACKAGES">("TESTS");
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);
  const [selectedTestItems, setSelectedTestItems] = useState<
    Array<{
      testId: string;
      test: TestItem;
      discount: number;
    }>
  >([]);

  // Step 4: Priority & Scheduling State
  const [priority, setPriority] = useState<"ROUTINE" | "URGENT" | "STAT">("ROUTINE");
  const [collectionType, setCollectionType] = useState<"WALK_IN" | "HOME_COLLECTION">("WALK_IN");
  const [homeAddress, setHomeAddress] = useState("");
  const [collectionDate, setCollectionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [collectionTimeSlot, setCollectionTimeSlot] = useState("08:00 - 10:00 AM");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [fastingStatus, setFastingStatus] = useState<"NOT_REQUIRED" | "FASTING_12H" | "POST_PRANDIAL">("NOT_REQUIRED");

  // Step 5: Billing & Advance Payment State
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENT">("FLAT");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState("");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [autoGenerateInvoice, setAutoGenerateInvoice] = useState(true);
  const [sendWhatsAppAlert, setSendWhatsAppAlert] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        setDataLoading(true);
        const [patientsRes, doctorsRes, testsRes, packagesRes] = await Promise.all([
          patientApi.getAll().catch(() => ({ data: [] })),
          doctorApi.getAll().catch(() => ({ data: [] })),
          testApi.getAll().catch(() => ({ data: [] })),
          // Safe packages fetch — testApi.getPackages is a real method, no unsafe cast needed
          testApi.getPackages().catch(() => ({ data: [] })),
        ]);

        if (patientsRes && patientsRes.data) {
          const list = patientsRes.data.patients || patientsRes.data || [];
          setPatients(Array.isArray(list) ? list : []);
        }

        if (doctorsRes && doctorsRes.data) {
          const list = doctorsRes.data.doctors || doctorsRes.data || [];
          setDoctors(Array.isArray(list) ? list : []);
        }

        if (testsRes && testsRes.data) {
          const list = testsRes.data.tests || testsRes.data || [];
          setTests(Array.isArray(list) ? list : []);
        }

        if (packagesRes && packagesRes.data) {
          const list = packagesRes.data.packages || packagesRes.data || [];
          setPackages(Array.isArray(list) ? list : []);
        }
      } catch (err: any) {
        console.error("Failed to load catalog data:", err);
        showToast("Error loading catalog data", "error");
      } finally {
        setDataLoading(false);
      }
    };

    loadCatalogData();
  }, []);

  // Preselect patient from query param if available
  useEffect(() => {
    if (paramPatientId && patients.length > 0 && !selectedPatient) {
      const match = patients.find(
        (p) => p.id === paramPatientId || p.uhid === paramPatientId
      );
      if (match) {
        setSelectedPatient(match);
      }
    }
  }, [paramPatientId, patients, selectedPatient]);

  // Pre-fill home collection address with patient's residential address
  useEffect(() => {
    if (selectedPatient?.address && !homeAddress) {
      setHomeAddress(selectedPatient.address);
    }
  }, [selectedPatient, homeAddress]);

  // Available departments in test catalog
  const departments = useMemo(() => {
    const set = new Set<string>();
    tests.forEach((t) => {
      const dept = t.category?.department || t.category?.name;
      if (dept) set.add(dept);
    });
    return ["ALL", ...Array.from(set)];
  }, [tests]);

  // Filtered Patients for Step 1
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 10);
    const q = patientSearch.toLowerCase().trim();
    return patients.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.uhid || "").toLowerCase().includes(q) ||
        (p.phone || "").includes(q)
    );
  }, [patients, patientSearch]);

  // Filtered Doctors for Step 2
  const filteredDoctors = useMemo(() => {
    if (!doctorSearch.trim()) return doctors.slice(0, 10);
    const q = doctorSearch.toLowerCase().trim();
    return doctors.filter(
      (d) =>
        (d.fullName || "").toLowerCase().includes(q) ||
        (d.specialization || "").toLowerCase().includes(q) ||
        (d.clinicName || "").toLowerCase().includes(q)
    );
  }, [doctors, doctorSearch]);

  // Doctor Frequent Test Suggestions
  const doctorSuggestedSuggestions = useMemo(() => {
    if (!selectedDoctor || !tests.length) return [];
    const spec = (selectedDoctor.specialization || "").toLowerCase();

    if (spec.includes("cardio")) {
      return tests.filter((t) =>
        ["lipid", "troponin", "ecg", "crp", "cholesterol"].some((k) =>
          t.testName.toLowerCase().includes(k)
        )
      );
    } else if (spec.includes("diabet") || spec.includes("endocrin")) {
      return tests.filter((t) =>
        ["glucose", "hba1c", "insulin", "thyroid", "tsh"].some((k) =>
          t.testName.toLowerCase().includes(k)
        )
      );
    } else if (spec.includes("gyn") || spec.includes("obstet")) {
      return tests.filter((t) =>
        ["hcg", "pregnancy", "pap", "cbc", "rubella", "folic"].some((k) =>
          t.testName.toLowerCase().includes(k)
        )
      );
    } else if (spec.includes("pediatr")) {
      return tests.filter((t) =>
        ["cbc", "bilirubin", "calcium", "blood group", "crp"].some((k) =>
          t.testName.toLowerCase().includes(k)
        )
      );
    }

    // Default general wellness tests
    return tests
      .filter((t) =>
        ["cbc", "complete blood count", "fasting", "lipid", "creatinine"].some((k) =>
          t.testName.toLowerCase().includes(k)
        )
      )
      .slice(0, 4);
  }, [selectedDoctor, tests]);

  // Filtered Tests for Step 3
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        !testSearch.trim() ||
        t.testName.toLowerCase().includes(testSearch.toLowerCase().trim()) ||
        t.testCode.toLowerCase().includes(testSearch.toLowerCase().trim());

      const dept = t.category?.department || t.category?.name || "";
      const matchesDept =
        selectedDepartment === "ALL" ||
        dept.toLowerCase() === selectedDepartment.toLowerCase();

      return matchesSearch && matchesDept;
    });
  }, [tests, testSearch, selectedDepartment]);

  // Toggle Test Selection
  const handleToggleTest = (test: TestItem) => {
    setSelectedTestItems((prev) => {
      const exists = prev.some((item) => item.testId === test.id);
      if (exists) {
        return prev.filter((item) => item.testId !== test.id);
      } else {
        return [...prev, { testId: test.id, test, discount: 0 }];
      }
    });
  };

  // Add all tests from a package/profile
  const handleAddPackage = (pkg: TestPackage) => {
    let addedCount = 0;
    if (pkg.items && pkg.items.length > 0) {
      pkg.items.forEach((item) => {
        if (item.test && !selectedTestItems.some((s) => s.testId === item.testId)) {
          setSelectedTestItems((prev) => [
            ...prev,
            { testId: item.testId, test: item.test, discount: 0 },
          ]);
          addedCount++;
        }
      });
      showToast(`Added ${addedCount} tests from panel "${pkg.packageName}"`, "success");
    } else {
      // If package items not populated, match by test name
      showToast(`Package "${pkg.packageName}" added`, "info");
    }
  };

  // Billing Calculations
  // Note: Pathology/diagnostic lab tests are GST-exempt in India under SAC 999316.
  // Set gstRate = 0. If your lab is registered for GST on non-exempt services,
  // update gstRate accordingly and un-comment the cgst/sgst lines.
  const billingCalculations = useMemo(() => {
    const subtotal = selectedTestItems.reduce(
      (sum, item) => sum + (Number(item.test.price) || 0),
      0
    );

    let calculatedDiscount = 0;
    if (discountType === "PERCENT") {
      calculatedDiscount = (subtotal * Math.min(100, Math.max(0, discountValue))) / 100;
    } else {
      calculatedDiscount = Math.min(subtotal, Math.max(0, discountValue));
    }

    const taxableAmount = Math.max(0, subtotal - calculatedDiscount);
    const gstRate = 0; // Pathology tests: GST-exempt (SAC 999316)
    const gstAmount = taxableAmount * gstRate;
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    const grandTotal = Math.round(taxableAmount + gstAmount); // equals taxableAmount when gstRate=0
    const dueAmount = Math.max(0, grandTotal - paidAmount);

    return {
      subtotal,
      calculatedDiscount,
      taxableAmount,
      gstAmount,
      cgstAmount,
      sgstAmount,
      grandTotal,
      dueAmount,
    };
  }, [selectedTestItems, discountType, discountValue, paidAmount]);

  // Group selected tests by tube container for phlebotomy preparation
  const requiredTubesSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        badge: ReturnType<typeof getVacutainerBadge>;
        testNames: string[];
      }
    >();

    selectedTestItems.forEach((item) => {
      const badge = getVacutainerBadge(item.test.testName, item.test.sampleType);
      if (!map.has(badge.type)) {
        map.set(badge.type, { badge, testNames: [] });
      }
      map.get(badge.type)!.testNames.push(item.test.testName);
    });

    return Array.from(map.values());
  }, [selectedTestItems]);

  // Clinical Gender & Age Validation Check
  const clinicalWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!selectedPatient) return warnings;

    const gender = (selectedPatient.gender || "").toUpperCase();

    // Check tests against gender
    selectedTestItems.forEach((item) => {
      const name = item.test.testName.toLowerCase();
      const code = item.test.testCode.toLowerCase();

      // Male-specific tests
      if (
        (name.includes("psa") ||
          name.includes("prostate") ||
          name.includes("semen")) &&
        gender === "FEMALE"
      ) {
        warnings.push(
          `Test "${item.test.testName}" is typically contraindicated or not applicable for Female patients.`
        );
      }

      // Female-specific tests
      if (
        (name.includes("pregnancy") ||
          name.includes("beta hcg") ||
          name.includes("pap smear") ||
          name.includes("ovarian") ||
          name.includes("estrogen") ||
          name.includes("amh")) &&
        gender === "MALE"
      ) {
        warnings.push(
          `Test "${item.test.testName}" is typically indicated for Female patients.`
        );
      }
    });

    return warnings;
  }, [selectedPatient, selectedTestItems]);

  // Step Validation logic
  const validateStep = (stepNumber: number): boolean => {
    setGeneralError("");

    if (stepNumber === 1) {
      if (!selectedPatient) {
        setGeneralError("Please select an existing patient or register a new patient to proceed.");
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      // Referring doctor is optional (can be self/walk-in)
      return true;
    }

    if (stepNumber === 3) {
      if (selectedTestItems.length === 0) {
        setGeneralError("Please select at least one laboratory test or package to continue.");
        return false;
      }
      return true;
    }

    if (stepNumber === 4) {
      if (collectionType === "HOME_COLLECTION" && !homeAddress.trim()) {
        setGeneralError("Please enter the home collection address.");
        return false;
      }
      return true;
    }

    if (stepNumber === 5) {
      if (billingCalculations.calculatedDiscount > 0 && !discountReason.trim()) {
        setGeneralError("Audit compliance requires a reason or approval note when providing a discount.");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(6, prev + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setGeneralError("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Order Creation
  const handleFinalSubmit = async (statusOverride?: "DRAFT" | "REGISTERED", addAnother = false) => {
    setGeneralError("");
    setSubmitting(true);

    try {
      if (!selectedPatient) {
        throw new Error("Patient selection is missing.");
      }

      if (selectedTestItems.length === 0) {
        throw new Error("No tests selected for this order.");
      }

      const orderPayload = {
        patientId: selectedPatient.id,
        doctorId: isSelfReferral ? undefined : selectedDoctor?.id || undefined,
        orderStatus: statusOverride || "REGISTERED",
        priority,
        collectionType,
        homeCollectionAddress: collectionType === "HOME_COLLECTION" ? homeAddress : undefined,
        notes: [
          clinicalNotes,
          fastingStatus !== "NOT_REQUIRED" ? `Fasting: ${fastingStatus}` : "",
          discountReason ? `Discount note: ${discountReason}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
        discount: billingCalculations.calculatedDiscount,
        discountCode: discountReason || undefined,
        paidAmount,
        paymentMethod,
        paymentNotes: paymentNotes || `Advance payment via ${paymentMethod}`,
        items: selectedTestItems.map((item) => ({
          testId: item.testId,
          discount: item.discount || 0,
        })),
      };

      const response = await orderApi.create(orderPayload);

      if (response && (response.success || response.data || response.id)) {
        const created = response.data?.order || response.data || response;
        showToast(`Order #${created.orderNumber || "New"} generated successfully!`, "success");

        if (addAnother) {
          // Reset wizard state for next order
          setSelectedPatient(null);
          setSelectedDoctor(null);
          setIsSelfReferral(false);
          setSelectedTestItems([]);
          setPaidAmount(0);
          setDiscountValue(0);
          setDiscountReason("");
          setClinicalNotes("");
          setCurrentStep(1);
        } else {
          setCreatedOrderSummary(created);
        }
      } else {
        throw new Error(response?.message || "Failed to create order");
      }
    } catch (err: any) {
      console.error("Order submission error:", err);
      setGeneralError(err.message || "Failed to submit order. Please check all fields.");
      showToast(err.message || "Failed to create order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Step indicator items
  const steps = [
    { num: 1, label: "Patient", icon: User },
    { num: 2, label: "Doctor", icon: Stethoscope },
    { num: 3, label: "Tests & Profiles", icon: FlaskConical },
    { num: 4, label: "Schedule", icon: Clock },
    { num: 5, label: "Billing", icon: CreditCard },
    { num: 6, label: "Review", icon: CheckCircle2 },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="New Order Registration">
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          {/* Breadcrumb & Top Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to All Orders</span>
            </Link>

            <span className="text-xs font-mono text-slate-400">
              LabCore ELIS • Requisition Flow
            </span>
          </div>

          {/* Wizard Card */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            {/* Wizard Header Stepper */}
            <div className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 px-6 py-5">
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  const isCurrent = currentStep === step.num;
                  const isCompleted = currentStep > step.num;

                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => {
                        // Allow navigating back to completed steps
                        if (step.num < currentStep) {
                          setCurrentStep(step.num);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                        isCurrent
                          ? "bg-blue-600 text-white shadow-md scale-[1.02]"
                          : isCompleted
                          ? "text-emerald-700 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          : "text-slate-400 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? "bg-white/20 text-white"
                            : isCompleted
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isCompleted ? "✓" : step.num}
                      </div>
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Step Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* Error Banner */}
            {generalError && (
              <div className="mx-6 mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <p className="font-medium">{generalError}</p>
              </div>
            )}

            {/* Wizard Body Content */}
            <div className="p-6 md:p-8">
              {/* ==================================================== */}
              {/* STEP 1: PATIENT SELECTION */}
              {/* ==================================================== */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Step 1: Patient Identification
                      </h2>
                      <p className="text-xs text-slate-500">
                        Search existing patient database by UHID, phone number or name, or quick-register a new patient
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPatientRegisterModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Quick Register Patient
                    </button>
                  </div>

                  {/* Selected Patient Banner */}
                  {selectedPatient ? (
                    <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <PatientIdentityMark
                          firstName={selectedPatient.firstName}
                          lastName={selectedPatient.lastName}
                          gender={selectedPatient.gender}
                          size="card"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              {selectedPatient.firstName} {selectedPatient.lastName}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 uppercase">
                              {selectedPatient.gender}
                            </span>
                            {selectedPatient.bloodGroup && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                                {selectedPatient.bloodGroup}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
                            UHID: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPatient.uhid}</span> • Phone: {selectedPatient.phone}
                          </p>
                          {selectedPatient.address && (
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {selectedPatient.address}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedPatient(null)}
                        className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Change Patient
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search patient by UHID (e.g. UHID-1001), Name, or Mobile Number..."
                          value={patientSearch}
                          onChange={(e) => setPatientSearch(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                        />
                      </div>

                      {/* Patient Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                        {filteredPatients.length === 0 ? (
                          <div className="col-span-2 py-10 text-center text-slate-400 text-xs">
                            <User className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p className="font-medium">No matching patient found</p>
                            <p className="text-[11px] mt-1">
                              Click "Quick Register Patient" above to register immediately
                            </p>
                          </div>
                        ) : (
                          filteredPatients.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPatient(p)}
                              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition-all flex items-center justify-between group shadow-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  {p.firstName.charAt(0)}
                                  {p.lastName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    {p.firstName} {p.lastName}
                                  </p>
                                  <p className="text-[10px] font-mono text-slate-500">
                                    {p.uhid} • {p.gender} • {p.phone}
                                  </p>
                                </div>
                              </div>

                              <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                Select →
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* STEP 2: REFERRING DOCTOR */}
              {/* ==================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                        Step 2: Referring Doctor
                      </h2>
                      <p className="text-xs text-slate-500">
                        Specify the referring consultant, clinic, or choose Self/Walk-in
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSelfReferral(true);
                          setSelectedDoctor(null);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          isSelfReferral
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                            : "bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        Self / Direct Walk-in
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDoctorAddModal(true)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Doctor
                      </button>
                    </div>
                  </div>

                  {isSelfReferral ? (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center py-8">
                      <UserCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Self-Referred / Patient Walk-in
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        No referring doctor assigned. Test reports will be directly issued to the patient.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsSelfReferral(false)}
                        className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Choose a Referring Doctor Instead
                      </button>
                    </div>
                  ) : selectedDoctor ? (
                    <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                          Dr
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {selectedDoctor.fullName}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {selectedDoctor.specialization || "General Medicine"}
                            {selectedDoctor.clinicName ? ` • ${selectedDoctor.clinicName}` : ""}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDoctor(null)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Change Doctor
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search doctor by name, clinic, or specialization..."
                          value={doctorSearch}
                          onChange={(e) => setDoctorSearch(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                        />
                      </div>

                      {/* Doctor Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                        {filteredDoctors.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setSelectedDoctor(doc);
                              setIsSelfReferral(false);
                            }}
                            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition-all flex items-center justify-between group shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                Dr
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                  {doc.fullName}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {doc.specialization || "General Physician"}{" "}
                                  {doc.clinicName ? `• ${doc.clinicName}` : ""}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Select →
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Pattern Suggested Tests */}
                  {selectedDoctor && doctorSuggestedSuggestions.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                        Suggested Tests based on {selectedDoctor.fullName} ({selectedDoctor.specialization || "Practitioner"}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {doctorSuggestedSuggestions.map((t) => {
                          const isSelected = selectedTestItems.some((s) => s.testId === t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleToggleTest(t)}
                              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-slate-700 border-amber-200 hover:bg-amber-100"
                              }`}
                            >
                              <span>{t.testName}</span>
                              <span className="text-[10px] opacity-80">₹{t.price}</span>
                              {isSelected ? "✓" : "+"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* STEP 3: TEST CATALOG & PANELS */}
              {/* ==================================================== */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-blue-600" />
                        Step 3: Test Requisition & Packages
                      </h2>
                      <p className="text-xs text-slate-500">
                        Select single pathology tests or one-click bundled health profiles
                      </p>
                    </div>

                    {/* Tests vs Packages Toggle */}
                    <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                      <button
                        type="button"
                        onClick={() => setActiveCatalogTab("TESTS")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeCatalogTab === "TESTS"
                            ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        Individual Tests ({tests.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCatalogTab("PACKAGES")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeCatalogTab === "PACKAGES"
                            ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        Health Profiles & Packages ({packages.length})
                      </button>
                    </div>
                  </div>

                  {/* Selected Tests Summary Tray */}
                  {selectedTestItems.length > 0 && (
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-100 dark:border-blue-900/60">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          Selected Tests ({selectedTestItems.length})
                        </span>
                        <span className="text-xs font-black text-blue-900 dark:text-blue-100">
                          Subtotal: ₹{billingCalculations.subtotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                        {selectedTestItems.map((item) => (
                          <span
                            key={item.testId}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shadow-xs text-slate-800 dark:text-slate-200"
                          >
                            <span>{item.test.testName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              (₹{item.test.price})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleTest(item.test)}
                              className="text-slate-400 hover:text-rose-600 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Bar & Department Filter Tabs */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search test name or code (e.g. CBC, HbA1c, LFT, Lipid, Creatinine)..."
                        value={testSearch}
                        onChange={(e) => setTestSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                      />
                    </div>

                    {activeCatalogTab === "TESTS" && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {departments.map((dept) => (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => setSelectedDepartment(dept)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                              selectedDepartment === dept
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            {dept}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Catalog Grid */}
                  {activeCatalogTab === "TESTS" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {filteredTests.length === 0 ? (
                        <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
                          <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p className="font-semibold">No tests match your search</p>
                        </div>
                      ) : (
                        filteredTests.map((test) => {
                          const isSelected = selectedTestItems.some(
                            (s) => s.testId === test.id
                          );
                          return (
                            <div
                              key={test.id}
                              onClick={() => handleToggleTest(test)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm"
                                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                    {test.testName}
                                  </h4>
                                  <span
                                    className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                                      isSelected
                                        ? "bg-blue-600 text-white font-bold"
                                        : "border border-slate-300 text-transparent"
                                    }`}
                                  >
                                    ✓
                                  </span>
                                </div>
                                <p className="text-[10px] font-mono text-slate-400 mt-1">
                                  {test.testCode} • {test.sampleType || "Blood"}
                                </p>
                              </div>

                              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                                <span className="text-[10px] text-slate-500">
                                  TAT: {test.tatDisplay || `${test.tatHours || 24} hrs`}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  ₹{test.price}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    /* Packages Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
                      {packages.length === 0 ? (
                        <div className="col-span-2 py-12 text-center text-slate-400 text-xs">
                          <PackageCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p className="font-semibold">No packages configured yet</p>
                        </div>
                      ) : (
                        packages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200">
                                  {pkg.packageCode}
                                </span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                  ₹{pkg.offerPrice || pkg.price || 0}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                                {pkg.packageName}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {pkg.description || "Comprehensive multi-parameter health screening panel."}
                              </p>

                              {pkg.items && pkg.items.length > 0 && (
                                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-2">
                                  Includes {pkg.items.length} tests
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddPackage(pkg)}
                              className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add All Tests in Package
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* STEP 4: PRIORITY & SCHEDULING */}
              {/* ==================================================== */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Step 4: Priority, Collection & Scheduling
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select emergency triage priority and specimen collection preferences
                    </p>
                  </div>

                  {/* Priority Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Order Processing Priority *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Routine */}
                      <button
                        type="button"
                        onClick={() => setPriority("ROUTINE")}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          priority === "ROUTINE"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 mb-2">
                          Standard
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          ROUTINE
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Standard processing queue within standard turnaround times (24-48h).
                        </p>
                      </button>

                      {/* Urgent */}
                      <button
                        type="button"
                        onClick={() => setPriority("URGENT")}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          priority === "URGENT"
                            ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 mb-2">
                          Expedited
                        </span>
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          URGENT
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Prioritized processing. Expected report delivery within 4-6 hours.
                        </p>
                      </button>

                      {/* STAT Emergency */}
                      <button
                        type="button"
                        onClick={() => setPriority("STAT")}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          priority === "STAT"
                            ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 mb-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
                          Emergency
                        </span>
                        <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                          STAT Emergency
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Highest priority for critical clinical intervention. Immediate testing (&lt; 1 hour).
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Collection Type Toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Specimen Collection Venue *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCollectionType("WALK_IN")}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          collectionType === "WALK_IN"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Lab Center / Walk-in
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Patient visits the laboratory phlebotomy collection desk.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCollectionType("HOME_COLLECTION")}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          collectionType === "HOME_COLLECTION"
                            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                          Home Collection Visit
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Phlebotomist visits patient address with sample vacutainer kit.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* If Home Collection: Address & Time Slot */}
                  {collectionType === "HOME_COLLECTION" && (
                    <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-purple-900 dark:text-purple-200 mb-1">
                          Home Collection Address *
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={homeAddress}
                          onChange={(e) => setHomeAddress(e.target.value)}
                          placeholder="Complete street address, apartment / flat number, landmark..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-purple-900 dark:text-purple-200 mb-1">
                            Scheduled Date
                          </label>
                          <input
                            type="date"
                            value={collectionDate}
                            onChange={(e) => setCollectionDate(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-purple-900 dark:text-purple-200 mb-1">
                            Preferred Time Window
                          </label>
                          <select
                            value={collectionTimeSlot}
                            onChange={(e) => setCollectionTimeSlot(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="07:00 - 09:00 AM">Early Morning (07:00 - 09:00 AM)</option>
                            <option value="09:00 - 11:00 AM">Morning (09:00 - 11:00 AM)</option>
                            <option value="11:00 AM - 01:00 PM">Noon (11:00 AM - 01:00 PM)</option>
                            <option value="04:00 - 06:00 PM">Evening (04:00 - 06:00 PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fasting & Clinical Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Patient Fasting Status
                      </label>
                      <select
                        value={fastingStatus}
                        onChange={(e) => setFastingStatus(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="NOT_REQUIRED">Fasting Not Required</option>
                        <option value="FASTING_12H">Overnight Fasting (10-12 hrs)</option>
                        <option value="POST_PRANDIAL">Post-Prandial (2 hrs after meal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Clinical & Phlebotomy Notes
                      </label>
                      <input
                        type="text"
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder="e.g. History of fever x 4 days, fragile veins, cold chain"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* STEP 5: BILLING & ADVANCE PAYMENT */}
              {/* ==================================================== */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Step 5: Pricing, Concessions & Advance Billing
                    </h2>
                    <p className="text-xs text-slate-500">
                      Review automatic price calculations, apply audited discounts, and record payment
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Discount & Payment Form */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Discount Section */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Percent className="h-4 w-4 text-blue-600" />
                          Discount / Concession (Optional)
                        </h4>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={() => setDiscountType("FLAT")}
                              className={`flex-1 py-1.5 text-xs font-bold transition-colors ${
                                discountType === "FLAT"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              ₹ Flat
                            </button>
                            <button
                              type="button"
                              onClick={() => setDiscountType("PERCENT")}
                              className={`flex-1 py-1.5 text-xs font-bold transition-colors ${
                                discountType === "PERCENT"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              % Percent
                            </button>
                          </div>

                          <input
                            type="number"
                            min={0}
                            value={discountValue || ""}
                            onChange={(e) => setDiscountValue(Number(e.target.value))}
                            placeholder={discountType === "PERCENT" ? "e.g. 10%" : "e.g. ₹100"}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {discountValue > 0 && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Discount Reason / Approval Note * (Audit Compliance)
                            </label>
                            <input
                              type="text"
                              required
                              value={discountReason}
                              onChange={(e) => setDiscountReason(e.target.value)}
                              placeholder="e.g. Senior citizen concession, B2B clinic referral, Doctor authorized"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Advance Payment Collection */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          Advance Payment Collection
                        </h4>

                        <div className="grid grid-cols-4 gap-2">
                          {["CASH", "UPI", "CARD", "PAY_LATER"].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setPaymentMethod(m);
                                if (m === "PAY_LATER") {
                                  setPaidAmount(0);
                                } else if (paidAmount === 0) {
                                  setPaidAmount(billingCalculations.grandTotal);
                                }
                              }}
                              className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                                paymentMethod === m
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {m === "PAY_LATER" ? "Pay Later" : m}
                            </button>
                          ))}
                        </div>

                        {paymentMethod !== "PAY_LATER" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <label className="font-semibold text-slate-700 dark:text-slate-300">
                                Amount Paid (₹)
                              </label>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => setPaidAmount(billingCalculations.grandTotal)}
                                  className="text-[10px] text-blue-600 font-semibold hover:underline"
                                >
                                  Full (₹{billingCalculations.grandTotal})
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPaidAmount(Math.round(billingCalculations.grandTotal / 2))
                                  }
                                  className="text-[10px] text-blue-600 font-semibold hover:underline"
                                >
                                  50% Advance
                                </button>
                              </div>
                            </div>

                            <input
                              type="number"
                              min={0}
                              max={billingCalculations.grandTotal}
                              value={paidAmount || ""}
                              onChange={(e) => setPaidAmount(Number(e.target.value))}
                              className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Itemized Financial Summary Card */}
                    <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 text-white shadow-xl space-y-4 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Requisition Invoice Summary
                        </span>

                        <div className="mt-4 space-y-2 text-xs border-b border-slate-800 pb-3">
                          <div className="flex justify-between text-slate-300">
                            <span>Subtotal ({selectedTestItems.length} tests)</span>
                            <span className="font-mono">
                              ₹{billingCalculations.subtotal.toLocaleString("en-IN")}
                            </span>
                          </div>

                          {billingCalculations.calculatedDiscount > 0 && (
                            <div className="flex justify-between text-amber-400 font-medium">
                              <span>Discount Concession</span>
                              <span className="font-mono">
                                -₹{billingCalculations.calculatedDiscount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between text-slate-300">
                            <span>Taxable Value</span>
                            <span className="font-mono">
                              ₹{billingCalculations.taxableAmount.toLocaleString("en-IN")}
                            </span>
                          </div>

                          {billingCalculations.gstAmount > 0 ? (
                            <div className="flex justify-between text-slate-400 text-[11px]">
                              <span>GST (CGST + SGST)</span>
                              <span className="font-mono">
                                ₹{billingCalculations.gstAmount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-between text-emerald-400/70 text-[10px]">
                              <span>GST</span>
                              <span className="font-mono italic">Exempt (SAC 999316)</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 flex justify-between items-baseline">
                          <span className="text-sm font-bold">Grand Total</span>
                          <span className="text-2xl font-black text-white font-mono">
                            ₹{billingCalculations.grandTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs">
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>Amount Paid Now:</span>
                          <span className="font-mono">
                            ₹{paidAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between text-rose-400 font-bold">
                          <span>Balance Due Amount:</span>
                          <span className="font-mono">
                            ₹{billingCalculations.dueAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* STEP 6: REVIEW & CONFIRM */}
              {/* ==================================================== */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      Step 6: Review & Finalize Order
                    </h2>
                    <p className="text-xs text-slate-500">
                      Verify all patient demographics, prescribed tests, emergency triage, and billing details
                    </p>
                  </div>

                  {/* Clinical Compatibility Warnings */}
                  {clinicalWarnings.length > 0 && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Clinical Appropriateness / Gender Alert</span>
                      </div>
                      <ul className="list-disc list-inside text-xs text-rose-700 dark:text-rose-300 space-y-1">
                        {clinicalWarnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Comprehensive Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Patient & Doctor */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Patient & Referring Doctor
                      </h4>

                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {selectedPatient?.firstName} {selectedPatient?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          UHID: {selectedPatient?.uhid} • {selectedPatient?.gender} • Phone: {selectedPatient?.phone}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isSelfReferral ? "Self / Walk-in" : selectedDoctor?.fullName || "Unassigned"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isSelfReferral ? "Direct Patient Walk-in" : selectedDoctor?.specialization || "General Practice"}
                        </p>
                      </div>
                    </div>

                    {/* Priority & Scheduling */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Priority & Scheduling
                      </h4>

                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={priority} />
                        <span className="text-xs text-slate-500">
                          {collectionType === "HOME_COLLECTION" ? "Home Collection Visit" : "Lab Walk-in"}
                        </span>
                      </div>

                      {collectionType === "HOME_COLLECTION" && (
                        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                          Scheduled: {collectionDate} ({collectionTimeSlot}) • {homeAddress}
                        </p>
                      )}

                      {fastingStatus !== "NOT_REQUIRED" && (
                        <p className="text-xs text-amber-600 font-semibold">
                          Fasting: {fastingStatus}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Test List Review */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Prescribed Test Requisitions ({selectedTestItems.length})
                    </h4>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto pr-1">
                      {selectedTestItems.map((item) => (
                        <div
                          key={item.testId}
                          className="py-2 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.test.testName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">
                              {item.test.testCode} • {item.test.sampleType}
                            </span>
                          </div>
                          <span className="font-bold font-mono text-slate-900 dark:text-white">
                            ₹{item.test.price}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-bold">
                      <span>Total Net Payable:</span>
                      <span className="text-base text-blue-600 dark:text-blue-400">
                        ₹{billingCalculations.grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {currentStep === 6 ? (
                  <>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleFinalSubmit("DRAFT")}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-colors"
                    >
                      Save as Draft
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleFinalSubmit("REGISTERED", true)}
                      className="px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800 rounded-xl hover:bg-blue-100 disabled:opacity-50 transition-colors"
                    >
                      Save & Add Another
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleFinalSubmit("REGISTERED")}
                      className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      {submitting ? "Registering..." : "Confirm & Create Order"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <PatientQuickRegisterModal
          isOpen={showPatientRegisterModal}
          onClose={() => setShowPatientRegisterModal(false)}
          onPatientCreated={(newPatient) => {
            setPatients((prev) => [newPatient, ...prev]);
            setSelectedPatient(newPatient);
            showToast(`Patient ${newPatient.firstName} registered and selected!`, "success");
          }}
        />

        <DoctorQuickAddModal
          isOpen={showDoctorAddModal}
          onClose={() => setShowDoctorAddModal(false)}
          onDoctorCreated={(newDoc) => {
            setDoctors((prev) => [newDoc, ...prev]);
            setSelectedDoctor(newDoc);
            setIsSelfReferral(false);
            showToast(`Doctor ${newDoc.fullName} added and selected!`, "success");
          }}
        />

        {/* Post-Registration Success Modal */}
        {createdOrderSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Order Registered Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Order requisition has been created and barcode generated for sample tube labeling.
              </p>

              <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Order Number:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {createdOrderSummary.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Tube Barcode:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {createdOrderSummary.barcode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {createdOrderSummary.patient?.firstName} {createdOrderSummary.patient?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Bill:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{createdOrderSummary.grandTotal || 0}
                  </span>
                </div>
              </div>

              <div className="p-3.5 mb-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 text-left flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Instant Patient Notification
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Send invoice & tracking via WhatsApp or Email
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPostCommunicationHub(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Notify Patient</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <a
                  href={`/orders/${createdOrderSummary.id}/barcode`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 hover:bg-purple-100 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Barcodes
                </a>

                <a
                  href={`/orders/${createdOrderSummary.id}/receipt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Print Receipt
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <a
                  href={`/samples/collect?orderId=${createdOrderSummary.id}`}
                  className="py-2 px-2 rounded-xl text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 hover:bg-amber-100 flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <FlaskConical className="h-4 w-4" />
                  Collect Sample
                </a>
                <a
                  href={`/invoices?orderId=${createdOrderSummary.id}`}
                  className="py-2 px-2 rounded-xl text-[11px] font-bold text-sky-700 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 hover:bg-sky-100 flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Invoice
                </a>
                <a
                  href={`/payments?orderId=${createdOrderSummary.id}&amount=${createdOrderSummary.dueAmount ?? createdOrderSummary.grandTotal ?? 0}`}
                  className="py-2 px-2 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 hover:bg-emerald-100 flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <DollarSign className="h-4 w-4" />
                  Payment
                </a>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setCreatedOrderSummary(null);
                    router.push("/orders");
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
                >
                  Go to Orders Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Patient Registration Modal */}
        <PatientQuickRegisterModal
          isOpen={showPatientRegisterModal}
          onClose={() => setShowPatientRegisterModal(false)}
          onPatientCreated={(newPatient) => {
            setPatients((prev) => [newPatient, ...prev]);
            setSelectedPatient(newPatient);
            setShowPatientRegisterModal(false);
            showToast(`Patient ${newPatient.firstName} ${newPatient.lastName} registered!`, "success");
          }}
        />

        {/* Quick Doctor Registration Wizard */}
        <RegisterDoctorWizard
          isOpen={showDoctorAddModal}
          onClose={() => setShowDoctorAddModal(false)}
          onSuccess={() => {
            setShowDoctorAddModal(false);
            doctorApi.getAll({ limit: 10, sortBy: "createdAt", sortOrder: "desc" }).then((res: any) => {
              const list = res?.data?.doctors || res?.data || [];
              if (list.length > 0) {
                setDoctors(list);
                setSelectedDoctor(list[0]);
                setIsSelfReferral(false);
                showToast(`Doctor ${list[0].fullName} linked to order!`, "success");
              }
            });
          }}
        />

        {/* Post-Registration Multi-Channel Communication Hub Modal */}
        {showPostCommunicationHub && createdOrderSummary && (
          <OrderCommunicationHubModal
            isOpen={showPostCommunicationHub}
            onClose={() => setShowPostCommunicationHub(false)}
            order={createdOrderSummary}
            onSuccess={({ channel, recipient }) => {
              showToast(`Notification dispatched via ${channel} to ${recipient}!`, "success");
            }}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
