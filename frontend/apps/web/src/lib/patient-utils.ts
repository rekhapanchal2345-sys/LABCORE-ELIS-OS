/**
 * Patient Identity, Clinical Demographics & ABDM Utility Functions
 * Single Source of Truth for LabCore ELIS LIS (India NABL / ISO 15189 / ABDM / DPDP Act 2023)
 */

export interface PatientNameFields {
  title?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
}

/**
 * Format full patient name consistently, handling title, first, middle, last name.
 * Prevents "null", "undefined", double spaces, or missing names.
 */
export function formatPatientFullName(patient?: any | null): string {
  if (!patient) return "Unnamed Patient";

  if (typeof patient === "string") {
    return patient.trim() || "Unnamed Patient";
  }

  const parts = [
    patient.title?.trim(),
    patient.firstName?.trim(),
    patient.middleName?.trim(),
    patient.lastName?.trim(),
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(" ");

  if (typeof patient.fullName === "string" && patient.fullName.trim()) {
    return patient.fullName.trim();
  }
  if (typeof patient.name === "string" && patient.name.trim()) {
    return patient.name.trim();
  }

  return "Unnamed Patient";
}

/**
 * Parses full name string into structured title, firstName, middleName, lastName.
 * Handles Indian 3-part names (e.g. "PANCHAL MAYURKUMAR ASHOKKUMAR").
 */
export function parseFullName(input?: string | null): {
  title?: string;
  firstName: string;
  middleName: string;
  lastName: string;
} {
  if (!input || !input.trim()) {
    return { firstName: "", middleName: "", lastName: "" };
  }

  const KNOWN_TITLES = ["MR", "MR.", "MRS", "MRS.", "MS", "MS.", "DR", "DR.", "MASTER", "BABY", "SHREE", "SMT", "SMT."];
  const tokens = input.trim().split(/\s+/).filter(Boolean);

  let title: string | undefined = undefined;
  if (tokens.length > 1 && KNOWN_TITLES.includes(tokens[0].toUpperCase())) {
    title = tokens.shift();
  }

  if (tokens.length === 1) {
    return { title, firstName: tokens[0], middleName: "", lastName: "" };
  }
  if (tokens.length === 2) {
    return { title, firstName: tokens[0], middleName: "", lastName: tokens[1] };
  }
  if (tokens.length === 3) {
    return { title, firstName: tokens[0], middleName: tokens[1], lastName: tokens[2] };
  }
  
  // 4 or more tokens: first token is firstName, last token is lastName, middle tokens are joined as middleName
  const firstName = tokens[0];
  const lastName = tokens[tokens.length - 1];
  const middleName = tokens.slice(1, -1).join(" ");
  return { title, firstName, middleName, lastName };
}

export interface ClinicalAgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  formatted: string;
  isPediatric: boolean;
  isNewborn: boolean;
  isInfant: boolean;
  isSenior: boolean;
}

/**
 * Calculates exact clinical age handling newborns, infants, pediatrics, and leap years.
 * - Newborn: <= 28 days (displays "X days" or "Newborn")
 * - Infant: < 1 year (displays "X months" or "Xm Yd")
 * - Child: 1 - 5 years (displays "X yrs Y mos")
 * - Adult / Senior: >= 6 years (displays "X yrs")
 */
export function calculateClinicalAge(
  dateOfBirth?: string | Date | null,
  ageFallback?: number | null
): ClinicalAgeResult {
  if (!dateOfBirth) {
    const fallbackYears = typeof ageFallback === "number" && !isNaN(ageFallback) && ageFallback >= 0 ? ageFallback : null;
    if (fallbackYears !== null) {
      return {
        years: fallbackYears,
        months: 0,
        days: 0,
        totalDays: fallbackYears * 365,
        formatted: fallbackYears === 0 ? "Newborn" : `${fallbackYears} yrs`,
        isPediatric: fallbackYears < 18,
        isNewborn: fallbackYears === 0,
        isInfant: fallbackYears === 0,
        isSenior: fallbackYears >= 60,
      };
    }
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      formatted: "Age N/A",
      isPediatric: false,
      isNewborn: false,
      isInfant: false,
      isSenior: false,
    };
  }

  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) {
    return calculateClinicalAge(null, ageFallback);
  }

  const today = new Date();
  // Prevent future DOB error
  if (birthDate > today) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      formatted: "Invalid DOB (Future)",
      isPediatric: true,
      isNewborn: true,
      isInfant: true,
      isSenior: false,
    };
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    // Days in previous month
    const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffTime = Math.abs(today.getTime() - birthDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const isNewborn = totalDays <= 28;
  const isInfant = totalDays < 365;
  const isPediatric = years < 18;
  const isSenior = years >= 60;

  let formatted = "";
  if (totalDays === 0) {
    formatted = "Newborn (Day 0)";
  } else if (isNewborn) {
    formatted = `${totalDays} ${totalDays === 1 ? "day" : "days"}`;
  } else if (isInfant) {
    if (months === 0) {
      formatted = `${days} days`;
    } else if (days === 0) {
      formatted = `${months} ${months === 1 ? "month" : "months"}`;
    } else {
      formatted = `${months}m ${days}d`;
    }
  } else if (years < 5) {
    formatted = months > 0 ? `${years}y ${months}m` : `${years} yrs`;
  } else {
    formatted = `${years} yrs`;
  }

  return {
    years,
    months,
    days,
    totalDays,
    formatted,
    isPediatric,
    isNewborn,
    isInfant,
    isSenior,
  };
}

export interface FormattedPhoneResult {
  display: string;
  e164: string;
  rawDigits: string;
  isValid: boolean;
}

/**
 * Validates and formats Indian mobile numbers to standard E.164 and clean visual display.
 * Example: "9876543210" -> display: "+91 98765 43210", e164: "+919876543210"
 */
export function formatIndianPhone(phone?: string | null): FormattedPhoneResult {
  if (!phone) {
    return { display: "Not on file", e164: "", rawDigits: "", isValid: false };
  }

  let digits = phone.replace(/\D/g, "");

  // Handle +91 prefix
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  const isValid = digits.length === 10 && /^[6-9]/.test(digits);

  if (!isValid) {
    return {
      display: phone.trim() || "Invalid Phone",
      e164: digits ? `+${digits}` : "",
      rawDigits: digits,
      isValid: false,
    };
  }

  // Format as "+91 XXXXX XXXXX"
  const formattedDisplay = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  const e164 = `+91${digits}`;

  return {
    display: formattedDisplay,
    e164,
    rawDigits: digits,
    isValid: true,
  };
}

/**
 * Normalizes blood group codes to standard clinical symbols (e.g. A_POSITIVE -> A+)
 */
export function formatBloodGroup(bloodGroup?: string | null): string {
  if (!bloodGroup) return "N/A";
  const clean = bloodGroup.trim().toUpperCase();

  const map: Record<string, string> = {
    A_POSITIVE: "A+",
    A_POS: "A+",
    APOSITIVE: "A+",
    "A+": "A+",
    A_NEGATIVE: "A-",
    A_NEG: "A-",
    ANEGATIVE: "A-",
    "A-": "A-",
    B_POSITIVE: "B+",
    B_POS: "B+",
    BPOSITIVE: "B+",
    "B+": "B+",
    B_NEGATIVE: "B-",
    B_NEG: "B-",
    BNEGATIVE: "B-",
    "B-": "B-",
    AB_POSITIVE: "AB+",
    AB_POS: "AB+",
    ABPOSITIVE: "AB+",
    "AB+": "AB+",
    AB_NEGATIVE: "AB-",
    AB_NEG: "AB-",
    ABNEGATIVE: "AB-",
    "AB-": "AB-",
    O_POSITIVE: "O+",
    O_POS: "O+",
    OPOSITIVE: "O+",
    "O+": "O+",
    O_NEGATIVE: "O-",
    O_NEG: "O-",
    ONEGATIVE: "O-",
    "O-": "O-",
    BOMBAY: "Bombay (hh)",
    "BOMBAY (HH)": "Bombay (hh)",
  };

  return map[clean] || bloodGroup.replace("_", "+");
}

/**
 * Formats 14-digit ABHA number into standard ABDM format (12-3456-7890-1234)
 */
export function formatAbhaNumber(abhaNumber?: string | null): string {
  if (!abhaNumber) return "";
  const digits = abhaNumber.replace(/\D/g, "");
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4");
  }
  return abhaNumber;
}

/**
 * Sanitizes dirty medical condition strings entered in free text or default placeholders.
 * Filters out "NO", "NONE", "Normal Profile", "null", "N/A", "nil", "-", etc.
 */
export function sanitizeMedicalConditions(input?: string | string[] | null): string[] {
  if (!input) return [];

  const rawList: string[] = Array.isArray(input)
    ? input
    : typeof input === "string"
    ? input.split(/[,;\n]/)
    : [];

  const junkPlaceholders = new Set([
    "no",
    "none",
    "nil",
    "na",
    "n/a",
    "null",
    "undefined",
    "normal",
    "normal profile",
    "no known medical conditions",
    "no known allergies",
    "no chronic conditions",
    "-",
    ".",
    "none reported",
  ]);

  return rawList
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && !junkPlaceholders.has(item.toLowerCase()));
}
