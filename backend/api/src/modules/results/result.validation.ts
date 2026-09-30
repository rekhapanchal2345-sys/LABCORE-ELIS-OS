import { z } from "zod";

export const createResultSchema = z.object({
  orderId: z.string().cuid(),

  testId: z.string().cuid(),

  remarks: z
    .string()
    .max(2000)
    .optional(),

  interpretation: z
    .string()
    .max(5000)
    .optional(),

  values: z
    .array(
      z.object({
        parameterId: z.string().cuid(),

        value: z.string().max(1000),

        flag: z
          .enum([
            "LOW",
            "NORMAL",
            "HIGH",
            "CRITICAL",
          ])
          .optional(),

        remark: z
          .string()
          .max(1000)
          .optional(),
      })
    )
    .min(1),
});

export const updateResultSchema = z.object({
  remarks: z
    .string()
    .max(2000)
    .optional(),

  interpretation: z
    .string()
    .max(5000)
    .optional(),

  values: z
    .array(
      z.object({
        parameterId: z.string().cuid(),

        value: z.string().max(1000),

        flag: z
          .enum([
            "LOW",
            "NORMAL",
            "HIGH",
            "CRITICAL",
          ])
          .optional(),

        remark: z
          .string()
          .max(1000)
          .optional(),
      })
    )
    .optional(),
});

export const resultIdSchema = z.object({
  id: z.string().cuid(),
});

export const resultQuerySchema = z.object({
  orderId: z
    .string()
    .cuid()
    .optional(),

  testId: z
    .string()
    .cuid()
    .optional(),

  status: z
    .enum([
      "PENDING",
      "ENTERED",
      "VERIFIED",
      "APPROVED",
      "PUBLISHED",
    ])
    .optional(),

  search: z
    .string()
    .optional(),

  dateFrom: z
    .string()
    .optional(),

  dateTo: z
    .string()
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

export const criticalAcknowledgmentSchema = z.object({
  resultId: z.string().cuid(),
  resultValueId: z.string().cuid().optional(),
  notifiedPerson: z.string().min(1).max(200),
  notifiedPersonContact: z.string().min(1).max(100),
  notificationMode: z.string().min(1).max(50),
  notificationTime: z.string().or(z.date()),
  notes: z.string().max(2000).optional(),
  acknowledgmentReason: z.string().max(2000).optional(),
});

export const amendmentSchema = z.object({
  resultId: z.string().cuid(),
  amendmentReason: z.string().min(1).max(5000),
  amendmentType: z.string().min(1).max(100),
  changedFields: z.array(z.string()).min(1),
  fieldChanges: z.any().optional(),
});

export const bulkVerifySchema = z.object({
  resultIds: z.array(z.string().cuid()).min(1).max(100),
});