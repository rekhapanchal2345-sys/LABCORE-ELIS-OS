import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  generateOrder,
  generateSample,
  generatePatient,
  validate,
  getPrintData,
  generateBatch,
  regenerate,
  scanBarcode,
} from "./barcode.controller";

import { z } from "zod";

const router = Router();

router.use(authenticate);

// Validation schemas
const barcodeSchema = z.object({
  barcode: z.string().min(1),
});

const batchBarcodeSchema = z.object({
  orderIds: z.array(z.string().cuid()).min(1),
});

const scanBarcodeSchema = z.object({
  barcode: z.string().min(1),
});

// =======================================================
// GENERATE BARCODES
// =======================================================

// Generate order barcode
router.post(
  "/order/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH
  ),
  generateOrder
);

// Generate sample barcode
router.post(
  "/sample/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH
  ),
  generateSample
);

// Generate patient barcode
router.post(
  "/patient/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST
  ),
  generatePatient
);

// =======================================================
// VALIDATE BARCODES
// =======================================================

// Validate barcode
router.get(
  "/validate/:barcode",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST
  ),
  validate
);

// Scan barcode (for barcode scanners)
router.post(
  "/scan",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST
  ),
  validate({
    body: scanBarcodeSchema,
  }),
  scanBarcode
);

// =======================================================
// BARCODE PRINTING
// =======================================================

// Get barcode print data
router.get(
  "/print/:barcode",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST
  ),
  getPrintData
);

// =======================================================
// BATCH OPERATIONS
// =======================================================

// Generate batch barcodes
router.post(
  "/batch",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH
  ),
  validate({
    body: batchBarcodeSchema,
  }),
  generateBatch
);

// =======================================================
// BARCODE MANAGEMENT
// =======================================================

// Regenerate barcode
router.post(
  "/regenerate/:type/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH
  ),
  regenerate
);

export default router;