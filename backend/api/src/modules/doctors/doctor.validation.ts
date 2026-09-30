import { z } from "zod";

export const createDoctorSchema = z.object({
  doctorCode: z.string().min(2).max(50).optional(),

  fullName: z.string().min(2).max(150).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).optional(),

  qualification: z.string().max(150).optional(),

  specialization: z.string().max(150).optional(),

  phone: z.string().min(10).max(30).optional().transform(val => val?.replace(/\s/g, '')),

  email: z.string().max(255).optional().or(z.literal('')),

  clinicName: z.string().max(200).optional(),

  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),

  commissionRate: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional(),

  isActive: z.boolean().optional(),

  // Essential LIMS fields
  signatureUrl: z.string().optional(), // Accept both URLs and base64 data URLs
  registrationNumber: z.string().min(1).max(100).optional().transform(val => val?.replace(/\s/g, '').replace(/[^\w]/g, '')),

  // Optional legacy fields (kept for backward compatibility)
  photoUrl: z.string().optional(), // Accept both URLs and base64 data URLs
  licenseNumber: z.string().max(100).optional(),
  licenseExpiry: z.string().optional(),
  experience: z.coerce.number().min(0).max(100).optional(),
  consultationFee: z.coerce.number().min(0).optional(),
  availableDays: z.string().optional(),
  availableTime: z.string().optional(),
  department: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),

  // New LIMS-specific fields
  doctorType: z.enum(["REFERRING_DOCTOR", "INTERNAL_PATHOLOGIST", "IN_HOUSE_PATHOLOGIST", "CONSULTANT_PATHOLOGIST"]).optional(),
  clinicAddress: z.string().max(500).optional(),
  whatsappNumber: z.string().min(1).max(20).optional().transform(val => val?.replace(/\s/g, '')),
  reportDeliveryEmail: z.boolean().optional(),
  reportDeliveryWhatsApp: z.boolean().optional(),
  reportDeliveryHardCopy: z.boolean().optional(),
  reportDeliveryPortal: z.boolean().optional(),
  enablePortalAccess: z.boolean().optional(),
  bankAccountNumber: z.string().max(30).optional(),
  bankIfscCode: z.string().max(20).optional(),
  bankAccountHolderName: z.string().max(200).optional(),
}).passthrough(); // Allow additional fields

export const updateDoctorSchema =
  createDoctorSchema.partial();

export const doctorIdSchema = z.object({
  id: z.string().cuid(),
});

export const doctorQuerySchema = z.object({
  search: z.string().optional(),

  specialization: z.string().optional(),

  doctorType: z.string().optional(),

  isActive: z
    .enum(["true", "false"])
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});