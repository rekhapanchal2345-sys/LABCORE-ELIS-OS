import { z } from "zod";

// =======================================================
// AUDIT ID
// =======================================================

export const auditIdSchema = z.object({
  id: z.string().cuid(),
});

// =======================================================
// AUDIT QUERY
// =======================================================

export const auditQuerySchema = z.object({
  userId: z.string().cuid().optional(),

  module: z.string().max(100).optional(),

  action: z.string().max(100).optional(),

  recordId: z.string().optional(),

  fromDate: z.string().optional(),

  toDate: z.string().optional(),

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

// =======================================================
// CREATE AUDIT LOG
// =======================================================

export const createAuditSchema = z.object({
  userId: z.string().cuid().optional(),

  module: z
    .string()
    .min(1)
    .max(100),

  action: z
    .string()
    .min(1)
    .max(100),

  recordId: z
    .string()
    .optional(),

  ipAddress: z
    .string()
    .max(100)
    .optional(),

  userAgent: z
    .string()
    .max(500)
    .optional(),

  oldData: z
    .record(z.string(), z.any())
    .optional(),

  newData: z
    .record(z.string(), z.any())
    .optional(),
});