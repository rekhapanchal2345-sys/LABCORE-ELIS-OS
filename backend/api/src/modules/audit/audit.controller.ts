import {
    Request,
    Response,
    NextFunction,
  } from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth";
  
  import {
    createAuditLog,
    getAuditLogById,
    getAuditLogs,
    getRecordHistory,
    getUserActivity,
  } from "./audit.service";
  
  // =======================================================
  // CREATE AUDIT LOG
  // =======================================================
  
  export const create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const body = (req as any).validated?.body || req.body;
      
      const auditLog =
        await createAuditLog({
          ...body,
  
          // Prefer authenticated user
          userId:
            req.user?.id ??
            body.userId,
  
          ipAddress:
            req.ip,
  
          userAgent:
            req.get(
              "user-agent"
            ),
        });
  
      res.status(201).json({
        success: true,
        message:
          "Audit log created successfully",
        data: auditLog,
      });
    } catch (error) {
      next(error);
    }
  };
  
  // =======================================================
  // LIST AUDIT LOGS
  // =======================================================
  
  export const list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const query = (req as any).validated?.query || req.query;
      
      const result =
        await getAuditLogs({
          userId: query.userId?.toString(),
          module: query.module?.toString(),
          action: query.action?.toString(),
          recordId: query.recordId?.toString(),
          fromDate: query.fromDate?.toString(),
          toDate: query.toDate?.toString(),
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        });
  
      res.status(200).json({
        success: true,
        message:
          "Audit logs fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
  
  // =======================================================
  // GET ONE AUDIT LOG
  // =======================================================
  
  export const getOne = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const params = (req as any).validated?.params || req.params;
      
      const auditLog =
        await getAuditLogById(
          params.id as string
        );
  
      res.status(200).json({
        success: true,
        message:
          "Audit log fetched successfully",
        data: auditLog,
      });
    } catch (error) {
      next(error);
    }
  };
  
  // =======================================================
  // RECORD HISTORY
  // =======================================================
  
  export const recordHistory =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const params = (req as any).validated?.params || req.params;
        
        const history =
          await getRecordHistory(
            params.recordId as string
          );
  
        res.status(200).json({
          success: true,
          message:
            "Record audit history fetched successfully",
          data: history,
        });
      } catch (error) {
        next(error);
      }
    };
  
  // =======================================================
  // USER ACTIVITY
  // =======================================================
  
  export const userActivity =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const params = (req as any).validated?.params || req.params;
        const query = (req as any).validated?.query || req.query;
        
        const result =
          await getUserActivity(
            params.userId as string,
            Number(query.page) || 1,
            Number(query.limit) || 20
          );
  
        res.status(200).json({
          success: true,
          message:
            "User activity fetched successfully",
          data: result,
        });
      } catch (error) {
        next(error);
      }
    };