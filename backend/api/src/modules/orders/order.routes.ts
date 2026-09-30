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
  collect,
  cancel,
} from "./order.controller";

import {
  createOrderSchema,
  updateOrderSchema,
  orderIdSchema,
  orderQuerySchema,
  collectSampleSchema,
  cancelOrderSchema,
} from "./order.validation";

const router = Router();

router.use(authenticate);

// =======================================================
// CREATE ORDER
// =======================================================

router.post(
  "/",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK
  ),
  validate({
    body: createOrderSchema,
  }),
  create
);

// =======================================================
// LIST ORDERS
// =======================================================

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
    query: orderQuerySchema,
  }),
  list
);

// =======================================================
// COUNT ORDERS
// =======================================================

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

// =======================================================
// GET ORDER
// =======================================================

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
    params: orderIdSchema,
  }),
  getOne
);

// =======================================================
// UPDATE ORDER
// =======================================================

router.patch(
  "/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST
  ),
  validate({
    params: orderIdSchema,
    body: updateOrderSchema,
  }),
  update
);

// =======================================================
// SAMPLE COLLECTION
// =======================================================

router.post(
  "/:id/collect-sample",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH
  ),
  validate({
    params: orderIdSchema,
    body: collectSampleSchema,
  }),
  collect
);

// =======================================================
// CANCEL ORDER
// =======================================================

router.post(
  "/:id/cancel",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK
  ),
  validate({
    params: orderIdSchema,
    body: cancelOrderSchema,
  }),
  cancel
);

export default router;