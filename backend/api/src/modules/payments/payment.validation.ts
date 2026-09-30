import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().cuid(),

  amount: z
    .number()
    .positive(),

  method: z.enum([
    "CASH",
    "CARD",
    "UPI",
    "NET_BANKING",
    "CHEQUE",
  ]),

  transactionId: z
    .string()
    .max(200)
    .optional(),

  remarks: z
    .string()
    .max(1000)
    .optional(),
});

export const createSplitPaymentSchema = z.object({
  orderId: z.string().cuid(),

  payments: z.array(
    z.object({
      amount: z.number().positive(),
      method: z.enum([
        "CASH",
        "CARD",
        "UPI",
        "NET_BANKING",
        "CHEQUE",
      ]),
      transactionId: z.string().max(200).optional(),
      remarks: z.string().max(1000).optional(),
    })
  ).min(1).max(5), // Allow 1-5 split payments
});

export const paymentIdSchema = z.object({
  id: z.string().cuid(),
});

export const paymentQuerySchema = z.object({
  search: z.string().optional(),
  patientId: z.string().optional(),
  orderId: z
    .string()
    .optional(),

  method: z
    .enum([
      "CASH",
      "CARD",
      "UPI",
      "NET_BANKING",
      "CHEQUE",
    ])
    .optional(),

  status: z
    .enum([
      "PENDING",
      "PARTIAL",
      "PAID",
      "REFUNDED",
    ])
    .optional(),

  startDate: z
    .string()
    .optional(),

  endDate: z
    .string()
    .optional(),

  receivedById: z
    .string()
    .cuid()
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