import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

import { BadRequestError } from "../errors/http.error.js";

/**
 * Express middleware factory that validates req.body with the provided Zod
 * schema. On failure a BadRequestError is thrown containing the formatted
 * Zod error details.
 *
 * Returns a middleware function that replaces req.body with the parsed
 * value on success.
 */
export function validateBody(schema: ZodTypeAny) {
  return async function (req: Request, _res: Response, next: NextFunction) {
    try {
      const parsed = await schema.safeParseAsync(req.body);
      if (!parsed.success) {
        throw new BadRequestError("Validation failed", parsed.error.format());
      }
      req.body = parsed.data as Record<string, unknown>;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

export default validateBody;
