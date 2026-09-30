import {
  Request,
  Response,
  NextFunction,
} from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth";
import {
  createAdvance,
  getPatientAdvances,
  getPatientWallet,
  applyAdvanceToInvoice,
  refundAdvance,
} from "./advance.service";

// =======================================================
// CREATE ADVANCE
// =======================================================

export const create =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const advance =
        await createAdvance({
          ...body,
          receivedById: req.user?.id,
        });

      res.status(201).json({
        success: true,
        message: "Advance created successfully",
        data: advance,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// GET PATIENT ADVANCES
// =======================================================

export const getAdvances =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = (req as any).validated?.params || req.params;
      
      const advances =
        await getPatientAdvances(params.patientId);

      res.status(200).json({
        success: true,
        message: "Patient advances fetched successfully",
        data: advances,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// GET PATIENT WALLET
// =======================================================

export const getWallet =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = (req as any).validated?.params || req.params;
      
      const wallet =
        await getPatientWallet(params.patientId);

      res.status(200).json({
        success: true,
        message: "Patient wallet fetched successfully",
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// APPLY ADVANCE TO INVOICE
// =======================================================

export const applyToInvoice =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const result =
        await applyAdvanceToInvoice({
          ...body,
          appliedById: req.user?.id,
        });

      res.status(200).json({
        success: true,
        message: "Advance applied to invoice successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// REFUND ADVANCE
// =======================================================

export const refund =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const result =
        await refundAdvance({
          ...body,
          processedById: req.user?.id,
        });

      res.status(200).json({
        success: true,
        message: "Advance refunded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };