import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

import { createRequestLogger } from "../utils/logger.js";

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const id = uuidv4();
  const logger = createRequestLogger({ requestId: id, method: req.method, url: req.originalUrl });
  (req as any).logger = logger;
  next();
}

export default requestLogger;
