import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Store validated data in a custom property
      const validated: any = {};

      // Validate request body
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);

        if (!result.success) {
          console.log("Validation error details:", result.error);
          const errorResponse = {
            success: false,
            message: "Invalid request body",
            errors: result.error.format(),
          };
          console.log('Sending validation error response:', errorResponse);
          return res.status(400).json(errorResponse);
        }

        validated.body = result.data;
      }

      // Validate route params
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);

        if (!result.success) {
          const errorResponse = {
            success: false,
            message: "Invalid request parameters",
            errors: result.error.format(),
          };
          console.log('Sending validation error response:', errorResponse);
          return res.status(400).json(errorResponse);
        }

        validated.params = result.data;
      }

      // Validate query parameters
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);

        if (!result.success) {
          const errorResponse = {
            success: false,
            message: "Invalid query parameters",
            errors: result.error.format(),
          };
          console.log('Sending validation error response:', errorResponse);
          return res.status(400).json(errorResponse);
        }

        validated.query = result.data;
      }

      // Attach validated data to request object
      (req as any).validated = validated;

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      next(error);
    }
  };
};