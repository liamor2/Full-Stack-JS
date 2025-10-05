import type { Request } from "express";
import type { RequestLogger } from "../utils/logger";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id?: string; role?: string } | Record<string, unknown>;
    logger?: RequestLogger;
  }
}

export {};
