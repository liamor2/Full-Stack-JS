import type { Request, Response, NextFunction } from "express";

import { HttpError } from "../errors/http.error.js";
import type { RequestWithLogger } from "../types/requests.js";
import { rootLogger } from "../utils/logger.js";

/**
 * Global Express error handling middleware.
 *
 * Behavior:
 * - If the error is an instance of HttpError, respond with its status and
 *   body shaped as { error, details }.
 * - Otherwise log the error and return a generic 500 response.
 *
 * The middleware prefers a request-scoped logger when available at
 * `req.logger` but falls back to the application root logger.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  void _next;
  const reqLogger = (req as RequestWithLogger).logger;
  if (err instanceof HttpError) {
    reqLogger?.error?.("HttpError", err);
    return res
      .status(err.status)
      .json({ error: err.message, details: err.details });
  }
  reqLogger?.error?.("Unhandled error:", err);
  if (!reqLogger) rootLogger.error({ err }, "Unhandled error");
  return res.status(500).json({ error: "Internal Server Error" });
}

export default errorHandler;
