import { Router } from "express";

import {
  enterResult,
  getResultById,
} from "../controllers/result.controller";

import { validate } from "../../middleware/validate";

import {
  enterResultSchema,
  resultIdSchema,
} from "../schemas/result.schema";

const router = Router();

/**
 * POST /api/results
 *
 * Enter test results.
 *
 * The controller is responsible for:
 * - validating the order/test relationship
 * - reading reference ranges
 * - calculating LOW / HIGH / PANIC flags
 * - saving the result
 * - auto-validating when applicable
 */
router.post(
  "/",
  validate(enterResultSchema),
  enterResult
);

/**
 * GET /api/results/:id
 *
 * Get a single result with its related data.
 */
router.get(
  "/:id",
  validate(resultIdSchema),
  getResultById
);

export default router;