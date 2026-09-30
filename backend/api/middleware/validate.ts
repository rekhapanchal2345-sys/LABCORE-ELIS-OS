import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import type { ZodType } from "zod";

export const validate = (
  schema: ZodType
): RequestHandler => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })
      );

      res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });

      return;
    }

    /*
     * Keep Zod's parsed/transformed values.
     * This is especially important for:
     * - query.page
     * - query.limit
     * - optional/default values
     */
    const parsed = result.data as {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };

    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }

    if (parsed.params !== undefined) {
      Object.assign(
        req.params,
        parsed.params
      );
    }

    /*
     * Express req.query can be readonly depending
     * on Express/@types versions, so copy values
     * instead of assigning req.query directly.
     */
    if (parsed.query !== undefined) {
      Object.keys(req.query).forEach(
        (key) => {
          delete req.query[key];
        }
      );

      Object.assign(
        req.query,
        parsed.query
      );
    }

    next();
  };
};