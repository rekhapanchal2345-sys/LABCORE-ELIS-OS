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