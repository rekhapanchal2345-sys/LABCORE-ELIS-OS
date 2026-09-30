import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  createReceivable,
  updateReceivablePayment,
  getReceivables,
  getReceivableById,
  updateOverdueStatus,
  getReceivablesSummary,
  createCorporateAccount,
  getCorporateAccounts,
  updateCorporateBalance,
} from "./receivable.service";

// =======================================================
// CREATE RECEIVABLE
// =======================================================

export const create =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const receivable =
        await createReceivable(body);

      res.status(201).json({
        success: true,
        message: "Receivable created successfully",
        data: receivable,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// UPDATE RECEIVABLE PAYMENT
// =======================================================

export const updatePayment =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const receivable =
        await updateReceivablePayment(body);

      res.status(200).json({
        success: true,
        message: "Receivable payment updated successfully",
        data: receivable,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// LIST RECEIVABLES
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
        await getReceivables({
          patientId: query.patientId,
          corporateAccountId: query.corporateAccountId,
          status: query.status,
          agingDays: query.agingDays,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        });

      res.status(200).json({
        success: true,
        message: "Receivables fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// GET RECEIVABLE BY ID
// =======================================================

export const getOne =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = (req as any).validated?.params || req.params;
      
      const receivable =
        await getReceivableById(params.id);

      res.status(200).json({
        success: true,
        message: "Receivable fetched successfully",
        data: receivable,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// UPDATE OVERDUE STATUS
// =======================================================

export const updateOverdue =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await updateOverdueStatus();

      res.status(200).json({
        success: true,
        message: "Overdue status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// GET RECEIVABLES SUMMARY
// =======================================================

export const summary =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const summary =
        await getReceivablesSummary();

      res.status(200).json({
        success: true,
        message: "Receivables summary fetched successfully",
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// CREATE CORPORATE ACCOUNT
// =======================================================

export const createCorporate =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const account =
        await createCorporateAccount(body);

      res.status(201).json({
        success: true,
        message: "Corporate account created successfully",
        data: account,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// LIST CORPORATE ACCOUNTS
// =======================================================

export const listCorporate =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = (req as any).validated?.query || req.query;

      const result =
        await getCorporateAccounts({
          isActive: query.isActive,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        });

      res.status(200).json({
        success: true,
        message: "Corporate accounts fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =======================================================
// UPDATE CORPORATE BALANCE
// =======================================================

export const updateBalance =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = (req as any).validated?.body || req.body;
      
      const account =
        await updateCorporateBalance(body);

      res.status(200).json({
        success: true,
        message: "Corporate balance updated successfully",
        data: account,
      });
    } catch (error) {
      next(error);
    }
  };