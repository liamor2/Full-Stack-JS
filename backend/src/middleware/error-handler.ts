import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http.error.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  // Fallback - avoid leaking details
  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal Server Error" });
}

export default errorHandler;
