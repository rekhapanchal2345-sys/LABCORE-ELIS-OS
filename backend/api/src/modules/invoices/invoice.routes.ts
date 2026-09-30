import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  create,
  list,
  getOne,
  refreshPaymentStatus,
  remove,
  getMetrics,
  refund,
} from "./invoice.controller";

import {
  createInvoiceSchema,
  invoiceIdSchema,
  invoiceQuerySchema,
  billingMetricsQuerySchema,
  refundSchema,
} from "./invoice.validation";

const router = Router();

router.use(authenticate);

// =======================================================
// CREATE INVOICE
// =======================================================

router.post(
  "/",
  authorize(
    "ADMIN",
    "FRONT_DESK"
  ),
  validate({
    body: createInvoiceSchema,
  }),
  create
);

// =======================================================
// LIST INVOICES
// =======================================================

router.get(
  "/",
  authorize(
    "ADMIN",
    "FRONT_DESK",
    "PATHOLOGIST"
  ),
  validate({
    query: invoiceQuerySchema,
  }),
  list
);

// =======================================================
// COUNT INVOICES
// =======================================================

router.get(
  "/count",
  authorize(
    "ADMIN",
    "FRONT_DESK",
    "PATHOLOGIST"
  ),
  list
);

// =======================================================
// GET INVOICE
// =======================================================

router.get(
  "/:id",
  authorize(
    "ADMIN",
    "FRONT_DESK",
    "PATHOLOGIST"
  ),
  validate({
    params: invoiceIdSchema,
  }),
  getOne
);

// =======================================================
// REFRESH PAYMENT STATUS
// =======================================================

router.patch(
  "/:id/payment-status",
  authorize(
    "ADMIN",
    "FRONT_DESK"
  ),
  validate({
    params: invoiceIdSchema,
  }),
  refreshPaymentStatus
);

// =======================================================
// DELETE INVOICE
// =======================================================

router.delete(
  "/:id",
  authorize(
    "ADMIN"
  ),
  validate({
    params: invoiceIdSchema,
  }),
  remove
);

// =======================================================
// GET BILLING METRICS
// =======================================================

router.get(
  "/metrics/billing",
  authorize(
    "ADMIN",
    "FRONT_DESK"
  ),
  validate({
    query: billingMetricsQuerySchema,
  }),
  getMetrics
);

// =======================================================
// PROCESS REFUND
// =======================================================

router.post(
  "/refund",
  authorize(
    "ADMIN",
    "FRONT_DESK"
  ),
  validate({
    body: refundSchema,
  }),
  refund
);

export default router;