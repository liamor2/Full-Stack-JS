import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@full-stack-js/shared";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const token = auth.slice("Bearer ".length);
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).userId = payload.sub;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default requireAuth;
