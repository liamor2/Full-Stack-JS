import { Request, Response, NextFunction } from "express";

import { verifyJwt, getUserById } from "./auth.service.js";
import { UnauthorizedError, BadRequestError } from "../../errors/http.error.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    throw new BadRequestError("Missing token");
  const token = header.slice(7);
  try {
    const payload = verifyJwt(token);
    const user = getUserById(payload.sub);
    if (!user) throw new UnauthorizedError("Invalid token");
    (req as any).user = user;
    next();
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof BadRequestError) throw e;
    throw new UnauthorizedError("Invalid token");
  }
}
