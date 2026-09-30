import {
  Request,
  Response,
  NextFunction,
} from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth";
import {
  createRefundRequest,
  approveRefund,
  rejectRefund,
  processRefund,
  getRefunds,
  getRefundById,
} from "./refund.service";

// =======================================================
// CREATE REFUND REQUEST
// =======================================================

export const create =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const refund =
        await createRefundRequest({
          ...body,
          requestedById: req.user?.id,
        });

      res.status(201).json({
        success: true,
        message: "Refund request created successfully",
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// APPROVE REFUND
// =======================================================

export const approve =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const result =
        await approveRefund({
          ...body,
          approverId: req.user?.id,
        });

      res.status(200).json({
        success: true,
        message: "Refund approved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// REJECT REFUND
// =======================================================

export const reject =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const result =
        await rejectRefund({
          ...body,
          approverId: req.user?.id,
        });

      res.status(200).json({
        success: true,
        message: "Refund rejected successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// PROCESS REFUND
// =======================================================

export const process =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const refund =
        await processRefund({
          ...body,
          processedById: req.user?.id,
        });

      res.status(200).json({
        success: true,
        message: "Refund processed successfully",
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// LIST REFUNDS
// =======================================================

export const list =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = (req as any).validated?.query || req.query;

      const result =
        await getRefunds({
          status: query.status,
          paymentId: query.paymentId,
          requestedById: query.requestedById,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        });

      res.status(200).json({
        success: true,
        message: "Refunds fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// GET REFUND BY ID
// =======================================================

export const getOne =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = (req as any).validated?.params || req.params;
      
      const refund =
        await getRefundById(params.id);

      res.status(200).json({
        success: true,
        message: "Refund fetched successfully",
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  };