import { z } from "zod";

export const createAdvanceSchema = z.object({
  patientId: z.string().cuid(),
  amount: z.number().positive(),
  reason: z.string().max(500).optional(),
});

export const applyAdvanceSchema = z.object({
  patientId: z.string().cuid(),
  orderId: z.string().cuid(),
  amount: z.number().positive(),
});

export const refundAdvanceSchema = z.object({
  advanceId: z.string().cuid(),
  amount: z.number().positive(),
  reason: z.string().min(1).max(500),
});

export const patientIdSchema = z.object({
  patientId: z.string().cuid(),
});