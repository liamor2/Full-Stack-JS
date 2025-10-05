import type { Request, Response, NextFunction } from "express";

import { HttpError } from "../errors/http.error.js";
import { rootLogger } from "../utils/logger.js";

/**
 * Central Express error handler.
 *
 * Maps known HttpError instances to their status and body. Other errors are
 * logged and returned as a generic 500 response.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  void _next;
  const reqLogger = (req as Request & {
    logger?: { error?: (...args: unknown[]) => void };
  }).logger as { error?: (...args: unknown[]) => void } | undefined;
  if (err instanceof HttpError) {
    if (reqLogger?.error) reqLogger.error("HttpError", err);
    return res
      .status(err.status)
      .json({ error: err.message, details: err.details });
  }
  if (reqLogger?.error) reqLogger.error("Unhandled error:", err);
  else rootLogger.error({ err }, "Unhandled error");
  return res.status(500).json({ error: "Internal Server Error" });
}

export default errorHandler;
