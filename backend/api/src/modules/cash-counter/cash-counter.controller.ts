import {
  Request,
  Response,
  NextFunction,
} from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth";
import {
  createCashCounter,
  openCashCounter,
  closeCashCounter,
  getCashCounters,
  getCashCounterById,
  addCashMovement,
} from "./cash-counter.service";

// =======================================================
// CREATE CASH COUNTER
// =======================================================

export const create =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const counter =
        await createCashCounter(body);

      res.status(201).json({
        success: true,
        message: "Cash counter created successfully",
        data: counter,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// OPEN CASH COUNTER
// =======================================================

export const open =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const result =
        await openCashCounter({
          ...body,
          userId: req.user?.id,
        });

      res.status(200).json({
        success: true,
        message: "Cash counter opened successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// CLOSE CASH COUNTER
// =======================================================

export const close =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const result =
        await closeCashCounter({
          ...body,
          userId: req.user?.id,
        });

      res.status(200).json({
        success: true,
        message: "Cash counter closed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// LIST CASH COUNTERS
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
        await getCashCounters({
          status: query.status,
          branchId: query.branchId,
          assignedUserId: query.assignedUserId,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        });

      res.status(200).json({
        success: true,
        message: "Cash counters fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// GET CASH COUNTER BY ID
// =======================================================

export const getOne =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = (req as any).validated?.params || req.params;
      
      const counter =
        await getCashCounterById(params.id);

      res.status(200).json({
        success: true,
        message: "Cash counter fetched successfully",
        data: counter,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// ADD CASH MOVEMENT
// =======================================================

export const addMovement =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const result =
        await addCashMovement({
          ...body,
          performedById: req.user?.id,
        });

      res.status(201).json({
        success: true,
        message: "Cash movement added successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };