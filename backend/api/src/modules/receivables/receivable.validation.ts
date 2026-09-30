import { z } from "zod";

export const createReceivableSchema = z.object({
  invoiceId: z.string().cuid(),
  patientId: z.string().cuid().optional(),
  corporateAccountId: z.string().cuid().optional(),
  totalAmount: z.number().positive(),
  dueDate: z.string().datetime(),
});

export const updateReceivablePaymentSchema = z.object({
  receivableId: z.string().cuid(),
  paymentAmount: z.number().positive(),
});

export const receivableIdSchema = z.object({
  id: z.string().cuid(),
});

export const receivableQuerySchema = z.object({
  patientId: z.string().cuid().optional(),
  corporateAccountId: z.string().cuid().optional(),
  status: z.enum(["PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE", "WRITE_OFF"]).optional(),
  agingDays: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createCorporateAccountSchema = z.object({
  accountNumber: z.string().min(1).max(50),
  accountName: z.string().min(1).max(100),
  organizationName: z.string().min(1).max(200),
  contactPerson: z.string().max(100).optional(),
  contactPhone: z.string().max(15).optional(),
  contactEmail: z.string().email().optional(),
  billingAddress: z.string().max(500).optional(),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.string().max(50).optional(),
  gstin: z.string().max(15).optional(),
  panNumber: z.string().max(10).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateCorporateBalanceSchema = z.object({
  accountId: z.string().cuid(),
  amount: z.number(),
});

export const corporateQuerySchema = z.object({
  isActive: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});