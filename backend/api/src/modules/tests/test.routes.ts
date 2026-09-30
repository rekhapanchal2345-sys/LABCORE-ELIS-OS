import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createCategoryController,
  listCategories,
  getCategory,
  updateCategoryController,
  updateCategoryEnhancedController,
  deleteCategoryController,

  createTestController,
  listTests,
  getTest,
  updateTestController,
  deleteTestController,

  addParameterController,
  updateParameterController,
  deleteParameterController,

  addReferenceRangeController,
  updateReferenceRangeController,
  deleteReferenceRangeController,

  createPackageController,
  listPackages,
  getPackageController,
  updatePackageController,
  deletePackageController,
  addPackageItemController,
  removePackageItemController,

  exportCatalogController,
  importCatalogController,
} from "./test.controller";

import {
  createCategorySchema,
  updateCategorySchema,
  updateCategoryEnhancedSchema,
  categoryIdSchema,

  createTestSchema,
  updateTestSchema,
  testIdSchema,
  testQuerySchema,

  createParameterSchema,
  updateParameterSchema,
  parameterIdSchema,

  createReferenceRangeSchema,
  updateReferenceRangeSchema,
  referenceRangeIdSchema,

  createPackageSchema,
  updatePackageSchema,
  packageIdSchema,
  packageQuerySchema,
  createPackageItemSchema,
  packageItemParamsSchema,

  importCatalogSchema,
} from "./test.validation";

const router = Router();

// All test routes require authentication
router.use(authenticate);

// =======================================================
// TEST CATEGORIES
// =======================================================

router.post(
  "/categories",
  authorize(UserRole.ADMIN),
  validate({
    body: createCategorySchema,
  }),
  createCategoryController
);

router.get(
  "/categories",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  listCategories
);

router.get(
  "/categories/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    params: categoryIdSchema,
  }),
  getCategory
);

router.patch(
  "/categories/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: categoryIdSchema,
    body: updateCategoryEnhancedSchema,
  }),
  updateCategoryEnhancedController
);

router.delete(
  "/categories/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: categoryIdSchema,
  }),
  deleteCategoryController
);

// =======================================================
// TEST PACKAGES (MUST BE REGISTERED BEFORE /:id WILDCARD!)
// =======================================================

router.post(
  "/packages",
  authorize(UserRole.ADMIN),
  validate({
    body: createPackageSchema,
  }),
  createPackageController
);

router.get(
  "/packages",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    query: packageQuerySchema,
  }),
  listPackages
);

router.get(
  "/packages/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  validate({
    params: packageIdSchema,
  }),
  getPackageController
);

router.patch(
  "/packages/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: packageIdSchema,
    body: updatePackageSchema,
  }),
  updatePackageController
);

router.delete(
  "/packages/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: packageIdSchema,
  }),
  deletePackageController
);

router.post(
  "/packages/:id/items",
  authorize(UserRole.ADMIN),
  validate({
    params: packageIdSchema,
    body: createPackageItemSchema,
  }),
  addPackageItemController
);

router.delete(
  "/packages/:id/items/:testId",
  authorize(UserRole.ADMIN),
  validate({
    params: packageItemParamsSchema,
  }),
  removePackageItemController
);

// =======================================================
// PARAMETERS (BY PARAMETER ID)
// =======================================================

router.patch(
  "/parameters/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: parameterIdSchema,
    body: updateParameterSchema,
  }),
  updateParameterController
);

router.delete(
  "/parameters/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: parameterIdSchema,
  }),
  deleteParameterController
);

// =======================================================
// REFERENCE RANGES
// =======================================================

router.post(
  "/parameters/:id/reference-ranges",
  authorize(UserRole.ADMIN),
  validate({
    params: parameterIdSchema,
    body: createReferenceRangeSchema,
  }),
  addReferenceRangeController
);

router.patch(
  "/reference-ranges/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: referenceRangeIdSchema,
    body: updateReferenceRangeSchema,
  }),
  updateReferenceRangeController
);

router.delete(
  "/reference-ranges/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: referenceRangeIdSchema,
  }),
  deleteReferenceRangeController
);

// =======================================================
// EXPORT/IMPORT CATALOG (BEFORE /:id WILDCARD)
// =======================================================

router.get(
  "/catalog/export",
  authorize(UserRole.ADMIN),
  exportCatalogController
);

router.post(
  "/catalog/import",
  authorize(UserRole.ADMIN),
  validate({
    body: importCatalogSchema,
  }),
  importCatalogController
);

// =======================================================
// TESTS ROOT & COUNT
// =======================================================

router.post(
  "/",
  authorize(UserRole.ADMIN),
  validate({
    body: createTestSchema,
  }),
  createTestController
);

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
    query: testQuerySchema,
  }),
  listTests
);

router.get(
  "/count",
  authorize(
    UserRole.ADMIN,
    UserRole.FRONT_DESK,
    UserRole.LAB_TECH,
    UserRole.PATHOLOGIST,
    UserRole.DOCTOR
  ),
  listTests
);

// =======================================================
// TESTS BY ID (WILDCARDS - MUST BE AT THE VERY END!)
// =======================================================

router.post(
  "/:id/parameters",
  authorize(UserRole.ADMIN),
  validate({
    params: testIdSchema,
    body: createParameterSchema,
  }),
  addParameterController
);

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
    params: testIdSchema,
  }),
  getTest
);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: testIdSchema,
    body: updateTestSchema,
  }),
  updateTestController
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  validate({
    params: testIdSchema,
  }),
  deleteTestController
);

export default router;