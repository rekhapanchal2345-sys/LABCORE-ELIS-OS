import { Router } from "express";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  suspendUser,
  updateProfileSettings,
} from "./user.controller";

import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  userListSchema,
} from "./user.schema";

import {
  validate,
} from "../../../middleware/validate.middleware";

import {
  authenticate,
  requirePermission,
} from "../../../middleware/auth";

import {
  PERMISSIONS,
} from "../../../src/lib/permissions";

const router = Router();

/**
 * -----------------------------------------
 * ALL USER ROUTES REQUIRE AUTHENTICATION
 * -----------------------------------------
 */
router.use(
  authenticate
);

/**
 * -----------------------------------------
 * GET /api/users
 * -----------------------------------------
 */
router.get(
  "/",
  requirePermission(
    PERMISSIONS.USER_READ
  ),
  validate({ query: userListSchema }),
  getUsers
);

/**
 * -----------------------------------------
 * GET /api/users/count
 * -----------------------------------------
 */
router.get(
  "/count",
  requirePermission(
    PERMISSIONS.USER_READ
  ),
  validate({ query: userListSchema }),
  getUsers
);

/**
 * -----------------------------------------
 * POST /api/users
 * -----------------------------------------
 */
router.post(
  "/",
  requirePermission(
    PERMISSIONS.USER_CREATE
  ),
  validate({ body: createUserSchema }),
  createUser
);

/**
 * -----------------------------------------
 * GET /api/users/:id
 * -----------------------------------------
 */
router.get(
  "/:id",
  requirePermission(
    PERMISSIONS.USER_READ
  ),
  validate({ params: userIdSchema }),
  getUserById
);

/**
 * -----------------------------------------
 * PUT /api/users/:id
 * -----------------------------------------
 */
router.put(
  "/:id",
  requirePermission(
    PERMISSIONS.USER_UPDATE
  ),
  validate({ body: updateUserSchema }),
  updateUser
);

/**
 * -----------------------------------------
 * PATCH /api/users/:id/activate
 * -----------------------------------------
 */
router.patch(
  "/:id/activate",
  requirePermission(
    PERMISSIONS.USER_UPDATE
  ),
  validate({ params: userIdSchema }),
  activateUser
);

/**
 * -----------------------------------------
 * PATCH /api/users/:id/suspend
 * -----------------------------------------
 */
router.patch(
  "/:id/suspend",
  requirePermission(
    PERMISSIONS.USER_UPDATE
  ),
  validate({ params: userIdSchema }),
  suspendUser
);

/**
 * -----------------------------------------
 * DELETE /api/users/:id
 *
 * Soft delete:
 * status = INACTIVE
 * -----------------------------------------
 */
router.delete(
  "/:id",
  requirePermission(
    PERMISSIONS.USER_UPDATE
  ),
  validate({ params: userIdSchema }),
  deactivateUser
);

/**
 * -----------------------------------------
 * PATCH /api/users/:id/profile
 *
 * Update profile settings (users can update their own)
 * -----------------------------------------
 */
router.patch(
  "/:id/profile",
  authenticate,
  validate({ params: userIdSchema }),
  updateProfileSettings
);

export default router;