import { Request, Response, NextFunction } from "express";

import { UnauthorizedError, BadRequestError } from "../../errors/http.error.js";

import { verifyJwt, getUserById } from "./auth.service.js";

/**
 * Express middleware that requires a valid Bearer JWT in Authorization header.
 *
 * If the token is valid, attaches the user record to req.user and calls next().
 * On failure an HttpError is thrown (BadRequestError/UnauthorizedError).
 *
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express NextFunction
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    throw new BadRequestError("Missing token");
  const token = header.slice(7);
  try {
    const payload = verifyJwt(token);
    const user = getUserById(payload.sub);
    if (!user) throw new UnauthorizedError("Invalid token");
    (req as Request & { user?: unknown }).user = user;
    next();
  } catch (e) {
    const err = e as unknown;
    if (err instanceof UnauthorizedError || err instanceof BadRequestError) throw err;
    throw new UnauthorizedError("Invalid token");
  }
}
