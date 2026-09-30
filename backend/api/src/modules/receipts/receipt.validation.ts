import { z } from "zod";

export const generateReceiptSchema = z.object({
  paymentId: z.string().cuid(),
  receiptType: z.enum(["PAYMENT", "REFUND", "ADVANCE"]).optional(),
});

export const receiptIdSchema = z.object({
  id: z.string().cuid(),
});

export const paymentIdSchema = z.object({
  paymentId: z.string().cuid(),
});

export const receiptNumberSchema = z.object({
  receiptNumber: z.string(),
});

export const paymentReportQuerySchema = z.object({
  reportType: z.enum(["daily", "monthly", "staff", "refund", "general"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  method: z.enum([
    "CASH",
    "CARD",
    "UPI",
    "NET_BANKING",
    "CHEQUE",
    "BANK_TRANSFER",
    "ADVANCE",
    "WALLET",
    "CORPORATE_CREDIT",
    "OTHER",
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const exportQuerySchema = z.object({
  format: z.enum(["CSV", "EXCEL", "PDF"]).default("CSV"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  method: z.enum([
    "CASH",
    "CARD",
    "UPI",
    "NET_BANKING",
    "CHEQUE",
    "BANK_TRANSFER",
    "ADVANCE",
    "WALLET",
    "CORPORATE_CREDIT",
    "OTHER",
  ]).optional(),
  status: z.enum(["PENDING", "PARTIAL", "PAID", "REFUNDED"]).optional(),
});