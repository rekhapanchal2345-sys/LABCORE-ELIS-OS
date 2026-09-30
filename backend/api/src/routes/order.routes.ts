import { Router } from "express";

import {
  createOrder,
  getOrderById,
} from "../controllers/order.controller";

import { validate } from "../../middleware/validate";

import {
  createOrderSchema,
  orderIdSchema,
} from "../schemas/order.schema";

const router = Router();

/*
 * POST /api/orders
 *
 * Creates:
 * - Order
 * - Order Items
 * - GST calculation
 * - Invoice
 *
 * All inside one Prisma transaction.
 */
router.post(
  "/",
  validate(
    createOrderSchema
  ),
  createOrder
);

/*
 * GET /api/orders/:id
 *
 * Returns:
 * - patient
 * - doctor
 * - order items
 * - tests
 * - invoice
 * - payments
 * - results
 */
router.get(
  "/:id",
  validate(
    orderIdSchema
  ),
  getOrderById
);

export default router;