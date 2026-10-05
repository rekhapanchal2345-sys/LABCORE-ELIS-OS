import { Request, Response, NextFunction } from "express";

import {
  checkTestDuplicate,
  cloneTest,
  bulkUpdatePrices,
  bulkToggleActive,
  bulkDeleteTests,
  reorderTests,
  getTestAnalytics,
  recalculatePackagePricing,
} from "./test.advanced.service";

import { successResponse } from "../../utils/response";

const actorId = (req: Request): string | undefined => {
  const user = (req as any).user;
  return user?.id ?? user?.userId ?? undefined;
};

// =======================================================
// DUPLICATE CHECK
// =======================================================

export const checkDuplicateController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    const result = await checkTestDuplicate(body);
    return successResponse(res, result, "Duplicate check completed");
  } catch (error) {
    next(error);
  }
};

// =======================================================
// TEST CLONE
// =======================================================

export const cloneTestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;

    const clone = await cloneTest(
      params.id as string,
      body,
      actorId(req)
    );

    return successResponse(res, clone, "Test cloned successfully", 201);
  } catch (error) {
    next(error);
  }
};

// =======================================================
// BULK OPERATIONS
// =======================================================

export const bulkUpdatePricesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    const result = await bulkUpdatePrices(body, actorId(req));
    return successResponse(res, result, "Bulk price update completed");
  } catch (error) {
    next(error);
  }
};

export const bulkToggleActiveController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    const result = await bulkToggleActive(body, actorId(req));
    return successResponse(res, result, "Bulk status update completed");
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    const result = await bulkDeleteTests(body, actorId(req));
    return successResponse(res, result, "Bulk delete completed");
  } catch (error) {
    next(error);
  }
};

export const reorderTestsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    const result = await reorderTests(body, actorId(req));
    return successResponse(res, result, "Tests reordered successfully");
  } catch (error) {
    next(error);
  }
};

// =======================================================
// ANALYTICS
// =======================================================

export const getTestAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    const analytics = await getTestAnalytics(
      typeof query.startDate === "string" ? query.startDate : undefined,
      typeof query.endDate === "string" ? query.endDate : undefined,
      Number(query.limit) || 10
    );
    return successResponse(res, analytics, "Test analytics fetched successfully");
  } catch (error) {
    next(error);
  }
};

// =======================================================
// PACKAGE AUTO-PRICING
// =======================================================

export const recalculatePackagePricingController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;

    const result = await recalculatePackagePricing(
      params.id as string,
      body,
      actorId(req)
    );
    return successResponse(res, result, "Package pricing recalculated successfully");
  } catch (error) {
    next(error);
  }
};
