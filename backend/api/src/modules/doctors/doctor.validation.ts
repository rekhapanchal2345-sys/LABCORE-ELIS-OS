import { z } from "zod";

// =======================================================
// FORMAT VALIDATORS (Indian context)
// =======================================================

/** Strips spaces/dashes/parentheses and normalises to +91XXXXXXXXXX. */
export const normalisePhone = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  // 10-digit local number, or a number that already carries the 91 prefix.
  const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.slice(-10);
  return `+91${ten}`;
};

const PHONE_RE = /^\+91[6-9]\d{9}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_RE = /^[a-zA-Z0-9._-]{2,64}@[a-zA-Z][a-zA-Z0-9]{2,32}$/;
const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;
const PINCODE_RE = /^[1-9]\d{5}$/;

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => normalisePhone(v))
  .refine((v) => !!v && PHONE_RE.test(v), {
    message: "Enter a valid 10-digit Indian mobile number",
  });

export const ifscSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(IFSC_RE, { message: "Invalid IFSC code (expected format: ABCD0123456)" });

export const upiSchema = z
  .string()
  .trim()
  .regex(UPI_RE, { message: "Invalid UPI ID (expected format: name@bank)" });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: "Enter a valid email address" });

export const panSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(PAN_RE, { message: "Invalid PAN (expected format: ABCDE1234F)" });

export const gstinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(GSTIN_RE, { message: "Invalid GSTIN (expected 15-character format)" });

export const pincodeSchema = z
  .string()
  .trim()
  .regex(PINCODE_RE, { message: "Invalid PIN code (expected 6 digits)" });

// =======================================================
// ENUMS
// =======================================================

export const DOCTOR_TYPES = [
  "REFERRING_DOCTOR",
  "IN_HOUSE_PATHOLOGIST",
  "INTERNAL_PATHOLOGIST",
  "CONSULTANT_PATHOLOGIST",
  "CONSULTANT",
  "HOSPITAL_PARTNER",
  "CLINIC_PARTNER",
] as const;

export const COMMISSION_TYPES = [
  "PERCENTAGE",
  "FLAT_PER_PATIENT",
  "CATEGORY_WISE",
  "NONE",
] as const;

export const PAYOUT_CYCLES = ["WEEKLY", "MONTHLY"] as const;

export const ORGANIZATION_TYPES = [
  "HOSPITAL",
  "CLINIC",
  "DIAGNOSTIC_CENTER",
  "CORPORATE",
] as const;

/** Doctor types whose report sign-off requires a digital signature. */
export const PATHOLOGIST_TYPES = [
  "IN_HOUSE_PATHOLOGIST",
  "INTERNAL_PATHOLOGIST",
  "CONSULTANT_PATHOLOGIST",
] as const;

/** Doctor types that never earn referral commission. */
export const NON_COMMISSION_TYPES = [
  "IN_HOUSE_PATHOLOGIST",
  "INTERNAL_PATHOLOGIST",
  "CONSULTANT_PATHOLOGIST",
  "CONSULTANT",
] as const;
// __PART2__

/** Optional text that is treated as "not provided" when blank. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .nullable()
    .optional();

const optionalPhone = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v ? normalisePhone(v) : undefined))
  .refine((v) => v === undefined || PHONE_RE.test(v), {
    message: "Enter a valid 10-digit Indian mobile number",
  });

const optionalEmail = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (!v) return undefined;
    const t = String(v).trim().toLowerCase();
    return t === "" ? undefined : t;
  })
  .refine((v) => v === undefined || z.string().email().safeParse(v).success, {
    message: "Enter a valid email address",
  });

const optionalPincode = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v ? String(v).trim() : undefined))
  .refine((v) => v === undefined || v === "" || PINCODE_RE.test(v), {
    message: "Invalid PIN code (expected 6 digits)",
  })
  .nullable()
  .optional();

const baseDoctorShape = {
  // ---- Identity ----
  doctorCode: z.string().trim().min(2).max(50).optional(),
  fullName: z.string().trim().min(2, "Doctor name is required").max(150).optional(),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  middleName: optionalText(100),
  title: z.enum(["Dr.", "Prof.", "Dr.Prof.", "Mr.", "Ms.", "Mrs.", ""]).optional(),

  // ---- Clinical ----
  qualification: optionalText(150),
  specialization: optionalText(150),
  department: optionalText(100),
  designation: optionalText(100),
  doctorType: z.enum(DOCTOR_TYPES).optional(),
  experience: z.coerce.number().min(0).max(100).optional(),
  experienceYears: z.coerce.number().min(0).max(70).optional(),
  consultationFee: z.coerce.number().min(0).optional(),
  licenseNumber: optionalText(100),
  licenseExpiry: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ? new Date(v as string) : undefined))
    .nullable()
    .optional(),
  availableDays: optionalText(200),
  availableTime: optionalText(100),
  languages: optionalText(300),
  notes: optionalText(2000),

  // ---- Personal ----
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z
    .union([z.string(), z.null()])
    .optional()
    .refine((v) => {
      if (!v) return true;
      const d = new Date(v as string);
      if (Number.isNaN(d.getTime())) return false;
      return d.getTime() <= Date.now() && d.getFullYear() >= 1920;
    }, { message: "Enter a valid date of birth" })
    .transform((v) => (v ? new Date(v as string) : undefined))
    .nullable()
    .optional(),

  // ---- Contact ----
  phone: optionalPhone,
  whatsappNumber: optionalPhone,
  email: optionalEmail,
  address: optionalText(500),
  clinicAddress: optionalText(500),
  clinicName: optionalText(200),
  city: optionalText(100),
  state: optionalText(100),
  postalCode: optionalPincode,
  pincode: optionalPincode,

  // ---- Statutory ----
  registrationNumber: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) =>
      v ? String(v).trim().replace(/\s/g, "").replace(/[^\w/-]/g, "") : undefined
    )
    .refine((v) => v === undefined || v.length >= 3, {
      message: "Registration number is required (min 3 characters)",
    })
    .nullable()
    .optional(),
  registrationCouncil: optionalText(100),
  registrationExpiry: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ? new Date(v as string) : undefined))
    .refine(
      (v) => v === undefined || !(v instanceof Date) || !Number.isNaN(v.getTime()),
      { message: "Enter a valid registration expiry date" }
    )
    .nullable()
    .optional(),
  registrationCertificateUrl: optionalText(2_000_000),
  panNumber: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ? String(v).trim().toUpperCase() : undefined))
    .refine((v) => v === undefined || v === "" || PAN_RE.test(v), {
      message: "Invalid PAN (expected format: ABCDE1234F)",
    })
    .nullable()
    .optional(),
  gstin: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ? String(v).trim().toUpperCase() : undefined))
    .refine((v) => v === undefined || v === "" || GSTIN_RE.test(v), {
      message: "Invalid GSTIN (expected 15-character format)",
    })
    .nullable()
    .optional(),

  // ---- Commission ----
  commissionType: z.enum(COMMISSION_TYPES).optional(),
  commissionRate: z.coerce
    .number()
    .min(0, "Commission cannot be negative")
    .max(100, "Commission cannot exceed 100%")
    .optional(),
  commissionFlatAmount: z.coerce.number().min(0).max(1_000_000).optional(),
  commissionCategoryRules: z
    .union([z.array(z.record(z.string(), z.unknown())), z.null()])
    .optional(),
  payoutCycle: z.enum(PAYOUT_CYCLES).optional(),

  // ---- Banking ----
  bankAccountNumber: optionalText(30),
  bankIfscCode: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ? String(v).trim().toUpperCase() : undefined))
    .refine((v) => v === undefined || v === "" || IFSC_RE.test(v), {
      message: "Invalid IFSC code (expected format: ABCD0123456)",
    })
    .nullable()
    .optional(),
  bankAccountHolderName: optionalText(200),
  bankName: optionalText(150),
  upiId: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ? String(v).trim() : undefined))
    .refine((v) => v === undefined || v === "" || UPI_RE.test(v), {
      message: "Invalid UPI ID (expected format: name@bank)",
    })
    .nullable()
    .optional(),
  cancelledChequeUrl: optionalText(2_000_000),

  // ---- Affiliation ----
  organizationId: z.string().cuid().nullish(),

  // ---- Media ----
  photoUrl: optionalText(2_000_000),
  signatureUrl: optionalText(2_000_000),

  // ---- Report delivery ----
  reportDeliveryEmail: z.boolean().optional(),
  reportDeliveryWhatsApp: z.boolean().optional(),
  reportDeliveryHardCopy: z.boolean().optional(),
  reportDeliveryPortal: z.boolean().optional(),
  enablePortalAccess: z.boolean().optional(),

  // ---- Status ----
  isActive: z.boolean().optional(),
};

export const createDoctorSchema = z
  .object(baseDoctorShape)
  .passthrough()
  .superRefine((data, ctx) => {
    const type = data.doctorType ?? "REFERRING_DOCTOR";

    const hasName =
      !!data.fullName ||
      (!!data.firstName && !!data.lastName) ||
      (!!data.firstName && !!data.fullName);
    if (!hasName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fullName"],
        message: "Doctor name is required",
      });
    }

    // Pathologists author reports: their digital signature is not optional.
    if (
      (PATHOLOGIST_TYPES as readonly string[]).includes(type) &&
      !data.signatureUrl
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["signatureUrl"],
        message:
          "A digital signature is mandatory for pathologist / consultant records",
      });
    }

    const earnsReferral = !(NON_COMMISSION_TYPES as readonly string[]).includes(type);
    if (earnsReferral && !data.registrationNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationNumber"],
        message: "Registration number is required for referral partners",
      });
    }

    const cType = data.commissionType ?? "PERCENTAGE";

    if (cType === "PERCENTAGE" && data.commissionRate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commissionRate"],
        message: "Commission percentage is required for percentage-based plans",
      });
    }

    if (cType === "FLAT_PER_PATIENT" && !data.commissionFlatAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commissionFlatAmount"],
        message: "Flat commission amount is required for flat-per-patient plans",
      });
    }

    if (cType === "CATEGORY_WISE") {
      const rules = data.commissionCategoryRules;
      if (!Array.isArray(rules) || rules.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["commissionCategoryRules"],
          message: "Add at least one test category with a commission rate",
        });
      } else {
        const badRate = rules.find((r) => {
          const rate = Number((r as any)?.rate ?? NaN);
          return !Number.isFinite(rate) || rate < 0 || rate > 100;
        });
        if (badRate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["commissionCategoryRules"],
            message: "Each category commission must be between 0 and 100%",
          });
        }
      }
    }

    if (data.reportDeliveryWhatsApp && !data.whatsappNumber && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whatsappNumber"],
        message: "WhatsApp report delivery requires a phone number",
      });
    }
    if (data.reportDeliveryEmail && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email report delivery requires an email address",
      });
    }
    if (data.enablePortalAccess && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Doctor portal access requires an email address",
      });
    }
  });

export const updateDoctorSchema = z.object(baseDoctorShape).passthrough();

export const doctorIdSchema = z.object({
  id: z.string().cuid(),
});

export const bulkIdSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, "Select at least one doctor").max(200),
});

const isoDate = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), {
    message: "Invalid date",
  });

export const doctorQuerySchema = z.object({
  search: z.string().trim().max(150).optional(),

  specialization: z.string().trim().max(150).optional(),

  doctorType: z.string().trim().max(40).optional(),

  /** Convenience bucket used by the "Pathologists" tab. */
  typeGroup: z.enum(["REFERRING_DOCTOR", "PATHOLOGIST", "PARTNER"]).optional(),

  city: z.string().trim().max(100).optional(),

  organizationId: z.string().cuid().optional(),

  isActive: z.enum(["true", "false"]).optional(),

  /** true | false | all — controls archived visibility. */
  archived: z.enum(["true", "false", "all"]).optional(),

  dateFrom: isoDate,
  dateTo: isoDate,

  sortBy: z
    .enum(["name", "createdAt", "referrals", "revenue", "commissionDue"])
    .optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const archiveDoctorSchema = z.object({
  reason: z.string().trim().max(500).optional(),
  /** Optional: archive the linked patients/orders context (never deletes). */
  alsoDeactivate: z.boolean().optional(),
});

export const payoutSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Payout amount must be greater than zero")
    .max(10_000_000),
  paymentMode: z.enum(["UPI", "CASH", "NEFT", "CHEQUE", "IMPS", "RTGS"]),
  refNumber: z.string().trim().max(120).optional(),
  payoutDate: z.string().optional(),
  tdsDeduction: z.coerce.number().min(0).max(50).optional(),
  remarks: z.string().trim().max(500).optional(),
  /** Limit settlement to a single YYYY-MM period. */
  periodKey: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, "periodKey must look like 2026-09")
    .optional(),
});

export const statusSchema = z.object({
  isActive: z.boolean(),
});

export const organizationSchema = z.object({
  code: z.string().trim().min(2).max(30).optional(),
  name: z.string().trim().min(2, "Organisation name is required").max(200),
  organizationType: z.enum(ORGANIZATION_TYPES).optional(),
  contactPerson: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().max(255).optional(),
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(10).optional(),
  gstin: z.string().trim().max(15).optional(),
  panNumber: z.string().trim().max(10).optional(),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
  payoutCycle: z.enum(PAYOUT_CYCLES).optional(),
  bankAccountNumber: z.string().trim().max(30).optional(),
  bankIfscCode: z.string().trim().max(20).optional(),
  bankAccountHolderName: z.string().trim().max(200).optional(),
  isActive: z.boolean().optional(),
});

export const documentSchema = z.object({
  documentType: z.string().trim().min(2).max(60),
  fileName: z.string().trim().max(255).optional(),
  mimeType: z.string().trim().max(120).optional(),
  sizeBytes: z.coerce.number().int().min(0).optional(),
  fileData: z.string().max(5_000_000),
});