import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export function validateBody(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      res.status(400).json({ error: err.errors ?? String(err) });
    }
  };
}

export default validateBody;
