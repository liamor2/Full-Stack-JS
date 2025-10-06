import type { RequestHandler } from "express";
import { UserModel } from "../models/user.js";

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const anyReq = req as any;
  const userId = anyReq.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user: any = await UserModel.findById(userId).lean();
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
};

export default requireAdmin;
