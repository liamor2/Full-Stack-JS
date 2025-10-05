import type { Request, Response, NextFunction } from "express";

import { createRequestLogger, type RequestLogger } from "../utils/logger.js";

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const id = crypto.randomUUID();
  const logger: RequestLogger = createRequestLogger({ requestId: id, method: req.method, url: req.originalUrl });
  (req as unknown as Request & { logger?: RequestLogger }).logger = logger;
  next();
}

export default requestLogger;
