import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  create,
  list,
  getOne,
  update,
  updateStatus,
  remove,
  statistics,
  commission,
  bySpecialization,
  uploadPhoto,
  uploadSignature,
} from "./doctor.controller";

import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorIdSchema,
  doctorQuerySchema,
} from "./doctor.validation";

const router = Router();

// All doctor routes require authentication
router.use(authenticate);

/*
 * CREATE DOCTOR
 * Admin / Front Desk
 */
router.post(
  "/",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK
  ),
  validate({
    body: createDoctorSchema,
  }),
  create
);

/*
 * LIST DOCTORS
 */
router.get(
  "/",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    query: doctorQuerySchema,
  }),
  list
);

/*
 * COUNT DOCTORS
 */
router.get(
  "/count",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  list
);

/*
 * GET SINGLE DOCTOR
 */
router.get(
  "/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    params: doctorIdSchema,
  }),
  getOne
);

/*
 * UPDATE DOCTOR
 */
router.patch(
  "/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK
  ),
  validate({
    params: doctorIdSchema,
    body: updateDoctorSchema,
  }),
  update
);

/*
 * ACTIVATE / DEACTIVATE DOCTOR
 */
router.patch(
  "/:id/status",
  authorize(UserRole.ADMIN),
  validate({
    params: doctorIdSchema,
  }),
  updateStatus
);

/*
 * DELETE DOCTOR
 */
router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: doctorIdSchema,
  }),
  remove
);

/*
 * GET DOCTOR STATISTICS
 */
router.get(
  "/:id/statistics",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.DOCTOR
  ),
  validate({
    params: doctorIdSchema,
  }),
  statistics
);

/*
 * GET DOCTOR COMMISSION
 */
router.get(
  "/:id/commission",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.DOCTOR
  ),
  validate({
    params: doctorIdSchema,
  }),
  commission
);

/*
 * GET DOCTORS BY SPECIALIZATION
 */
router.get(
  "/specialization/:specialization",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  bySpecialization
);

/*
 * UPLOAD DOCTOR PHOTO
 */
router.post(
  "/:id/photo",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK
  ),
  uploadPhoto
);

/*
 * UPLOAD DOCTOR SIGNATURE
 */
router.post(
  "/:id/signature",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK
  ),
  uploadSignature
);

/*
 * PROCESS DOCTOR COMMISSION PAYOUT
 */
router.post(
  "/:id/payout",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK
  ),
  require("./doctor.controller").processPayout
);

export default router;