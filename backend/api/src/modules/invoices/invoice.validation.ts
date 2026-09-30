import { z } from "zod";

export const createInvoiceSchema = z.object({
  orderId: z.string().cuid(),

  gstPercent: z
    .number()
    .min(0)
    .max(100)
    .optional(),

  discount: z
    .number()
    .min(0)
    .optional(),
});

export const invoiceIdSchema = z.object({
  id: z.string().cuid(),
});

export const invoiceQuerySchema = z.object({
  search: z.string().optional(),
  patientId: z.string().optional(),
  orderId: z.string().optional(),

  paymentStatus: z
    .enum([
      "PENDING",
      "PARTIAL",
      "PAID",
      "REFUNDED",
    ])
    .optional(),

  doctorId: z.string().optional(),

  dateFrom: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Invalid dateFrom format" }),

  dateTo: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Invalid dateTo format" }),

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

export const billingMetricsQuerySchema = z.object({
  startDate: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Invalid start date format" }),
  endDate: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Invalid end date format" }),
});

export const refundSchema = z.object({
  invoiceId: z.string().cuid(),
  amount: z.number().positive("Refund amount must be positive"),
  reason: z.string().min(1, "Refund reason is required"),
  refundMethod: z.string().min(1, "Refund method is required"),
  transactionId: z.string().optional(),
});