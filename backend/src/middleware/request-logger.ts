import type { Request, Response, NextFunction } from "express";

import { createRequestLogger } from "../utils/logger.js";

function generateRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const id = generateRequestId();
  const logger = createRequestLogger({
    requestId: id,
    method: req.method,
    url: req.originalUrl,
  });
  (req as any).logger = logger;
  next();
}

export default requestLogger;
