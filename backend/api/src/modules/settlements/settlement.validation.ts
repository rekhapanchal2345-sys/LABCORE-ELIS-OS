import { z } from "zod";

export const createSettlementSchema = z.object({
  provider: z.string().min(1).max(100),
  providerType: z.enum(["PAYMENT_GATEWAY", "BANK", "CORPORATE"]),
  grossAmount: z.number().positive(),
  fees: z.number().min(0).optional(),
  settlementDate: z.string().datetime().optional(),
  referenceNumber: z.string().max(200).optional(),
  utr: z.string().max(200).optional(),
  metadata: z.any().optional(),
  notes: z.string().max(1000).optional(),
});

export const processSettlementSchema = z.object({
  settlementId: z.string().cuid(),
  settledAmount: z.number().positive(),
  paymentIds: z.array(z.string().cuid()).min(1),
});

export const createReconciliationSchema = z.object({
  sourceType: z.enum(["INTERNAL", "GATEWAY", "BANK"]),
  sourceId: z.string(),
  transactionId: z.string(),
  amount: z.number(),
  status: z.enum(["PENDING", "MATCHED", "UNMATCHED", "DISCREPANCY", "RESOLVED"]),
  discrepancy: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const reconcileSchema = z.object({
  recordId: z.string().cuid(),
  matchedWith: z.string(),
  notes: z.string().max(1000).optional(),
});

export const settlementIdSchema = z.object({
  id: z.string().cuid(),
});

export const settlementQuerySchema = z.object({
  provider: z.string().optional(),
  providerType: z.enum(["PAYMENT_GATEWAY", "BANK", "CORPORATE"]).optional(),
  status: z.enum(["EXPECTED", "PROCESSING", "SETTLED", "MISMATCH", "FAILED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const reconciliationQuerySchema = z.object({
  sourceType: z.enum(["INTERNAL", "GATEWAY", "BANK"]).optional(),
  status: z.enum(["PENDING", "MATCHED", "UNMATCHED", "DISCREPANCY", "RESOLVED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});