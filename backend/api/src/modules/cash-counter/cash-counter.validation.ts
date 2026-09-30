import { z } from "zod";

export const createCashCounterSchema = z.object({
  counterNumber: z.string().min(1).max(50),
  counterName: z.string().min(1).max(100),
  branchId: z.string().optional(),
  location: z.string().max(200).optional(),
  assignedUserId: z.string().cuid().optional(),
});

export const openCashCounterSchema = z.object({
  counterId: z.string().cuid(),
  openingBalance: z.number().min(0),
  denominationData: z.any().optional(),
});

export const closeCashCounterSchema = z.object({
  counterId: z.string().cuid(),
  actualCash: z.number().min(0),
  denominationData: z.any().optional(),
  varianceReason: z.string().max(500).optional(),
});

export const cashMovementSchema = z.object({
  drawerId: z.string().cuid(),
  movementType: z.enum([
    "DEPOSIT",
    "WITHDRAWAL",
    "TRANSFER_IN",
    "TRANSFER_OUT",
    "ADJUSTMENT",
    "REFUND",
  ]),
  amount: z.number().positive(),
  reason: z.string().min(1).max(500),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
});

export const cashCounterIdSchema = z.object({
  id: z.string().cuid(),
});

export const cashCounterQuerySchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "LOCKED"]).optional(),
  branchId: z.string().optional(),
  assignedUserId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});