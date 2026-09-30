import { z } from "zod";

export const createSampleSchema = z.object({
  orderId: z.string().cuid(),

  sampleType: z
    .string()
    .min(2)
    .max(100),

  notes: z
    .string()
    .max(1000)
    .optional(),
});

export const sampleIdSchema = z.object({
  id: z.string().cuid(),
});

export const sampleQuerySchema = z.object({
  search: z.string().optional(),

  orderId: z.string().cuid().optional(),

  status: z
    .enum([
      "PENDING",
      "COLLECTED",
      "RECEIVED",
      "PROCESSING",
      "COMPLETED",
      "REJECTED",
    ])
    .optional(),

  sampleType: z.string().optional(),

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

export const collectSampleSchema = z.object({
  barcode: z.string().min(1),

  notes: z
    .string()
    .max(1000)
    .optional(),

  collectionType: z
    .enum(["WALK_IN", "HOME_COLLECTION"])
    .optional(),

  priority: z
    .enum(["ROUTINE", "URGENT", "STAT"])
    .optional(),

  location: z
    .string()
    .max(200)
    .optional(),
});

export const receiveSampleSchema = z.object({
  notes: z
    .string()
    .max(1000)
    .optional(),

  location: z
    .string()
    .max(200)
    .optional(),
});

export const rejectSampleSchema = z.object({
 reason: z
    .string()
    .min(2)
    .max(500),
});

export const processSampleSchema = z.object({
  location: z
    .string()
    .max(200)
    .optional(),
});

export const completeSampleSchema = z.object({
  location: z
    .string()
    .max(200)
    .optional(),
});