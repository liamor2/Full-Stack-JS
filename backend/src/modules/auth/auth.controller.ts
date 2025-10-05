import { Request, Response } from "express";

import { register, login } from "./auth.service.js";
import { BadRequestError } from "../../errors/http.error.js";

export async function registerHandler(req: Request, res: Response) {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    throw new BadRequestError(e?.message ?? "Bad Request");
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (e: any) {
    throw new BadRequestError(e?.message ?? "Bad Request");
  }
}

export function meHandler(req: Request, res: Response) {
  res.json({ user: (req as any).user });
}
