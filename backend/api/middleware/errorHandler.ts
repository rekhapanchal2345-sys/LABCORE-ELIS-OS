import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
  details?: unknown;
}

export const errorHandler: ErrorRequestHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );

  console.error(error);

  /**
   * -----------------------------------------
   * ZOD ERROR
   * -----------------------------------------
   */
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  /**
   * -----------------------------------------
   * PRISMA KNOWN REQUEST ERROR
   * -----------------------------------------
   */
  if (
    error instanceof
    Prisma.PrismaClientKnownRequestError
  ) {
    switch (error.code) {
      /**
       * Unique constraint
       */
      case "P2002": {
        const target =
          Array.isArray(error.meta?.target)
            ? error.meta.target.join(", ")
            : "field";

        res.status(409).json({
          success: false,
          message: `A record with the same ${target} already exists.`,
          code: error.code,
        });

        return;
      }

      /**
       * Record not found
       */
      case "P2025": {
        res.status(404).json({
          success: false,
          message: "Requested record was not found.",
          code: error.code,
        });

        return;
      }

      /**
       * Foreign key constraint
       */
      case "P2003": {
        res.status(400).json({
          success: false,
          message:
            "The request contains an invalid related record.",
          code: error.code,
        });

        return;
      }

      /**
       * Required relation violation
       */
      case "P2014": {
        res.status(400).json({
          success: false,
          message:
            "The requested relation cannot be created or modified.",
          code: error.code,
        });

        return;
      }

      /**
       * Column does not exist
       */
      case "P2022": {
        const column =
          error.meta?.column || "column";

        res.status(400).json({
          success: false,
          message: `The column ${column} does not exist in the current database.`,
          code: error.code,
        });

        return;
      }

      default: {
        res.status(400).json({
          success: false,
          message:
            "Database operation failed.",
          code: error.code,
        });

        return;
      }
    }
  }

  /**
   * -----------------------------------------
   * PRISMA VALIDATION ERROR
   * -----------------------------------------
   */
  if (
    error instanceof
    Prisma.PrismaClientValidationError
  ) {
    res.status(400).json({
      success: false,
      message:
        "Invalid data supplied to the database.",
    });

    return;
  }

  /**
   * -----------------------------------------
   * CUSTOM APPLICATION ERROR
   * -----------------------------------------
   */
  const statusCode =
    error.statusCode ??
    error.status ??
    500;

  /**
   * Never expose internal error details
   * in production.
   */
  const message =
    statusCode >= 500
      ? "Internal server error."
      : error.message ||
        "Request failed.";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !==
      "production" &&
    error.details !== undefined
      ? {
          details: error.details,
        }
      : {}),
  });
};