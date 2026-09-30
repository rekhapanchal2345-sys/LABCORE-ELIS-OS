import { Router } from "express";

import {
  login,
  getMe,
} from "../controllers/auth.controller";

import {
  loginSchema,
} from "../schemas/auth.schema";

import {
  validate,
} from "../../middleware/validate.middleware";

import {
  authenticate,
} from "../../middleware/auth";

const router = Router();

/**
 * POST /api/auth/login
 *
 * Public route.
 */
router.post(
  "/login",
  validate(loginSchema),
  login
);

/**
 * GET /api/auth/me
 *
 * Protected route.
 */
router.get(
  "/me",
  authenticate,
  getMe
);

export default router;