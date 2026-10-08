/**
 * Shared types for the Doctors & Referral module.
 *
 * Everything rendered about a doctor comes from the API — this file
 * holds presentation only, never an estimated figure.
 */

export type DoctorType =
  | 'REFERRING_DOCTOR'
  | 'IN_HOUSE_PATHOLOGIST'
  | 'INTERNAL_PATHOLOGIST'
  | 'CONSULTANT_PATHOLOGIST'
  | 'CONSULTANT'
  | 'HOSPITAL_PARTNER'
  | 'CLINIC_PARTNER';

export type CommissionType =
  | 'PERCENTAGE'
  | 'FLAT_PER_PATIENT'
  | 'CATEGORY_WISE'
  | 'NONE';

export type PayoutCycle = 'WEEKLY' | 'MONTHLY';

export interface DoctorMetrics {
  totalReferrals: number;
  totalOrders: number;
  paidOrderCount: number;
  paidRevenue: number;
  commissionEarned: number;
  commissionSettled: number;
  commissionPending: number;
  monthlyOrders: number;
}

export interface DoctorRow {
  id: string;
  doctorCode: string;
  fullName: string;
  title?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  registrationNumber?: string | null;
  registrationCouncil?: string | null;
  registrationExpiry?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  clinicName?: string | null;
  clinicAddress?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  languages?: string | null;
  designation?: string | null;
  department?: string | null;
  experienceYears?: number | null;
  photoUrl?: string | null;
  signatureUrl?: string | null;
  doctorType: DoctorType;
  commissionRate?: number | string | null;
  commissionType: CommissionType;
  commissionFlatAmount?: number | string | null;
  payoutCycle?: PayoutCycle | null;
  organizationId?: string | null;
  organization?: {
    id: string;
    name: string;
    code: string;
    organizationType: string;
  } | null;
  isActive: boolean;
  isArchived: boolean;
  archivedAt?: string | null;
  reportDeliveryEmail: boolean;
  reportDeliveryWhatsApp: boolean;
  reportDeliveryHardCopy: boolean;
  reportDeliveryPortal: boolean;
  reportDeliveryModes?: string[];
  enablePortalAccess?: boolean;
  createdAt: string;
  consultationFee?: number | string | null;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  availableDays?: string | null;
  availableTime?: string | null;

  // Metrics are server-computed and identical on every screen.
  totalReferrals?: number;
  totalOrders?: number;
  paidRevenue?: number;
  commissionEarned?: number;
  commissionSettled?: number;
  commissionPending?: number;
  monthlyOrders?: number;
}

export interface DoctorKpis {
  totalDoctors: number;
  activeDoctors: number;
  archivedDoctors: number;
  partnerOrganizations: number;
  patientsReferredThisMonth: number;
  totalReferrals: number;
  paidRevenue: number;
  pendingCommission: number;
  settledCommission: number;
  doctorsWithPendingPayout: number;
}

export interface DoctorDocument {
  id: string;
  documentType: string;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  fileData?: string | null;
  createdAt: string;
}

export interface DoctorOrganization {
  id: string;
  code: string;
  name: string;
  organizationType:
    | 'HOSPITAL'
    | 'CLINIC'
    | 'DIAGNOSTIC_CENTER'
    | 'CORPORATE';
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  gstin?: string | null;
  panNumber?: string | null;
  commissionRate?: number | string | null;
  payoutCycle?: PayoutCycle | null;
  isActive: boolean;
  _count?: { doctors: number };
}

export interface DoctorProfile extends DoctorRow {
  metrics: DoctorMetrics;
  bankDetailsMasked: boolean;
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  bankAccountHolderName?: string | null;
  bankName?: string | null;
  upiId?: string | null;
  panNumber?: string | null;
  gstin?: string | null;
  notes?: string | null;
  signatureRequired: boolean;
  signatureApproved: boolean;
  requiresCommission: boolean;
  documents?: DoctorDocument[];
}
// ------------------------------------------------------------------
// Labels
// ------------------------------------------------------------------

export const DOCTOR_TYPE_LABEL: Record<DoctorType, string> = {
  REFERRING_DOCTOR: 'Referring Doctor',
  IN_HOUSE_PATHOLOGIST: 'In-house Pathologist',
  INTERNAL_PATHOLOGIST: 'Internal Pathologist',
  CONSULTANT_PATHOLOGIST: 'Consultant Pathologist',
  CONSULTANT: 'Consultant',
  HOSPITAL_PARTNER: 'Hospital Partner',
  CLINIC_PARTNER: 'Clinic Partner',
};

/** Types whose report sign-off requires an approved digital signature. */
export const PATHOLOGIST_TYPES: DoctorType[] = [
  'IN_HOUSE_PATHOLOGIST',
  'INTERNAL_PATHOLOGIST',
  'CONSULTANT_PATHOLOGIST',
];

/** Types that are paid a percentage and therefore earn referral commission. */
export const COMMISSION_ELIGIBLE_TYPES: DoctorType[] = [
  'REFERRING_DOCTOR',
  'HOSPITAL_PARTNER',
  'CLINIC_PARTNER',
];

export const COMMISSION_TYPE_LABEL: Record<CommissionType, string> = {
  PERCENTAGE: 'Percentage of revenue',
  FLAT_PER_PATIENT: 'Flat per patient',
  CATEGORY_WISE: 'Test-category wise',
  NONE: 'No commission',
};

export const PAYOUT_CYCLE_LABEL: Record<PayoutCycle, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

export const REPORT_DELIVERY_MODES = [
  { key: 'reportDeliveryEmail', label: 'Email' },
  { key: 'reportDeliveryWhatsApp', label: 'WhatsApp' },
  { key: 'reportDeliveryHardCopy', label: 'Hard Copy' },
  { key: 'reportDeliveryPortal', label: 'Portal' },
] as const;

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export const COMMON_SPECIALIZATIONS = [
  'General Medicine',
  'Pathology',
  'Radiology',
  'Cardiology',
  'Dermatology',
  'Orthopaedics',
  'Gynaecology',
  'Paediatrics',
  'Neurology',
  'Nephrology',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology',
  'ENT',
  'Ophthalmology',
  'Urology',
  'Psychiatry',
  'Anaesthesiology',
];

export const REGISTRATION_COUNCILS = [
  'NMC (National Medical Commission)',
  'State Medical Council',
  'Indian Medical Association',
  'Dental Council of India',
  'Nursing Council of India',
];

export const PAYMENT_MODES = [
  'UPI',
  'CASH',
  'NEFT',
  'IMPS',
  'RTGS',
  'CHEQUE',
] as const;
// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

export const isPathologist = (type?: string | null) =>
  PATHOLOGIST_TYPES.includes((type ?? '') as DoctorType);

export const earnsCommission = (type?: string | null) =>
  !isPathologist(type) && type !== 'CONSULTANT';

export const formatINR = (value?: number | string | null) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return '₹0';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

export const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Stable initials for the avatar. Never falls back to a placeholder name. */
export const initialsOf = (name?: string | null) => {
  const cleaned = (name || '').replace(/^(dr\.?|prof\.?)\s*/i, '').trim();
  if (!cleaned) return 'DR';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};

/** Deterministic avatar tint so the same doctor always looks the same. */
const AVATAR_TINTS = [
  'var(--primary)',
  'var(--info)',
  'var(--success)',
  '#7c3aed',
  '#db2777',
  '#0891b2',
  '#4f46e5',
] as const;

export const avatarTint = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
};

/** Mask a phone for compact list rows. */
export const maskPhone = (phone?: string | null) => {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `••••• ${digits.slice(-5)}`;
};

/** Human label for a commission plan. */
export const commissionLabel = (doctor: {
  commissionType?: CommissionType | null;
  commissionRate?: number | string | null;
  commissionFlatAmount?: number | string | null;
}) => {
  const type = doctor.commissionType ?? 'PERCENTAGE';
  if (type === 'NONE') return 'No commission';
  if (type === 'FLAT_PER_PATIENT')
    return `${formatINR(doctor.commissionFlatAmount)} / patient`;
  if (type === 'CATEGORY_WISE') return 'Category-wise';
  return `${Number(doctor.commissionRate ?? 0)}% of paid revenue`;
};

/** WhatsApp deep link, or null when no reachable number is on file. */
export const whatsappLink = (
  phone: string | null | undefined,
  message: string
) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const withCountry =
    digits.length === 12 && digits.startsWith('91')
      ? digits
      : `91${digits.slice(-10)}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
};

/** Referral statement built from real ledger numbers. */
export const referralStatement = (doctor: {
  fullName?: string | null;
  metrics?: DoctorMetrics;
  commissionLabelText?: string;
}) => {
  const m = doctor.metrics;
  return [
    `Respected ${doctor.fullName || 'Doctor'},`,
    '',
    'Greetings from LabCore Enterprise Diagnostic Center.',
    '',
    'Here is your referral activity summary:',
    `• Patients referred: ${m?.totalReferrals ?? 0}`,
    `• Paid test revenue: ${formatINR(m?.paidRevenue ?? 0)}`,
    `• Commission plan: ${doctor.commissionLabelText ?? '—'}`,
    `• Commission earned: ${formatINR(m?.commissionEarned ?? 0)}`,
    `• Pending settlement: ${formatINR(m?.commissionPending ?? 0)}`,
    '',
    'Thank you for your continued clinical trust.',
  ].join('\n');
};