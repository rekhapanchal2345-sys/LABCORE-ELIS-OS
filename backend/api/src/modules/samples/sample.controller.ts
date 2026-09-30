import {
    Request,
    Response,
    NextFunction,
  } from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth";
import prisma from "../../../config/database";
  
  import {
    createSample,
    getSamples,
    getSampleById,
    collectSample,
    receiveSample,
    startProcessing,
    completeSample,
    rejectSample,
    createTrackingEvent,
    getSampleTrackingHistory,
    getOrderTrackingHistory,
    getPatientTrackingHistory,
    getComprehensivePatientTracking,
  } from "./sample.service";
  
  import {
    successResponse,
    createdResponse,
  } from "../../utils/response";
  
  export const create =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const sample =
          await createSample(
            req.body
          );
  
        return createdResponse(
          res,
          sample,
          "Sample created successfully"
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
        // Check if this is a count request
        if (req.path.endsWith('/count')) {
          const count = await prisma.sample.count();
          return successResponse(res, { count }, "Sample count fetched successfully");
        }
        
        const result =
          await getSamples({
            search:
              req.query.search,
  
            orderId:
              req.query.orderId,
  
            status:
              req.query.status,
  
            sampleType:
              req.query.sampleType,
  
            page:
              Number(req.query.page) ||
              1,
  
            limit:
              Number(req.query.limit) ||
              20,
          });
  
        return successResponse(
          res,
          result,
          "Samples fetched successfully"
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
        const sample =
          await getSampleById(
            req.params.id as string
          );
  
        return successResponse(
          res,
          sample,
          "Sample fetched successfully"
        );
      } catch (error) {
        next(error);
      }
    };
  
  export const collect =
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        if (!req.user?.id) {
          throw new Error(
            "Authenticated user not found"
          );
        }
  
        const sample =
          await collectSample(
            req.params.id as string,
            req.user.id,
            req.body
          );
  
        return successResponse(
          res,
          sample,
          "Sample collected successfully"
        );
      } catch (error) {
        next(error);
      }
    };
  
  export const receive =
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const sample =
          await receiveSample(
            req.params.id as string,
            req.user?.id,
            req.body.notes,
            req.body.location
          );

        return successResponse(
          res,
          sample,
          "Sample received successfully"
        );
      } catch (error) {
        next(error);
      }
    };
  
  export const process =
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const sample =
          await startProcessing(
            req.params.id as string,
            req.user?.id,
            req.body.location
          );

        return successResponse(
          res,
          sample,
          "Sample moved to processing"
        );
      } catch (error) {
        next(error);
      }
    };
  
  export const complete =
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const sample =
          await completeSample(
            req.params.id as string,
            req.user?.id,
            req.body.location
          );

        return successResponse(
          res,
          sample,
          "Sample completed successfully"
        );
      } catch (error) {
        next(error);
      }
    };
  
  export const reject =
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const sample =
          await rejectSample(
            req.params.id as string,
            req.body.reason,
            req.user?.id
          );

        return successResponse(
          res,
          sample,
          "Sample rejected successfully"
        );
      } catch (error) {
        next(error);
      }
    };

  // =======================================================
  // SAMPLE TRACKING HISTORY CONTROLLERS
  // =======================================================

  export const createTracking =
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        if (!req.user?.id) {
          throw new Error("Authenticated user not found");
        }

        const trackingEvent = await createTrackingEvent({
          ...req.body,
          performedById: req.user.id,
        });

        return createdResponse(
          res,
          trackingEvent,
          "Tracking event created successfully"
        );
      } catch (error) {
        next(error);
      }
    };

  export const getSampleTracking =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const trackingHistory = await getSampleTrackingHistory(
          req.params.id as string
        );

        return successResponse(
          res,
          trackingHistory,
          "Sample tracking history fetched successfully"
        );
      } catch (error) {
        next(error);
      }
    };

  export const getOrderTracking =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const trackingHistory = await getOrderTrackingHistory(
          req.params.id as string
        );

        return successResponse(
          res,
          trackingHistory,
          "Order tracking history fetched successfully"
        );
      } catch (error) {
        next(error);
      }
    };

  export const getPatientTracking =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const trackingHistory = await getPatientTrackingHistory(
          req.params.id as string,
          {
            limit: req.query.limit ? Number(req.query.limit) : 50,
            offset: req.query.offset ? Number(req.query.offset) : 0,
          }
        );

        return successResponse(
          res,
          trackingHistory,
          "Patient tracking history fetched successfully"
        );
      } catch (error) {
        next(error);
      }
    };

  export const getComprehensiveTracking =
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const comprehensiveData = await getComprehensivePatientTracking(
          req.params.id as string
        );

        return successResponse(
          res,
          comprehensiveData,
          "Comprehensive patient tracking data fetched successfully"
        );
      } catch (error) {
        next(error);
      }
    };