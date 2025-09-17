import { Request, Response, NextFunction } from "express";
import { verifyJwt, getUserById } from "./auth.service.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });
  const token = header.slice(7);
  try {
    const payload = verifyJwt(token);
    const user = getUserById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid token" });
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
