import type { RequestHandler } from "express";
import type { ZodType, ZodError } from "zod";

type ValidationDetail = {
  path: string;
  message: string;
  code?: string;
  [key: string]: unknown;
};

export function validateBody(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err && (err as ZodError).issues) {
        const zErr = err as ZodError;
        const details: ValidationDetail[] = zErr.issues.map((issue) => {
          const path = issue.path?.join(".") || "";
          const detail: ValidationDetail = {
            path,
            message: issue.message,
          };
          if ((issue as any).code) detail.code = (issue as any).code;
          const extras = Object.keys(issue).filter(
            (k) => !["path", "message", "code"].includes(k),
          );
          for (const k of extras) {
            detail[k] = (issue as any)[k];
          }
          return detail;
        });

        return res.status(400).json({ error: "Validation failed", details });
      }

      const message = err instanceof Error ? err.message : String(err);
      return res.status(400).json({ error: message });
    }
  };
}

export default validateBody;
