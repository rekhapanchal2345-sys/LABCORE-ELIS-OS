import { z } from "zod";

export const approvalIdSchema = z.object({
  id: z.string(),
});

export const approvalQuerySchema = z.object({
  orderId: z.string().optional(),
  search: z.string().optional(),
  filter: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  department: z.string().optional(),
  hasCritical: z.string().optional(),
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

export const rejectApprovalSchema = z.object({
  remarks: z
    .string()
    .min(1)
    .max(2000),
});

export const batchApproveSchema = z.object({
  ids: z.array(z.string()).min(1),
  remarks: z.string().optional(),
});

export const criticalAckSchema = z.object({
  notifiedPerson: z.string().min(1, "Notified doctor/person name is required"),
  notifiedPersonContact: z.string().optional(),
  notificationMode: z.string().default("PHONE"),
  notificationTime: z.string().optional(),
  notes: z.string().optional(),
  readBackConfirmed: z.boolean().default(true),
});