import {
    Request,
    Response,
    NextFunction,
  } from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth";
import prisma from "../../../config/database";
  
  import {
    createPayment,
    createSplitPayment,
    getPaymentById,
    getPayments,
    refundPayment,
    getPaymentMetrics,
    getShiftCloseReport,
  } from "./payment.service";
  
  // =======================================================
  // CREATE SPLIT PAYMENT
  // =======================================================

  export const createSplit =
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const body = (req as any).validated?.body || req.body;
        
        const payments =
          await createSplitPayment(
            body,
            req.user?.id
          );

        res.status(201).json({
          success: true,
          message:
            "Split payment created successfully",
          data: payments,
        });
      } catch (error) {
        next(error);
      }
    };

  // =======================================================
  // CREATE
  // =======================================================
  
  export const create =
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const body = (req as any).validated?.body || req.body;
        
        const payment =
          await createPayment(
            body,
            req.user?.id
          );
  
        res.status(201).json({
          success: true,
          message:
            "Payment created successfully",
          data: payment,
        });
      } catch (error) {
        next(error);
      }
    };
  
  // =======================================================
  // LIST
  // =======================================================
  
  export const list =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Check if this is a count request
        if (req.path.endsWith('/count')) {
          const count = await prisma.payment.count();
          res.status(200).json({
            success: true,
            message: "Payment count fetched successfully",
            data: { count },
          });
          return;
        }
        
        // Use validated data if available, otherwise fall back to original request
        const query = (req as any).validated?.query || req.query;

        console.log('Fetching payments with query:', query);

        const result =
          await getPayments({
            search: query.search,
            patientId: query.patientId,
            orderId: query.orderId,
            method: query.method,
            status: query.status,
            startDate: query.startDate,
            endDate: query.endDate,
            receivedById: query.receivedById,
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
          });

        console.log('Payments fetched successfully:', result.payments.length);

        res.status(200).json({
          success: true,
          message:
            "Payments fetched successfully",
          data: result,
        });
      } catch (error) {
        console.error('Error in payment list controller:', error);
        next(error);
      }
    };
  
  // =======================================================
  // GET ONE
  // =======================================================
  
  export const getOne =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const params = (req as any).validated?.params || req.params;
        
        const payment =
          await getPaymentById(
            params.id as string
          );
  
        res.status(200).json({
          success: true,
          message:
            "Payment fetched successfully",
          data: payment,
        });
      } catch (error) {
        next(error);
      }
    };
  
  // =======================================================
  // SHIFT CLOSE REPORT
  // =======================================================

  export const shiftClose =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const query = (req as any).validated?.query || req.query;

        const report =
          await getShiftCloseReport({
            startDate: query.startDate,
            endDate: query.endDate,
            receivedById: query.receivedById,
          });

        res.status(200).json({
          success: true,
          message:
            "Shift close report generated successfully",
          data: report,
        });
      } catch (error) {
        console.error('Error in shift close controller:', error);
        next(error);
      }
    };

  // =======================================================
  // METRICS
  // =======================================================

  export const metrics =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const query = (req as any).validated?.query || req.query;

        const metrics =
          await getPaymentMetrics({
            startDate: query.startDate,
            endDate: query.endDate,
            receivedById: query.receivedById,
          });

        res.status(200).json({
          success: true,
          message:
            "Payment metrics fetched successfully",
          data: metrics,
        });
      } catch (error) {
        console.error('Error in payment metrics controller:', error);
        next(error);
      }
    };

  // =======================================================
  // REFUND
  // =======================================================
  
  export const refund =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const params = (req as any).validated?.params || req.params;
        
        const payment =
          await refundPayment(
            params.id as string
          );
  
        res.status(200).json({
          success: true,
          message:
            "Payment refunded successfully",
          data: payment,
        });
      } catch (error) {
        next(error);
      }
    };