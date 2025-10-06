import type { Request } from "express";

import type { RequestLogger } from "../utils/logger.js";

/**
 * Simple typed Request variants to avoid repeated inline casts.
 */
export type RequestWithUser = Request & {
  user?: { id?: string; role?: string } | Record<string, unknown>;
};

export type RequestWithLogger = Request & { logger?: RequestLogger };

export type RequestWithUserLogger = Request & {
  user?: { id?: string; role?: string } | Record<string, unknown>;
  logger?: RequestLogger;
};

export default {};
