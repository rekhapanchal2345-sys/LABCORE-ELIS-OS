import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updatePaymentStatus,
  deleteInvoice as deleteInvoiceService,
  getBillingMetrics,
  processRefund,
} from "./invoice.service";

import prisma from "../../../config/database";

export const create =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const body = (req as any).validated?.body || req.body;

      const invoice =
        await createInvoice(body);

      res.status(201).json({
        success: true,
        message:
          "Invoice created successfully",
        data: invoice,
      });
    } catch (error) {
      console.error("Error in create invoice controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create invoice",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

export const list =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Check if this is a count request
      if (req.path.endsWith('/count')) {
        const count = await prisma.invoice.count();
        res.status(200).json({
          success: true,
          message: "Invoice count fetched successfully",
          data: { count },
        });
        return;
      }
      
      // Use validated data if available, otherwise fall back to original request
      const query = (req as any).validated?.query || req.query;

      const result =
        await getInvoices({
          search: query.search,
          patientId: query.patientId,
          orderId: query.orderId,
          paymentStatus: query.paymentStatus,
          doctorId: query.doctorId,
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        });

      res.status(200).json({
        success: true,
        message:
          "Invoices fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in list invoices controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve invoices",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

export const getOne =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const params = (req as any).validated?.params || req.params;

      const invoice =
        await getInvoiceById(
          params.id as string
        );

      res.status(200).json({
        success: true,
        message:
          "Invoice fetched successfully",
        data: invoice,
      });
    } catch (error) {
      console.error("Error in getOne invoice controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve invoice",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

export const refreshPaymentStatus =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const params = (req as any).validated?.params || req.params;

      const invoice =
        await updatePaymentStatus(
          params.id as string
        );

      res.status(200).json({
        success: true,
        message:
          "Payment status updated successfully",
        data: invoice,
      });
    } catch (error) {
      console.error("Error in refreshPaymentStatus controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update payment status",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

export const remove =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const params = (req as any).validated?.params || req.params;

      const result =
        await deleteInvoiceService(
          params.id as string
        );

      res.status(200).json({
        success: true,
        message:
          "Invoice deleted successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in delete invoice controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete invoice",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

export const getMetrics =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const query = (req as any).validated?.query || req.query;

      const metrics =
        await getBillingMetrics({
          startDate: query.startDate,
          endDate: query.endDate,
        });

      res.status(200).json({
        success: true,
        message:
          "Billing metrics fetched successfully",
        data: metrics,
      });
    } catch (error) {
      console.error("Error in getMetrics controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load billing metrics",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

export const refund =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Use validated data if available, otherwise fall back to original request
      const body = (req as any).validated?.body || req.body;

      const result =
        await processRefund({
          invoiceId: body.invoiceId,
          amount: body.amount,
          reason: body.reason,
          refundMethod: body.refundMethod,
          transactionId: body.transactionId,
          userId: (req as any).user?.id,
        });

      res.status(200).json({
        success: true,
        message:
          "Refund processed successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in refund controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process refund",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };