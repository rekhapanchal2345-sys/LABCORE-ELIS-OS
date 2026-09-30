import { z } from "zod";

export const createRefundSchema = z.object({
  paymentId: z.string().cuid(),
  amount: z.number().positive(),
  reason: z.string().min(1).max(500),
  refundMethod: z.enum([
    "CASH",
    "CARD",
    "UPI",
    "NET_BANKING",
    "BANK_TRANSFER",
    "ORIGINAL_METHOD",
  ]),
  refundTo: z.string().max(200).optional(),
});

export const approveRefundSchema = z.object({
  refundId: z.string().cuid(),
  approvalNotes: z.string().max(500).optional(),
});

export const rejectRefundSchema = z.object({
  refundId: z.string().cuid(),
  rejectionReason: z.string().min(1).max(500),
});

export const processRefundSchema = z.object({
  refundId: z.string().cuid(),
  transactionId: z.string().max(200).optional(),
  utr: z.string().max(200).optional(),
});

export const refundIdSchema = z.object({
  id: z.string().cuid(),
});

export const refundQuerySchema = z.object({
  status: z.enum([
    "PENDING",
    "APPROVED",
    "REJECTED",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
  ]).optional(),
  paymentId: z.string().cuid().optional(),
  requestedById: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});