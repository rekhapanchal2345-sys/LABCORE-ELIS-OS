import { Router, type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import {
  changePasswordHandler,
  login,
  logout,
  profile,
  refresh,
  register,
  revokeSession,
  sessions,
  unlock,
  verifyMfa,
} from "./auth.controller";
import { authenticate, requireRoles } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate.middleware";
import {
  changePasswordSchema,
  loginSchema,
  mfaVerifySchema,
  refreshSchema,
  registerSchema,
} from "./auth.validator";

const authLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Covers routine token refreshes for a shared workstation IP.
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please wait a few minutes.",
    code: "RATE_LIMITED",
  },
});

/**
 * A laboratory shares one egress IP across many workstations, so this limits
 * failed attempts per network rather than blocking legitimate sign-ins.
 * Per-account lockout handles targeted brute force.
 */
const loginLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many sign-in attempts from this network. Please try later.",
    code: "RATE_LIMITED",
  },
});

const router = Router();

router.post(
  "/login",
  loginLimiter,
  validate({ body: loginSchema }),
  login
);

router.post(
  "/login/mfa",
  authLimiter,
  validate({ body: mfaVerifySchema }),
  verifyMfa
);

router.post(
  "/refresh",
  authLimiter,
  validate({ body: refreshSchema }),
  refresh
);

/**
 * Staff accounts can only be created by an administrator.
 * Public self-service registration is not allowed.
 */
router.post(
  "/register",
  authenticate,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validate({ body: registerSchema }),
  register
);

router.get("/profile", authenticate, profile);

router.get("/me", authenticate, profile);

router.post("/logout", authenticate, logout);

router.get("/sessions", authenticate, sessions);

router.delete("/sessions/:id", authenticate, revokeSession);

router.post(
  "/password/change",
  authenticate,
  validate({ body: changePasswordSchema }),
  changePasswordHandler
);

/**
 * Unlock an account locked by failed sign-in attempts.
 */
router.patch(
  "/:id/unlock",
  authenticate,
  requireRoles("ADMIN", "SUPER_ADMIN"),
  unlock
);

export default router;
