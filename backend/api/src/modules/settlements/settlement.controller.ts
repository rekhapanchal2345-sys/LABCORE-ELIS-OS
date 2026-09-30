import {
  Request,
  Response,
  NextFunction,
} from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth";
import {
  createSettlement,
  processSettlement,
  getSettlements,
  getSettlementById,
  createReconciliationRecord,
  reconcileTransactions,
  getReconciliationRecords,
  getSettlementSummary,
} from "./settlement.service";

// =======================================================
// CREATE SETTLEMENT
// =======================================================

export const create =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const settlement =
        await createSettlement(body);

      res.status(201).json({
        success: true,
        message: "Settlement created successfully",
        data: settlement,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// PROCESS SETTLEMENT
// =======================================================

export const process =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const settlement =
        await processSettlement(body);

      res.status(200).json({
        success: true,
        message: "Settlement processed successfully",
        data: settlement,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// LIST SETTLEMENTS
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
        await getSettlements({
          provider: query.provider,
          providerType: query.providerType,
          status: query.status,
          startDate: query.startDate,
          endDate: query.endDate,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        });

      res.status(200).json({
        success: true,
        message: "Settlements fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// GET SETTLEMENT BY ID
// =======================================================

export const getOne =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = (req as any).validated?.params || req.params;
      
      const settlement =
        await getSettlementById(params.id);

      res.status(200).json({
        success: true,
        message: "Settlement fetched successfully",
        data: settlement,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// CREATE RECONCILIATION RECORD
// =======================================================

export const createReconciliation =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const record =
        await createReconciliationRecord(body);

      res.status(201).json({
        success: true,
        message: "Reconciliation record created successfully",
        data: record,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// RECONCILE TRANSACTIONS
// =======================================================

export const reconcile =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const record =
        await reconcileTransactions({
          ...body,
          reconciledById: req.user?.id,
        });

      res.status(200).json({
        success: true,
        message: "Transactions reconciled successfully",
        data: record,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// LIST RECONCILIATION RECORDS
// =======================================================

export const listReconciliations =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = (req as any).validated?.query || req.query;

      const result =
        await getReconciliationRecords({
          sourceType: query.sourceType,
          status: query.status,
          startDate: query.startDate,
          endDate: query.endDate,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        });

      res.status(200).json({
        success: true,
        message: "Reconciliation records fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// GET SETTLEMENT SUMMARY
// =======================================================

export const summary =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = (req as any).validated?.query || req.query;

      const summary =
        await getSettlementSummary({
          startDate: query.startDate,
          endDate: query.endDate,
          provider: query.provider,
        });

      res.status(200).json({
        success: true,
        message: "Settlement summary fetched successfully",
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };