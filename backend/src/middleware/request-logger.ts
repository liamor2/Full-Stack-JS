import type { Response, NextFunction } from "express";

import type { RequestWithLogger } from "../types/requests.js";
import { createRequestLogger, type RequestLogger } from "../utils/logger.js";

/**
 * Attach a request-scoped structured logger to the incoming Request.
 *
 * The middleware generates a stable request identifier and binds basic
 * request metadata (method and url) to a pino child logger. The child
 * logger is stored at `req.logger` and may be used by downstream handlers.
 *
 * This keeps logging consistent across the application and ensures that
 * all log entries for a request include the same requestId for tracing.
 *
 * @param req - Express request object augmented with an optional logger.
 * @param _res - Express response object (unused).
 * @param next - Express next function.
 */
export function requestLogger(
  req: RequestWithLogger,
  _res: Response,
  next: NextFunction,
) {
  const id = crypto.randomUUID();
  const logger: RequestLogger = createRequestLogger({
    requestId: id,
    method: req.method,
    url: req.originalUrl,
  });
  req.logger = logger;
  next();
}

export default requestLogger;
