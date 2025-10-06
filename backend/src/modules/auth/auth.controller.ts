import { Request, Response } from "express";

import { BadRequestError, HttpError } from "../../errors/http.error.js";
import type { RequestWithUser } from "../../types/requests.js";

import { register, login } from "./auth.service.js";

/**
 * HTTP handler to register a new user.
 *
 * Delegates to the service layer and maps any unexpected errors to a
 * BadRequestError so the centralized error handler will return a 400.
 *
 * @param req - Express Request containing the registration payload in req.body
 * @param res - Express Response used to respond with 201 and created entity
 */
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

/**
 * HTTP handler to authenticate a user and return tokens.
 *
 * Delegates to the auth service and converts unexpected errors into a
 * BadRequestError for consistent API responses.
 *
 * @param req - Express Request containing login credentials in req.body
 * @param res - Express Response which receives the authenticated user and tokens
 */
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

/**
 * Return the currently authenticated user attached to req.user by the
 * `requireAuth` middleware. If no user is present the response will contain
 * `user: undefined`.
 *
 * @param req - Express Request with optional user attached
 * @param res - Express Response used to return the user
 */
export function meHandler(req: RequestWithUser, res: Response) {
  const user = req.user;
  res.json({ user });
}
