import {
    Request,
    Response,
    NextFunction,
  } from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth";
import prisma from "../../../config/database";
  
  import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    collectSample,
    cancelOrder,
  } from "./order.service";

  import {
    getOrderAnalytics,
    getTATAnalytics,
    getHourlyThroughput,
    bulkEscalatePriority,
    bulkUpdateStatus,
    getOrderPipeline,
    getRevenueByDoctor,
  } from "./order.analytics";
  
  import {
    successResponse,
    createdResponse,
  } from "../../utils/response";
  
  export const create =
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const userId =
          req.user?.id;
        
        // Use validated data if available, otherwise fall back to original request
        const body = (req as any).validated?.body || req.body;
  
        const order =
          await createOrder(
            body,
            userId
          );
  
        return createdResponse(
          res,
          order,
          "Order created successfully"
        );
      } catch (error) {
        next(error);
      }
    };
  
  export const list =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const query = (req as any).validated?.query || req.query;
        
        // Check if this is a count request
        if (req.path.endsWith('/count')) {
          const count = await prisma.order.count();
          return successResponse(res, { count }, "Order count fetched successfully");
        }
        
        const result =
          await getOrders({
            search: query.search,
            patientId: query.patientId,
            doctorId: query.doctorId,
            orderStatus: query.orderStatus,
            paymentStatus: query.paymentStatus,
            priority: query.priority,
            dateFrom: query.dateFrom,
            dateTo: query.dateTo,
            collectionType: query.collectionType,
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 20,
          });
  
        return successResponse(
          res,
          result,
          "Orders fetched successfully"
        );
      } catch (error) {
        next(error);
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
        
        const order =
          await getOrderById(
            params.id as string
          );
  
        return successResponse(
          res,
          order,
          "Order fetched successfully"
        );
      } catch (error) {
        next(error);
      }
    };
  
  export const update =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const params = (req as any).validated?.params || req.params;
        const body = (req as any).validated?.body || req.body;
        
        const order =
          await updateOrder(
            params.id as string,
            body
          );
  
        return successResponse(
          res,
          order,
          "Order updated successfully"
        );
      } catch (error) {
        next(error);
      }
    };
  
  export const collect =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const params = (req as any).validated?.params || req.params;
        const body = (req as any).validated?.body || req.body;
        
        const order =
          await collectSample(
            params.id as string,
            body?.barcode,
            (req as any).user?.id,
            body
          );
  
        return successResponse(
          res,
          order,
          "Sample collected successfully"
        );
      } catch (error) {
        next(error);
      }
    };
  
  export const cancel =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        // Use validated data if available, otherwise fall back to original request
        const params = (req as any).validated?.params || req.params;
        const body = (req as any).validated?.body || req.body;
        
        const order =
          await cancelOrder(
            params.id as string,
            body.reason
          );
  
        return successResponse(
          res,
          order,
          "Order cancelled successfully"
        );
      } catch (error) {
        next(error);
      }
    };

// ─────────────────────────────────────────────────────────────
//  ANALYTICS CONTROLLERS
// ─────────────────────────────────────────────────────────────

export const analytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query as any;
    const dateRange = from && to ? { from: new Date(from), to: new Date(to) } : undefined;
    const data = await getOrderAnalytics(dateRange);
    return successResponse(res, data, "Analytics fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const tatAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getTATAnalytics();
    return successResponse(res, data, "TAT analytics fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const hourlyThroughput = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getHourlyThroughput();
    return successResponse(res, data, "Hourly throughput fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const pipeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dateFilter } = req.query as any;
    const data = await getOrderPipeline(dateFilter);
    return successResponse(res, data, "Pipeline fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const revenueByDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query as any;
    const dateRange = from && to ? { from: new Date(from), to: new Date(to) } : undefined;
    const data = await getRevenueByDoctor(dateRange);
    return successResponse(res, data, "Revenue by doctor fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const bulkEscalate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderIds, priority } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "orderIds array is required" });
    }
    if (!["ROUTINE", "URGENT", "STAT"].includes(priority)) {
      return res.status(400).json({ success: false, message: "Invalid priority" });
    }
    const data = await bulkEscalatePriority(orderIds, priority);
    return successResponse(res, data, `Priority updated to ${priority} for ${data.updatedCount} orders`);
  } catch (error) {
    next(error);
  }
};

export const bulkStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderIds, status } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "orderIds array is required" });
    }
    const data = await bulkUpdateStatus(orderIds, status);
    return successResponse(res, data, `Status updated to ${status} for ${data.updatedCount} orders`);
  } catch (error) {
    next(error);
  }
};