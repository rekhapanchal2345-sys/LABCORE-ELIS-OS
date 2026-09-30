import {
  Request,
  Response,
  NextFunction,
} from "express";

import type { AuthenticatedRequest } from "../../../middleware/auth";

import {
  generateOrderBarcode,
  generateSampleBarcode,
  generatePatientBarcode,
  validateBarcode,
  generateBarcodeData,
  getBarcodePrintData,
  generateBatchBarcodes,
  regenerateBarcode,
} from "./barcode.service";

import {
  successResponse,
  createdResponse,
} from "../../utils/response";

export const generateOrder =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const barcode = await generateOrderBarcode(
        req.params.id as string
      );

      return successResponse(
        res,
        { barcode },
        "Order barcode generated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

export const generateSample =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const barcode = await generateSampleBarcode(
        req.params.id as string
      );

      return successResponse(
        res,
        { barcode },
        "Sample barcode generated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

export const generatePatient =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const barcode = await generatePatientBarcode(
        req.params.id as string
      );

      return successResponse(
        res,
        { barcode },
        "Patient barcode generated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

export const validate =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validation = await validateBarcode(
        req.params.barcode as string
      );

      return successResponse(
        res,
        validation,
        "Barcode validated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

export const getPrintData =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const printData = await getBarcodePrintData(
        req.params.barcode as string
      );

      return successResponse(
        res,
        printData,
        "Barcode print data fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  };

export const generateBatch =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderIds } = req.body;

      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        throw new Error("Invalid order IDs array");
      }

      const barcodes = await generateBatchBarcodes(orderIds);

      return successResponse(
        res,
        { barcodes },
        "Batch barcodes generated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

export const regenerate =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { type, id } = req.params;

      if (type !== 'ORDER' && type !== 'SAMPLE') {
        throw new Error("Invalid entity type. Must be ORDER or SAMPLE");
      }

      const barcode = await regenerateBarcode(
        type as 'ORDER' | 'SAMPLE',
        id as string
      );

      return successResponse(
        res,
        { barcode },
        "Barcode regenerated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

export const scanBarcode =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { barcode } = req.body;

      if (!barcode) {
        throw new Error("Barcode is required");
      }

      const validation = await validateBarcode(barcode);

      // Log the scan event
      if (validation.type !== 'INVALID' && req.user?.id) {
        // Here you could log scan events to audit log
        console.log(`Barcode ${barcode} scanned by user ${req.user.id}`);
      }

      return successResponse(
        res,
        validation,
        "Barcode scanned successfully"
      );
    } catch (error) {
      next(error);
    }
  };