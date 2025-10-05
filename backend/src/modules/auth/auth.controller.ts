import { Request, Response } from "express";

import { BadRequestError, HttpError } from "../../errors/http.error.js";

import { register, login } from "./auth.service.js";

export async function registerHandler(req: Request, res: Response) {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (e: unknown) {
    if (e instanceof HttpError) throw e;
    const message = e instanceof Error ? e.message : String(e);
    throw new BadRequestError(message ?? "Bad Request");
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (e: unknown) {
    if (e instanceof HttpError) throw e;
    const message = e instanceof Error ? e.message : String(e);
    throw new BadRequestError(message ?? "Bad Request");
  }
}

export function meHandler(req: Request, res: Response) {
  const user = (req as Request & { user?: Record<string, unknown> }).user;
  res.json({ user });
}
